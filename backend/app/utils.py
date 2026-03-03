"""
Utility functions for the AI News application
"""
import re
from typing import Optional


def calculate_reading_time(content: str, words_per_minute: int = 200) -> int:
    """
    Calculate estimated reading time for an article in minutes.
    
    Args:
        content: The article content text
        words_per_minute: Average reading speed (default: 200 wpm)
    
    Returns:
        Estimated reading time in minutes (minimum 1 minute)
    """
    if not content:
        return 1
    
    # Remove extra whitespace and count words
    words = len(content.split())
    
    # Calculate reading time
    minutes = max(1, round(words / words_per_minute))
    
    return minutes


def truncate_text(text: str, max_length: int = 160, suffix: str = "...") -> str:
    """
    Truncate text to a maximum length, adding suffix if truncated.
    
    Args:
        text: Text to truncate
        max_length: Maximum length before truncation
        suffix: Suffix to add when truncated
    
    Returns:
        Truncated text
    """
    if not text or len(text) <= max_length:
        return text
    
    return text[:max_length - len(suffix)].strip() + suffix


def sanitize_slug(text: str) -> str:
    """
    Create a URL-safe slug from text.
    
    Args:
        text: Text to convert to slug
    
    Returns:
        URL-safe slug
    """
    if not text:
        return ""
    
    # Convert to lowercase
    slug = text.lower()
    
    # Replace spaces and special characters with hyphens
    slug = re.sub(r'[^a-z0-9]+', '-', slug)
    
    # Remove leading/trailing hyphens
    slug = slug.strip('-')
    
    # Remove consecutive hyphens
    slug = re.sub(r'-+', '-', slug)
    
    return slug[:250]
