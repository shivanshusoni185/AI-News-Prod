import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .database import engine, Base
from .routers import admin, news, contact

#Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI News API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "backend/uploads/images"
os.makedirs(UPLOAD_DIR, exist_ok=True)

app.mount("/uploads/images", StaticFiles(directory=UPLOAD_DIR), name="images")

app.include_router(admin.router)
app.include_router(news.router)
app.include_router(contact.router)


@app.get("/")
async def root():
    return {"message": "AI News API", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
