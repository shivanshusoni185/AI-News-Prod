from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
import logging
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Get database URL from environment variable
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    logger.error("DATABASE_URL environment variable is not set")
    raise ValueError("DATABASE_URL environment variable is not set")

# Configure SQLAlchemy engine for PostgreSQL (Supabase)
try:
    # PostgreSQL with connection pooling and SSL
    connect_args = {}

    # Add SSL requirement for Supabase if not already in URL
    if "sslmode" not in DATABASE_URL:
        connect_args["sslmode"] = "require"

    engine = create_engine(
        DATABASE_URL,
        pool_size=5,  # Number of connections to keep open
        max_overflow=10,  # Additional connections when pool is exhausted
        pool_timeout=30,  # Seconds to wait before timing out
        pool_recycle=1800,  # Recycle connections after 30 minutes
        pool_pre_ping=True,  # Enable connection health checks
        connect_args=connect_args
    )
    logger.info("Database engine created successfully with PostgreSQL")
except Exception as e:
    logger.error(f"Failed to create database engine: {str(e)}")
    raise

# Create session factory with configured engine
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for all models
Base = declarative_base()

def get_db():
    """
    Dependency function for database sessions.
    Usage with FastAPI:
        @app.get("/")
        def endpoint(db: Session = Depends(get_db)):
            # Use db session here
            result = db.query(MyModel).all()
    """
    db = SessionLocal()
    try:
        logger.debug("Database session started")
        yield db
        logger.debug("Database session will be committed")
    except Exception as e:
        db.rollback()
        logger.error(f"Database error: {str(e)}")
        raise
    finally:
        db.close()
        logger.debug("Database session closed")
