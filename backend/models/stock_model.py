# # backend/models/stock_model.py
# import numpy as np
# import pandas as pd
# from sklearn.preprocessing import MinMaxScaler
# import tensorflow as tf
# from tensorflow.keras.models import Sequential
# from tensorflow.keras.layers import LSTM, Dense, Dropout
# from .technical_analysis import TechnicalAnalysis
# import joblib

# class StockPricePredictor:
#     def __init__(self, sequence_length=60):
#         self.sequence_length = sequence_length
#         self.model = None
#         self.scaler = MinMaxScaler(feature_range=(0, 1))
#         self.feature_columns = None
        
#     def prepare_features(self, df):
#         """Prepare all technical indicators and features"""
#         # Store original columns
#         orig_columns = df.columns.tolist()
        
#         # Remove Date column if exists
#         if 'Date' in df.columns:
#             df = df.drop('Date', axis=1)
            
#         # Ensure all required columns exist
#         required_columns = ['Open', 'High', 'Low', 'Close', 'Volume']
#         missing_columns = [col for col in required_columns if col not in df.columns]
#         if missing_columns:
#             raise ValueError(f"Missing required columns: {missing_columns}")
            
#         # Convert Volume to numeric if it isn't already
#         if 'Volume' in df.columns:
#             df['Volume'] = pd.to_numeric(df['Volume'].astype(str).str.replace(',', ''), errors='coerce')
            
#         # Add technical indicators
#         df['SMA_20'] = df['Close'].rolling(window=20).mean()
#         df['SMA_50'] = df['Close'].rolling(window=50).mean()
        
#         # RSI
#         delta = df['Close'].diff()
#         gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
#         loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
#         rs = gain / loss
#         df['RSI'] = 100 - (100 / (1 + rs))
        
#         # MACD
#         exp1 = df['Close'].ewm(span=12, adjust=False).mean()
#         exp2 = df['Close'].ewm(span=26, adjust=False).mean()
#         df['MACD'] = exp1 - exp2
#         df['Signal_Line'] = df['MACD'].ewm(span=9, adjust=False).mean()
        
#         # Bollinger Bands
#         df['BB_middle'] = df['Close'].rolling(window=20).mean()
#         df['BB_upper'] = df['BB_middle'] + 2 * df['Close'].rolling(window=20).std()
#         df['BB_lower'] = df['BB_middle'] - 2 * df['Close'].rolling(window=20).std()
        
#         # Price momentum
#         df['Momentum'] = df['Close'].pct_change(periods=10)
        
#         # Fill NaN values
#         df = df.fillna(method='bfill')
        
#         # Store feature columns
#         if self.feature_columns is None:
#             self.feature_columns = df.columns.tolist()
        
#         return df
        
#     def prepare_data(self, data):
#         """Prepare data for training or prediction"""
#         # Convert to DataFrame if it's a Series
#         df = pd.DataFrame(data) if isinstance(data, pd.Series) else data.copy()
        
#         # Prepare features
#         df = self.prepare_features(df)
        
#         # Scale features
#         scaled_features = self.scaler.fit_transform(df)
        
#         X, y = [], []
#         for i in range(self.sequence_length, len(scaled_features)):
#             X.append(scaled_features[i-self.sequence_length:i])
#             y.append(scaled_features[i, df.columns.get_loc('Close')])
            
#         return np.array(X), np.array(y)
    
#     def build_model(self, input_shape):
#         """Build the LSTM model"""
#         model = Sequential([
#             LSTM(100, return_sequences=True, input_shape=input_shape),
#             Dropout(0.2),
#             LSTM(100, return_sequences=True),
#             Dropout(0.2),
#             LSTM(100),
#             Dropout(0.2),
#             Dense(50),
#             Dense(1)
#         ])
        
#         model.compile(optimizer='adam', loss='mean_squared_error')
#         self.model = model
#         return model
    
#     def train(self, data, epochs=50, batch_size=32, validation_split=0.2):
#         """Train the model with the given data"""
#         # Prepare training data
#         X, y = self.prepare_data(data)
        
#         # Build model if not already built
#         if self.model is None:
#             input_shape = (X.shape[1], X.shape[2])
#             self.build_model(input_shape)
            
#         # Train the model
#         history = self.model.fit(
#             X, y,
#             epochs=epochs,
#             batch_size=batch_size,
#             validation_split=validation_split,
#             verbose=1
#         )
        
#         return history
    
#     def predict_next_day(self, data):
#         """Predict the next day's closing price"""
#         try:
#             # Convert to DataFrame if necessary
#             df = pd.DataFrame(data) if isinstance(data, pd.Series) else data.copy()
            
