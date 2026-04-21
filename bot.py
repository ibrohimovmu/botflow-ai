import os
import asyncio
import logging
import uvicorn
from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from aiogram import Bot, Dispatcher, types
from aiogram.client.default import DefaultBotProperties
from aiogram.types import Update
from aiogram.fsm.storage.memory import MemoryStorage
from typing import Optional, List
from aiogram.client.session.aiohttp import AiohttpSession
import aiohttp
from pydantic import BaseModel

from config import settings
from database.models import init_db
from database.manager import smart_init
from handlers import start, onboarding, builder, admin, finalize
from middlewares.auth import AuthMiddleware

# FastAPI
app = FastAPI()
PORT = int(os.environ.get("PORT", 7860))

if not os.path.exists("static"): os.makedirs("static")
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
async def root(): return {"status": "Aura Studio Online ✅", "mode": "Webhook" if settings.USE_WEBHOOK else "Polling"}

@app.get("/app", response_class=HTMLResponse)
async def webapp():
    try:
        with open("static/webapp.html", "r", encoding="utf-8") as f: return HTMLResponse(content=f.read())
    except: return HTMLResponse(content="<h1>Mini App Yuklanmoqda...</h1>")

# Webhook endpoint
@app.post(settings.WEBHOOK_PATH)
async def bot_webhook(update: dict):
    telegram_update = Update(**update)
    await dp.feed_update(bot, telegram_update)
    return {"ok": True}

class TelegramUser(BaseModel):
    id: int
    first_name: str
    last_name: Optional[str] = None
    username: Optional[str] = None
    photo_url: Optional[str] = None
    auth_date: int
    hash: str

@app.post("/auth/telegram")
async def telegram_auth(user: TelegramUser):
    # Verify hash would go here in production
    logging.info(f"👤 User authenticated via Widget: {user.first_name} (@{user.username})")
    return {"status": "ok", "user_id": user.id}

logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")

# Globals for access in webhook
bot: Bot = None
dp: Dispatcher = None

async def main():
    # 1. Database & Migration
    await smart_init()

    # Initialize bot for Render (Native connection, no mirror needed!)
    bot_session = AiohttpSession()
    bot = Bot(token=settings.BOT_TOKEN, session=bot_session, default=DefaultBotProperties(parse_mode="HTML"))
    dp = Dispatcher(storage=MemoryStorage())
    # ... rest of setup continues below

    # Middlewares & Routers
    dp.message.middleware(AuthMiddleware())
    dp.callback_query.middleware(AuthMiddleware())
    
    dp.include_router(start.router)
    dp.include_router(onboarding.router)
    dp.include_router(builder.router)
    dp.include_router(admin.router)
    dp.include_router(finalize.router)

    from handlers.my_bots import router as my_bots_router
    from handlers.analytics import router as analytics_router
    from handlers.referral import router as referral_router
    from handlers.ai_handler import router as ai_handler_router
    
    dp.include_router(my_bots_router)
    dp.include_router(analytics_router)
    dp.include_router(referral_router)
    dp.include_router(ai_handler_router)

    # 5. Background Cleanup Task
    async def cleanup_expired_bots():
        from database.models import async_session, UserBot
        from sqlalchemy import select, delete
        from datetime import datetime
        while True:
            await asyncio.sleep(60)
            try:
                async with async_session() as session_db:
                    q = delete(UserBot).where(UserBot.expires_at < datetime.utcnow(), UserBot.status == "testing")
                    result = await session_db.execute(q)
                    await session_db.commit()
                    if result.rowcount > 0:
                        logging.info(f"🧹 Cleaned up {result.rowcount} expired trial bots.")
            except Exception as e:
                logging.error(f"Cleanup task error: {e}")

    asyncio.create_task(cleanup_expired_bots())

    print(f"🚀 Aura Studio Bot Renderda ishga tushmoqda...")

    # Set webhook for Render
    try:
        await bot.delete_webhook(drop_pending_updates=True)
        webhook_url = f"{settings.WEBHOOK_URL}{settings.WEBHOOK_PATH}"
        await bot.set_webhook(url=webhook_url)
        logging.info(f"📝 Webhook muvaffaqiyatli o'rnatildi: {webhook_url}")
    except Exception as e:
        logging.error(f"Render Webhook hatosi: {e}")

    # Launch FastAPI (uvicorn)
    config_uv = uvicorn.Config(app, host="0.0.0.0", port=PORT, log_level="info")
    server = uvicorn.Server(config_uv)
    await server.serve()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        pass
