# backend/utils/data_processor.py
import pandas as pd
import numpy as np
from typing import Tuple

class DataProcessor:
    @staticmethod
    def load_and_clean_data(file_path: str) -> pd.DataFrame:
        """
        Load and clean the stock data
        """
        df = pd.read_csv(file_path)
        
        # Convert date to datetime
        df['Date'] = pd.to_datetime(df['Date'])
        
        # Sort by date
        df = df.sort_values('Date')
        
        # Handle missing values
        df = df.dropna(subset=['Close'])
        
        # Reset index after cleaning
        df = df.reset_index(drop=True)
        
        return df
    
    @staticmethod
    def prepare_training_data(data: pd.DataFrame, target_column: str = 'Close') -> pd.DataFrame:
        """
        Prepare data for training by adding technical indicators
        """
        df = data.copy()
        
        # Add rolling means
        df['MA5'] = df[target_column].rolling(window=5).mean()
        df['MA20'] = df[target_column].rolling(window=20).mean()
        
        # Add daily returns
        df['Returns'] = df[target_column].pct_change()
        
        # Add volatility
        df['Volatility'] = df['Returns'].rolling(window=20).std()
        
        # Drop rows with NaN values created by rolling calculations
        df = df.dropna()
        
        return df
    
    @staticmethod
    def split_data(data: pd.DataFrame, train_ratio: float = 0.8) -> Tuple[pd.DataFrame, pd.DataFrame]:
        """
        Split data into training and testing sets
        """
        train_size = int(len(data) * train_ratio)
        train_data = data[:train_size]
        test_data = data[train_size:]
        
        return train_data, test_data