#             # Add technical indicators
#             df = self.prepare_features(df)
            
#             # Ensure columns match training data
#             missing_cols = set(self.feature_columns) - set(df.columns)
#             if missing_cols:
#                 raise ValueError(f"Missing columns from training data: {missing_cols}")
            
#             # Reorder columns to match training data
#             df = df[self.feature_columns]
            
#             # Get the most recent sequence
#             recent_data = df.tail(self.sequence_length)
            
#             # Scale the features
#             scaled_data = self.scaler.transform(recent_data)
#             X = scaled_data.reshape(1, self.sequence_length, scaled_data.shape[1])
            
#             # Make prediction
#             scaled_prediction = self.model.predict(X, verbose=0)
            
#             # Create a dummy row for inverse transform
#             dummy = np.zeros((1, scaled_data.shape[1]))
#             dummy[0, df.columns.get_loc('Close')] = scaled_prediction[0, 0]
            
#             # Inverse transform to get the actual price
#             prediction = self.scaler.inverse_transform(dummy)[0, df.columns.get_loc('Close')]
            
#             return prediction
#         except Exception as e:
#             print(f"Error in predict_next_day: {str(e)}")
#             raise
    
#     def analyze_trends(self, data):
#         """Analyze market trends"""
#         df = pd.DataFrame(data)
#         analyzer = TechnicalAnalysis(df)
        
#         # Get various analyses
#         trend = analyzer.determine_trend()
#         performance = analyzer.get_best_performing_periods()
#         levels = analyzer.get_support_resistance_levels()
        
#         return {
#             'trend': trend,
#             'performance': performance,
#             'support_resistance': levels
#         }
    
#     def save_model(self, model_path, scaler_path):
#         """Save the model and scaler"""
#         # Save model, scaler, and feature columns
#         self.model.save(model_path)
        
#         # Save scaler and feature columns together
#         save_dict = {
#             'scaler': self.scaler,
#             'feature_columns': self.feature_columns
#         }
#         joblib.dump(save_dict, scaler_path)
    
#     def load_model(self, model_path, scaler_path):
#         """Load the saved model and scaler"""
#         self.model = tf.keras.models.load_model(model_path)
        
#         # Load scaler and feature columns
#         saved_dict = joblib.load(scaler_path)
#         self.scaler = saved_dict['scaler']
#         self.feature_columns = saved_dict['feature_columns']

