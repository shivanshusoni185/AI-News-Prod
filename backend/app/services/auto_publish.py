import html
import logging
import os
import re
from dataclasses import dataclass
from typing import Iterable, Optional
from urllib.parse import urlparse

import feedparser
import requests
from bs4 import BeautifulSoup
from sqlalchemy import or_
from sqlalchemy.orm import Session

from ..database import SessionLocal
from ..models import News, generate_slug

logger = logging.getLogger(__name__)

REQUEST_TIMEOUT = 20
MAX_IMAGE_BYTES = 10 * 1024 * 1024
USER_AGENT = (
    "Mozilla/5.0 (compatible; TheCloudMindBot/1.0; "
    "+https://cloudmindai.in)"
)


@dataclass(frozen=True)
class FeedConfig:
    topic: str
    url: str
    tags: list[str]


FEEDS: tuple[FeedConfig, ...] = (
    FeedConfig(
        topic="ai",
        url=(
            "https://news.google.com/rss/search?"
            "q=artificial+intelligence&hl=en-IN&gl=IN&ceid=IN:en"
        ),
        tags=["AI", "Automation", "Daily Brief"],
    ),
    FeedConfig(
        topic="sports",
        url=(
            "https://news.google.com/rss/headlines/section/topic/SPORTS?"
            "hl=en-IN&gl=IN&ceid=IN:en"
        ),
        tags=["Sports", "Automation", "Daily Brief"],
    ),
)


def _clean_text(value: str) -> str:
    text = BeautifulSoup(html.unescape(value or ""), "html.parser").get_text(" ")
    text = re.sub(r"\s+", " ", text).strip()
    return text


def _clean_title(title: str) -> str:
    cleaned = _clean_text(title)
    parts = re.split(r"\s[-|]\s", cleaned)
    return parts[0].strip() if parts else cleaned


def _summary_from_entry(entry: dict) -> str:
    candidates = [
        entry.get("summary", ""),
        entry.get("description", ""),
        " ".join(
            _clean_text(part.get("value", ""))
            for part in entry.get("content", [])
            if part.get("value")
        ),
    ]
    for candidate in candidates:
        cleaned = _clean_text(candidate)
        if cleaned:
            return cleaned[:500]
    return "Auto-curated story. Open the source link for the full article."


def _content_from_summary(summary: str, source_url: str, topic: str) -> str:
    paragraphs = [
        summary,
        (
            f"This {topic} story was automatically aggregated for the daily "
            "morning update."
        ),
        f"Original source: {source_url}",
    ]
    return "\n\n".join(paragraphs)


def _extract_image_url(entry: dict, article_html: Optional[str]) -> Optional[str]:
    for key in ("media_content", "media_thumbnail"):
        media_items = entry.get(key) or []
        for item in media_items:
            url = item.get("url")
            if url:
                return url

    if not article_html:
        return None

    soup = BeautifulSoup(article_html, "html.parser")
    selectors = [
        ("meta", {"property": "og:image"}),
        ("meta", {"name": "twitter:image"}),
        ("meta", {"property": "og:image:url"}),
    ]
    for tag_name, attrs in selectors:
        tag = soup.find(tag_name, attrs=attrs)
        if tag and tag.get("content"):
            return tag["content"].strip()

    return None


def _download_image(image_url: str) -> tuple[bytes, str, str] | tuple[None, None, None]:
    try:
        response = requests.get(
            image_url,
            timeout=REQUEST_TIMEOUT,
            headers={"User-Agent": USER_AGENT},
            stream=True,
        )
        response.raise_for_status()
        content_type = response.headers.get("Content-Type", "").split(";")[0].strip()
        if not content_type.startswith("image/"):
            return None, None, None

        data = response.content[: MAX_IMAGE_BYTES + 1]
        if len(data) > MAX_IMAGE_BYTES:
            logger.warning("Skipping oversized image: %s", image_url)
            return None, None, None

        path = urlparse(image_url).path
        filename = os.path.basename(path) or "image.jpg"
        return data, filename, content_type or "image/jpeg"
    except Exception as exc:
        logger.warning("Failed to download image %s: %s", image_url, exc)
        return None, None, None


def _fetch_article_html(url: str) -> tuple[str, Optional[str]]:
    response = requests.get(
        url,
        timeout=REQUEST_TIMEOUT,
        headers={"User-Agent": USER_AGENT},
        allow_redirects=True,
    )
    response.raise_for_status()
    return response.text, response.url


def _story_exists(db: Session, title: str, base_slug: str) -> bool:
    return (
        db.query(News.id)
        .filter(or_(News.title == title, News.slug == base_slug))
        .first()
        is not None
    )


def _create_news_item(db: Session, feed: FeedConfig, entry: dict) -> bool:
    raw_title = entry.get("title", "")
    title = _clean_title(raw_title)
    if not title:
        return False

    base_slug = generate_slug(title)
    if _story_exists(db, title, base_slug):
        logger.info("Skipping existing story: %s", title)
        return False
    slug = generate_slug(title, db, News)

    source_url = entry.get("link")
    article_html = None
    if source_url:
        try:
            article_html, source_url = _fetch_article_html(source_url)
        except Exception as exc:
            logger.warning("Failed to fetch article page %s: %s", source_url, exc)

    summary = _summary_from_entry(entry)
    content = _content_from_summary(summary, source_url or "Unavailable", feed.topic)

    image_data = None
    image_filename = None
    image_mimetype = None
    image_url = _extract_image_url(entry, article_html)
    if image_url:
        image_data, image_filename, image_mimetype = _download_image(image_url)

    news = News(
        title=title,
        summary=summary,
        content=content,
        tags=feed.tags,
        published=True,
        slug=slug,
        image_data=image_data,
        image_filename=image_filename,
        image_mimetype=image_mimetype,
    )
    db.add(news)
    db.commit()
    db.refresh(news)
    logger.info("Published automated %s story: %s", feed.topic, title)
    return True


def _iter_entries(feed: FeedConfig, limit: int) -> Iterable[dict]:
    parsed = feedparser.parse(feed.url)
    if parsed.bozo:
        logger.warning("Feed parser warning for %s: %s", feed.url, parsed.bozo_exception)
    return parsed.entries[:limit]


def run_auto_publish(max_per_topic: int = 5) -> dict[str, int]:
    stats = {"ai": 0, "sports": 0}
    db = SessionLocal()
    try:
        for feed in FEEDS:
            for entry in _iter_entries(feed, max_per_topic):
                try:
                    created = _create_news_item(db, feed, entry)
                except Exception as exc:
                    db.rollback()
                    logger.exception(
                        "Auto-publish failed for topic %s and entry %s: %s",
                        feed.topic,
                        entry.get("title"),
                        exc,
                    )
                    continue
                if created:
                    stats[feed.topic] += 1
    finally:
        db.close()
    return stats
