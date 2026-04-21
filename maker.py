import logging
import asyncio
import sys
import io
import json
from aiogram import Bot, Dispatcher, types, F
from aiogram.filters import Command
from aiogram.utils.keyboard import InlineKeyboardBuilder
from aiogram.types import InlineKeyboardButton

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# ===========================
# MASTER BOT SETTINGS
# ===========================
MASTER_TOKEN = "8704179220:AAERPxB6anEAnStpjgjAF3m1MXLMumcJslM"
DB_FILE = "child_bots.json"

logging.basicConfig(level=logging.INFO)
master_bot = Bot(token=MASTER_TOKEN)
master_dp = Dispatcher()
child_dp = Dispatcher()  # Barcha child botlar shu dispatcher orqali ishlaydi

active_child_tasks = {}

def load_db():
    try:
        with open(DB_FILE, "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return {}

def save_db(data):
    with open(DB_FILE, "w") as f:
        json.dump(data, f, indent=2)

# ===========================
# CHILD BOT TEMPLATE LOGIC
# ===========================
@child_dp.message(Command("start"))
async def child_start(message: types.Message, bot: Bot):
    bot_info = await bot.get_me()
    await message.answer(
        f"Salom! Men @{bot_info.username} man.\n\n"
        f"Ushbu bot <b>BotMaker Pro</b> yordamida hech qanday kod yozmasdan yaratildi!\n\n"
        f"Mening vazifam — Guruhlarni avto-boshqarish va xavfsizlikni ta'minlash.",
        parse_mode="HTML"
    )

@child_dp.message(Command("help"))
async def child_help(message: types.Message):
    await message.answer("Sizning botingiz mukammal ishlayapti! Bu shunchaki shablon.")

@child_dp.message(F.text)
async def child_text(message: types.Message):
    # Oddiy echo funksiyasi ishlayaptimi deb tekshirish uchun
    await message.answer(f"Siz yozdingiz: {message.text}\n(Ushbu bot BotMaker orqali avtomatik yaratilgan)")

async def run_child_bot(token: str):
    bot = Bot(token=token)
    try:
        await bot.delete_webhook(drop_pending_updates=True)
        await child_dp.start_polling(bot)
    except Exception as e:
        logging.error(f"Child bot {token[:10]} xatosi: {e}")

# ===========================
# MASTER BOT LOGIC
# ===========================
@master_dp.message(Command("start"))
async def master_start(message: types.Message):
    text = (
        "👑 <b>Bot Maker Pro xizmatiga xush kelibsiz!</b>\n\n"
        "Men sizga hech qanday dasturlashsiz 1 soniyada tayyor ishlaydigan botlarni yaratib beraman.\n\n"
        "<b>Qanday ishlaydi?</b>\n"
        "1. @BotFather ga kiring va yangi bot oching.\n"
        "2. U yerdan olingan <code>Token</code> ni (masalan: 12345:ABCDEF) shu yerga tashlang.\n"
        "3. Tizim avtomatik ravishda botingizni ishga tushiradi!"
    )
    await message.answer(text, parse_mode="HTML")

@master_dp.message(F.text)
async def handle_token_submit(message: types.Message):
    token = message.text.strip()
    
    # Token formatini qisqa tekshirish: sonlar:harflar
    if ":" not in token or len(token) < 30:
        return await message.answer("❌ Bu token emas. Iltimos, @BotFather bergan tokenni yuboring.")
        
    await message.answer("⏳ <b>Token tekshirilmoqda...</b>", parse_mode="HTML")
    
    # Token ishlaydimi yo'qmi tekshiramiz
    test_bot = Bot(token=token)
    try:
        bot_info = await test_bot.get_me()
    except Exception as e:
        return await message.answer(f"❌ <b>Xatolik!</b> Ushbu token noto'g'ri. BotFather dan to'g'ri nusxa oling.\n\nXato: {e}", parse_mode="HTML")
        
    db = load_db()
    if token in active_child_tasks or token in db:
        return await message.answer(f"⚠️ Bu bot (@{bot_info.username}) allaqachon tizimda faol!")
        
    # Ma'lumotlar bazasiga saqlaymiz
    db[token] = {
        "owner_id": message.from_user.id,
        "bot_username": bot_info.username,
        "bot_id": bot_info.id
    }
    save_db(db)
    
    # Botni orqa fonda ishga tushuramiz
    task = asyncio.create_task(run_child_bot(token))
    active_child_tasks[token] = task
    
    await message.answer(
        f"✅ <b>Tabriklaymiz! Botingiz ishga tushdi!</b>\n\n"
        f"🤖 Bot profili: @{bot_info.username}\n\n"
        f"Hozir uni ochib /start buyrug'ini berib ko'ring. U allaqachon ishlayapti!\n\n"
        f"Kelajakda bu yerga 'Guruh boshqaruv', 'Kino' kabi shablonlarni ham kiritishimiz mumkin.",
        parse_mode="HTML"
    )

# Funksiya eski bor botlarni yurgizish uchun
async def start_existing_bots():
    db = load_db()
    for token in db:
        task = asyncio.create_task(run_child_bot(token))
        active_child_tasks[token] = task
        logging.info(f"Yangi child bot ishga tushdi: {db[token]['bot_username']}")

async def main():
    await master_bot.delete_webhook(drop_pending_updates=True)
    await start_existing_bots()
    print("Master BotMaker ishga tushdi!")
    await master_dp.start_polling(master_bot)

if __name__ == "__main__":
    asyncio.run(main())
