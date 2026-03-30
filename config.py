import os
from dotenv import load_dotenv
load_dotenv()

# ── BOT TOKENS ────────────────────────────────────────────────────────────────
EDTECH_TOKEN   = os.getenv("EDTECH_TOKEN", "")
FILMFLOW_TOKEN = os.getenv("FILMFLOW_TOKEN", "")

# ── ADMINS ───────────────────────────────────────────────────────────────────
ADMIN_IDS = [int(x) for x in os.getenv("ADMIN_IDS", "7021334895").split(",")]

# ── SUPABASE (Ed-Tech uchun) ─────────────────────────────────────────────────
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

# ── AI ────────────────────────────────────────────────────────────────────────
GROQ_API_KEY   = os.getenv("GROQ_API_KEY", "")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
AI_MODEL       = os.getenv("AI_MODEL", "llama-3.3-70b-versatile")

# ── HF (Film DB zaxirasi uchun) ──────────────────────────────────────────────
HF_TOKEN   = os.getenv("HF_TOKEN", "")
HF_DATASET = os.getenv("HF_DATASET", "ibrohmwvgmai/filmflow-data")

# ── FILM BOT KANALLAR ────────────────────────────────────────────────────────
FILM_CHANNELS = [
    {"name": "🎬 FilmFlow Asosiy",    "url": "https://t.me/filmflowuz"},
    {"name": "🎭 Multfilm & Seriallar","url": "https://t.me/salommultfilm"},
    {"name": "🍿 HD Kinolar",          "url": "https://t.me/salomfilm"},
]
REQUIRED_CHANNEL = os.getenv("REQUIRED_CHANNEL", "@filmflowuz")
FILM_BOT_USERNAME = os.getenv("FILM_BOT_USERNAME", "filmflowuzbot")

# ── MUKOFOT TIZIMI ────────────────────────────────────────────────────────────
REWARD_PER_MOVIES  = 10      # Nechta kino qo'shganda mukofot
REWARD_AMOUNT      = 5000    # Mukofot miqdori (so'm)
ADMIN_CONTACT      = os.getenv("ADMIN_CONTACT", "https://t.me/ibrohmwv")

# ── EDTECH ───────────────────────────────────────────────────────────────────
EDTECH_BOT_USERNAME = os.getenv("EDTECH_BOT_USERNAME", "FlowSafeGarant_bot")
SITE_URL            = os.getenv("SITE_URL", "https://flowfilmuz.xyz")