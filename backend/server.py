"""
Server entry point for the AI News API
This file is used by supervisor to start the backend service
"""
from app.main import app

__all__ = ['app']
