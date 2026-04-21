"""
🤖 AI Bot Builder — Telegram Bot
================================
Foydalanuvchilar AI yordamida Telegram bot yaratishlari mumkin.

SOZLAMALAR:
- BOT_TOKEN: Telegram bot tokeningiz (@BotFather dan olinadi)
- ADMIN_TELEGRAM_ID: Admin Telegram ID raqami
- OPENAI_API_KEY: OpenAI yoki boshqa AI API kaliti
- OPENAI_BASE_URL: API endpoint (OpenAI, Together, Groq, va h.k.)
- AI_MODEL: Ishlatiladigan AI model nomi

O'zingizning API kalitingizni qo'yish uchun quyidagi "SOZLAMALAR" bo'limini tahrirlang.
"""

import logging
import os
import random
import io
import sqlite3
import subprocess
import asyncio
import re

from PIL import Image, ImageDraw, ImageFont
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, InputFile
from telegram.ext import (
    Application,
    CommandHandler,
    MessageHandler,
    CallbackQueryHandler,
    ContextTypes,
    filters,
    ConversationHandler,
)
import httpx
from openai import OpenAI

# ╔══════════════════════════════════════════════════════════════╗
# ║                      SOZLAMALAR                              ║
# ║  Quyidagi qiymatlarni o'zingiznikiga o'zgartiring            ║
# ╚══════════════════════════════════════════════════════════════╝

# Telegram Bot Token (@BotFather dan oling)
BOT_TOKEN = "7959144179:AAG8-nJQRwdLW5Iz78P9CNpu_bljTZwGWSc"

# Admin Telegram ID (botga admin sifatida kim javob beradi)
ADMIN_TELEGRAM_ID = 7021334895

# AI API sozlamalari
# OpenAI uchun: https://api.openai.com/v1
# Together AI uchun: https://api.together.xyz/v1
# Groq uchun: https://api.groq.com/openai/v1
# Local (Ollama) uchun: http://localhost:11434/v1
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "YOUR_API_KEY_HERE")
OPENAI_BASE_URL = os.environ.get("OPENAI_BASE_URL", "https://api.openai.com/v1")

# AI Model nomi
# OpenAI: gpt-4.1-mini, gpt-4o, gpt-3.5-turbo
# Together: meta-llama/Llama-3-70b-chat-hf
# Groq: llama3-70b-8192
AI_MODEL = "gpt-4.1-mini"

# Ma'lumotlar bazasi fayli
DB_NAME = "bot_builder_users.db"

# Hosting narxlari (so'm)
PRICE_SIMPLE = "50,000"
PRICE_MEDIUM = "100,000"
PRICE_CODE = "30,000"

# ╔══════════════════════════════════════════════════════════════╗
# ║                 SOZLAMALAR TUGADI                            ║
# ║         Quyidagi kodni o'zgartirish shart emas               ║
# ╚══════════════════════════════════════════════════════════════╝

# Logging
logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO,
)
logging.getLogger("httpx").setLevel(logging.WARNING)
logger = logging.getLogger(__name__)

# OpenAI client
http_client = httpx.Client(timeout=httpx.Timeout(90.0, connect=15.0))
client = OpenAI(
    api_key=OPENAI_API_KEY,
    base_url=OPENAI_BASE_URL,
    http_client=http_client,
)

# Test bot processes: {user_id: subprocess.Popen}
test_bot_processes = {}

# ConversationHandler states
(
    CAPTCHA, REGISTER_NAME, TERMS, MAIN_MENU,
    BOT_CREATION_CONVERSATION, GET_BOT_OPTIONS,
    ASK_TOKEN, EDIT_BOT,
) = range(8)


# ═══════════════════════════════════════════════════════════════
#                       MA'LUMOTLAR BAZASI
# ═══════════════════════════════════════════════════════════════

