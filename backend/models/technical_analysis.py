# backend/models/technical_analysis.py
import pandas as pd
import numpy as np
from datetime import datetime

class TechnicalAnalysis:
    def __init__(self, df):
        """Initialize with a pandas DataFrame containing OHLCV data"""
        self.df = df.copy()
        if 'Date' in self.df.columns:
            self.df['Date'] = pd.to_datetime(self.df['Date'])
        
    def calculate_moving_averages(self, short_window=20, long_window=50):
        """Calculate short and long-term moving averages"""
        self.df['SMA_short'] = self.df['Close'].rolling(window=short_window).mean()
        self.df['SMA_long'] = self.df['Close'].rolling(window=long_window).mean()
        return self.df
    
    def determine_trend(self, lookback_period=14):
        """
        Determine trend direction using multiple indicators
        Returns: 'uptrend', 'downtrend', or 'sideways'
        """
        # Calculate required indicators
        df = self.df.copy()
        df['SMA_20'] = df['Close'].rolling(window=20).mean()
        df['SMA_50'] = df['Close'].rolling(window=50).mean()
        
        # RSI calculation
        delta = df['Close'].diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=lookback_period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=lookback_period).mean()
        rs = gain / loss
        df['RSI'] = 100 - (100 / (1 + rs))
        
        # Get latest values
        latest = df.iloc[0]  # Assuming data is in reverse chronological order
        
        # Trend determination logic
        trend_signals = []
        
        # Price above/below moving averages
        if latest['Close'] > latest['SMA_20'] > latest['SMA_50']:
            trend_signals.append('uptrend')
        elif latest['Close'] < latest['SMA_20'] < latest['SMA_50']:
            trend_signals.append('downtrend')
            
        # RSI conditions
        if latest['RSI'] > 60:
            trend_signals.append('uptrend')
        elif latest['RSI'] < 40:
            trend_signals.append('downtrend')
            
        # Price momentum
        recent_prices = df['Close'].head(lookback_period)
        price_change = (recent_prices.iloc[0] - recent_prices.iloc[-1]) / recent_prices.iloc[-1] * 100
        
        if price_change > 5:
            trend_signals.append('uptrend')
        elif price_change < -5:
            trend_signals.append('downtrend')
            
        # Determine final trend based on majority of signals
        uptrend_count = trend_signals.count('uptrend')
        downtrend_count = trend_signals.count('downtrend')
        
        if uptrend_count > downtrend_count:
            return 'uptrend'
        elif downtrend_count > uptrend_count:
            return 'downtrend'
        else:
            return 'sideways'
    
    def get_best_performing_periods(self):
        """
        Analyze best and worst performing days and months
        Returns a dictionary with performance metrics
        """
        df = self.df.copy()
        
        # Calculate daily returns
        df['Daily_Return'] = df['Close'].pct_change() * 100
        
        # Best and worst days
        best_day = df.nlargest(1, 'Daily_Return').iloc[0]
        worst_day = df.nsmallest(1, 'Daily_Return').iloc[0]
        
        # Monthly analysis
        df['Year_Month'] = df['Date'].dt.to_period('M')
        monthly_data = df.groupby('Year_Month')['Close'].agg(['first', 'last'])
        monthly_data['return'] = ((monthly_data['last'] / monthly_data['first']) - 1) * 100
        
        best_month_idx = monthly_data['return'].idxmax()
        worst_month_idx = monthly_data['return'].idxmin()
        
        best_month_return = monthly_data.loc[best_month_idx, 'return']
        worst_month_return = monthly_data.loc[worst_month_idx, 'return']
        
        return {
            'best_day': {
                'date': best_day['Date'].strftime('%Y-%m-%d'),
                'return': round(best_day['Daily_Return'], 2),
                'close': best_day['Close']
            },
            'worst_day': {
                'date': worst_day['Date'].strftime('%Y-%m-%d'),
                'return': round(worst_day['Daily_Return'], 2),
                'close': worst_day['Close']
            },
            'best_month': {
                'month': str(best_month_idx),
                'return': round(best_month_return, 2)
            },
            'worst_month': {
                'month': str(worst_month_idx),
                'return': round(worst_month_return, 2)
            }
        }
    
    def get_support_resistance_levels(self, n_levels=3):
        """
        Calculate potential support and resistance levels
        Returns: dict with support and resistance prices
        """
        prices = self.df['Close'].values
        
        # Find local maxima and minima
        resistance_levels = []
        support_levels = []
        
        for i in range(1, len(prices) - 1):
            if prices[i] > prices[i-1] and prices[i] > prices[i+1]:
                resistance_levels.append(prices[i])
            if prices[i] < prices[i-1] and prices[i] < prices[i+1]:
                support_levels.append(prices[i])
        
        # Get the most significant levels
        resistance_levels = sorted(set(resistance_levels), reverse=True)[:n_levels]
        support_levels = sorted(set(support_levels))[:n_levels]
        
        return {
            'support_levels': [round(level, 2) for level in support_levels],
            'resistance_levels': [round(level, 2) for level in resistance_levels]
        }