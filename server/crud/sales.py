from .database import *

def create_sales(group_work_id, name, price, description):
    conn, cur = get_cursor(dict_mode=True)
    try:
        cur.execute("""
            INSERT INTO sales (group_work_id, name, price, description)
            VALUES (%s, %s, %s, %s);
        """, (group_work_id, name, int(price), description))
        conn.commit()
        return True
    except Exception as e:
        print(e)
        return False
    finally:
        cur.close()
        conn.close()

def get_all_sales():
    conn, cur = get_cursor(dict_mode=True)
    
    cur.execute("""
        SELECT s.id, s.group_work_id, s.name, s.price, s.description, s.created_at, s.status,
               gw.name as group_work_name
        FROM sales s
        LEFT JOIN group_work gw ON s.group_work_id = gw.id
        WHERE s.status = 'active'
        ORDER BY s.created_at DESC;
    """)
    
    data = cur.fetchall()
    
    cur.close()
    conn.close()
    
    return data

def get_sales_by_group_work(group_work_id):
    conn, cur = get_cursor(dict_mode=True)
    
    cur.execute("""
        SELECT s.id, s.group_work_id, s.name, s.price, s.description, s.created_at, s.status,
               gw.name as group_work_name
        FROM sales s
        LEFT JOIN group_work gw ON s.group_work_id = gw.id
        WHERE s.group_work_id = %s AND s.status = 'active'
        ORDER BY s.created_at DESC;
    """, (group_work_id,))
    
    data = cur.fetchall()
    
    cur.close()
    conn.close()
    
    return data

def update_sales(sales_id, group_work_id, name, price, description):
    conn, cur = get_cursor(dict_mode=True)
    try:
        cur.execute("""
            UPDATE sales 
            SET group_work_id = %s, name = %s, price = %s, description = %s
            WHERE id = %s;
        """, (group_work_id, name, int(price), description, sales_id))
        conn.commit()
        return True
    except Exception as e:
        print(e)
        return False
    finally:
        cur.close()
        conn.close()

def delete_sales(sales_id):
    conn, cur = get_cursor(dict_mode=True)
    try:
        cur.execute("UPDATE sales SET status = 'inactive' WHERE id = %s;", (sales_id,))
        conn.commit()
        return True
    except Exception as e:
        print(e)
        return False
    finally:
        cur.close()
        conn.close()

def get_sales_statistics():
    """Get sales statistics for dashboard"""
    conn, cur = get_cursor(dict_mode=True)
    
    # Total sales amount
    cur.execute("""
        SELECT COALESCE(SUM(price), 0) as total_sales,
               COUNT(*) as total_orders,
               AVG(price) as avg_order_value
        FROM sales 
        WHERE status = 'active';
    """)
    
    stats = cur.fetchone()
    
    # Monthly sales trend (last 6 months)
    cur.execute("""
        SELECT DATE_TRUNC('month', created_at) as month,
               SUM(price) as monthly_sales,
               COUNT(*) as monthly_orders
        FROM sales 
        WHERE status = 'active' 
        AND created_at >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '5 months'
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY month;
    """)
    
    monthly_trend = cur.fetchall()
    
    cur.close()
    conn.close()
    
    return {
        'total_sales': stats['total_sales'],
        'total_orders': stats['total_orders'],
        'avg_order_value': stats['avg_order_value'],
        'monthly_trend': monthly_trend
    }

def get_monthly_sales_data():
    """Get monthly sales data for chart"""
    conn, cur = get_cursor(dict_mode=True)
    
    cur.execute("""
        SELECT 
            TO_CHAR(created_at, 'Mon') as month,
            SUM(price) as amount
        FROM sales 
        WHERE status = 'active'
        AND created_at >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '11 months'
        GROUP BY TO_CHAR(created_at, 'Mon'), DATE_TRUNC('month', created_at)
        ORDER BY DATE_TRUNC('month', created_at)
        LIMIT 12;
    """)
    
    data = cur.fetchall()
    
    cur.close()
    conn.close()
    
    return data
