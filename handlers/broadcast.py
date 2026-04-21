from aiogram import Router, types, F, Bot
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.utils.keyboard import InlineKeyboardBuilder
from aiogram.types import InlineKeyboardButton
from database.models import async_session, User
from sqlalchemy import select
from config import settings

router = Router()
MASTER_ADMIN_ID = int(settings.BOT_TOKEN.split(":")[0]) if settings.BOT_TOKEN else 0

class BroadcastState(StatesGroup):
    waiting_message = State()

@router.message(F.text == "/broadcast")
async def broadcast_cmd(message: types.Message, state: FSMContext):
    if message.from_user.id != MASTER_ADMIN_ID:
        return await message.answer("⛔️ Bu buyruq faqat bosh admin uchun!")
    await message.answer(
        "📣 <b>Broadcast rejimi</b>\n\nBarcha foydalanuvchilarga yubormoqchi bo'lgan xabarni yozing:"
    )
    await state.set_state(BroadcastState.waiting_message)

@router.message(BroadcastState.waiting_message)
async def send_broadcast(message: types.Message, state: FSMContext, bot: Bot):
    await state.clear()
    async with async_session() as session:
        result = await session.execute(select(User).where(User.is_verified == True))
        users = result.scalars().all()

    sent, failed = 0, 0
    progress = await message.answer(f"📤 Yuborilmoqda... (0/{len(users)})")

    for i, user in enumerate(users):
        try:
            await bot.copy_message(
                chat_id=user.user_id,
                from_chat_id=message.chat.id,
                message_id=message.message_id
            )
            sent += 1
        except Exception:
            failed += 1
        if i % 10 == 0:
            try:
                await progress.edit_text(f"📤 Yuborilmoqda... ({i}/{len(users)})")
            except Exception:
                pass

    await progress.edit_text(
        f"✅ <b>Broadcast yakunlandi!</b>\n\n"
        f"📨 Muvaffaqiyatli: <b>{sent}</b>\n"
        f"❌ Yuborilmadi: <b>{failed}</b>"
    )

@router.message(F.text == "/stats")
async def global_stats(message: types.Message):
    if message.from_user.id != MASTER_ADMIN_ID:
        return
    async with async_session() as session:
        from database.models import UserBot
        from sqlalchemy import func
        user_count = (await session.execute(select(func.count(User.user_id)))).scalar()
        bot_count  = (await session.execute(select(func.count(UserBot.id)))).scalar()

    await message.answer(
        f"📊 <b>Global Statistika</b>\n\n"
        f"👥 Jami foydalanuvchilar: <b>{user_count}</b>\n"
        f"🤖 Yaratilgan botlar: <b>{bot_count}</b>"
    )
