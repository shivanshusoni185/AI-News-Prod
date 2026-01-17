#!/usr/bin/env python3
"""
Migration script to populate slugs for existing news articles.

This script:
1. Connects to the database
2. Finds all news articles without slugs
3. Generates unique slugs based on article titles
4. Updates the database with the new slugs

Run this script from the backend directory:
    python migrate_slugs.py
"""

import sys
import os
from pathlib import Path

# Add the parent directory to the path to import app modules
sys.path.append(str(Path(__file__).parent))

from app.database import SessionLocal, engine
from app.models import News, generate_slug
from sqlalchemy import text


def migrate_slugs():
    """Generate and populate slugs for all articles that don't have one"""
    print("=" * 60)
    print("Starting slug migration for news articles")
    print("=" * 60)

    # Create database session
    db = SessionLocal()

    try:
        # Get all news articles
        all_news = db.query(News).all()
        total_count = len(all_news)
        print(f"\nTotal articles in database: {total_count}")

        # Find articles without slugs
        articles_without_slugs = [news for news in all_news if not news.slug]
        count_without_slugs = len(articles_without_slugs)

        print(f"Articles without slugs: {count_without_slugs}")
        print(f"Articles already with slugs: {total_count - count_without_slugs}")

        if count_without_slugs == 0:
            print("\nNo articles need slug migration. All articles already have slugs!")
            return

        print(f"\nGenerating slugs for {count_without_slugs} articles...")
        print("-" * 60)

        updated_count = 0
        errors = []

        for news in articles_without_slugs:
            try:
                # Generate unique slug
                slug = generate_slug(news.title, db, News)
                news.slug = slug

                print(f"[{updated_count + 1}/{count_without_slugs}] ID {news.id}: '{news.title[:50]}...'")
                print(f"    -> Slug: '{slug}'")

                updated_count += 1

            except Exception as e:
                error_msg = f"Error generating slug for article ID {news.id}: {str(e)}"
                print(f"    [ERROR] {error_msg}")
                errors.append(error_msg)

        # Commit all changes
        if updated_count > 0:
            print("\n" + "=" * 60)
            print("Committing changes to database...")
            db.commit()
            print(f"[SUCCESS] Successfully updated {updated_count} articles with slugs!")

        # Report any errors
        if errors:
            print("\n" + "=" * 60)
            print(f"[WARNING] Encountered {len(errors)} errors:")
            for error in errors:
                print(f"  - {error}")

        print("\n" + "=" * 60)
        print("Migration Summary:")
        print(f"  Total articles: {total_count}")
        print(f"  Successfully migrated: {updated_count}")
        print(f"  Errors: {len(errors)}")
        print(f"  Already had slugs: {total_count - count_without_slugs}")
        print("=" * 60)

        # Verify the migration
        print("\nVerifying migration...")
        remaining_without_slugs = db.query(News).filter(News.slug == None).count()
        if remaining_without_slugs == 0:
            print("[SUCCESS] Verification passed! All articles now have slugs.")
        else:
            print(f"[WARNING] {remaining_without_slugs} articles still without slugs.")

    except Exception as e:
        print(f"\n[ERROR] Critical error during migration: {str(e)}")
        db.rollback()
        raise

    finally:
        db.close()
        print("\nDatabase connection closed.")


if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("NEWS ARTICLE SLUG MIGRATION SCRIPT")
    print("=" * 60)
    print("\nThis script will generate URL-friendly slugs for all")
    print("news articles that don't currently have one.")
    print("\nPress Ctrl+C to cancel, or Enter to continue...")

    try:
        input()
    except KeyboardInterrupt:
        print("\n\nMigration cancelled by user.")
        sys.exit(0)

    try:
        migrate_slugs()
        print("\n[SUCCESS] Migration completed successfully!\n")
    except KeyboardInterrupt:
        print("\n\n[CANCELLED] Migration cancelled by user.")
        sys.exit(1)
    except Exception as e:
        print(f"\n[ERROR] Migration failed: {str(e)}\n")
        sys.exit(1)
