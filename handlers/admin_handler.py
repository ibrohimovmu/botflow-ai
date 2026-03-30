"""
handlers/admin_handler.py
Ikkala bot uchun umumiy admin operatsiyalar.
"""
import logging
from aiogram import Router, F
from aiogram.types import Message
from aiogram.filters import Command
import config
import database.supabase_db as sdb
import database.film_db as fdb

router = Router()
logger = logging.getLogger(__name__)


@router.message(Command("admin"))
async def admin_cmd(message: Message):
    if message.from_user.id not in config.ADMIN_IDS:
        return await message.answer("❌ Ruxsat yo'q!")

    role = getattr(message.bot, "role", "unknown")

    if role == "edtech":
        stats = await sdb.get_stats()
        await message.answer(
            f"⚙️ <b>Ed-Tech Admin Panel:</b>\n\n"
            f"👥 Jami foydalanuvchilar: {stats['total']}\n"
            f"👨‍🏫 O'qituvchilar: {stats['teachers']}\n"
            f"🎓 O'quvchilar: {stats['students']}\n"
            f"⏳ Kutayotganlar: {stats['pending']}",
            parse_mode="HTML"
        )
    elif role == "film":
        mc = fdb.get_movie_count()
        uc = fdb.get_user_count()
        await message.answer(
            f"⚙️ <b>Film Admin Panel:</b>\n\n"
            f"🎬 Kinolar: {mc}\n"
            f"👥 Foydalanuvchilar: {uc}\n\n"
            f"➕ Kino qo'shish: '➕ Kino qo'shish'\n"
            f"🗑 O'chirish: '🗑 Kino o'chirish'",
            parse_mode="HTML"
        )


@router.message(Command("stats"))
async def stats_cmd(message: Message):
    if message.from_user.id not in config.ADMIN_IDS:
        return
    role = getattr(message.bot, "role", "")
    if role == "edtech":
        s = await sdb.get_stats()
        await message.answer(
            f"📊 Ed-Tech: {s['total']} user, {s['teachers']} o'qituvchi, {s['pending']} kutmoqda"
        )
    elif role == "film":
        await message.answer(
            f"📊 Film: {fdb.get_movie_count()} kino, {fdb.get_user_count()} user"
        )
