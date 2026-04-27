import psycopg2

conn = psycopg2.connect(
    host="localhost",
    database="sale-internal",
    user="postgres",
    password="energy2023"
)

cur = conn.cursor()

create_table_query = """

create table if not exists "group_user" (
    id INTEGER PRIMARY KEY,
    name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

create table if not exists "group_cost" (
    id INTEGER PRIMARY KEY,
    name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

create table if not exists "group_work" (
    id INTEGER PRIMARY KEY,
    name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    name VARCHAR(100),
    age INTEGER,
    group_id INTEGER REFERENCES "group_user"(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    action VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

create table if not exists products (
    id INTEGER PRIMARY KEY,
    name VARCHAR(100),
    price DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


create table if not exists "cost" (
    id INTEGER PRIMARY KEY,
    group_cost_id INTEGER REFERENCES "group_cost"(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    name VARCHAR(100),
    price INTEGER,
    description TEXT
);

create table if not exists "sales" (
    id INTEGER PRIMARY KEY,
    group_work_id INTEGER REFERENCES "group_work"(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    name VARCHAR(100),
    price INTEGER,
    description TEXT
);


create table if not exists fostec_product (
    id INTEGER PRIMARY KEY,
    name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

create table if not exists measuring_work (
    id INTEGER PRIMARY KEY,
    name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

"""

cur.execute(create_table_query)
conn.commit()

print("สร้างตารางเรียบร้อย")

cur.close()
conn.close()