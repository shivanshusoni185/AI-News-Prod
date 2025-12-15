from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import Contact
from ..schemas import ContactCreate, ContactResponse
from ..auth import get_current_admin

router = APIRouter(prefix="/contact", tags=["contact"])


@router.post("/", status_code=201)
def create_contact(contact: ContactCreate, db: Session = Depends(get_db)):
    """
    Create a new contact form submission (public endpoint)
    """
    db_contact = Contact(
        name=contact.name,
        email=contact.email,
        subject=contact.subject,
        message=contact.message
    )

    db.add(db_contact)
    db.commit()
    db.refresh(db_contact)

    return {"message": "Contact form submitted successfully", "id": db_contact.id}


@router.get("/", response_model=List[ContactResponse])
def get_all_contacts(
    db: Session = Depends(get_db),
    admin: str = Depends(get_current_admin)
):
    """
    Get all contact submissions (admin only)
    """
    contacts = db.query(Contact).order_by(Contact.created_at.desc()).all()
    return contacts


@router.get("/{contact_id}", response_model=ContactResponse)
def get_contact(
    contact_id: int,
    db: Session = Depends(get_db),
    admin: str = Depends(get_current_admin)
):
    """
    Get a specific contact submission (admin only)
    """
    contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    # Mark as read
    contact.read = True
    db.commit()

    return contact


@router.delete("/{contact_id}")
def delete_contact(
    contact_id: int,
    db: Session = Depends(get_db),
    admin: str = Depends(get_current_admin)
):
    """
    Delete a contact submission (admin only)
    """
    contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    db.delete(contact)
    db.commit()

    return {"message": "Contact deleted successfully"}
