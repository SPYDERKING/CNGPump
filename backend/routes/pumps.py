from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from schemas.pump import PumpCreate, Pump, PumpWithDistance, PumpAdminCreate, PumpAdmin
from services.pump_service import pump_service
from services.user_service import user_service
from db import get_db
from uuid import UUID
import logging
router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/", response_model=list[Pump])
def get_pumps(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all pumps"""
    pumps = pump_service.get_pumps(db, skip=skip, limit=limit)
    return pumps


@router.get("/nearby", response_model=list[PumpWithDistance])
def get_nearby_pumps(
    latitude: float = Query(..., ge=-90, le=90, description="User's latitude"),
    longitude: float = Query(..., ge=-180, le=180, description="User's longitude"),
    max_distance: float = Query(default=25.0, ge=0.1, le=100, description="Maximum distance in kilometers"),
    db: Session = Depends(get_db)
):
    """Get pumps near the specified location"""
    try:
        pumps = pump_service.get_nearby_pumps(db, latitude, longitude, max_distance)
        return pumps
    except Exception as e:
        logger.error(f"Error getting nearby pumps: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get nearby pumps"
        )


@router.get("/{pump_id}", response_model=Pump)
def get_pump(pump_id: UUID, db: Session = Depends(get_db)):
    """Get a specific pump by ID"""
    pump = pump_service.get_pump_by_id(db, pump_id)
    if not pump:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pump not found"
        )
    return pump

@router.post("/", response_model=Pump)
def create_pump(pump: PumpCreate, db: Session = Depends(get_db)):
    """Create a new pump (admin only)"""
    new_pump = pump_service.create_pump(db, pump)
    return new_pump

@router.put("/{pump_id}", response_model=Pump)
def update_pump(pump_id: UUID, pump_update: PumpCreate, db: Session = Depends(get_db)):
    """Update a pump (admin only)"""
    updated_pump = pump_service.update_pump(db, pump_id, pump_update)
    if not updated_pump:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pump not found"
        )
    return updated_pump

@router.delete("/{pump_id}")
def delete_pump(pump_id: UUID, db: Session = Depends(get_db)):
    """Delete a pump (admin only)"""
    success = pump_service.delete_pump(db, pump_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pump not found"
        )
    return {"message": "Pump deleted successfully"}

@router.get("/{pump_id}/admins", response_model=list[PumpAdmin])
def get_pump_admins(pump_id: UUID, db: Session = Depends(get_db)):
    """Get all admins for a specific pump"""
    # Implementation would depend on how you store pump-admin relationships
    pass

@router.post("/assign-admin", response_model=PumpAdmin)
def assign_admin_to_pump(admin_assignment: PumpAdminCreate, db: Session = Depends(get_db)):
    """Assign an admin user to manage a pump"""
    # Verify user exists
    user = user_service.get_user_by_id(db, admin_assignment.user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Verify pump exists
    pump = pump_service.get_pump_by_id(db, admin_assignment.pump_id)
    if not pump:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pump not found"
        )
    
    # Assign admin to pump
    pump_admin = pump_service.assign_admin_to_pump(
        db, 
        admin_assignment.user_id, 
        admin_assignment.pump_id
    )
    
    return pump_admin

