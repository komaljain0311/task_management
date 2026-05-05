from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
print(f"DEBUG: Raw DATABASE_URL from env: '{DATABASE_URL}'")

if not DATABASE_URL or DATABASE_URL.lower() in ["none", "null", "undefined", ""]:
    print("DEBUG: Using default SQLite database")
    DATABASE_URL = "sqlite:///./taskmanager.db"
else:
    if DATABASE_URL.startswith("postgres://"):
        print("DEBUG: Converting postgres:// to postgresql://")
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    
    # Final check for basic URL structure
    if "://" not in DATABASE_URL:
        print(f"WARNING: Invalid URL structure in '{DATABASE_URL}'. Falling back to SQLite.")
        DATABASE_URL = "sqlite:///./taskmanager.db"

print(f"DEBUG: Final DATABASE_URL being used: {DATABASE_URL.split('@')[-1] if '@' in DATABASE_URL else DATABASE_URL}")

try:
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
    )
except Exception as e:
    print(f"CRITICAL: Failed to create engine with URL. Error: {e}")
    print("CRITICAL: Falling back to SQLite as last resort.")
    DATABASE_URL = "sqlite:///./taskmanager.db"
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()