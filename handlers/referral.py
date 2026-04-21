from aiogram import Router, types, F
from aiogram.utils.keyboard import InlineKeyboardBuilder
from aiogram.types import InlineKeyboardButton
from database.models import async_session, User, Referral
from sqlalchemy import select
import random, string

router = Router()

def gen_ref_code(user_id: int) -> str:
    suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=5))
    return f"AURA{user_id}{suffix}"

@router.callback_query(F.data == "referral_info")
async def referral_info(callback: types.CallbackQuery):
    user_id = callback.from_user.id
    async with async_session() as session:
        user_res = await session.execute(select(User).where(User.user_id == user_id))
        user = user_res.scalar_one_or_none()

        if user and not user.referral_code:
            user.referral_code = gen_ref_code(user_id)
            await session.commit()

        ref_code = user.referral_code if user else gen_ref_code(user_id)
        ref_count = user.ref_count if user else 0

    bot_username = "aiyordamchiaibot"
    ref_link = f"https://t.me/{bot_username}?start={ref_code}"

    text = (
        "🎁 <b>Referal dasturi</b>\n\n"
        "Do'stlaringizni taklif qiling va bonuslar oling!\n\n"
        f"👥 Taklif qilganlaringiz: <b>{ref_count} kishi</b>\n\n"
        f"🔗 Sizning referal havolangiz:\n"
        f"<code>{ref_link}</code>\n\n"
        "📌 <b>Qoidalar:</b>\n"
        "• Har bir yangi foydalanuvchi uchun bonus\n"
        "• 5 ta referal = 1 ta <b>Premium shablon</b> bepul\n"
        "• 10 ta referal = <b>VIP status</b> 30 kun"
    )

    kb = InlineKeyboardBuilder()
    kb.row(InlineKeyboardButton(
        text="📤 Do'stlarimga ulashish",
        url=f"https://t.me/share/url?url={ref_link}&text=Telegram%20botingizni%20yarating!"
    ))
    kb.row(InlineKeyboardButton(text="⬅️ Orqaga", callback_data="my_profile"))
    await callback.message.edit_text(text, reply_markup=kb.as_markup())