def init_db():
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS users (
            user_id INTEGER PRIMARY KEY,
            name TEXT,
            registered INTEGER DEFAULT 0,
            bots_created INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()


def add_user(user_id, name):
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute(
        "INSERT OR REPLACE INTO users (user_id, name, registered) VALUES (?, ?, 0)",
        (user_id, name),
    )
    conn.commit()
    conn.close()


def get_user(user_id):
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("SELECT user_id, name, registered FROM users WHERE user_id = ?", (user_id,))
    user = c.fetchone()
    conn.close()
    return user


def set_user_registered(user_id):
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("UPDATE users SET registered = 1 WHERE user_id = ?", (user_id,))
    conn.commit()
    conn.close()


def increment_bots_created(user_id):
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("UPDATE users SET bots_created = bots_created + 1 WHERE user_id = ?", (user_id,))
    conn.commit()
    conn.close()


def get_total_users():
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("SELECT COUNT(*) FROM users WHERE registered = 1")
    count = c.fetchone()[0]
    conn.close()
    return count


# ═══════════════════════════════════════════════════════════════
#                         CAPTCHA
# ═══════════════════════════════════════════════════════════════

def generate_captcha_image():
    """Tasodifiy CAPTCHA rasm yaratadi."""
    colors = [
        (41, 128, 185), (39, 174, 96), (192, 57, 43),
        (142, 68, 173), (44, 62, 80), (211, 84, 0),
    ]
    bg_color = random.choice([(240, 248, 255), (255, 250, 240), (245, 245, 245)])
    image = Image.new("RGB", (220, 80), color=bg_color)
    d = ImageDraw.Draw(image)

    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 38)
    except IOError:
        font = ImageFont.load_default()

    captcha_text = "".join(random.choices("23456789ABCDEFGHJKLMNPQRSTUVWXYZ", k=5))

    # Har bir harfni biroz burchakda yozish
    x_pos = 15
    for char in captcha_text:
        color = random.choice(colors)
        y_offset = random.randint(-5, 5)
        d.text((x_pos, 18 + y_offset), char, fill=color, font=font)
        x_pos += 38

    # Shovqin nuqtalar
    for _ in range(600):
        x = random.randint(0, 219)
        y = random.randint(0, 79)
        d.point((x, y), fill=(
            random.randint(100, 200),
            random.randint(100, 200),
            random.randint(100, 200),
        ))

    # Shovqin chiziqlar
    for _ in range(4):
        x1, y1 = random.randint(0, 220), random.randint(0, 80)
        x2, y2 = random.randint(0, 220), random.randint(0, 80)
        d.line(
            [(x1, y1), (x2, y2)],
            fill=(random.randint(80, 180), random.randint(80, 180), random.randint(80, 180)),
            width=random.randint(1, 2),
        )

    buf = io.BytesIO()
    image.save(buf, format="PNG")
    buf.seek(0)
    return buf, captcha_text


# ═══════════════════════════════════════════════════════════════
#                      YORDAMCHI FUNKSIYALAR
# ═══════════════════════════════════════════════════════════════

async def send_long_message(message, text):
    """Uzun xabarlarni bo'laklarga bo'lib yuboradi (Telegram 4096 belgi limiti)."""
    MAX_LEN = 4000
    if len(text) <= MAX_LEN:
        await message.reply_text(text)
        return
    lines = text.split("\n")
    chunk = ""
    for line in lines:
        if len(chunk) + len(line) + 1 > MAX_LEN:
            if chunk:
                await message.reply_text(chunk)
            chunk = line + "\n"
        else:
            chunk += line + "\n"
    if chunk.strip():
        await message.reply_text(chunk)


def extract_code(text):
    """AI javobidan Python kodini ajratib oladi."""
    pattern = r"```python\s*(.*?)```"
    matches = re.findall(pattern, text, re.DOTALL)
    if matches:
        return matches[0].strip()
    return None


def stop_test_bot(user_id):
    """Foydalanuvchining sinov botini to'xtatadi."""
    if user_id in test_bot_processes:
        proc = test_bot_processes[user_id]
        try:
            proc.terminate()
            proc.wait(timeout=5)
        except Exception:
            try:
                proc.kill()
            except Exception:
                pass
        del test_bot_processes[user_id]
        return True
    return False


