import os
import pandas as pd
import numpy as np
from models.stock_model import StockPricePredictor

def prepare_training_data(df):
    """Prepare and enhance training data with technical indicators"""
    # Convert 'Date' to datetime if it isn't already
    df['Date'] = pd.to_datetime(df['Date'])
    
    # Remove unwanted columns
    numeric_columns = ['Open', 'High', 'Low', 'Close', 'Volume']
    df = df[numeric_columns].copy()
    
    # Convert Volume to numeric, removing any non-numeric characters
    df['Volume'] = pd.to_numeric(df['Volume'].astype(str).str.replace(',', ''), errors='coerce')
    
    # Calculate technical indicators
    df['SMA_20'] = df['Close'].rolling(window=20).mean()
    df['SMA_50'] = df['Close'].rolling(window=50).mean()
    
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
    
    # Calculate Bollinger Bands
    df['BB_middle'] = df['Close'].rolling(window=20).mean()
    df['BB_upper'] = df['BB_middle'] + 2 * df['Close'].rolling(window=20).std()
    df['BB_lower'] = df['BB_middle'] - 2 * df['Close'].rolling(window=20).std()
    
    # Calculate price momentum
    df['Momentum'] = df['Close'].pct_change(periods=10)
    
    # Handle NaN values
    df = df.fillna(df.bfill())
    
    return df

def evaluate_model(model, test_data):
    """Evaluate model performance"""
    predictions = []
    actuals = []
    
    for i in range(len(test_data) - model.sequence_length):
        sequence = test_data.iloc[i:i+model.sequence_length]
        next_day = test_data.iloc[i+model.sequence_length]['Close']
        
        prediction = model.predict_next_day(sequence)
        predictions.append(prediction)
        actuals.append(next_day)
    
    # Calculate metrics
    predictions = np.array(predictions)
    actuals = np.array(actuals)
    
    mse = np.mean((predictions - actuals) ** 2)
    rmse = np.sqrt(mse)
    mae = np.mean(np.abs(predictions - actuals))
    mape = np.mean(np.abs((predictions - actuals) / actuals)) * 100
    
    return {
        'mse': mse,
        'rmse': rmse,
        'mae': mae,
        'mape': mape
    }

def main():
    try:
        # Create directories if they don't exist
        os.makedirs('models/saved_models', exist_ok=True)
        os.makedirs('data/raw', exist_ok=True)

        # Define paths
        data_path = 'C:\\Users\\Acer\\OneDrive\\Desktop\\Stock Trading Model 2\\backend\\data\\raw\\nepsealpha_export_price_UNL_2020-01-03_2025-01-03.csv'
        model_path = 'models/saved_models/stock_model.h5'
        scaler_path = 'models/saved_models/scaler.pkl'

        # Load and prepare data
        print("Loading and preparing data...")
        df = pd.read_csv(data_path)
        df = prepare_training_data(df)
        print(f"Data prepared successfully. Shape: {df.shape}")

        # Split data into training and testing sets (80-20 split)
        train_size = int(len(df) * 0.8)
        train_data = df[:train_size]
        test_data = df[train_size:]

        # Initialize and train model
        print("Initializing model...")
        model = StockPricePredictor(sequence_length=60)

        print("Training model...")
        history = model.train(
            data=train_data,
            epochs=50,
            batch_size=32,
            validation_split=0.2
        )

        # Evaluate model
        print("Evaluating model...")
        metrics = evaluate_model(model, test_data)
        print("\\nModel Performance Metrics:")
        print(f"Mean Squared Error: {metrics['mse']:.2f}")
        print(f"Root Mean Squared Error: {metrics['rmse']:.2f}")
        print(f"Mean Absolute Error: {metrics['mae']:.2f}")
        print(f"Mean Absolute Percentage Error: {metrics['mape']:.2f}%")

        # Save model
        print("\\nSaving model...")
        model.save_model(model_path, scaler_path)

        # Test prediction
        print("\\nTesting prediction...")
        latest_data = df.head(60)
        test_prediction = model.predict_next_day(latest_data)
        print(f"Predicted next day closing price: Rs. {test_prediction:.2f}")

        print("\\nTraining completed successfully!")

    except Exception as e:
        print(f"Error during training: {str(e)}")
        raise

if __name__ == "__main__":
    main()