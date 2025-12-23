import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error
import joblib
from typing import List, Dict, Any
from datetime import datetime, timedelta
import os

class DemandPredictor:
    def __init__(self):
        self.model = None
        self.is_trained = False
        self.model_path = "ai_models/demand_model.pkl"
        
    def prepare_features(self, data: pd.DataFrame) -> pd.DataFrame:
        """
        Prepare features for training the demand prediction model.
        
        Args:
            data (pd.DataFrame): Raw data containing historical bookings
            
        Returns:
            pd.DataFrame: Processed features for training
        """
        # Extract time-based features
        data['hour'] = pd.to_datetime(data['slot_time'], format='%H:%M:%S').dt.hour
        data['day_of_week'] = pd.to_datetime(data['slot_date']).dt.dayofweek
        data['month'] = pd.to_datetime(data['slot_date']).dt.month
        
        # Create aggregated features
        features = data.groupby(['pump_id', 'slot_date', 'hour', 'day_of_week', 'month', 'weather', 'traffic']).agg({
            'demand_count': 'sum'
        }).reset_index()
        
        return features
    
    def train(self, training_data: pd.DataFrame) -> Dict[str, Any]:
        """
        Train the demand prediction model.
        
        Args:
            training_data (pd.DataFrame): Historical data for training
            
        Returns:
            Dict[str, Any]: Training metrics
        """
        # Prepare features
        features = self.prepare_features(training_data)
        
        # Define feature columns and target
        feature_columns = ['hour', 'day_of_week', 'month', 'weather', 'traffic']
        X = features[feature_columns]
        y = features['demand_count']
        
        # Handle categorical variables
        X = pd.get_dummies(X, columns=['weather', 'traffic'], dummy_na=True)
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Train model
        self.model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.model.fit(X_train, y_train)
        
        # Evaluate model
        y_pred = self.model.predict(X_test)
        mse = mean_squared_error(y_test, y_pred)
        rmse = np.sqrt(mse)
        
        self.is_trained = True
        
        # Save model
        os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
        joblib.dump(self.model, self.model_path)
        
        return {
            "mse": mse,
            "rmse": rmse,
            "samples": len(training_data)
        }
    
    def load_model(self) -> bool:
        """
        Load a pre-trained model from disk.
        
        Returns:
            bool: True if model loaded successfully, False otherwise
        """
        try:
            if os.path.exists(self.model_path):
                self.model = joblib.load(self.model_path)
                self.is_trained = True
                return True
            return False
        except Exception as e:
            print(f"Error loading model: {str(e)}")
            return False
    
    def predict_demand(self, pump_id: str, slot_date: datetime, slot_time: str, 
                      weather: str = "clear", traffic: str = "low") -> float:
        """
        Predict demand for a specific time slot.
        
        Args:
            pump_id (str): Pump identifier
            slot_date (datetime): Date of the slot
            slot_time (str): Time of the slot (HH:MM format)
            weather (str): Weather condition
            traffic (str): Traffic condition
            
        Returns:
            float: Predicted demand count
        """
        if not self.is_trained and not self.load_model():
            # Return average demand if no model is available
            return 5.0
            
        try:
            # Parse time
            hour = int(slot_time.split(':')[0])
            
            # Extract date features
            day_of_week = slot_date.weekday()
            month = slot_date.month
            
            # Create feature vector
            features = pd.DataFrame({
                'hour': [hour],
                'day_of_week': [day_of_week],
                'month': [month],
                'weather': [weather],
                'traffic': [traffic]
            })
            
            # Handle categorical variables (same as training)
            features = pd.get_dummies(features, columns=['weather', 'traffic'], dummy_na=True)
            
            # Ensure all columns from training are present
            # This is a simplified approach - in production, you'd save the training columns
            expected_columns = ['hour', 'day_of_week', 'month', 'weather_clear', 'weather_rainy', 
                              'weather_cloudy', 'traffic_low', 'traffic_medium', 'traffic_high']
            
            for col in expected_columns:
                if col not in features.columns:
                    features[col] = 0
                    
            # Reorder columns to match training
            features = features.reindex(columns=expected_columns, fill_value=0)
            
            # Make prediction
            prediction = self.model.predict(features)[0]
            return max(0, prediction)  # Ensure non-negative prediction
            
        except Exception as e:
            print(f"Error predicting demand: {str(e)}")
            # Return average demand as fallback
            return 5.0

# Global instance
demand_predictor = DemandPredictor()