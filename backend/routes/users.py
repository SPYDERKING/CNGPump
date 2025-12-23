from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from schemas.user import UserCreate, User, UserLogin, Token, UserProfile
from services.user_service import user_service
from utils.security import create_access_token, verify_password
from db import get_db
from datetime import timedelta
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/register", response_model=User)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if user already exists by email
    db_user = user_service.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )
    
    # Check if user already exists by phone
    if user.phone:
        db_user = user_service.get_user_by_phone(db, phone=user.phone)
        if db_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this phone number already exists"
            )
    
    # Create new user
    new_user = user_service.create_user(db, user)
    logger.info(f"User registered: {user.email or user.phone}")
    return new_user

@router.post("/login", response_model=Token)
def login_user(user_credentials: UserLogin, db: Session = Depends(get_db)):
    """Authenticate user and return access token"""
    user = user_service.authenticate_user(
        db, 
        email=user_credentials.email, 
        password=user_credentials.password,
        phone=user_credentials.phone
    )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=30)
    # Use email or phone as subject for token
    subject = user.email if user.email else user.phone
    access_token = create_access_token(
        data={"sub": subject, "user_id": str(user.id)},
        expires_delta=access_token_expires
    )
    
    logger.info(f"User logged in: {user.email}")
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/profile", response_model=User)
def get_user_profile(current_user: User = Depends(user_service.get_current_user)):
    """Get current user profile"""
    return current_user
@router.put("/profile", response_model=User)
def update_user_profile(
    user_update: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(user_service.get_current_user)
):
    """Update current user profile"""
    updated_user = user_service.update_user(db, current_user.id, user_update)
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    logger.info(f"User profile updated: {current_user.email}")
    return updated_user


@router.get("/search", response_model=list[User])
def search_users(
    query: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(user_service.get_current_user)
):
    """Search users by email or full name (super admin only)"""
    # Check if user is super admin
    if current_user.role != "super_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only super admins can search users"
        )
    
    # Search users by email or full name
    users = user_service.search_users(db, query)
    return users


from pydantic import BaseModel

class AssignRoleRequest(BaseModel):
    user_id: str
    role: str


@router.post("/assign-role", response_model=User)
def assign_user_role(
    request: AssignRoleRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(user_service.get_current_user)
):
    """Assign a role to a user (super admin only)"""
    # Check if user is super admin
    if current_user.role != "super_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only super admins can assign roles"
        )
    
    user_id = request.user_id
    role = request.role
    
    # Validate role
    try:
        UserRole(role)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role specified"
        )
    
    # Check if user exists
    target_user = user_service.get_user_by_id(db, user_id)
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if role already exists
    from models.user import UserRoles
    existing_role = db.query(UserRoles).filter(
        UserRoles.user_id == user_id,
        UserRoles.role == role
    ).first()
    
    if existing_role:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already has this role"
        )
    
    # Create the role assignment
    user_role = UserRoles(
        user_id=user_id,
        role=role
    )
    db.add(user_role)
    db.commit()
    db.refresh(user_role)
    
    # Also update the main user role field for compatibility
    target_user.role = role
    db.commit()
    db.refresh(target_user)
    
    return target_user