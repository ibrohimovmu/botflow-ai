import asyncio
import json
import logging
from sqlalchemy import text
from database.models import engine, async_session, User, UserBot
import os

async def smart_init():
    """
    1. Ensures all tables in models.py exist in Supabase.
    2. Checks for missing columns in existing tables and adds them.
    3. Migrates data from JSON files if not already in DB.
    """
    async with engine.begin() as conn:
        # Create tables that don't exist
        from database.models import Base
        await conn.run_sync(Base.metadata.create_all)
    
    # 2. Check for missing columns in 'users' table
    # Supabase might have an older version of the table
    async with async_session() as session:
        try:
            # We try to add columns that might be missing from the 5-column version
            cols_to_add = [
                ("is_verified", "BOOLEAN DEFAULT FALSE"),
                ("is_registered", "BOOLEAN DEFAULT FALSE"),
                ("is_terms_accepted", "BOOLEAN DEFAULT FALSE"),
                ("referral_code", "VARCHAR"),
                ("referred_by", "BIGINT"),
                ("ref_count", "INTEGER DEFAULT 0")
            ]
            for col_name, col_type in cols_to_add:
                try:
                    await session.execute(text(f"ALTER TABLE users ADD COLUMN IF NOT EXISTS {col_name} {col_type}"))
                except: pass
            await session.commit()
        except Exception as e:
            logging.error(f"Migration error: {e}")

    # 3. Import JSON data
    # subscribers.json -> users
    if os.path.exists("subscribers.json"):
        try:
            with open("subscribers.json", "r") as f:
                data = json.load(f)
                subs = data.get("subscribers", {})
                async with async_session() as session:
                    for uid, info in subs.items():
                        user_id = int(uid)
                        # Check if user exists
                        from sqlalchemy import select
                        res = await session.execute(select(User).where(User.user_id == user_id))
                        if not res.scalar_one_or_none():
                            new_user = User(
                                user_id=user_id,
                                username=info.get("username"),
                                full_name=info.get("username"), # Fallback
                                is_verified=True,
                                is_registered=True
                            )
                            session.add(new_user)
                    await session.commit()
                    logging.info(f"✅ Migrated {len(subs)} users from subscribers.json")
        except Exception as e:
            logging.error(f"JSON migration error: {e}")

    # ai_bots_db.json -> UserBot
    if os.path.exists("ai_bots_db.json"):
        try:
            with open("ai_bots_db.json", "r") as f:
                data = json.load(f)
                async with async_session() as session:
                    for token, info in data.items():
                        from sqlalchemy import select
                        res = await session.execute(select(UserBot).where(UserBot.token == token))
                        if not res.scalar_one_or_none():
                            new_bot = UserBot(
                                owner_id=int(info.get("owner", 0)),
                                bot_name=info.get("bot_username", "Unknown"),
                                token=token,
                                template=info.get("category", "custom"),
                                config=json.dumps(info.get("config", {})),
                                status="active"
                            )
                            session.add(new_bot)
                    await session.commit()
                    logging.info(f"✅ Migrated {len(data)} bots from ai_bots_db.json")
        except Exception as e:
            logging.error(f"Bot migration error: {e}")

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(smart_init())
