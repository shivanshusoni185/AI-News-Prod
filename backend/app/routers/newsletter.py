from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from ..database import get_db
from ..models import Newsletter
from ..schemas import NewsletterCreate, NewsletterResponse

router = APIRouter(prefix="/newsletter", tags=["newsletter"])


@router.post("", response_model=NewsletterResponse)
async def subscribe_newsletter(
    subscription: NewsletterCreate,
    db: Session = Depends(get_db)
):
    """Subscribe to newsletter"""
    # Validate email format (basic validation)
    email = subscription.email.strip().lower()
    if not email or '@' not in email:
        raise HTTPException(status_code=400, detail="Invalid email address")
    
    try:
        # Check if already subscribed
        existing = db.query(Newsletter).filter(Newsletter.email == email).first()
        if existing:
            if existing.active:
                raise HTTPException(status_code=400, detail="Email already subscribed")
            else:
                # Reactivate subscription
                existing.active = True
                db.commit()
                db.refresh(existing)
                return existing
        
        # Create new subscription
        newsletter = Newsletter(email=email)
        db.add(newsletter)
        db.commit()
        db.refresh(newsletter)
        
        return newsletter
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Email already subscribed")


@router.delete("/{email}")
async def unsubscribe_newsletter(email: str, db: Session = Depends(get_db)):
    """Unsubscribe from newsletter"""
    email = email.strip().lower()
    
    subscription = db.query(Newsletter).filter(Newsletter.email == email).first()
    if not subscription:
        raise HTTPException(status_code=404, detail="Email not found")
    
    subscription.active = False
    db.commit()
    
    return {"success": True, "message": "Successfully unsubscribed"}
