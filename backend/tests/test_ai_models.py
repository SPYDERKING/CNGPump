import pytest
import pandas as pd
from ai_models.demand_predictor import DemandPredictor

def test_demand_predictor_initialization():
    """Test DemandPredictor initialization"""
    predictor = DemandPredictor()
    
    assert predictor.model is None
    assert predictor.is_trained == False
    assert predictor.model_path == "ai_models/demand_model.pkl"

def test_prepare_features():
    """Test feature preparation for demand prediction"""
    predictor = DemandPredictor()
    
    # Create sample data
    data = pd.DataFrame({
        'pump_id': ['pump1', 'pump1', 'pump2'],
        'slot_date': ['2023-01-01', '2023-01-01', '2023-01-02'],
        'slot_time': ['10:00:00', '11:00:00', '10:00:00'],
        'demand_count': [5, 3, 7],
        'weather': ['clear', 'clear', 'rainy'],
        'traffic': ['low', 'medium', 'high']
    })
    
    features = predictor.prepare_features(data)
    
    assert isinstance(features, pd.DataFrame)
    assert len(features) == 3
    assert 'hour' in features.columns
    assert 'day_of_week' in features.columns
    assert 'month' in features.columns

def test_predict_demand_without_model():
    """Test demand prediction without a trained model"""
    predictor = DemandPredictor()
    
    # Try to predict without training
    prediction = predictor.predict_demand(
        pump_id="pump1",
        slot_date=pd.Timestamp("2023-01-01"),
        slot_time="10:00",
        weather="clear",
        traffic="low"
    )
    
    # Should return default value
    assert isinstance(prediction, float)
    assert prediction >= 0

def test_generate_token_code_format():
    """Test that generated token codes have the correct format"""
    from utils.qr_generator import generate_token_code
    
    for _ in range(10):  # Test multiple generations
        token_code = generate_token_code()
        assert isinstance(token_code, str)
        assert token_code.startswith("CNG-")
        assert len(token_code) == 10
        # Check that the part after CNG- contains only valid characters
        suffix = token_code[4:]
        valid_chars = set('ABCDEFGHJKLMNPQRSTUVWXYZ23456789')
        assert all(c in valid_chars for c in suffix)

def test_qr_code_generation():
    """Test QR code generation produces valid output"""
    from utils.qr_generator import generate_qr_code
    
    data = "test_data_for_qr"
    qr_image, qr_data = generate_qr_code(data)
    
    assert isinstance(qr_image, str)
    assert qr_data == data
    # QR code should be a base64 string
    assert len(qr_image) > 100
    assert qr_image.startswith("iVBORw0KGgo") or "base64" in qr_image.lower()