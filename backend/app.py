# backend/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from models.stock_model import StockPricePredictor
from models.trading_strategy import TradingStrategy
import os
import logging
from datetime import datetime

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(f'app_{datetime.now().strftime("%Y%m%d")}.log')
    ]
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:5173"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Load the trained model
try:
    logger.info("Loading model...")
    model = StockPricePredictor()
    current_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(current_dir, 'models', 'saved_models', 'stock_model.h5')
    scaler_path = os.path.join(current_dir, 'models', 'saved_models', 'scaler.pkl')
    
    if not os.path.exists(model_path) or not os.path.exists(scaler_path):
        logger.warning("Model files not found. Some functionality may be limited.")
    else:
        model.load_model(model_path, scaler_path)
        logger.info("Model loaded successfully!")
except Exception as e:
    logger.error(f"Error loading model: {str(e)}")

def load_stock_data():
    """Helper function to load and process stock data"""
    try:
        # Define possible file paths
        possible_paths = [
            os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data', 'raw', 
                        'nepsealpha_export_price_UNL_20200103_20250103.csv'),
            os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data', 'raw', 
                        'nepsealpha_export_price_UNL_2020-01-03_2025-01-03.csv')
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
        
        # Read and process data
        df = pd.read_csv(data_path)
        df['Date'] = pd.to_datetime(df['Date'])
        
        # Clean numeric data
        numeric_columns = ['Open', 'High', 'Low', 'Close', 'Volume']
        for col in numeric_columns:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col].astype(str).str.replace(',', ''), errors='coerce')
        
        # Handle missing values
        df = df.fillna(method='ffill').fillna(method='bfill')
        
        # Sort by date in descending order
        df = df.sort_values('Date', ascending=False)
        
        return df
        
    except Exception as e:
        logger.error(f"Error loading data: {str(e)}")
        logger.error("Stack trace:", exc_info=True)
        raise

@app.route('/api/historical', methods=['GET'])
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

@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        if not data or 'prices' not in data:
            return jsonify({
                'error': 'No data provided or invalid format',
                'status': 'error'
            }), 400

        df = pd.DataFrame(data['prices'])
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

@app.route('/api/predict/weekly', methods=['POST'])
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

@app.route('/api/trading/signals', methods=['GET'])
def get_trading_signals():
    try:
        df = load_stock_data()
        
        # Initialize trading strategy
        strategy = TradingStrategy(df)
        
        # Generate signals
        signals = strategy.generate_signals()
        
        # Run backtest
        backtest_results = strategy.backtest_strategy()
        
        # Convert signals to dictionary format
        signals_dict = [vars(signal) for signal in signals]
        
        return jsonify({
            'signals': signals_dict,
            'backtest_results': backtest_results,
            'status': 'success'
        })
    except Exception as e:
        logger.error(f"Error generating trading signals: {str(e)}")
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 400

@app.route('/api/analysis/temporal', methods=['GET'])
def get_temporal_analysis():
    try:
        df = load_stock_data()
        
        # Initialize trading strategy
        strategy = TradingStrategy(df)
        
        # Get temporal analysis
        temporal_patterns = strategy.analyze_temporal_patterns()
        
        return jsonify({
            'temporal_patterns': temporal_patterns,
            'status': 'success'
        })
    except Exception as e:
        logger.error(f"Error analyzing temporal patterns: {str(e)}")
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 400

@app.route('/api/metrics', methods=['GET'])
def get_market_metrics():
    try:
        df = load_stock_data()
        
        # Calculate metrics
        current_price = float(df['Close'].iloc[0])
        previous_price = float(df['Close'].iloc[1])
        
        metrics = {
            'current_price': current_price,
            'daily_change': float(current_price - previous_price),
            'daily_change_percent': float((current_price - previous_price) / previous_price * 100),
            'weekly_high': float(df.head(5)['High'].max()),
            'weekly_low': float(df.head(5)['Low'].min()),
            'monthly_high': float(df.head(20)['High'].max()),
            'monthly_low': float(df.head(20)['Low'].min()),
            'average_volume': float(df.head(20)['Volume'].mean())
        }
        
        return jsonify({
            'metrics': metrics,
            'status': 'success'
        })
    except Exception as e:
        logger.error(f"Error calculating metrics: {str(e)}")
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 400
    

if __name__ == '__main__':
    app.run(debug=True)