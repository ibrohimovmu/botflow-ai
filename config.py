import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings
from typing import Optional

load_dotenv()

class Settings(BaseSettings):
    BOT_TOKEN: Optional[str] = os.getenv("BOT_TOKEN")
    DATABASE_URL: Optional[str] = os.getenv("DATABASE_URL")
    REDIS_URL: Optional[str] = os.getenv("REDIS_URL")
    GROQ_KEY: Optional[str] = os.getenv("GROQ_KEY")
    
    STICKER_WELCOME: Optional[str] = os.getenv("STICKER_WELCOME")
    STICKER_SUCCESS: Optional[str] = os.getenv("STICKER_SUCCESS")
    
    # Webhook Settings
    USE_WEBHOOK: bool = os.getenv("USE_WEBHOOK", "True").lower() == "true"
    WEBHOOK_URL: str = os.getenv("WEBHOOK_URL", "https://ibrohmwvgmai-vault.hf.space")
    WEBHOOK_PATH: str = os.getenv("WEBHOOK_PATH", "/webhook")
    
    # Mirror/Proxy (For HF stability)
    MIRROR_LIST: list[str] = [
        "https://tapi.b-cdn.net", # Primary (wait, it was dead, let's move it down)
        "https://tgbot.xyz",
        "https://teleapi.io",
        "https://botapi.t-v.pp.ua",
        "https://api.pwrtelegram.xyz"
    ]
    TELEGRAM_API_SERVER: str = os.getenv("TELEGRAM_API_SERVER", "https://tgbot.xyz")

settings = Settings()
