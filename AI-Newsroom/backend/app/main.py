from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from .database import engine, Base
from .routers import admin, news, contact

logger = logging.getLogger(__name__)

# Try to create database tables, but don't fail if database is unreachable
try:
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created successfully")
except Exception as e:
    logger.error(f"Failed to create database tables: {str(e)}")
    logger.error("The API will start but database operations will fail until connection is restored")
    logger.error("Please check your Supabase database status and network connectivity")

app = FastAPI(title="AI News API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(admin.router)
app.include_router(news.router)
app.include_router(contact.router)


@app.get("/")
async def root():
    return {"message": "AI News API", "version": "1.0.0"}


@app.get("/health")
async def health():
    db_status = "unknown"
    try:
        # Try to connect to database
        connection = engine.connect()
        connection.close()
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)[:100]}"

    return {
        "status": "running",
        "database": db_status
    }
