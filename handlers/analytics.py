from aiogram import Router, types, F
from aiogram.utils.keyboard import InlineKeyboardBuilder
from aiogram.types import InlineKeyboardButton
from database.models import async_session, User, UserBot, Referral
from sqlalchemy import select, func
import datetime

router = Router()

@router.callback_query(F.data == "my_profile")
async def show_profile(callback: types.CallbackQuery):
    user_id = callback.from_user.id
    async with async_session() as session:
        # User ma'lumotlari
        user_res = await session.execute(select(User).where(User.user_id == user_id))
        user = user_res.scalar_one_or_none()

        # Bot soni
        bot_count_res = await session.execute(
            select(func.count()).where(UserBot.owner_id == user_id)
        )
        bot_count = bot_count_res.scalar()

        # Referal soni
        ref_count_res = await session.execute(
            select(func.count()).where(Referral.referrer_id == user_id)
        )
        ref_count = ref_count_res.scalar()

    join_date = user.join_date.strftime("%d.%m.%Y") if user and user.join_date else "Noma'lum"
    ref_code = user.referral_code if user and user.referral_code else f"REF{user_id}"

    text = (
        f"👤 <b>Profilingiz</b>\n\n"
        f"🆔 ID: <code>{user_id}</code>\n"
        f"👤 Ism: {callback.from_user.full_name}\n"
        f"📅 A'zo bo'lgan: {join_date}\n\n"
        f"━━━━━━━━━━━━━━━━\n"
        f"🤖 Yaratilgan botlar: <b>{bot_count} ta</b>\n"
        f"👥 Taklif qilinganlar: <b>{ref_count} kishi</b>\n\n"
        f"🎁 <b>Sizning referal kodingiz:</b>\n"
        f"<code>{ref_code}</code>\n\n"
        f"📤 Ulashish uchun:\n"
        f"<code>https://t.me/aiyordamchiaibot?start={ref_code}</code>"
    )

    kb = InlineKeyboardBuilder()
    kb.row(InlineKeyboardButton(text="📊 Batafsil statistika", callback_data="full_stats"))
    kb.row(InlineKeyboardButton(text="🎁 Referal tizimi", callback_data="referral_info"))
    kb.row(InlineKeyboardButton(text="⬅️ Asosiy menyu", callback_data="show_main_menu"))
    await callback.message.edit_text(text, reply_markup=kb.as_markup())

@router.callback_query(F.data == "full_stats")
async def full_stats(callback: types.CallbackQuery):
    user_id = callback.from_user.id
    async with async_session() as session:
        bots_res = await session.execute(
            select(UserBot).where(UserBot.owner_id == user_id)
        )
        bots = bots_res.scalars().all()

    if not bots:
        return await callback.answer("Hali botlaringiz yo'q!", show_alert=True)

    text = "📊 <b>Botlaringiz statistikasi:</b>\n\n"
    for i, bot in enumerate(bots, 1):
        text += (
            f"{i}. 🤖 <b>{bot.bot_name or bot.template}</b>\n"
            f"   📋 Shablon: {bot.template}\n"
            f"   🗓 Yaratilgan: {bot.created_at.strftime('%d.%m.%Y')}\n"
            f"   🔄 Status: {'🟢 Faol' if bot.status == 'active' else '🔴 Nofaol'}\n\n"
        )

    kb = InlineKeyboardBuilder()
    kb.row(InlineKeyboardButton(text="⬅️ Profilga qaytish", callback_data="my_profile"))
    await callback.message.edit_text(text, reply_markup=kb.as_markup())
