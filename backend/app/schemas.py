from pydantic import BaseModel, field_validator, model_validator
from datetime import datetime
from typing import Optional, List, Any


class NewsBase(BaseModel):
    title: str
    summary: str
    content: str
    tags: Optional[List[str]] = None
    published: bool = False

    @field_validator('tags', mode='before')
    @classmethod
    def validate_tags(cls, v):
        """Ensure tags is always a list"""
        if v is None:
            return []
        if isinstance(v, str):
            # If it's a string, convert to list
            return [v.strip()] if v.strip() else []
        if isinstance(v, list):
            return v
        return []


class NewsCreate(NewsBase):
    pass


class NewsUpdate(BaseModel):
    title: Optional[str] = None
    summary: Optional[str] = None
    content: Optional[str] = None
    tags: Optional[List[str]] = None
    published: Optional[bool] = None

    @field_validator('tags', mode='before')
    @classmethod
    def validate_tags(cls, v):
        """Ensure tags is always a list"""
        if v is None:
            return []
        if isinstance(v, str):
            return [v.strip()] if v.strip() else []
        if isinstance(v, list):
            return v
        return []


class NewsResponse(NewsBase):
    id: int
    image_url: Optional[str] = None
    created_at: datetime
    slug: Optional[str] = None
    reading_time: Optional[int] = None

    @model_validator(mode='before')
    @classmethod
    def compute_image_url(cls, data):
        """Compute image_url from image_data if available and calculate reading time"""
        if isinstance(data, dict):
            # Calculate reading time if content exists
            if 'content' in data and data['content']:
                from ..utils import calculate_reading_time
                data['reading_time'] = calculate_reading_time(data['content'])
            return data
        # If it's a model instance, convert to dict
        if hasattr(data, '__dict__'):
            # Get the model's attributes
            result = {}
            for key in ['id', 'title', 'summary', 'content', 'tags', 'published', 'created_at', 'updated_at', 'author_id', 'slug']:
                if hasattr(data, key):
                    result[key] = getattr(data, key)

            # Compute image_url
            if hasattr(data, 'image_data') and data.image_data:
                result['image_url'] = f"/news/image/{data.id}"
            elif hasattr(data, '_image_url_legacy') and data._image_url_legacy:
                result['image_url'] = data._image_url_legacy
            else:
                result['image_url'] = None

            # Calculate reading time
            if hasattr(data, 'content') and data.content:
                from ..utils import calculate_reading_time
                result['reading_time'] = calculate_reading_time(data.content)

            return result
        return data

    class Config:
        from_attributes = True


class NewsListResponse(BaseModel):
    id: int
    title: str
    summary: str
    tags: Optional[List[str]] = None
    image_url: Optional[str] = None
    published: bool
    created_at: datetime
    slug: Optional[str] = None

    @model_validator(mode='before')
    @classmethod
    def compute_image_url(cls, data):
        """Compute image_url from image_data if available"""
        if isinstance(data, dict):
            return data
        # If it's a model instance, convert to dict
        if hasattr(data, '__dict__'):
            # Get the model's attributes
            result = {}
            for key in ['id', 'title', 'summary', 'tags', 'published', 'created_at', 'slug']:
                if hasattr(data, key):
                    result[key] = getattr(data, key)

            # Compute image_url
            if hasattr(data, 'image_data') and data.image_data:
                result['image_url'] = f"/news/image/{data.id}"
            elif hasattr(data, '_image_url_legacy') and data._image_url_legacy:
                result['image_url'] = data._image_url_legacy
            else:
                result['image_url'] = None

            return result
        return data

    @field_validator('tags', mode='before')
    @classmethod
    def validate_tags(cls, v):
        """Ensure tags is always a list"""
        if v is None:
            return []
        if isinstance(v, str):
            return [v.strip()] if v.strip() else []
        if isinstance(v, list):
            return v
        return []

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


class LoginRequest(BaseModel):
    username: str
    password: str


class ContactCreate(BaseModel):
    name: str
    email: str
    subject: str
    message: str


class ContactResponse(BaseModel):
    id: int
    name: str
    email: str
    subject: str
    message: str
    created_at: datetime
    read: bool = False

    class Config:
        from_attributes = True


class NewsletterCreate(BaseModel):
    email: str


class NewsletterResponse(BaseModel):
    id: int
    email: str
    created_at: datetime
    active: bool = True

    class Config:
        from_attributes = True


class ArticleViewCreate(BaseModel):
    news_id: int
    ip_address: Optional[str] = None


class ArticleReactionCreate(BaseModel):
    news_id: int
    reaction_type: str  # 'like' or 'bookmark'
    ip_address: Optional[str] = None


class ArticleReactionResponse(BaseModel):
    id: int
    news_id: int
    reaction_type: str
    created_at: datetime

    class Config:
        from_attributes = True


class ArticleStats(BaseModel):
    views: int
    likes: int
    bookmarks: int
