from sqlalchemy.orm import Session
from sqlalchemy import or_
from models.user import User, UserProfile
from schemas.user import UserCreate, UserUpdate
from utils.security import get_password_hash, verify_password, SECRET_KEY, ALGORITHM
from fastapi import HTTPException, status, Depends
from utils.security import oauth2_scheme
from jose import jwt
from typing import Optional
from db import get_db
from uuid import UUID
import logging

logger = logging.getLogger(__name__)

class UserService:
    def get_user_by_email(self, db: Session, email: str) -> User:
        return db.query(User).filter(User.email == email).first()
    
    def get_user_by_phone(self, db: Session, phone: str) -> User:
        return db.query(User).filter(User.phone == phone).first()
    
    def get_user_by_email_or_phone(self, db: Session, identifier: str) -> User:
        # Try to find user by email first
        user = self.get_user_by_email(db, identifier)
        if user:
            return user
        
        # If not found by email, try to find by phone
        return self.get_user_by_phone(db, identifier)
    
    def get_user_by_id(self, db: Session, user_id: UUID) -> User:
        return db.query(User).filter(User.id == user_id).first()
    
    def create_user(self, db: Session, user: UserCreate) -> User:
        db_user = User(
            email=user.email,
            hashed_password=get_password_hash(user.password),
            full_name=user.full_name,
            phone=user.phone,
            vehicle_number=user.vehicle_number
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        # Create user profile
        profile = UserProfile(
            user_id=db_user.id,
            full_name=user.full_name,
            phone=user.phone,
            vehicle_number=user.vehicle_number
        )
        db.add(profile)
        db.commit()
        
        logger.info(f"Created new user with email: {user.email}")
        return db_user
    
    def update_user(self, db: Session, user_id: UUID, user_update: UserUpdate) -> User:
        db_user = self.get_user_by_id(db, user_id)
        if not db_user:
            return None
            
        update_data = user_update.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_user, key, value)
            
        db.commit()
        db.refresh(db_user)
        
        # Update profile
        profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
        if profile:
            for key, value in update_data.items():
                if hasattr(profile, key):
                    setattr(profile, key, value)
            db.commit()
        
        logger.info(f"Updated user with id: {user_id}")
        return db_user
    
    def authenticate_user(self, db: Session, email: Optional[str], password: str, phone: Optional[str] = None) -> User:
        # Find user by email or phone
        if email:
            user = self.get_user_by_email(db, email)
        elif phone:
            user = self.get_user_by_phone(db, phone)
        else:
            return None
            
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user
    
    def get_current_user(self, db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
        credentials_exception = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            identifier: str = payload.get("sub")
            if identifier is None:
                raise credentials_exception
        except jwt.JWTError:
            raise credentials_exception
        user = self.get_user_by_email_or_phone(db, identifier=identifier)
        if user is None:
            raise credentials_exception
        return user
    
    def search_users(self, db: Session, query: str):
        """Search users by email or full name"""
        
        # Search by email or full name using OR condition
        users = db.query(User).filter(
            or_(
                User.email.ilike(f'%{query}%'),
                User.full_name.ilike(f'%{query}%')
            )
        ).all()
        
        return users

user_service = UserService()