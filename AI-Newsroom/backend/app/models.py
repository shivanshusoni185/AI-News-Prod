from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import validates
from .database import Base
from typing import List, Optional, Dict, Any

class News(Base):
    """
    News model representing articles in the database.
    """
    __tablename__ = "news"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    summary = Column(String(500), nullable=False)
    content = Column(Text, nullable=False)
    tags = Column(JSON, nullable=True, default=list)
    image_url = Column(String(500), nullable=True)
    published = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
    author_id = Column(Integer, nullable=True)  # Reference to user who created the news
    slug = Column(String(300), unique=True, nullable=True)  # URL-friendly version of title

    @validates('tags')
    def validate_tags(self, key, tags):
        """Ensure tags is always a list"""
        if tags is None:
            return []
        if isinstance(tags, str):
            # If it's a string, convert to list
            return [tags.strip()] if tags.strip() else []
        if isinstance(tags, list):
            return tags
        return []

    def _get_tags(self):
        """Property to ensure tags is always returned as a list"""
        tags_value = object.__getattribute__(self, '_sa_instance_state').dict.get('tags')
        if tags_value is None:
            return []
        if isinstance(tags_value, str):
            return [tags_value.strip()] if tags_value.strip() else []
        if isinstance(tags_value, list):
            return tags_value
        return []

    def to_dict(self) -> Dict[str, Any]:
        """Convert model instance to dictionary"""
        # Ensure tags is always a list
        tags_value = self.tags
        if isinstance(tags_value, str):
            tags_value = [tags_value.strip()] if tags_value.strip() else []
        elif tags_value is None:
            tags_value = []

        return {
            'id': self.id,
            'title': self.title,
            'summary': self.summary,
            'content': self.content,
            'tags': tags_value,
            'image_url': self.image_url,
            'published': self.published,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'author_id': self.author_id,
            'slug': self.slug
        }
        
    def __repr__(self) -> str:
        return f"<News(id={self.id}, title='{self.title[:20]}...', published={self.published})>"

    @classmethod
    def from_dict(cls, data: Dict[str, Any]):
        """Create a News instance from a dictionary"""
        return cls(
            title=data.get('title'),
            summary=data.get('summary'),
            content=data.get('content'),
            tags=data.get('tags', []),
            image_url=data.get('image_url'),
            published=data.get('published', False),
            author_id=data.get('author_id'),
            slug=data.get('slug')
        )


class Contact(Base):
    """
    Contact model for storing contact form submissions.
    """
    __tablename__ = "contacts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    subject = Column(String(500), nullable=False)
    message = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    read = Column(Boolean, default=False, index=True)

    def to_dict(self) -> Dict[str, Any]:
        """Convert model instance to dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'subject': self.subject,
            'message': self.message,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'read': self.read
        }

    def __repr__(self) -> str:
        return f"<Contact(id={self.id}, name='{self.name}', email='{self.email}')>"
