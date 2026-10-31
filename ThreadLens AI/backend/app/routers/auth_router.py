import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas import LoginRequest, RegisterRequest, TokenResponse, UserOut
from app.auth import verify_password, hash_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(registration: RegisterRequest, db: Session = Depends(get_db)):
    email = str(registration.email).lower()
    username = registration.username.strip()

    if db.query(User).filter(
        (User.username == username) | (User.email == email)
    ).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username or email is already registered",
        )

    user = User(
        email=email,
        username=username,
        full_name=registration.full_name.strip(),
        phone=(registration.phone or "").strip() or None,
        job_title=(registration.job_title or "").strip() or None,
        organization=(registration.organization or "").strip() or None,
        hashed_password=hash_password(registration.password),
        role="Employee",
        department="General",
        is_active=True,
        last_login=datetime.datetime.utcnow(),
    )
    db.add(user)
    try:
        db.commit()
        db.refresh(user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username or email is already registered",
        )

    token = create_access_token(data={"sub": user.username, "role": user.role, "id": user.id})
    return {"access_token": token, "token_type": "bearer", "user": user}

@router.post("/login", response_model=TokenResponse)
def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    # Look up by username or email
    user = db.query(User).filter(
        (User.username == credentials.username) | (User.email == credentials.username)
    ).first()

    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username/email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is disabled. Contact your IT administrator."
        )

    # Update last login timestamp
    user.last_login = datetime.datetime.utcnow()
    db.commit()
    db.refresh(user)

    token = create_access_token(data={"sub": user.username, "role": user.role, "id": user.id})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
