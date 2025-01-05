import numpy as np
from sklearn.model_selection import TimeSeriesSplit
from tensorflow.keras.callbacks import EarlyStopping
import itertools

class ModelTuner:
    def __init__(self, stock_model, train_data, val_data):
        self.model = stock_model
        self.train_data = train_data
        self.val_data = val_data
        
    def grid_search(self):
        """Perform grid search for hyperparameter tuning"""
        param_grid = {
            'sequence_length': [30, 45, 60],
            'lstm_units': [[50, 50, 50], [100, 100, 100], [150, 150, 150]],
            'dropout_rate': [0.2, 0.3, 0.4],
            'learning_rate': [0.001, 0.0005, 0.0001],
            'batch_size': [16, 32, 64]
        }
        
        best_params = None
        best_val_loss = float('inf')
        
        # Generate all combinations of parameters
        keys = param_grid.keys()
        values = param_grid.values()
        combinations = list(itertools.product(*values))
        
        for combo in combinations:
            params = dict(zip(keys, combo))
            val_loss = self._evaluate_params(params)
            
            if val_loss < best_val_loss:
                best_val_loss = val_loss
                best_params = params
                
        return best_params, best_val_loss
    
    def _evaluate_params(self, params):
        """Evaluate a set of hyperparameters"""
        # Configure model with parameters
        self.model.sequence_length = params['sequence_length']
        self.model.build_model(
            lstm_units=params['lstm_units'],
            dropout_rate=params['dropout_rate'],
            learning_rate=params['learning_rate']
        )
        
        # Train with early stopping
        early_stopping = EarlyStopping(
            monitor='val_loss',
            patience=5,
            restore_best_weights=True
        )
        
        history = self.model.train(
            self.train_data,
            validation_data=self.val_data,
            batch_size=params['batch_size'],
            epochs=50,
            callbacks=[early_stopping],
            verbose=0
        )
        
        return min(history.history['val_loss'])
    
    def time_series_cv(self, params, n_splits=5):
        """Perform time series cross-validation"""
        tscv = TimeSeriesSplit(n_splits=n_splits)
        scores = []
        
        for train_idx, val_idx in tscv.split(self.train_data):
            train_fold = self.train_data.iloc[train_idx]
            val_fold = self.train_data.iloc[val_idx]
            
            # Configure and train model
            self.model.sequence_length = params['sequence_length']
            self.model.build_model(
                lstm_units=params['lstm_units'],
                dropout_rate=params['dropout_rate'],
                learning_rate=params['learning_rate']
            )
            
            # Train model
            history = self.model.train(
                train_fold,
                validation_data=val_fold,
                batch_size=params['batch_size'],
                epochs=50,
                verbose=0
            )
            
            scores.append(min(history.history['val_loss']))
            
        return np.mean(scores), np.std(scores)
    
    def optimize_sequence_length(self, min_length=10, max_length=100, step=5):
        """Find optimal sequence length"""
        best_length = self.model.sequence_length
        best_val_loss = float('inf')
        
        for length in range(min_length, max_length + 1, step):
            self.model.sequence_length = length
            val_loss = self._evaluate_params({
                'sequence_length': length,
                'lstm_units': [100, 100, 100],
                'dropout_rate': 0.2,
                'learning_rate': 0.001,
                'batch_size': 32
            })
            
            if val_loss < best_val_loss:
                best_val_loss = val_loss
                best_length = length
                
        return best_length