# models/stock_model.py
import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
import joblib
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class StockPricePredictor:
    def __init__(self, sequence_length=60):
        self.sequence_length = sequence_length
        self.model = None
        self.scaler = MinMaxScaler(feature_range=(0, 1))
        self.feature_columns = None
        
    def prepare_features(self, df):
        """Prepare all technical indicators and features"""
        try:
            # Store original columns
            orig_columns = df.columns.tolist()
            
            # Remove Date column if exists
            if 'Date' in df.columns:
                df = df.drop('Date', axis=1)
                
            # Ensure all required columns exist
            required_columns = ['Open', 'High', 'Low', 'Close', 'Volume']
            missing_columns = [col for col in required_columns if col not in df.columns]
            if missing_columns:
                raise ValueError(f"Missing required columns: {missing_columns}")
                
            # Convert Volume to numeric if it isn't already
            if 'Volume' in df.columns:
                df['Volume'] = pd.to_numeric(df['Volume'].astype(str).str.replace(',', ''), errors='coerce')
                
            # Add technical indicators
            df['SMA_20'] = df['Close'].rolling(window=20).mean()
            df['SMA_50'] = df['Close'].rolling(window=50).mean()
            
            # RSI
            delta = df['Close'].diff()
            gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
            loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
            rs = gain / loss
            df['RSI'] = 100 - (100 / (1 + rs))
            
            # MACD
            exp1 = df['Close'].ewm(span=12, adjust=False).mean()
            exp2 = df['Close'].ewm(span=26, adjust=False).mean()
            df['MACD'] = exp1 - exp2
            df['Signal_Line'] = df['MACD'].ewm(span=9, adjust=False).mean()
            
            # Bollinger Bands
            df['BB_middle'] = df['Close'].rolling(window=20).mean()
            df['BB_upper'] = df['BB_middle'] + 2 * df['Close'].rolling(window=20).std()
            df['BB_lower'] = df['BB_middle'] - 2 * df['Close'].rolling(window=20).std()
            
            # Price momentum
            df['Momentum'] = df['Close'].pct_change(periods=10)
            
            # Fill NaN values using forward fill then backward fill
            df = df.ffill().bfill()
            
            # Store feature columns
            if self.feature_columns is None:
                self.feature_columns = df.columns.tolist()
            
            return df
            
        except Exception as e:
            logger.error(f"Error in prepare_features: {str(e)}")
            raise
    
    def train(self, data, epochs=50, batch_size=32, validation_split=0.2):
        """Train the model with the given data"""
        try:
            # Prepare training data
            X, y = self.prepare_data(data)
            
            # Build model if not already built
            if self.model is None:
                input_shape = (X.shape[1], X.shape[2])
                self.build_model(input_shape)
                
            # Train the model
            history = self.model.fit(
                X, y,
                epochs=epochs,
                batch_size=batch_size,
                validation_split=validation_split,
                verbose=1
            )
            
            return history
            
        except Exception as e:
            logger.error(f"Error in train: {str(e)}")
            raise
    
    def prepare_data(self, data):
        """Prepare data for training or prediction"""
        try:
            # Convert to DataFrame if it's a Series
            df = pd.DataFrame(data) if isinstance(data, pd.Series) else data.copy()
            
            # Prepare features
            df = self.prepare_features(df)
            
            # Scale features
            scaled_features = self.scaler.fit_transform(df)
            
            X, y = [], []
            for i in range(self.sequence_length, len(scaled_features)):
                X.append(scaled_features[i-self.sequence_length:i])
                y.append(scaled_features[i, df.columns.get_loc('Close')])
                
            return np.array(X), np.array(y)
            
        except Exception as e:
            logger.error(f"Error in prepare_data: {str(e)}")
            raise
    
    def build_model(self, input_shape):
        """Build the LSTM model"""
        try:
            model = Sequential([
                LSTM(100, return_sequences=True, input_shape=input_shape),
                Dropout(0.2),
                LSTM(100, return_sequences=True),
                Dropout(0.2),
                LSTM(100),
                Dropout(0.2),
                Dense(50),
                Dense(1)
            ])
            
            model.compile(
                optimizer='adam', 
                loss='mean_squared_error',
                metrics=['mae', 'mse']  # Adding metrics for training visibility
            )
            
            self.model = model
            return model
            
        except Exception as e:
            logger.error(f"Error in build_model: {str(e)}")
            raise
    
    def predict_next_day(self, data):
        """Predict the next day's closing price"""
        try:
            # Convert to DataFrame if necessary
            df = pd.DataFrame(data) if isinstance(data, pd.Series) else data.copy()
            
            # Add technical indicators
            df = self.prepare_features(df)
            
            # Ensure columns match training data
            missing_cols = set(self.feature_columns) - set(df.columns)
            if missing_cols:
                raise ValueError(f"Missing columns from training data: {missing_cols}")
            
            # Reorder columns to match training data
            df = df[self.feature_columns]
            
            # Get the most recent sequence
            recent_data = df.tail(self.sequence_length)
            
            # Scale the features
            scaled_data = self.scaler.transform(recent_data)
            X = scaled_data.reshape(1, self.sequence_length, scaled_data.shape[1])
            
            # Make prediction
            scaled_prediction = self.model.predict(X, verbose=0)
            
            # Create a dummy row for inverse transform
            dummy = np.zeros((1, scaled_data.shape[1]))
            dummy[0, df.columns.get_loc('Close')] = scaled_prediction[0, 0]
            
            # Inverse transform to get the actual price
            prediction = self.scaler.inverse_transform(dummy)[0, df.columns.get_loc('Close')]
            
            return prediction
            
        except Exception as e:
            logger.error(f"Error in predict_next_day: {str(e)}")
            raise
    
    def save_model(self, model_path, scaler_path):
        """Save the model and scaler"""
        try:
            # Save model
            self.model.save(model_path)
            
            # Save scaler and feature columns together
            save_dict = {
                'scaler': self.scaler,
                'feature_columns': self.feature_columns
            }
            joblib.dump(save_dict, scaler_path)
            
            logger.info("Model and scaler saved successfully")
            
        except Exception as e:
            logger.error(f"Error in save_model: {str(e)}")
            raise
    
    def load_model(self, model_path, scaler_path):
        """Load the saved model and scaler"""
        try:
            # Load model with custom metrics
            self.model = tf.keras.models.load_model(
                model_path,
                custom_objects=None,
                compile=True  # Ensure the model is compiled
            )
            
            # Load scaler and feature columns
            saved_dict = joblib.load(scaler_path)
            self.scaler = saved_dict['scaler']
            self.feature_columns = saved_dict['feature_columns']
            
            # Compile the model with metrics
            self.model.compile(
                optimizer='adam',
                loss='mean_squared_error',
                metrics=['mae', 'mse']
            )
            
            logger.info("Model and scaler loaded successfully")
            
        except Exception as e:
            logger.error(f"Error in load_model: {str(e)}")
            raise
        
    def analyze_trends(self, df):
        """Analyze market trends from the data"""
        try:
            # Convert data types
            df = df.copy()
            df['Date'] = pd.to_datetime(df['Date'])
            
            # Clean numeric data
            numeric_columns = ['Open', 'High', 'Low', 'Close']
            for col in numeric_columns:
                df[col] = pd.to_numeric(df[col].astype(str).str.replace('[^\d.]', ''), errors='coerce')
            
            # Calculate moving averages
            df['SMA_20'] = df['Close'].rolling(window=20).mean()
            df['SMA_50'] = df['Close'].rolling(window=50).mean()
            
            # Determine trend
            current_price = df['Close'].iloc[0]
            sma_20 = df['SMA_20'].iloc[0]
            sma_50 = df['SMA_50'].iloc[0]
            
            if current_price > sma_20 > sma_50:
                trend = 'uptrend'
            elif current_price < sma_20 < sma_50:
                trend = 'downtrend'
            else:
                trend = 'sideways'
                
            # Calculate performance metrics
            df['Daily_Return'] = df['Close'].pct_change() * 100
            best_day = df.nlargest(1, 'Daily_Return').iloc[0]
            worst_day = df.nsmallest(1, 'Daily_Return').iloc[0]
            
            # Calculate support and resistance levels
            last_price = df['Close'].iloc[0]
            support_levels = df['Low'].nsmallest(3).tolist()
            resistance_levels = df['High'].nlargest(3).tolist()
            
            return {
                'trend': trend,
                'performance': {
                    'best_day': {
                        'date': best_day['Date'].strftime('%Y-%m-%d'),
                        'return': float(best_day['Daily_Return']),
                        'close': float(best_day['Close'])
                    },
                    'worst_day': {
                        'date': worst_day['Date'].strftime('%Y-%m-%d'),
                        'return': float(worst_day['Daily_Return']),
                        'close': float(worst_day['Close'])
                    }
                },
                'support_resistance': {
                    'support_levels': support_levels,
                    'resistance_levels': resistance_levels
                }
            }
        except Exception as e:
            logger.error(f"Error in analyze_trends: {str(e)}")
            raise
        
    def predict_weekly(self, data):
        """Predict stock prices for the next week"""
        try:
            # Convert to DataFrame if necessary
            df = pd.DataFrame(data) if isinstance(data, pd.Series) else data.copy()
            
            # Add technical indicators
            df = self.prepare_features(df)
            
            # Ensure columns match training data
            missing_cols = set(self.feature_columns) - set(df.columns)
            if missing_cols:
                raise ValueError(f"Missing columns from training data: {missing_cols}")
            
            # Reorder columns to match training data
            df = df[self.feature_columns]
            
            # Get the most recent sequence
            recent_data = df.tail(self.sequence_length)
            
            # Scale the features
            scaled_data = self.scaler.transform(recent_data)
            
            # Initialize predictions array
            weekly_predictions = []
            temp_data = scaled_data.copy()
            
            # Predict for next 5 trading days
            for _ in range(5):
                # Reshape data for prediction
                X = temp_data.reshape(1, self.sequence_length, temp_data.shape[1])
                
                # Make prediction
                scaled_prediction = self.model.predict(X, verbose=0)
                
                # Create a dummy row for inverse transform
                dummy = np.zeros((1, scaled_data.shape[1]))
                dummy[0, df.columns.get_loc('Close')] = scaled_prediction[0, 0]
                
                # Inverse transform to get actual price
                prediction = self.scaler.inverse_transform(dummy)[0, df.columns.get_loc('Close')]
                weekly_predictions.append(float(prediction))
                
                # Update temp_data for next prediction
                new_row = temp_data[-1].copy()
                new_row[df.columns.get_loc('Close')] = scaled_prediction[0, 0]
                temp_data = np.vstack((temp_data[1:], new_row))
            
            # Calculate confidence scores based on model uncertainty
            confidence_scores = []
            for i in range(len(weekly_predictions)):
                # Simple confidence calculation based on prediction day
                # Confidence decreases as we predict further into the future
                confidence = max(0.9 - (i * 0.1), 0.5)
                confidence_scores.append(confidence)
            
            return [{
                'day': i + 1,
                'price': price,
                'confidence': conf
            } for i, (price, conf) in enumerate(zip(weekly_predictions, confidence_scores))]
            
        except Exception as e:
            logger.error(f"Error in predict_weekly: {str(e)}")
            raise