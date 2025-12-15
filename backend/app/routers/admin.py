import os
import uuid
import shutil
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from PIL import Image
from io import BytesIO

from ..database import get_db
from ..models import News
from ..schemas import NewsResponse, Token
from ..auth import authenticate_admin, create_access_token, get_current_admin

router = APIRouter(prefix="/admin", tags=["admin"])

UPLOAD_DIR = "backend/uploads/images"
ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp"}


def validate_image(file: UploadFile) -> bool:
    if not file.filename:
        return False
    ext = file.filename.rsplit(".", 1)[-1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        return False
    return True


def save_image(file: UploadFile) -> str:
    ext = file.filename.rsplit(".", 1)[-1].lower()
    filename = f"{uuid.uuid4()}.{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    return filename


def delete_image(filename: str):
    if filename:
        filepath = os.path.join(UPLOAD_DIR, filename)
        if os.path.exists(filepath):
            os.remove(filepath)


@router.post("/login", response_model=Token)
async def login(username: str = Form(...), password: str = Form(...)):
    print(f"[LOGIN] Login attempt - Username: {username}")

    # Check if username is provided
    if not username:
        print("[ERROR] Login failed: Username not provided")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username is required",
        )

    # Check if password is provided
    if not password:
        print("[ERROR] Login failed: Password not provided")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password is required",
        )

    # Authenticate user
    if not authenticate_admin(username, password):
        print(f"[ERROR] Login failed: Invalid credentials for user {username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create access token
    try:
        access_token = create_access_token(data={"sub": username})
        print(f"[SUCCESS] Login successful for user: {username}")
        return {"access_token": access_token, "token_type": "bearer"}
    except Exception as e:
        print(f"[ERROR] Error creating access token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error generating access token",
        )


@router.post("/news", response_model=NewsResponse)
async def create_news(
    title: str = Form(...),
    summary: str = Form(...),
    content: str = Form(...),
    tags: Optional[str] = Form(None),
    published: bool = Form(False),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_admin: str = Depends(get_current_admin)
):
    import json

    image_path = None
    if image and image.filename:
        if not validate_image(image):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid image type. Allowed: jpg, jpeg, png, webp"
            )
        image_path = save_image(image)

    # Parse tags - can be JSON array or comma-separated string
    tags_list = None
    if tags:
        try:
            tags_list = json.loads(tags) if tags.startswith('[') else [t.strip() for t in tags.split(',')]
        except:
            tags_list = [t.strip() for t in tags.split(',')]

    news = News(
        title=title,
        summary=summary,
        content=content,
        tags=tags_list,
        published=published,
        image_url=image_path
    )
    db.add(news)
    db.commit()
    db.refresh(news)
    return news


@router.put("/news/{news_id}", response_model=NewsResponse)
async def update_news(
    news_id: int,
    title: Optional[str] = Form(None),
    summary: Optional[str] = Form(None),
    content: Optional[str] = Form(None),
    tags: Optional[str] = Form(None),
    published: Optional[bool] = Form(None),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_admin: str = Depends(get_current_admin)
):
    import json

    news = db.query(News).filter(News.id == news_id).first()
    if not news:
        raise HTTPException(status_code=404, detail="News not found")

    if title is not None:
        news.title = title
    if summary is not None:
        news.summary = summary
    if content is not None:
        news.content = content
    if tags is not None:
        # Parse tags - can be JSON array or comma-separated string
        try:
            tags_list = json.loads(tags) if tags.startswith('[') else [t.strip() for t in tags.split(',')]
        except:
            tags_list = [t.strip() for t in tags.split(',')]
        news.tags = tags_list
    if published is not None:
        news.published = published

    if image and image.filename:
        if not validate_image(image):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid image type. Allowed: jpg, jpeg, png, webp"
            )
        if news.image_url:
            delete_image(news.image_url)
        news.image_url = save_image(image)

    db.commit()
    db.refresh(news)
    return news


@router.delete("/news/{news_id}")
async def delete_news(
    news_id: int,
    db: Session = Depends(get_db),
    current_admin: str = Depends(get_current_admin)
):
    news = db.query(News).filter(News.id == news_id).first()
    if not news:
        raise HTTPException(status_code=404, detail="News not found")

    if news.image_url:
        delete_image(news.image_url)
    
    db.delete(news)
    db.commit()
    return {"message": "News deleted successfully"}


@router.get("/news", response_model=list[NewsResponse])
async def get_all_news(
    db: Session = Depends(get_db),
    current_admin: str = Depends(get_current_admin)
):
    news = db.query(News).order_by(News.created_at.desc()).all()

    # Ensure tags is always a list
    for item in news:
        if isinstance(item.tags, str):
            item.tags = [item.tags.strip()] if item.tags.strip() else []
        elif item.tags is None:
            item.tags = []

    return news
