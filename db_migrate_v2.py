import asyncio
import sqlite3
from database.models import DB_URL

async def migrate():
    db_path = DB_URL.replace("sqlite+aiosqlite:///", "")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Check for existing columns and add missing ones
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN is_registered BOOLEAN DEFAULT 0")
        print("Added 'is_registered' to users")
    except: print("'is_registered' already exists")
    
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN is_terms_accepted BOOLEAN DEFAULT 0")
        print("Added 'is_terms_accepted' to users")
    except: print("'is_terms_accepted' already exists")
    
    try:
        cursor.execute("ALTER TABLE users MODIFY COLUMN full_name VARCHAR")
        print("Updated full_name")
    except: pass
    
    conn.commit()
    conn.close()
    print("Migration complete!")

if __name__ == "__main__":
    asyncio.run(migrate())
