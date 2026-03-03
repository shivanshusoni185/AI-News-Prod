from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from fastapi.responses import Response
from sqlalchemy.orm import Session
from sqlalchemy import or_, func, desc
from datetime import datetime

from ..database import get_db
from ..models import News, ArticleView, ArticleReaction
from ..schemas import NewsResponse, NewsListResponse, ArticleViewCreate, ArticleReactionCreate, ArticleReactionResponse, ArticleStats
import math

router = APIRouter(prefix="/news", tags=["news"])


@router.get("")
async def list_news(
    search: Optional[str] = Query(None, description="Search in title and summary"),
    tag: Optional[str] = Query(None, description="Filter by tag"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(12, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db)
):
    """Get paginated list of published news articles"""
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

    # Get total count before pagination
    total = query.count()
    
    # Apply pagination
    offset = (page - 1) * limit
    news = query.order_by(News.created_at.desc()).offset(offset).limit(limit).all()

    # Convert to dicts and ensure tags is always a list
    items_data = []
    for item in news:
        if isinstance(item.tags, str):
            item.tags = [item.tags.strip()] if item.tags.strip() else []
        elif item.tags is None:
            item.tags = []
        
        # Convert to dict
        item_dict = {
            'id': item.id,
            'title': item.title,
            'summary': item.summary,
            'tags': item.tags,
            'image_url': f"/news/image/{item.id}" if item.image_data else None,
            'published': item.published,
            'created_at': item.created_at.isoformat() if item.created_at else None,
            'slug': item.slug
        }
        items_data.append(item_dict)

    # Calculate pagination metadata
    total_pages = math.ceil(total / limit) if total > 0 else 1

    return {
        "items": items_data,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
        "has_next": page < total_pages,
        "has_prev": page > 1
    }


@router.get("/image/{news_id}")
async def get_news_image(news_id: int, db: Session = Depends(get_db)):
    """Serve image for a news article from database"""
    news = db.query(News).filter(News.id == news_id).first()
    if not news:
        raise HTTPException(status_code=404, detail="News not found")

    if not news.image_data:
        raise HTTPException(status_code=404, detail="Image not found")

    # Return the image with proper content type
    return Response(
        content=news.image_data,
        media_type=news.image_mimetype or "image/jpeg",
        headers={
            "Cache-Control": "public, max-age=31536000",  # Cache for 1 year
            "Content-Disposition": f'inline; filename="{news.image_filename or "image.jpg"}"'
        }
    )


@router.get("/by-slug/{slug}", response_model=NewsResponse)
async def get_news_by_slug(slug: str, db: Session = Depends(get_db)):
    """Get a news article by its slug"""
    news = db.query(News).filter(News.slug == slug, News.published == True).first()
    if not news:
        raise HTTPException(status_code=404, detail="News not found")

    # Ensure tags is always a list
    if isinstance(news.tags, str):
        news.tags = [news.tags.strip()] if news.tags.strip() else []
    elif news.tags is None:
        news.tags = []

    return news


@router.get("/image/by-slug/{slug}")
async def get_news_image_by_slug(slug: str, db: Session = Depends(get_db)):
    """Serve image for a news article by slug"""
    news = db.query(News).filter(News.slug == slug).first()
    if not news:
        raise HTTPException(status_code=404, detail="News not found")

    if not news.image_data:
        raise HTTPException(status_code=404, detail="Image not found")

    # Return the image with proper content type
    return Response(
        content=news.image_data,
        media_type=news.image_mimetype or "image/jpeg",
        headers={
            "Cache-Control": "public, max-age=31536000",  # Cache for 1 year
            "Content-Disposition": f'inline; filename="{news.image_filename or "image.jpg"}"'
        }
    )


@router.get("/{news_id}", response_model=NewsResponse)
async def get_news(news_id: int, db: Session = Depends(get_db)):
    """Get a news article by ID (for backward compatibility)"""
    news = db.query(News).filter(News.id == news_id, News.published == True).first()
    if not news:
        raise HTTPException(status_code=404, detail="News not found")

    # Ensure tags is always a list
    if isinstance(news.tags, str):
        news.tags = [news.tags.strip()] if news.tags.strip() else []
    elif news.tags is None:
        news.tags = []

    return news


@router.post("/view")
async def record_view(
    view_data: ArticleViewCreate,
    request: Request,
    db: Session = Depends(get_db)
):
    """Record an article view for analytics"""
    # Get IP from request if not provided
    ip_address = view_data.ip_address or request.client.host
    
    # Create view record
    view = ArticleView(
        news_id=view_data.news_id,
        ip_address=ip_address
    )
    db.add(view)
    db.commit()
    
    return {"success": True, "message": "View recorded"}


@router.get("/{news_id}/stats", response_model=ArticleStats)
async def get_article_stats(news_id: int, db: Session = Depends(get_db)):
    """Get article statistics (views, likes, bookmarks)"""
    views = db.query(func.count(ArticleView.id)).filter(ArticleView.news_id == news_id).scalar() or 0
    likes = db.query(func.count(ArticleReaction.id)).filter(
        ArticleReaction.news_id == news_id,
        ArticleReaction.reaction_type == 'like'
    ).scalar() or 0
    bookmarks = db.query(func.count(ArticleReaction.id)).filter(
        ArticleReaction.news_id == news_id,
        ArticleReaction.reaction_type == 'bookmark'
    ).scalar() or 0
    
    return {
        "views": views,
        "likes": likes,
        "bookmarks": bookmarks
    }


@router.post("/reaction", response_model=ArticleReactionResponse)
async def add_reaction(
    reaction_data: ArticleReactionCreate,
    request: Request,
    db: Session = Depends(get_db)
):
    """Add a reaction (like or bookmark) to an article"""
    # Validate reaction type
    if reaction_data.reaction_type not in ['like', 'bookmark']:
        raise HTTPException(status_code=400, detail="Invalid reaction type. Must be 'like' or 'bookmark'")
    
    # Get IP from request if not provided
    ip_address = reaction_data.ip_address or request.client.host
    
    # Check if reaction already exists
    existing = db.query(ArticleReaction).filter(
        ArticleReaction.news_id == reaction_data.news_id,
        ArticleReaction.reaction_type == reaction_data.reaction_type,
        ArticleReaction.ip_address == ip_address
    ).first()
    
    if existing:
        # Toggle: remove if exists
        db.delete(existing)
        db.commit()
        return {"id": 0, "news_id": reaction_data.news_id, "reaction_type": reaction_data.reaction_type, "created_at": datetime.now()}
    
    # Create new reaction
    reaction = ArticleReaction(
        news_id=reaction_data.news_id,
        reaction_type=reaction_data.reaction_type,
        ip_address=ip_address
    )
    db.add(reaction)
    db.commit()
    db.refresh(reaction)
    
    return reaction


@router.get("/{news_id}/related", response_model=list[NewsListResponse])
async def get_related_articles(news_id: int, limit: int = Query(3, ge=1, le=10), db: Session = Depends(get_db)):
    """Get related articles based on tags"""
    # Get the current article
    current_article = db.query(News).filter(News.id == news_id).first()
    if not current_article:
        raise HTTPException(status_code=404, detail="News not found")
    
    # Get tags from current article
    current_tags = current_article.tags if isinstance(current_article.tags, list) else []
    
    if not current_tags:
        # If no tags, return recent articles
        related = db.query(News).filter(
            News.published == True,
            News.id != news_id
        ).order_by(News.created_at.desc()).limit(limit).all()
    else:
        # Find articles with matching tags
        related = db.query(News).filter(
            News.published == True,
            News.id != news_id
        ).all()
        
        # Score articles by tag overlap
        scored_articles = []
        for article in related:
            article_tags = article.tags if isinstance(article.tags, list) else []
            overlap = len(set(current_tags) & set(article_tags))
            if overlap > 0:
                scored_articles.append((article, overlap))
        
        # Sort by overlap score and limit
        scored_articles.sort(key=lambda x: x[1], reverse=True)
        related = [article for article, score in scored_articles[:limit]]
    
    # Ensure tags is always a list
    for item in related:
        if isinstance(item.tags, str):
            item.tags = [item.tags.strip()] if item.tags.strip() else []
        elif item.tags is None:
            item.tags = []
    
    return related


@router.get("/tags/all")
async def get_all_tags(db: Session = Depends(get_db)):
    """Get all unique tags from published articles"""
    articles = db.query(News.tags).filter(News.published == True).all()
    
    tags_set = set()
    for article in articles:
        if article.tags:
            if isinstance(article.tags, list):
                tags_set.update(article.tags)
            elif isinstance(article.tags, str):
                tags_set.add(article.tags.strip())
    
    return {"tags": sorted(list(tags_set))}


@router.get("/feed/rss")
async def get_rss_feed(db: Session = Depends(get_db)):
    """Generate RSS feed for the news articles"""
    articles = db.query(News).filter(News.published == True).order_by(News.created_at.desc()).limit(50).all()
    
    rss = '<?xml version="1.0" encoding="UTF-8"?>\n'
    rss += '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n'
    rss += '  <channel>\n'
    rss += '    <title>TheCloudMind.ai - Latest AI News</title>\n'
    rss += '    <link>https://cloudmindai.in/</link>\n'
    rss += '    <description>Your trusted source for AI developments and innovations</description>\n'
    rss += '    <language>en-us</language>\n'
    rss += '    <atom:link href="https://cloudmindai.in/api/news/feed/rss" rel="self" type="application/rss+xml" />\n'
    
    for article in articles:
        rss += '    <item>\n'
        rss += f'      <title><![CDATA[{article.title}]]></title>\n'
        rss += f'      <link>https://cloudmindai.in/article/{article.slug}</link>\n'
        rss += f'      <description><![CDATA[{article.summary}]]></description>\n'
        rss += f'      <pubDate>{article.created_at.strftime("%a, %d %b %Y %H:%M:%S +0000")}</pubDate>\n'
        rss += f'      <guid>https://cloudmindai.in/article/{article.slug}</guid>\n'
        rss += '    </item>\n'
    
    rss += '  </channel>\n'
    rss += '</rss>'
    
    return Response(content=rss, media_type="application/rss+xml")


@router.get("/sitemap/xml")
async def get_sitemap(db: Session = Depends(get_db)):
    """Generate sitemap XML for SEO"""
    articles = db.query(News).filter(News.published == True).all()
    
    sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n'
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    
    # Home page
    sitemap += '  <url>\n'
    sitemap += '    <loc>https://cloudmindai.in/</loc>\n'
    sitemap += '    <changefreq>daily</changefreq>\n'
    sitemap += '    <priority>1.0</priority>\n'
    sitemap += '  </url>\n'
    
    # Article pages
    for article in articles:
        sitemap += '  <url>\n'
        sitemap += f'    <loc>https://cloudmindai.in/article/{article.slug}</loc>\n'
        sitemap += f'    <lastmod>{article.updated_at.strftime("%Y-%m-%d") if article.updated_at else article.created_at.strftime("%Y-%m-%d")}</lastmod>\n'
        sitemap += '    <changefreq>weekly</changefreq>\n'
        sitemap += '    <priority>0.8</priority>\n'
        sitemap += '  </url>\n'
    
    sitemap += '</urlset>'
    
    return Response(content=sitemap, media_type="application/xml")
