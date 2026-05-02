import psycopg2
from psycopg2.extras import RealDictCursor

# Database connection config
DB_CONFIG = {
    'host': 'localhost',
    'database': 'salesdb',
    'user': 'postgres',
    'password': 'energy2023',
    'port': 5432
}

def add_bill_number_column():
    """Add bill_number column to sales table if it doesn't exist"""
    conn = None
    try:
        # Connect to PostgreSQL
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()
        
        # Check if column exists
        cur.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='sales' AND column_name='bill_number'
        """)
        
        column_exists = cur.fetchone()
        
        if not column_exists:
            print("Adding bill_number column to sales table...")
            
            # Add the column
            cur.execute("ALTER TABLE sales ADD COLUMN bill_number VARCHAR(50)")
            
            # Update existing records with default bill numbers
            cur.execute("""
                UPDATE sales 
                SET bill_number = 'BILL-' || TO_CHAR(created_at, 'YYYY-MM-DD') || '-' || id 
                WHERE bill_number IS NULL OR bill_number = ''
            """)
            
            conn.commit()
            print("✅ Bill number column added successfully!")
            
        else:
            print("✅ Bill number column already exists")
        
        # Show sample data
        cur.execute("""
            SELECT id, bill_number, name, created_at 
            FROM sales 
            ORDER BY created_at DESC 
            LIMIT 5
        """)
        
        records = cur.fetchall()
        print("\n📊 Sample sales data:")
        for record in records:
            print(f"ID: {record[0]}, Bill: {record[1]}, Name: {record[2]}, Date: {record[3]}")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        if conn:
            conn.rollback()
    finally:
        if conn:
            cur.close()
            conn.close()

if __name__ == "__main__":
    add_bill_number_column()
