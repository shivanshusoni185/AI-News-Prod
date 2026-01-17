from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from ..database import get_db
from ..models import News
from ..schemas import NewsResponse, NewsListResponse

router = APIRouter(prefix="/news", tags=["news"])


@router.get("", response_model=list[NewsListResponse])
async def list_news(
    search: Optional[str] = Query(None, description="Search in title and summary"),
    tag: Optional[str] = Query(None, description="Filter by tag"),
    db: Session = Depends(get_db)
):
    query = db.query(News).filter(News.published == True)

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                News.title.ilike(search_term),
                News.summary.ilike(search_term)
            )
        )

    if tag:
        query = query.filter(News.tags.ilike(f"%{tag}%"))

    news = query.order_by(News.created_at.desc()).all()

    # Ensure tags is always a list
    for item in news:
        if isinstance(item.tags, str):
            item.tags = [item.tags.strip()] if item.tags.strip() else []
        elif item.tags is None:
            item.tags = []

    return news


@router.get("/{news_id}", response_model=NewsResponse)
async def get_news(news_id: int, db: Session = Depends(get_db)):
    news = db.query(News).filter(News.id == news_id, News.published == True).first()
    if not news:
        raise HTTPException(status_code=404, detail="News not found")

    # Ensure tags is always a list
    if isinstance(news.tags, str):
        news.tags = [news.tags.strip()] if news.tags.strip() else []
    elif news.tags is None:
        news.tags = []

    return news
