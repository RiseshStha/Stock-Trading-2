from flask import Blueprint, jsonify, request
from flask_cors import CORS
import pandas as pd
import numpy as np
from models.stock_model import StockPricePredictor
import os
import logging

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

api = Blueprint('api', __name__)
CORS(api)

model = StockPricePredictor()

def load_stock_data():
    """Helper function to load and process stock data"""
    try:
        # Get the current directory (where routes.py is located)
        current_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        
        # Define possible file paths
        possible_paths = [
            os.path.join(current_dir, 'data', 'raw', 'nepsealpha_export_price_UNL_20200103_20250103.csv'),
            os.path.join(current_dir, 'data', 'raw', 'nepsealpha_export_price_UNL_2020-01-03_2025-01-03.csv'),
            os.path.join(current_dir, 'backend', 'data', 'raw', 'nepsealpha_export_price_UNL_20200103_20250103.csv')
        ]
        
        # Try each possible path
        data_path = None
        for path in possible_paths:
            if os.path.exists(path):
                data_path = path
                break
        
        if data_path is None:
            raise FileNotFoundError(f"Data file not found in any of the expected locations: {possible_paths}")
            
        logger.info(f"Loading data from: {data_path}")
        
        # Read the CSV file
        df = pd.read_csv(data_path)
        df['Date'] = pd.to_datetime(df['Date'])
        
        # Clean numeric columns
        numeric_columns = ['Open', 'High', 'Low', 'Close', 'Volume']
        for col in numeric_columns:
            df[col] = pd.to_numeric(df[col].astype(str).str.replace(',', ''), errors='coerce')
        
        # Handle missing values
        df = df.fillna(method='ffill').fillna(method='bfill')
        
        # Sort by date in descending order
        df = df.sort_values('Date', ascending=False)
        
        return df
        
    except Exception as e:
        logger.error(f"Error loading data: {str(e)}")
        raise

@api.route('/historical', methods=['GET'])
def get_historical_data():
    try:
        df = load_stock_data()
        
        # Calculate additional metrics
        analysis = model.analyze_trends(df)
        
        # Prepare response data
        historical_data = df[['Date', 'Close', 'High', 'Low', 'Volume']].to_dict('records')
        
        return jsonify({
            'data': historical_data,
            'trend_analysis': analysis['trend'],
            'performance_metrics': analysis['performance'],
            'support_resistance': analysis['support_resistance'],
            'status': 'success'
        })
    except Exception as e:
        logger.error(f"Error in get_historical_data: {str(e)}")
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 400

@api.route('/trading/signals', methods=['GET'])
def get_trading_signals():
    try:
        df = load_stock_data()
        
        from models.trading_strategy import TradingStrategy
        strategy = TradingStrategy(df)
        
        signals = strategy.generate_signals()
        backtest_results = strategy.backtest_strategy()
        
        signals_dict = [vars(signal) for signal in signals]
        
        return jsonify({
            'signals': signals_dict,
            'backtest_results': backtest_results,
            'status': 'success'
        })
    except Exception as e:
        logger.error(f"Error in trading signals: {str(e)}")
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 400

@api.route('/analysis/temporal', methods=['GET'])
def get_temporal_analysis():
    try:
        df = load_stock_data()
        
        from models.trading_strategy import TradingStrategy
        strategy = TradingStrategy(df)
        
        temporal_patterns = strategy.analyze_temporal_patterns()
        
        return jsonify({
            'temporal_patterns': temporal_patterns,
            'status': 'success'
        })
    except Exception as e:
        logger.error(f"Error in temporal analysis: {str(e)}")
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 400

@api.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        
        if not data or 'prices' not in data:
            return jsonify({
                'error': 'No data provided or invalid format',
                'status': 'error'
            }), 400

        df = pd.DataFrame(data['prices'])
        
        # Convert data types
        if 'Date' in df.columns:
            df['Date'] = pd.to_datetime(df['Date'])
            
        # Handle required columns
        required_columns = ['Open', 'High', 'Low', 'Close', 'Volume']
        for col in required_columns:
            if col not in df.columns:
                df[col] = df['Close']
        
        df['Volume'] = pd.to_numeric(df['Volume'].astype(str).str.replace(',', ''), errors='coerce')
        
        prediction = model.predict_next_day(df)
        analysis = model.analyze_trends(df)
        
        return jsonify({
            'prediction': float(prediction),
            'trend_analysis': analysis['trend'],
            'performance_metrics': analysis['performance'],
            'support_resistance': analysis['support_resistance'],
            'status': 'success'
        })
    except Exception as e:
        logger.error(f"Error in prediction: {str(e)}")
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 400

@api.route('/predict/weekly', methods=['POST'])
def predict_weekly():
    try:
        data = request.get_json()
        
        if not data or 'prices' not in data:
            return jsonify({
                'error': 'No data provided or invalid format',
                'status': 'error'
            }), 400

        df = pd.DataFrame(data['prices'])
        
        # Convert data types
        if 'Date' in df.columns:
            df['Date'] = pd.to_datetime(df['Date'])
            
        # Handle required columns
        required_columns = ['Open', 'High', 'Low', 'Close', 'Volume']
        for col in required_columns:
            if col not in df.columns:
                df[col] = df['Close']
        
        df['Volume'] = pd.to_numeric(df['Volume'].astype(str).str.replace(',', ''), errors='coerce')
        
        predictions = model.predict_weekly(df)
        analysis = model.analyze_trends(df)
        
        # Calculate prediction dates
        start_date = pd.to_datetime(df['Date'].iloc[-1]) + pd.Timedelta(days=1)
        prediction_dates = [(start_date + pd.Timedelta(days=i)).strftime('%Y-%m-%d') 
                          for i in range(5)]
        
        for pred, date in zip(predictions, prediction_dates):
            pred['date'] = date
        
        return jsonify({
            'weekly_predictions': predictions,
            'trend_analysis': analysis['trend'],
            'performance_metrics': analysis['performance'],
            'support_resistance': analysis['support_resistance'],
            'status': 'success'
        })
    except Exception as e:
        logger.error(f"Error in weekly prediction: {str(e)}")
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 400

@api.route('/retrain', methods=['POST'])
def retrain_model():
    try:
        # Load the data
        df = load_stock_data()
        
        # Split data into training and testing sets (80-20 split)
        train_size = int(len(df) * 0.8)
        train_data = df[:train_size]
        
        # Initialize and train model
        logger.info("Retraining model...")
        model.sequence_length = 60  # Reset sequence length
        
        # Train the model
        history = model.train(
            data=train_data,
            epochs=50,
            batch_size=32,
            validation_split=0.2
        )
        
        # Save the retrained model
        current_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        model_path = os.path.join(current_dir, 'models', 'saved_models', 'stock_model.h5')
        scaler_path = os.path.join(current_dir, 'models', 'saved_models', 'scaler.pkl')
        
        model.save_model(model_path, scaler_path)
        
        # Get final metrics from training history
        final_metrics = {
            'loss': float(history.history['loss'][-1]),
            'val_loss': float(history.history['val_loss'][-1]) if 'val_loss' in history.history else None,
            'epochs_trained': len(history.history['loss'])
        }
        
        return jsonify({
            'message': 'Model retrained successfully',
            'metrics': final_metrics,
            'status': 'success'
        })
        
    except Exception as e:
        logger.error(f"Error in model retraining: {str(e)}")
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 400
