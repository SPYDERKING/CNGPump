from sqlalchemy.orm import Session
from models.pump import Pump
from models.pump_admin import PumpAdmin
from schemas.pump import PumpCreate, PumpUpdate
from typing import List, Optional
from uuid import UUID
import logging

logger = logging.getLogger(__name__)

class PumpService:
    def get_pump_by_id(self, db: Session, pump_id: UUID) -> Pump:
        # Convert UUID to string for SQLite compatibility
        pump_id_str = str(pump_id)
        return db.query(Pump).filter(Pump.id == pump_id_str).first()
    
    def get_pumps(self, db: Session, skip: int = 0, limit: int = 100) -> List[Pump]:
        return db.query(Pump).offset(skip).limit(limit).all()
    
    def get_pumps_by_city(self, db: Session, city: str) -> List[Pump]:
        return db.query(Pump).filter(Pump.city == city).all()
    
    def create_pump(self, db: Session, pump: PumpCreate) -> Pump:
        db_pump = Pump(**pump.dict())
        db.add(db_pump)
        db.commit()
        db.refresh(db_pump)
        logger.info(f"Created new pump: {pump.name}")
        return db_pump
    
    def update_pump(self, db: Session, pump_id: UUID, pump_update: PumpUpdate) -> Pump:
        db_pump = self.get_pump_by_id(db, pump_id)
        if not db_pump:
            return None
            
        update_data = pump_update.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_pump, key, value)
            
        db.commit()
        db.refresh(db_pump)
        logger.info(f"Updated pump with id: {pump_id}")
        return db_pump
    
    def delete_pump(self, db: Session, pump_id: UUID) -> bool:
        db_pump = self.get_pump_by_id(db, pump_id)
        if not db_pump:
            return False
            
        db.delete(db_pump)
        db.commit()
        logger.info(f"Deleted pump with id: {pump_id}")
        return True
    
    def get_pumps_for_admin(self, db: Session, user_id: UUID) -> List[Pump]:
        """Get pumps managed by a specific admin user"""
        pump_ids = db.query(PumpAdmin.pump_id).filter(PumpAdmin.user_id == user_id).all()
        pump_ids = [pid[0] for pid in pump_ids]  # Extract IDs from tuples
        
        if not pump_ids:
            return []
            
        return db.query(Pump).filter(Pump.id.in_(pump_ids)).all()
    
    def assign_admin_to_pump(self, db: Session, user_id: UUID, pump_id: UUID) -> PumpAdmin:
        """Assign an admin user to manage a pump"""
        # Check if assignment already exists
        existing = db.query(PumpAdmin).filter(
            PumpAdmin.user_id == user_id,
            PumpAdmin.pump_id == pump_id
        ).first()
        
        if existing:
            return existing
            
        pump_admin = PumpAdmin(user_id=user_id, pump_id=pump_id)
        db.add(pump_admin)
        db.commit()
        db.refresh(pump_admin)
        logger.info(f"Assigned user {user_id} as admin for pump {pump_id}")
        return pump_admin
    
    def get_nearby_pumps(self, db: Session, latitude: float, longitude: float, max_distance: float = 25.0) -> List[dict]:
        """Get pumps within a specified distance from the given location"""
        from math import radians, cos, sin, asin, sqrt
        
        def haversine_distance(lat1, lon1, lat2, lon2):
            """Calculate the great circle distance between two points on earth"""
            # Convert decimal degrees to radians
            lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
            
            # Haversine formula
            dlat = lat2 - lat1
            dlon = lon2 - lon1
            a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
            c = 2 * asin(sqrt(a))
            
            # Radius of earth in kilometers
            r = 6371
            
            return c * r
        
        try:
            # Get all pumps with coordinates
            all_pumps = db.query(Pump).filter(
                Pump.latitude.isnot(None),
                Pump.longitude.isnot(None)
            ).all()
            
            nearby_pumps_with_distance = []
            for pump in all_pumps:
                if pump.latitude is not None and pump.longitude is not None:
                    distance = haversine_distance(
                        latitude, 
                        longitude, 
                        float(pump.latitude), 
                        float(pump.longitude)
                    )
                    if distance <= max_distance:
                        # Convert pump to dictionary and add distance
                        pump_dict = {
                            'id': str(pump.id),  # Convert UUID to string
                            'name': pump.name,
                            'address': pump.address,
                            'city': pump.city,
                            'latitude': float(pump.latitude) if pump.latitude else None,
                            'longitude': float(pump.longitude) if pump.longitude else None,
                            'total_capacity': pump.total_capacity,
                            'remaining_capacity': pump.remaining_capacity,
                            'walkin_lanes': pump.walkin_lanes,
                            'booked_lanes': pump.booked_lanes,
                            'rating': float(pump.rating) if pump.rating else None,
                            'is_open': pump.is_open,
                            'created_at': pump.created_at.isoformat() if pump.created_at else None,
                            'updated_at': pump.updated_at.isoformat() if pump.updated_at else None,
                            'distance': distance  # Add distance to the dictionary
                        }
                        nearby_pumps_with_distance.append(pump_dict)
            
            # Sort by distance
            nearby_pumps_with_distance.sort(key=lambda x: x['distance'])
            
            return nearby_pumps_with_distance
        except Exception as e:
            logger.error(f"Error in get_nearby_pumps: {str(e)}")
            # Return empty list in case of error instead of throwing exception
            return []

pump_service = PumpService()