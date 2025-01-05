import pandas as pd
import numpy as np
from dataclasses import dataclass
from typing import List, Dict, Tuple
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class TradeSignal:
    date: str
    action: str  # 'buy' or 'sell'
    price: float
    confidence: float
    indicators: Dict[str, float]

class TradingStrategy:
    def __init__(self, df: pd.DataFrame):
        # Make a copy and ensure numeric columns are properly formatted
        self.df = df.copy()
        
        # Ensure numeric columns are float
        numeric_columns = ['Open', 'High', 'Low', 'Close', 'Volume']
        for col in numeric_columns:
            if col in self.df.columns:
                if self.df[col].dtype != 'float64':
                    self.df[col] = self.df[col].astype(str).str.replace(',', '').astype(float)
        
        # Ensure Date is datetime
        if 'Date' in self.df.columns and not pd.api.types.is_datetime64_any_dtype(self.df['Date']):
            self.df['Date'] = pd.to_datetime(self.df['Date'])
            
        self.signals = []

        
    def analyze_temporal_patterns(self):
        """Analyze temporal patterns in the stock price"""
        try:
            df = self.df.copy()
            
            # Add temporal features
            df['Year'] = df['Date'].dt.year
            df['Month'] = df['Date'].dt.month
            df['DayOfWeek'] = df['Date'].dt.dayofweek  # Monday=0, Sunday=6
            df['WeekOfYear'] = df['Date'].dt.isocalendar().week.astype(int)
            
            # Daily analysis (only trading days)
            daily_analysis = df.groupby('DayOfWeek')['Close'].agg(['mean', 'max', 'min']).round(2)
            # Only include Monday (0) through Friday (4)
            daily_analysis = daily_analysis.iloc[0:5]
            daily_analysis.index = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
            
            # Weekly analysis
            weekly_analysis = df.groupby('WeekOfYear')['Close'].agg(['mean', 'max', 'min']).round(2)
            weekly_analysis.index = weekly_analysis.index.astype(str)  # Convert index to strings
            
            # Monthly analysis
            monthly_analysis = df.groupby('Month')['Close'].agg(['mean', 'max', 'min']).round(2)
            month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            monthly_analysis.index = [month_names[i-1] for i in monthly_analysis.index]
            
            result = {
                'daily': daily_analysis.to_dict('index'),
                'weekly': weekly_analysis.to_dict('index'),
                'monthly': monthly_analysis.to_dict('index')
            }
            
            return result
            
        except Exception as e:
            logger.error(f"Error in analyze_temporal_patterns: {str(e)}")
            logger.error("Stack trace:", exc_info=True)
            raise
        
    def generate_signals(self) -> List[TradeSignal]:
        """Generate trading signals based on multiple indicators"""
        df = self.prepare_data()
        signals = []
        
        for i in range(1, len(df)):
            current = df.iloc[i]
            prev = df.iloc[i-1]
            
            # Initialize confidence score
            buy_confidence = 0
            sell_confidence = 0
            
            # 1. EMA Crossover
            if prev['EMA_9'] <= prev['EMA_21'] and current['EMA_9'] > current['EMA_21']:
                buy_confidence += 0.3
            elif prev['EMA_9'] >= prev['EMA_21'] and current['EMA_9'] < current['EMA_21']:
                sell_confidence += 0.3
            
            # 2. RSI Signals
            if current['RSI'] < 30:
                buy_confidence += 0.2
            elif current['RSI'] > 70:
                sell_confidence += 0.2
            
            # 3. MACD Signals
            if prev['MACD_Hist'] <= 0 and current['MACD_Hist'] > 0:
                buy_confidence += 0.2
            elif prev['MACD_Hist'] >= 0 and current['MACD_Hist'] < 0:
                sell_confidence += 0.2
            
            # 4. Bollinger Bands
            if current['Close'] < current['BB_lower']:
                buy_confidence += 0.15
            elif current['Close'] > current['BB_upper']:
                sell_confidence += 0.15
            
            # 5. Volume Confirmation
            if current['Volume_Ratio'] > 1.5:
                buy_confidence += 0.15 if buy_confidence > 0 else 0
                sell_confidence += 0.15 if sell_confidence > 0 else 0
            
            # Generate signal if confidence is high enough
            if buy_confidence >= 0.5:
                signals.append(TradeSignal(
                    date=current['Date'].strftime('%Y-%m-%d'),
                    action='buy',
                    price=current['Close'],
                    confidence=buy_confidence,
                    indicators={
                        'rsi': current['RSI'],
                        'macd': current['MACD'],
                        'volume_ratio': current['Volume_Ratio']
                    }
                ))
            elif sell_confidence >= 0.5:
                signals.append(TradeSignal(
                    date=current['Date'].strftime('%Y-%m-%d'),
                    action='sell',
                    price=current['Close'],
                    confidence=sell_confidence,
                    indicators={
                        'rsi': current['RSI'],
                        'macd': current['MACD'],
                        'volume_ratio': current['Volume_Ratio']
                    }
                ))
        
        self.signals = signals
        return signals
    
    def backtest_strategy(self) -> Dict:
        """Backtest the trading strategy"""
        if not self.signals:
            self.generate_signals()
            
        initial_capital = 100000
        position = 0
        balance = initial_capital
        trades = []
        
        for signal in self.signals:
            if signal.action == 'buy' and position == 0:
                # Calculate number of shares we can buy
                shares = (balance * 0.95) // signal.price  # Keep 5% as buffer
                if shares > 0:
                    position = shares
                    balance -= shares * signal.price
                    trades.append({
                        'date': signal.date,
                        'action': 'buy',
                        'shares': shares,
                        'price': signal.price,
                        'value': shares * signal.price
                    })
                    
            elif signal.action == 'sell' and position > 0:
                # Sell all shares
                balance += position * signal.price
                trades.append({
                    'date': signal.date,
                    'action': 'sell',
                    'shares': position,
                    'price': signal.price,
                    'value': position * signal.price
                })
                position = 0
                
        # Calculate final portfolio value
        final_value = balance
        if position > 0:
            final_value += position * self.df['Close'].iloc[-1]
            
        return {
            'initial_capital': initial_capital,
            'final_value': final_value,
            'return_pct': ((final_value - initial_capital) / initial_capital) * 100,
            'trades': trades
        }
    
    def analyze_temporal_patterns(self):
        """Analyze temporal patterns in the stock price"""
        try:
            df = self.df.copy()
            
            # Add temporal features
            df['Year'] = df['Date'].dt.year.astype(int)
            df['Month'] = df['Date'].dt.month.astype(int)
            df['DayOfWeek'] = df['Date'].dt.dayofweek.astype(int)  # Monday=0, Sunday=6
            df['WeekOfYear'] = df['Date'].dt.isocalendar().week.astype(int)
            
            # Daily analysis (only trading days)
            daily_analysis = df.groupby('DayOfWeek')['Close'].agg(['mean', 'max', 'min']).round(2)
            # Only include Monday (0) through Friday (4)
            daily_analysis = daily_analysis.iloc[0:5]
            daily_analysis.index = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
            
            # Weekly analysis - convert index to string
            weekly_analysis = df.groupby('WeekOfYear')['Close'].agg(['mean', 'max', 'min']).round(2)
            weekly_analysis.index = weekly_analysis.index.astype(str)
            
            # Monthly analysis
            monthly_analysis = df.groupby('Month')['Close'].agg(['mean', 'max', 'min']).round(2)
            month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            monthly_analysis.index = [month_names[i-1] for i in monthly_analysis.index]
            
            # Convert everything to dictionary with string keys
            result = {
                'daily': daily_analysis.to_dict('index'),
                'weekly': weekly_analysis.to_dict('index'),
                'monthly': monthly_analysis.to_dict('index')
            }
            
            # Log success
            logger.info("Temporal analysis completed successfully")
            logger.info(f"Daily patterns: {list(result['daily'].keys())}")
            logger.info(f"Weekly patterns: {list(result['weekly'].keys())}")
            logger.info(f"Monthly patterns: {list(result['monthly'].keys())}")
            
            return result
            
        except Exception as e:
            logger.error(f"Error in analyze_temporal_patterns: {str(e)}")
            logger.error("Stack trace:", exc_info=True)
            raise
    
    def prepare_data(self):
        """Prepare data with all required indicators"""
        try:
            df = self.df.copy()
            
            # Calculate EMAs
            df['EMA_9'] = df['Close'].ewm(span=9, adjust=False).mean()
            df['EMA_21'] = df['Close'].ewm(span=21, adjust=False).mean()
            
            # Calculate RSI
            delta = df['Close'].diff()
            gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
            loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
            rs = gain / loss
            df['RSI'] = 100 - (100 / (1 + rs))
            
            # Calculate MACD
            exp1 = df['Close'].ewm(span=12, adjust=False).mean()
            exp2 = df['Close'].ewm(span=26, adjust=False).mean()
            df['MACD'] = exp1 - exp2
            df['Signal_Line'] = df['MACD'].ewm(span=9, adjust=False).mean()
            df['MACD_Hist'] = df['MACD'] - df['Signal_Line']
            
            # Calculate Bollinger Bands
            df['BB_middle'] = df['Close'].rolling(window=20).mean()
            bb_std = df['Close'].rolling(window=20).std()
            df['BB_upper'] = df['BB_middle'] + (bb_std * 2)
            df['BB_lower'] = df['BB_middle'] - (bb_std * 2)
            
            # Volume analysis
            df['Volume_MA'] = df['Volume'].rolling(window=20).mean()
            df['Volume_Ratio'] = df['Volume'] / df['Volume_MA']
            
            # Fill missing values
            df = df.ffill().bfill()
            
            return df
            
        except Exception as e:
            logger.error(f"Error in prepare_data: {str(e)}")
            logger.error("Stack trace:", exc_info=True)
            raise