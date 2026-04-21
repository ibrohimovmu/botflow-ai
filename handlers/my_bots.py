from aiogram import Router, types, F
from aiogram.fsm.context import FSMContext
from aiogram.utils.keyboard import InlineKeyboardBuilder
from aiogram.types import InlineKeyboardButton
from database.models import async_session, UserBot
from sqlalchemy import select, delete
import json

router = Router()

@router.callback_query(F.data == "my_projects")
async def show_my_bots(callback: types.CallbackQuery):
    async with async_session() as session:
        result = await session.execute(
            select(UserBot).where(UserBot.owner_id == callback.from_user.id)
        )
        bots = result.scalars().all()

    if not bots:
        kb = InlineKeyboardBuilder()
        kb.row(InlineKeyboardButton(text="🤖 Bot yaratish", callback_data="wizard_start"))
        kb.row(InlineKeyboardButton(text="⬅️ Orqaga", callback_data="show_main_menu"))
        return await callback.message.edit_text(
            "📭 <b>Sizda hali botlar yo'q</b>\n\nBirinchi botingizni yarating!",
            reply_markup=kb.as_markup()
        )

    kb = InlineKeyboardBuilder()
    for bot in bots:
        status_icon = "🟢" if bot.status == "active" else "🔴"
        bot_label = bot.bot_name or bot.template
        kb.row(InlineKeyboardButton(
            text=f"{status_icon} {bot_label}",
            callback_data=f"bot_detail_{bot.id}"
        ))
    kb.row(InlineKeyboardButton(text="➕ Yangi bot", callback_data="wizard_start"))
    kb.row(InlineKeyboardButton(text="⬅️ Orqaga", callback_data="show_main_menu"))

    await callback.message.edit_text(
        f"📂 <b>Mening botlarim</b>\n\nJami: <b>{len(bots)} ta bot</b>",
        reply_markup=kb.as_markup()
    )

@router.callback_query(F.data.startswith("bot_detail_"))
async def bot_detail(callback: types.CallbackQuery):
    bot_id = int(callback.data.replace("bot_detail_", ""))
    async with async_session() as session:
        result = await session.execute(select(UserBot).where(UserBot.id == bot_id))
        bot = result.scalar_one_or_none()

    if not bot:
        return await callback.answer("Bot topilmadi!", show_alert=True)

    # Murakkab mantiqlarni f-string tashqarisiga chiqaramiz (SyntaxError oldini olish uchun)
    features_list = []
    if bot.features:
        try:
            features_list = json.loads(bot.features)
        except:
            pass
    
    features_str = ", ".join(features_list) if features_list else "Standard"
    channel_info = bot.channel if bot.channel else "Yo'q"
    admin_info = bot.admin_id if bot.admin_id else "Yo'q"
    creation_date = bot.created_at.strftime("%d.%m.%Y") if bot.created_at else "Noma'lum"
    current_status = "Faol 🟢" if bot.status == "active" else "Nofaol 🔴"

    text = (
        f"🤖 <b>{bot.bot_name or 'Nomsiz Bot'}</b>\n\n"
        f"📋 Shablon: <code>{bot.template}</code>\n"
        f"📢 Kanal: {channel_info}\n"
        f"🔐 Admin: {admin_info}\n"
        f"🛠 Funksiyalar: {features_str}\n"
        f"📅 Yaratilgan: {creation_date}\n"
        f"🔄 Status: {current_status}"
    )
    
    kb = InlineKeyboardBuilder()
    kb.row(InlineKeyboardButton(text="🗑 O'chirish", callback_data=f"bot_delete_{bot_id}"))
    kb.row(InlineKeyboardButton(text="⬅️ Orqaga", callback_data="my_projects"))
    await callback.message.edit_text(text, reply_markup=kb.as_markup())

@router.callback_query(F.data.startswith("bot_delete_"))
async def confirm_delete(callback: types.CallbackQuery):
    bot_id = int(callback.data.replace("bot_delete_", ""))
    kb = InlineKeyboardBuilder()
    kb.row(
        InlineKeyboardButton(text="✅ Ha", callback_data=f"bot_execute_del_{bot_id}"),
        InlineKeyboardButton(text="❌ Yo'q", callback_data=f"bot_detail_{bot_id}")
    )
    await callback.message.edit_text("⚠️ <b>Haqiqatan ham bu botni o'chirmoqchimisiz?</b>", reply_markup=kb.as_markup())

@router.callback_query(F.data.startswith("bot_execute_del_"))
async def execute_delete(callback: types.CallbackQuery):
    bot_id = int(callback.data.replace("bot_execute_del_", ""))
    async with async_session() as session:
        await session.execute(delete(UserBot).where(UserBot.id == bot_id))
        await session.commit()
    await callback.answer("✅ Bot o'chirildi!", show_alert=True)
    await show_my_bots(callback)
