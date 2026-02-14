"""
Seed Data for BeeYield
========================
REWRITTEN: No hardcoded product data, accounts, or items.
Products must be added through the admin dashboard or migration scripts.
This module is kept for compatibility but contains NO hardcoded data.
"""
from app.db.supabase_db import db_select


def seed_products():
    """
    Check if products exist in the database.
    Products should be managed through the admin interface, NOT hardcoded here.
    """
    print("🔍 Checking products in database...")

    existing = db_select("products", limit=1)
    if existing:
        print(f"✅ Products exist in database ({len(existing)} found). No seeding needed.")
        return

    print("⚠️  No products found in database.")
    print("   → Use the admin dashboard to add products")
    print("   → Or run a SQL migration to populate the products table")
    print("   → No hardcoded seed data is used.")


if __name__ == "__main__":
    seed_products()
