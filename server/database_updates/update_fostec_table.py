#!/usr/bin/env python3
"""
Script to update PostgreSQL database by removing category and product_type columns
from the fostec_product table.
"""

import psycopg2
import sys
import os

# Database configuration
DB_CONFIG = {
    "host": "localhost",
    "database": "salesdb", 
    "user": "postgres",
    "password": "energy2023",
    "port": 5432
}

def connect_to_database():
    """Connect to PostgreSQL database"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        return conn
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return None

def check_table_structure(conn):
    """Check current table structure"""
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = 'fostec_product' 
            ORDER BY ordinal_position
        """)
        
        columns = cur.fetchall()
        print("\n📋 Current fostec_product table structure:")
        for col in columns:
            print(f"   - {col[0]} ({col[1]}) {'NULL' if col[2] == 'YES' else 'NOT NULL'}")
        
        cur.close()
        return columns
    except Exception as e:
        print(f"❌ Error checking table structure: {e}")
        return []

def drop_column_if_exists(conn, column_name):
    """Drop column if it exists"""
    try:
        cur = conn.cursor()
        
        # Check if column exists
        cur.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'fostec_product' 
            AND column_name = %s
        """, (column_name,))
        
        if cur.fetchone():
            cur.execute(f"ALTER TABLE fostec_product DROP COLUMN {column_name}")
            conn.commit()
            print(f"✅ Column '{column_name}' dropped successfully")
        else:
            print(f"ℹ️  Column '{column_name}' does not exist")
        
        cur.close()
        return True
    except Exception as e:
        print(f"❌ Error dropping column '{column_name}': {e}")
        conn.rollback()
        return False

def show_sample_data(conn):
    """Show sample data to verify table still works"""
    try:
        cur = conn.cursor()
        cur.execute("SELECT * FROM fostec_product LIMIT 5")
        rows = cur.fetchall()
        
        if rows:
            print("\n📊 Sample data (first 5 rows):")
            cur.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'fostec_product' ORDER BY ordinal_position")
            columns = [row[0] for row in cur.fetchall()]
            
            print("   " + " | ".join(f"{col:12}" for col in columns))
            print("   " + "-" * (len(columns) * 15))
            
            for row in rows:
                print("   " + " | ".join(f"{str(val):12}" for val in row))
        else:
            print("\n📊 No data in fostec_product table")
        
        cur.close()
    except Exception as e:
        print(f"❌ Error showing sample data: {e}")

def main():
    print("🔧 Updating fostec_product table structure...")
    print("=" * 50)
    
    # Connect to database
    conn = connect_to_database()
    if not conn:
        sys.exit(1)
    
    try:
        # Check current structure
        print("📋 Checking current table structure...")
        current_columns = check_table_structure(conn)
        
        if not current_columns:
            print("❌ Could not retrieve table structure")
            sys.exit(1)
        
        # Drop category column
        print("\n🗑️  Dropping 'category' column...")
        if not drop_column_if_exists(conn, 'category'):
            print("⚠️  Failed to drop category column")
        
        # Drop product_type column  
        print("\n🗑️  Dropping 'product_type' column...")
        if not drop_column_if_exists(conn, 'product_type'):
            print("⚠️  Failed to drop product_type column")
        
        # Verify updated structure
        print("\n📋 Updated table structure:")
        updated_columns = check_table_structure(conn)
        
        # Show sample data
        show_sample_data(conn)
        
        print("\n" + "=" * 50)
        print("✅ Database update completed successfully!")
        print("🎯 Fostec product table now contains only essential columns:")
        for col in updated_columns:
            print(f"   - {col[0]}")
        
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        sys.exit(1)
    
    finally:
        conn.close()
        print("\n🔌 Database connection closed")

if __name__ == "__main__":
    main()
