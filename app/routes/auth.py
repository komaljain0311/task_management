from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
import secrets
from datetime import datetime, timedelta

from app.database import get_db
from app import models
from app.schemas import UserCreate, UserLogin, User, Token, PasswordResetRequest, PasswordReset
from app.auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user,
    get_current_admin_user
)

router = APIRouter()

@router.post("/signup")
async def signup(user_data: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(models.User).filter(models.User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already exists"
        )

    # Hash password
    hashed_password = get_password_hash(user_data.password)

    # Make first user admin
    user_count = db.query(models.User).count()
    role = "ADMIN" if user_count == 0 else "MEMBER"

    # Create user
    db_user = models.User(
        email=user_data.email,
        name=user_data.name,
        password=hashed_password,
        role=role
    )

    try:
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User creation failed"
        )

    # Return user data with token
    return {
        "id": db_user.id,
        "name": db_user.name,
        "email": db_user.email,
        "role": db_user.role,
        "token": create_access_token(data={"sub": db_user.id}),
    }

@router.post("/login", response_model=dict)
async def login(user_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == user_data.email).first()
    if not user or not verify_password(user_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    access_token = create_access_token(data={"sub": user.id})
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "token": access_token
    }

@router.get("/me", response_model=User)
async def get_me(current_user: models.User = Depends(get_current_user)):
    return current_user

@router.post("/reset-password-request")
async def reset_password_request(
    reset_data: PasswordResetRequest,
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(models.User.email == reset_data.email).first()
    if not user:
        # Don't reveal if email exists or not
        return {"message": "If the email exists, a reset link has been sent"}

    # Generate reset token
    reset_token = secrets.token_urlsafe(32)
    reset_expires = datetime.utcnow() + timedelta(hours=1)

    user.reset_password_token = reset_token
    user.reset_password_expires = reset_expires

    db.commit()

    # In a real app, you'd send an email here
    # For now, just return the token for testing
    return {
        "message": "Reset token generated",
        "reset_token": reset_token
    }

@router.post("/reset-password")
async def reset_password(
    reset_data: PasswordReset,
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(
        models.User.reset_password_token == reset_data.token,
        models.User.reset_password_expires > datetime.utcnow()
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )

    user.password = get_password_hash(reset_data.new_password)
    user.reset_password_token = None
    user.reset_password_expires = None

    db.commit()

    return {"message": "Password reset successfully"}

@router.post("/elevate-admin")
async def elevate_admin(
    target_user_id: str,
    current_user: models.User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    target_user = db.query(models.User).filter(models.User.id == target_user_id).first()
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    target_user.role = "ADMIN"
    db.commit()

    return {"message": f"User {target_user.email} elevated to admin"}