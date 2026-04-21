import aiosqlite
from config import DB_PATH

async def init_db():
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS users (
                user_id INTEGER PRIMARY KEY,
                username TEXT,
                full_name TEXT,
                phone TEXT,
                is_registered INTEGER DEFAULT 0,
                is_captcha_passed INTEGER DEFAULT 0,
                joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        await db.commit()

async def add_user(user_id, username, full_name):
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "INSERT OR IGNORE INTO users (user_id, username, full_name) VALUES (?, ?, ?)",
            (user_id, username, full_name)
        )
        await db.commit()

async def update_captcha_status(user_id, status=1):
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("UPDATE users SET is_captcha_passed = ? WHERE user_id = ?", (status, user_id))
        await db.commit()

async def get_user_status(user_id):
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute("SELECT is_captcha_passed, is_registered FROM users WHERE user_id = ?", (user_id,)) as cursor:
            return await cursor.fetchone()
