from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

from app.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserResponse, Token, TokenData, GoogleLogin

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "fallback-secret-key")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 10080))

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    return user


@router.post("/register", response_model=Token)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed = pwd_context.hash(user_data.password)
    user = User(email=user_data.email, hashed_password=hashed)
    db.add(user)
    db.commit()
    db.refresh(user)
    
    token = create_access_token({"sub": user.email})
    return Token(access_token=token)


@router.post("/login", response_model=Token)
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user or not pwd_context.verify(user_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = create_access_token({"sub": user.email})
    return Token(access_token=token)


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/google", response_model=Token)
def google_login(data: GoogleLogin, db: Session = Depends(get_db)):
    import urllib.request
    import json
    
    id_token = data.credential
    try:
        url = f"https://oauth2.googleapis.com/tokeninfo?id_token={id_token}"
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req) as response:
            token_info = json.loads(response.read().decode())
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Google token connection")
        
    if "error_description" in token_info:
        raise HTTPException(status_code=400, detail=f"Google token validation failed: {token_info['error_description']}")
        
    google_client_id = os.getenv("GOOGLE_CLIENT_ID")
    if google_client_id and token_info.get("aud") != google_client_id:
        raise HTTPException(status_code=400, detail="Google token client ID mismatch")
        
    email = token_info.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Email not provided by Google")
        
    user = db.query(User).filter(User.email == email).first()
    if not user:
        # Create user with a dummy hashed password since they log in via Google
        import os as python_os
        dummy_hash = pwd_context.hash(python_os.urandom(16).hex())
        user = User(email=email, hashed_password=dummy_hash)
        db.add(user)
        db.commit()
        db.refresh(user)
        
    token = create_access_token({"sub": user.email})
    return Token(access_token=token)

