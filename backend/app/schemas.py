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
