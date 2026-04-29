import psycopg2
import configparser


DB_CONFIG = {
    "host": "postgresql.sphx-dev.online",
    "database": "salesdb",
    "user": "postgres",
    "password": "energy2023"
}

def get_conn():
    return psycopg2.connect(**DB_CONFIG)

def get_cursor(dict_mode=False):
    conn = get_conn()

    if dict_mode:
        from psycopg2.extras import RealDictCursor
        return conn, conn.cursor(cursor_factory=RealDictCursor)

    return conn, conn.cursor()