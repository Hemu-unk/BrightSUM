import os
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import jwt, JWTError
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr
from sqlmodel import Session, select
from .db import get_session
from .models import User
from .models import Verification, PasswordReset
from .services.emailer import send_verification_email, send_password_reset_email

router = APIRouter()

# SECRET: default to env, else the provided string (dev only)
SECRET_KEY = os.getenv("SECRET_KEY", "quarter&9")
ALGO = "HS256"
ACCESS_MIN = 60

# Use bcrypt_sha256 to avoid bcrypt's 72-byte limit; keep bcrypt for legacy hashes.
pwd = CryptContext(schemes=["bcrypt_sha256", "bcrypt"], deprecated="auto")

# IMPORTANT: Swagger's "Authorize" will POST form fields to this URL
oauth2 = OAuth2PasswordBearer(tokenUrl="/api/auth/token")

# request/response models
class SignupIn(BaseModel):
    email: EmailStr
    password: str
    role: str = "student"

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"

def create_token(sub: str, minutes: int = ACCESS_MIN) -> str:
    payload = {"sub": sub, "exp": datetime.utcnow() + timedelta(minutes=minutes)}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGO)

def current_user(token: str = Depends(oauth2), session: Session = Depends(get_session)) -> User:
    try:
        email = jwt.decode(token, SECRET_KEY, algorithms=[ALGO])["sub"]
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = session.exec(select(User).where(User.email == email)).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

@router.post("/signup")
def signup(body: SignupIn, session: Session = Depends(get_session)):
    existing = session.exec(select(User).where(User.email == body.email)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(email=body.email, password_hash=pwd.hash(body.password), role=body.role)
    session.add(user)
    session.commit()
    session.refresh(user)
    # Check if email verification is enabled via env var
    verification_enabled = os.getenv("EMAIL_VERIFICATION_ENABLED", "False").lower() in ("1", "true", "yes")
    if verification_enabled:
        # generate 6-digit numeric code
        import random
        code = f"{random.randint(0,999999):06d}"
        expires_at = datetime.utcnow() + timedelta(minutes=15)
        # store verification code
        v = Verification(email=user.email, code=code, expires_at=expires_at)
        session.add(v)
        session.commit()
        # attempt to send email; log failures but don't block signup
        try:
            send_verification_email(user.email, code, os.getenv("VERIFICATION_URL"))
        except Exception as e:
            print(f"[auth] Failed to send verification email: {e}")
        # Optionally return the code in debug mode to ease development
        if os.getenv("EMAIL_VERIFICATION_DEBUG", "False").lower() in ("1", "true", "yes"):
            return {"message": "User created", "email": user.email, "verification_required": True, "code": code}
        return {"message": "User created", "email": user.email, "verification_required": True}
    return {"message": "User created", "email": user.email, "verification_required": False}

# JSON login (used by Login.tsx)
@router.post("/login", response_model=TokenOut)
def login_json(body: LoginIn, session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.email == body.email)).first()
    if not user or not pwd.verify(body.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    # If verification enabled, disallow login when a pending verification exists
    verification_enabled = os.getenv("EMAIL_VERIFICATION_ENABLED", "False").lower() in ("1", "true", "yes")
    if verification_enabled:
        pending = session.exec(select(Verification).where(Verification.email == user.email)).first()
        if pending:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Email address not verified")
    return TokenOut(access_token=create_token(user.email))

# FORM login for Swagger "Authorize" (username = email)
@router.post("/token", response_model=TokenOut)
def login_form(form: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.email == form.username)).first()
    if not user or not pwd.verify(form.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    verification_enabled = os.getenv("EMAIL_VERIFICATION_ENABLED", "False").lower() in ("1", "true", "yes")
    if verification_enabled:
        pending = session.exec(select(Verification).where(Verification.email == user.email)).first()
        if pending:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Email address not verified")
    return TokenOut(access_token=create_token(user.email))


class VerifyIn(BaseModel):
    email: EmailStr
    code: str


@router.post("/verify")
def verify_email(body: VerifyIn, session: Session = Depends(get_session)):
    # locate verification entry
    v = session.exec(select(Verification).where(Verification.email == body.email, Verification.code == body.code)).first()
    if not v:
        raise HTTPException(status_code=400, detail="Invalid code or email")
    if v.expires_at and v.expires_at < datetime.utcnow():
        # expired
        session.delete(v)
        session.commit()
        raise HTTPException(status_code=400, detail="Verification code expired")
    # success: remove verification entry to mark verified
    session.delete(v)
    session.commit()
    return {"message": "Email verified"}


class ResendIn(BaseModel):
    email: EmailStr


@router.post("/verify/resend")
def resend_verification(body: ResendIn, session: Session = Depends(get_session)):
    # Only allow resend if user exists
    user = session.exec(select(User).where(User.email == body.email)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    # remove any existing pending codes
    session.query(Verification).filter(Verification.email == user.email).delete()
    session.commit()
    import random
    code = f"{random.randint(0,999999):06d}"
    expires_at = datetime.utcnow() + timedelta(minutes=15)
    v = Verification(email=user.email, code=code, expires_at=expires_at)
    session.add(v)
    session.commit()
    try:
        send_verification_email(user.email, code, os.getenv("VERIFICATION_URL"))
    except Exception:
        pass
    return {"message": "Verification resent"}


class PasswordResetRequestIn(BaseModel):
    email: EmailStr


@router.post("/password-reset/request")
def password_reset_request(body: PasswordResetRequestIn, session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.email == body.email)).first()
    if not user:
        # Don't reveal whether the email exists; return 200 to avoid account enumeration
        return {"message": "If an account exists for this email, a reset code has been sent"}
    # remove existing reset entries
    session.query(PasswordReset).filter(PasswordReset.email == user.email).delete()
    session.commit()
    import random
    code = f"{random.randint(0,999999):06d}"
    expires_at = datetime.utcnow() + timedelta(minutes=30)
    pr = PasswordReset(email=user.email, code=code, expires_at=expires_at)
    session.add(pr)
    session.commit()
    try:
        send_password_reset_email(user.email, code, os.getenv("PASSWORD_RESET_URL") or os.getenv("VERIFICATION_URL"))
    except Exception as e:
        print(f"[auth] Failed to send password reset email: {e}")
    return {"message": "If an account exists for this email, a reset code has been sent"}


class PasswordResetConfirmIn(BaseModel):
    email: EmailStr
    code: str
    new_password: str


@router.post("/password-reset/confirm")
def password_reset_confirm(body: PasswordResetConfirmIn, session: Session = Depends(get_session)):
    pr = session.exec(select(PasswordReset).where(PasswordReset.email == body.email, PasswordReset.code == body.code)).first()
    if not pr:
        raise HTTPException(status_code=400, detail="Invalid code or email")
    if pr.expires_at and pr.expires_at < datetime.utcnow():
        session.delete(pr)
        session.commit()
        raise HTTPException(status_code=400, detail="Reset code expired")
    user = session.exec(select(User).where(User.email == body.email)).first()
    if not user:
        # should not happen, but handle gracefully
        raise HTTPException(status_code=404, detail="User not found")
    user.password_hash = pwd.hash(body.new_password)
    session.add(user)
    # remove any password reset tokens for this user
    session.query(PasswordReset).filter(PasswordReset.email == user.email).delete()
    session.commit()
    return {"message": "Password updated"}

# Only the USERS dashboard
@router.get("/me")
def me(user: User = Depends(current_user)):
    return {"id": user.id, "email": user.email, "role": user.role}