async def call_ai(messages):
    """AI ga so'rov yuboradi, 3 marta qayta urinadi."""
    max_retries = 3
    for attempt in range(max_retries):
        try:
            response = client.chat.completions.create(
                model=AI_MODEL,
                messages=messages,
                temperature=0.7,
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            logger.error(f"AI xatolik (urinish {attempt + 1}/{max_retries}): {e}")
            if attempt < max_retries - 1:
                await asyncio.sleep(2)
            else:
                return None
    return None


# ═══════════════════════════════════════════════════════════════
#                     /start — CAPTCHA
# ═══════════════════════════════════════════════════════════════

async def start_captcha(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    stop_test_bot(update.effective_user.id)
    user_id = update.effective_user.id
    user = get_user(user_id)

    if user and user[2]:  # Allaqachon ro'yxatdan o'tgan
        return await send_main_menu(update, context)

    captcha_image, captcha_text = generate_captcha_image()
    context.user_data["captcha_text"] = captcha_text
    await update.message.reply_photo(
        photo=InputFile(captcha_image, filename="captcha.png"),
        caption="🔐 <b>Xavfsizlik tekshiruvi</b>\n\nRasmda ko'rsatilgan matnni kiriting:",
        parse_mode="HTML",
    )
    return CAPTCHA


async def check_captcha(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    user_input = update.message.text.strip().upper()
    correct = context.user_data.get("captcha_text", "").upper()

    if user_input == correct:
        await update.message.reply_text("✅ Kaptcha muvaffaqiyatli o'tildi!\n\n👤 Ismingizni kiriting:")
        return REGISTER_NAME
    else:
        captcha_image, captcha_text = generate_captcha_image()
        context.user_data["captcha_text"] = captcha_text
        await update.message.reply_photo(
            photo=InputFile(captcha_image, filename="captcha.png"),
            caption="❌ Noto'g'ri. Qaytadan urinib ko'ring:",
        )
        return CAPTCHA


# ═══════════════════════════════════════════════════════════════
#                      RO'YXATDAN O'TISH
# ═══════════════════════════════════════════════════════════════

async def save_name(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    user_name = update.message.text.strip()
    user_id = update.effective_user.id
    add_user(user_id, user_name)
    context.user_data["name"] = user_name

    terms_text = (
        f"Xush kelibsiz, <b>{user_name}</b>! 👋\n\n"
        "<blockquote><b>📜 Foydalanish shartlari</b>\n\n"
        "1. Ushbu bot AI yordamida Telegram botlari uchun Python kod yaratadi.\n"
        "2. Yaratilgan kod faqat qonuniy maqsadlarda ishlatilishi kerak.\n"
        "3. Kodning ishlashi va xavfsizligi foydalanuvchi javobgarligida.\n"
        "4. Xizmat narxlari o'zgarishi mumkin.\n"
        "5. Noqonuniy maqsadlarda foydalanish man etiladi.</blockquote>\n\n"
        "Davom etish uchun quyidagi tugmani bosing:"
    )
    keyboard = [[InlineKeyboardButton("✅ Roziman", callback_data="agree_terms")]]
    await update.message.reply_text(terms_text, parse_mode="HTML", reply_markup=InlineKeyboardMarkup(keyboard))
    return TERMS


# ═══════════════════════════════════════════════════════════════
#                         SHARTLAR
# ═══════════════════════════════════════════════════════════════

async def agree_terms(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    query = update.callback_query
    await query.answer()
    set_user_registered(query.from_user.id)
    await query.edit_message_text("✅ Ro'yxatdan o'tish muvaffaqiyatli yakunlandi!")
    return await send_main_menu(update, context)


# ═══════════════════════════════════════════════════════════════
#                       ASOSIY MENYU
# ═══════════════════════════════════════════════════════════════

async def send_main_menu(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    user = get_user(update.effective_user.id)
    name = user[1] if user else "Foydalanuvchi"
    total = get_total_users()

    keyboard = [
        [InlineKeyboardButton("🤖 Bot yaratish", callback_data="create_bot")],
        [
            InlineKeyboardButton("📋 Yo'riqnoma", callback_data="guide"),
            InlineKeyboardButton("ℹ️ Bot haqida", callback_data="about"),
        ],
        [InlineKeyboardButton("👤 Admin", url=f"tg://user?id={ADMIN_TELEGRAM_ID}")],
    ]
    await context.bot.send_message(
        chat_id=update.effective_chat.id,
        text=(
            f"📌 <b>Asosiy menyu</b>\n\n"
            f"Salom, <b>{name}</b>!\n"
            f"👥 Jami foydalanuvchilar: {total}\n\n"
            "Quyidagi tugmalardan birini tanlang:"
        ),
        parse_mode="HTML",
        reply_markup=InlineKeyboardMarkup(keyboard),
    )
    return MAIN_MENU


# ═══════════════════════════════════════════════════════════════
#                      BOT YARATISH (AI)
# ═══════════════════════════════════════════════════════════════

async def start_bot_creation(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    query = update.callback_query
    await query.answer()
    await query.edit_message_text(
        "🤖 <b>Bot yaratish</b>\n\n"
        "Qanday bot yaratmoqchisiz? Batafsil tushuntiring.\n\n"
        "<i>Masalan:</i>\n"
        "• \"Ob-havo ma'lumotini yuboradigan bot\"\n"
        "• \"Do'kon uchun buyurtma qabul qiladigan bot\"\n"
        "• \"Navbat tizimi boti\"\n\n"
        "Yozing, men savollar berib, talablarni aniqlashtiraman 👇",
        parse_mode="HTML",
    )
    context.user_data["bot_creation_messages"] = [
        {
            "role": "system",
            "content": (
                "Sen professional Telegram bot yaratishda yordam beradigan AI yordamchisisan. "
                "Foydalanuvchi bilan faqat o'zbek tilida gaplash. "
                "Avval foydalanuvchidan bot haqida batafsil ma'lumot ol — savollar ber, nima qilishi kerakligini aniqla. "
                "Kamida 2-3 ta savol ber, keyin to'liq ishlaydigan Python kodini yarat. "
                "Kod python-telegram-bot kutubxonasidan foydalansin. "
                "Kodda token uchun BOT_TOKEN = 'YOUR_BOT_TOKEN' placeholder qo'y. "
                "Kod ichida kommentariyalar o'zbek tilida bo'lsin. "
                "Kodni ```python ... ``` blokida ber. "
                "Kod professional, xatosiz va to'liq ishlaydigan bo'lsin."
            ),
        }
    ]
    return BOT_CREATION_CONVERSATION


async def ai_conversation(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    user_message = update.message.text
    messages = context.user_data.get("bot_creation_messages", [])
    messages.append({"role": "user", "content": user_message})
    context.user_data["bot_creation_messages"] = messages

    await context.bot.send_chat_action(chat_id=update.effective_chat.id, action="typing")

    ai_response = await call_ai(messages)

    if ai_response is None:
        await update.message.reply_text("❌ AI bilan aloqada xatolik. Xabaringizni qaytadan yuboring.")
        return BOT_CREATION_CONVERSATION

    messages.append({"role": "assistant", "content": ai_response})
    context.user_data["bot_creation_messages"] = messages

    if "```python" in ai_response:
        code = extract_code(ai_response)
        context.user_data["generated_bot_code"] = code
        context.user_data["generated_bot_response"] = ai_response

        increment_bots_created(update.effective_user.id)
        await send_long_message(update.message, ai_response)

        keyboard = [
            [InlineKeyboardButton("🧪 Sinov rejimi", callback_data="test_mode")],
            [InlineKeyboardButton("✏️ Tahrirlash", callback_data="edit_bot")],
            [
                InlineKeyboardButton("📦 Hostinga qo'yish", callback_data="deploy_hosting"),
                InlineKeyboardButton("💻 Kod olish", callback_data="get_code"),
            ],
            [InlineKeyboardButton("🔄 Boshqa bot yaratish", callback_data="create_bot_again")],
            [InlineKeyboardButton("🔙 Asosiy menyu", callback_data="back_menu")],
        ]
        await update.message.reply_text(
            "✅ <b>Botingiz tayyor!</b>\n\nNima qilmoqchisiz?",
            parse_mode="HTML",
            reply_markup=InlineKeyboardMarkup(keyboard),
        )
        return GET_BOT_OPTIONS
    else:
        await send_long_message(update.message, ai_response)
        return BOT_CREATION_CONVERSATION


# ═══════════════════════════════════════════════════════════════
#                       YO'RIQNOMA
# ═══════════════════════════════════════════════════════════════

async def show_guide(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    query = update.callback_query
    await query.answer()
    guide_text = (
        "<b>📋 Yo'riqnoma</b>\n\n"
        "<b>1. Ro'yxatdan o'tish:</b>\n"
        "   /start → CAPTCHA → Ism → Shartlar\n\n"
        "<b>2. Bot yaratish:</b>\n"
        "   🤖 Bot yaratish → AI bilan suhbat → Kod tayyor\n\n"
        "<b>3. Sinov rejimi:</b>\n"
        "   Bot tokeningizni kiriting → Bot ishga tushadi → Sinab ko'ring\n\n"
        "<b>4. Tahrirlash:</b>\n"
        "   O'zgartirish yozing → AI kodni yangilaydi\n\n"
        "<b>5. Yakunlash:</b>\n"
        "   📦 Hostinga qo'yish — admin serverga o'rnatadi\n"
        "   💻 Kod olish — to'lov qilib kodni olasiz\n\n"
        "<b>Token olish:</b>\n"
        "   @BotFather → /newbot → Token nusxalash"
    )
    await query.edit_message_text(guide_text, parse_mode="HTML")
    keyboard = [[InlineKeyboardButton("🔙 Asosiy menyu", callback_data="back_menu")]]
    await context.bot.send_message(
        chat_id=update.effective_chat.id,
        text="⬇️ Davom etish uchun:",
        reply_markup=InlineKeyboardMarkup(keyboard),
    )
    return MAIN_MENU


# ═══════════════════════════════════════════════════════════════
#                       BOT HAQIDA
# ═══════════════════════════════════════════════════════════════

async def show_about(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    query = update.callback_query
    await query.answer()
    total = get_total_users()
    about_text = (
        "<b>ℹ️ Bot haqida</b>\n\n"
        f"🤖 <b>Model:</b> {AI_MODEL}\n"
        f"👥 <b>Foydalanuvchilar:</b> {total}\n\n"
        "Ushbu bot AI yordamida Telegram botlari uchun "
        "Python kodini yaratadi.\n\n"
        "<code>python-telegram-bot</code> kutubxonasidan foydalanib, "
        "sizning talablaringizga mos bot kodi generatsiya qiladi.\n\n"
        "Maqsad — dasturlash bilimisiz ham bot yaratish imkoniyatini berish."
    )
    await query.edit_message_text(about_text, parse_mode="HTML")
    keyboard = [[InlineKeyboardButton("🔙 Asosiy menyu", callback_data="back_menu")]]
    await context.bot.send_message(
        chat_id=update.effective_chat.id,
        text="⬇️ Davom etish uchun:",
        reply_markup=InlineKeyboardMarkup(keyboard),
    )
    return MAIN_MENU


# ═══════════════════════════════════════════════════════════════
#                      ASOSIY MENYUGA QAYTISH
# ═══════════════════════════════════════════════════════════════

async def back_to_menu(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    query = update.callback_query
    await query.answer()
    return await send_main_menu(update, context)


# ═══════════════════════════════════════════════════════════════
#                  BOT TAYYOR — TANLOV TUGMALARI
# ═══════════════════════════════════════════════════════════════

async def handle_get_bot_options(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    query = update.callback_query
    await query.answer()

    # --- SINOV REJIMI ---
    if query.data == "test_mode":
        await query.edit_message_text(
            "🧪 <b>Sinov rejimi</b>\n\n"
            "Botingizni sinab ko'rish uchun bot tokeningizni yuboring.\n\n"
            "📌 <b>Token olish:</b>\n"
            "1. @BotFather ga kiring\n"
            "2. /newbot buyrug'ini yuboring\n"
            "3. Bot nomini kiriting\n"
            "4. Olingan tokenni shu yerga yuboring\n\n"
            "Masalan: <code>123456789:ABCdefGHIjklMNOpqrsTUVwxyz</code>",
            parse_mode="HTML",
        )
        return ASK_TOKEN

    # --- TAHRIRLASH ---
    elif query.data == "edit_bot":
        await query.edit_message_text(
            "✏️ <b>Tahrirlash</b>\n\n"
            "Botga qanday o'zgartirish kiritmoqchisiz?\n\n"
            "<i>Masalan:</i>\n"
            "• \"Inline tugmalar qo'sh\"\n"
            "• \"Admin panel qo'sh\"\n"
            "• \"Tilni o'zgartir\"\n"
            "• \"Yangi buyruq qo'sh\"\n\n"
            "Yozing, AI kodni qayta yaratadi 👇",
            parse_mode="HTML",
        )
        return EDIT_BOT

    # --- HOSTINGA QO'YISH ---
    elif query.data == "deploy_hosting":
        await query.edit_message_text(
            "📦 <b>Hostinga qo'yish</b>\n\n"
            "Botingizni serverga o'rnatib berish xizmati:\n\n"
            f"💰 <b>Narxlar:</b>\n"
            f"├ Oddiy bot — {PRICE_SIMPLE} so'm/oy\n"
            f"├ O'rtacha bot — {PRICE_MEDIUM} so'm/oy\n"
            f"└ Murakkab bot — kelishiladi\n\n"
            f"👤 <a href='tg://user?id={ADMIN_TELEGRAM_ID}'>Admin bilan bog'lanish</a>\n\n"
            "Admin bilan narx va shartlarni muhokama qiling.",
            parse_mode="HTML",
        )
        keyboard = [
            [InlineKeyboardButton("👤 Admin bilan bog'lanish", url=f"tg://user?id={ADMIN_TELEGRAM_ID}")],
            [InlineKeyboardButton("🔙 Asosiy menyu", callback_data="back_menu")],
        ]
        await context.bot.send_message(
            chat_id=update.effective_chat.id,
            text="⬇️ Tanlang:",
            reply_markup=InlineKeyboardMarkup(keyboard),
        )
        return MAIN_MENU

    # --- KOD OLISH ---
    elif query.data == "get_code":
        await query.edit_message_text(
            "💻 <b>Kod olish</b>\n\n"
            "Tayyor bot kodini olish uchun to'lov qilishingiz kerak.\n\n"
            f"💳 <b>Narx:</b> {PRICE_CODE} so'm\n\n"
            "To'lov usullari va batafsil ma'lumot uchun admin bilan bog'laning.\n"
            "To'lov tasdiqlangandan so'ng, bot kodi sizga yuboriladi.",
            parse_mode="HTML",
        )
        keyboard = [
            [InlineKeyboardButton("👤 Admin bilan bog'lanish", url=f"tg://user?id={ADMIN_TELEGRAM_ID}")],
            [InlineKeyboardButton("🔙 Asosiy menyu", callback_data="back_menu")],
        ]
        await context.bot.send_message(
            chat_id=update.effective_chat.id,
            text="⬇️ Tanlang:",
            reply_markup=InlineKeyboardMarkup(keyboard),
        )
        return MAIN_MENU

    # --- BOSHQA BOT YARATISH ---
    elif query.data == "create_bot_again":
        return await start_bot_creation(update, context)

    # --- SINOVNI TO'XTATISH ---
    elif query.data == "stop_test":
        user_id = update.effective_user.id
        stopped = stop_test_bot(user_id)
        if stopped:
            await query.edit_message_text("🛑 Sinov bot to'xtatildi.")
        else:
            await query.edit_message_text("ℹ️ Bot allaqachon to'xtatilgan.")
        return await send_main_menu(update, context)

    # --- ASOSIY MENYU ---
    elif query.data == "back_menu":
        return await send_main_menu(update, context)

    return MAIN_MENU


# ═══════════════════════════════════════════════════════════════
#                    SINOV REJIMI — TOKEN
# ═══════════════════════════════════════════════════════════════

async def receive_token(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    token = update.message.text.strip()

    if not re.match(r"^\d+:[A-Za-z0-9_-]+$", token):
        await update.message.reply_text(
            "❌ Token formati noto'g'ri.\n\n"
            "To'g'ri format: <code>123456789:ABCdefGHIjklMNOpqrsTUVwxyz</code>",
            parse_mode="HTML",
        )
        return ASK_TOKEN

    user_id = update.effective_user.id
    code = context.user_data.get("generated_bot_code", "")

    if not code:
        await update.message.reply_text("❌ Bot kodi topilmadi. Avval bot yarating.")
        return await send_main_menu(update, context)

    stop_test_bot(user_id)

    # Tokenni kodga qo'yish
    test_code = code.replace("YOUR_BOT_TOKEN", token)
    test_code = re.sub(r'BOT_TOKEN\s*=\s*["\'].*?["\']', f'BOT_TOKEN = "{token}"', test_code)

    test_dir = f"/tmp/test_bot_{user_id}"
    os.makedirs(test_dir, exist_ok=True)
    test_file = os.path.join(test_dir, "test_bot.py")
    with open(test_file, "w") as f:
        f.write(test_code)

    await update.message.reply_text("⏳ Botingiz ishga tushirilmoqda...")

    try:
        proc = subprocess.Popen(
            ["python3", test_file],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            cwd=test_dir,
        )
        test_bot_processes[user_id] = proc

        await asyncio.sleep(4)

        if proc.poll() is not None:
            stderr = proc.stderr.read().decode()
            error_msg = stderr[-500:] if len(stderr) > 500 else stderr
            await update.message.reply_text(
                f"❌ Bot ishga tushmadi:\n\n<code>{error_msg}</code>",
                parse_mode="HTML",
            )
            stop_test_bot(user_id)

            keyboard = [
                [InlineKeyboardButton("✏️ Tahrirlash", callback_data="edit_bot")],
                [InlineKeyboardButton("🔙 Asosiy menyu", callback_data="back_menu")],
            ]
            await update.message.reply_text(
                "Nima qilmoqchisiz?",
                reply_markup=InlineKeyboardMarkup(keyboard),
            )
            return GET_BOT_OPTIONS
        else:
            keyboard = [
                [InlineKeyboardButton("🛑 Sinovni to'xtatish", callback_data="stop_test")],
                [InlineKeyboardButton("✏️ Tahrirlash", callback_data="edit_bot")],
                [
                    InlineKeyboardButton("📦 Hostinga qo'yish", callback_data="deploy_hosting"),
                    InlineKeyboardButton("💻 Kod olish", callback_data="get_code"),
                ],
            ]
            await update.message.reply_text(
                "✅ <b>Botingiz sinov rejimida ishga tushdi!</b>\n\n"
                "Telegramda botingizga /start yuboring va sinab ko'ring.\n\n"
                "⚠️ Sinov bot vaqtincha ishlaydi. Doimiy ishlashi uchun hostinga qo'ying.",
                parse_mode="HTML",
                reply_markup=InlineKeyboardMarkup(keyboard),
            )
            return GET_BOT_OPTIONS

    except Exception as e:
        logger.error(f"Test bot xatolik: {e}")
        await update.message.reply_text(f"❌ Xatolik: {str(e)}")
        return await send_main_menu(update, context)


# ═══════════════════════════════════════════════════════════════
#                       TAHRIRLASH
# ═══════════════════════════════════════════════════════════════

async def edit_bot_request(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    user_message = update.message.text
    messages = context.user_data.get("bot_creation_messages", [])
    messages.append({
        "role": "user",
        "content": f"Botga quyidagi o'zgartirishni kirit: {user_message}. To'liq yangilangan kodni ber.",
    })
    context.user_data["bot_creation_messages"] = messages

    await context.bot.send_chat_action(chat_id=update.effective_chat.id, action="typing")

    ai_response = await call_ai(messages)

    if ai_response is None:
        await update.message.reply_text("❌ AI bilan aloqada xatolik. Qaytadan yozing.")
        return EDIT_BOT

    messages.append({"role": "assistant", "content": ai_response})
    context.user_data["bot_creation_messages"] = messages

    if "```python" in ai_response:
        code = extract_code(ai_response)
        context.user_data["generated_bot_code"] = code

    await send_long_message(update.message, ai_response)

    keyboard = [
        [InlineKeyboardButton("🧪 Sinov rejimi", callback_data="test_mode")],
        [InlineKeyboardButton("✏️ Yana tahrirlash", callback_data="edit_bot")],
        [
            InlineKeyboardButton("📦 Hostinga qo'yish", callback_data="deploy_hosting"),
            InlineKeyboardButton("💻 Kod olish", callback_data="get_code"),
        ],
        [InlineKeyboardButton("🔄 Boshqa bot yaratish", callback_data="create_bot_again")],
        [InlineKeyboardButton("🔙 Asosiy menyu", callback_data="back_menu")],
    ]
    await update.message.reply_text(
        "Nima qilmoqchisiz?",
        reply_markup=InlineKeyboardMarkup(keyboard),
    )
    return GET_BOT_OPTIONS


# ═══════════════════════════════════════════════════════════════
#                      XATOLIK HANDLER
# ═══════════════════════════════════════════════════════════════

async def error_handler(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    logger.error(f"Xatolik: {context.error}")
    try:
        if update and update.effective_message:
            await update.effective_message.reply_text(
                "❌ Kutilmagan xatolik. /start buyrug'ini yuborib qaytadan urinib ko'ring."
            )
    except Exception:
        pass


# ═══════════════════════════════════════════════════════════════
#                          MAIN
# ═══════════════════════════════════════════════════════════════

def main() -> None:
    init_db()
    application = Application.builder().token(BOT_TOKEN).build()

    conv_handler = ConversationHandler(
        entry_points=[CommandHandler("start", start_captcha)],
        states={
            CAPTCHA: [
                MessageHandler(filters.TEXT & ~filters.COMMAND, check_captcha),
            ],
            REGISTER_NAME: [
                MessageHandler(filters.TEXT & ~filters.COMMAND, save_name),
            ],
            TERMS: [
                CallbackQueryHandler(agree_terms, pattern="^agree_terms$"),
            ],
            MAIN_MENU: [
                CallbackQueryHandler(start_bot_creation, pattern="^create_bot$"),
                CallbackQueryHandler(show_guide, pattern="^guide$"),
                CallbackQueryHandler(show_about, pattern="^about$"),
                CallbackQueryHandler(back_to_menu, pattern="^back_menu$"),
            ],
            BOT_CREATION_CONVERSATION: [
                MessageHandler(filters.TEXT & ~filters.COMMAND, ai_conversation),
            ],
            GET_BOT_OPTIONS: [
                CallbackQueryHandler(
                    handle_get_bot_options,
                    pattern="^(test_mode|edit_bot|deploy_hosting|get_code|create_bot_again|stop_test|back_menu)$",
                ),
            ],
            ASK_TOKEN: [
                MessageHandler(filters.TEXT & ~filters.COMMAND, receive_token),
            ],
            EDIT_BOT: [
                MessageHandler(filters.TEXT & ~filters.COMMAND, edit_bot_request),
            ],
        },
        fallbacks=[CommandHandler("start", start_captcha)],
        per_message=False,
    )

    application.add_handler(conv_handler)
    application.add_error_handler(error_handler)

    logger.info("🤖 Bot Builder ishga tushirildi!")
    logger.info(f"   Model: {AI_MODEL}")
    logger.info(f"   API: {OPENAI_BASE_URL}")
    application.run_polling(allowed_updates=Update.ALL_TYPES, drop_pending_updates=True)


if __name__ == "__main__":
    main()
