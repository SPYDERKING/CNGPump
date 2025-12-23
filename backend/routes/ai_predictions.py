from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ai_models.demand_predictor import demand_predictor
from services.pump_service import pump_service
from db import get_db
from uuid import UUID
from datetime import datetime, date
from typing import List
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/train")
def train_demand_model(db: Session = Depends(get_db)):
    """Train the demand prediction model with historical data"""
    # In a real implementation, you would:
    # 1. Fetch historical booking data from the database
    # 2. Prepare features for training
    # 3. Train the model
    # 4. Save the trained model
    
    # For demonstration, we'll return a mock response
    return {
        "message": "Demand prediction model training initiated",
        "status": "success",
        "details": {
            "model_type": "RandomForestRegressor",
            "features": ["hour", "day_of_week", "month", "weather", "traffic"],
            "training_samples": 0  # Would be actual count in real implementation
        }
    }

@router.get("/predict/demand/{pump_id}")
def predict_demand(
    pump_id: UUID,
    slot_date: str,  # Format: YYYY-MM-DD
    slot_time: str,  # Format: HH:MM
    weather: str = "clear",
    traffic: str = "low",
    db: Session = Depends(get_db)
):
    """Predict demand for a specific time slot at a pump"""
    # Verify pump exists
    pump = pump_service.get_pump_by_id(db, pump_id)
    if not pump:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pump not found"
        )
    
    # Parse date and time
    try:
        parsed_date = datetime.strptime(slot_date, "%Y-%m-%d").date()
        # parsed_time = datetime.strptime(slot_time, "%H:%M").time()
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid date or time format. Use YYYY-MM-DD for date and HH:MM for time."
        )
    
    # Predict demand
    predicted_demand = demand_predictor.predict_demand(
        str(pump_id),
        parsed_date,
        slot_time,
        weather,
        traffic
    )
    
    return {
        "pump_id": str(pump_id),
        "slot_date": slot_date,
        "slot_time": slot_time,
        "predicted_demand": round(predicted_demand, 2),
        "weather_condition": weather,
        "traffic_condition": traffic
    }

@router.get("/predict/optimal-slots/{pump_id}")
def predict_optimal_slots(
    pump_id: UUID,
    target_date: str,  # Format: YYYY-MM-DD
    db: Session = Depends(get_db)
):
    """Predict optimal time slots for a pump on a specific date"""
    # Verify pump exists
    pump = pump_service.get_pump_by_id(db, pump_id)
    if not pump:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pump not found"
        )
    
    # Parse date
    try:
        parsed_date = datetime.strptime(target_date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid date format. Use YYYY-MM-DD."
        )
    
    # For demonstration, we'll predict demand for each hour from 6 AM to 6 PM
    optimal_slots = []
    for hour in range(6, 18):
        slot_time = f"{hour:02d}:00"
        
        # Predict demand for this slot
        predicted_demand = demand_predictor.predict_demand(
            str(pump_id),
            parsed_date,
            slot_time,
            "clear",  # Default values for demo
            "low"
        )
        
        optimal_slots.append({
            "time": slot_time,
            "predicted_demand": round(predicted_demand, 2)
        })
    
    # Sort by predicted demand (ascending - lower demand slots are more optimal)
    optimal_slots.sort(key=lambda x: x["predicted_demand"])
    
    return {
        "pump_id": str(pump_id),
        "target_date": target_date,
        "optimal_slots": optimal_slots[:5]  # Return top 5 optimal slots
    }

@router.get("/predict/fuel-demand/{pump_id}")
def predict_fuel_demand(
    pump_id: UUID,
    days_ahead: int = 7,
    db: Session = Depends(get_db)
):
    """Predict fuel demand for a pump over the next N days"""
    # Verify pump exists
    pump = pump_service.get_pump_by_id(db, pump_id)
    if not pump:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pump not found"
        )
    
    predictions = []
    today = date.today()
    
    # Predict for each day
    for i in range(days_ahead):
        prediction_date = today + timedelta(days=i)
        
        # For demonstration, we'll predict total daily demand
        daily_demand = 0
        for hour in range(6, 18):
            slot_time = f"{hour:02d}:00"
            hourly_demand = demand_predictor.predict_demand(
                str(pump_id),
                prediction_date,
                slot_time,
                "clear",
                "low"
            )
            daily_demand += hourly_demand
        
        predictions.append({
            "date": prediction_date.isoformat(),
            "predicted_daily_demand": round(daily_demand, 2)
        })
    
    return {
        "pump_id": str(pump_id),
        "predictions": predictions
    }