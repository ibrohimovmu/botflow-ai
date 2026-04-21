from aiogram import types, Router, F
from keyboards.inline import get_onboarding_kb, get_main_menu_kb
from config import settings

router = Router()

async def show_onboarding(message: types.Message):
    text = (
        "🌟 <b>Nima uchun Aura Studio?</b>\n\n"
        "🚀 <b>Tezkorlik:</b> 1 daqiqada professional bot\n"
        "🎨 <b>Moslashuvchanlik:</b> AI orqali real vaqtda tahrirlash\n"
        "🏦 <b>To'lovlar:</b> O'rnatilgan to'lov tizimlari\n"
        "📊 <b>Analitika:</b> Botlaringiz statistikasi doim qo'lingizda\n"
        "🛡 <b>Xavfsizlik:</b> Foydalanuvchi ma'lumotlari himoyalangan\n\n"
        "📜 <b>Foydalanish shartlari:</b>\n"
        "<blockquote>Bizning xizmatdan foydalanish orqali siz qonuniy botlarni yaratishga va "
        "boshqa foydalanuvchilar qoidalariga rioya qilishga rozilik bildirasiz.</blockquote>\n"
        "Davom etish uchun pastdagi tugmani bosing 👇"
    )
    
    # Sticker (agar file_id bo'lsa)
    if settings.STICKER_WELCOME:
        try: await message.answer_sticker(settings.STICKER_WELCOME)
        except: pass

    await message.answer(
        text,
        reply_markup=get_onboarding_kb(),
        parse_mode="HTML"
    )

async def show_main_menu_logic(message: types.Message):
    await message.answer(
        "🏠 <b>Asosiy Menyu</b>\n\nMarhamat, bot yaratishni boshlash uchun quyidagi tugmalardan birini tanlang:",
        reply_markup=get_main_menu_kb(),
        parse_mode="HTML"
    )

@router.callback_query(F.data == "show_main_menu")
async def main_menu(callback: types.CallbackQuery):
    await callback.message.edit_text(
        "🏠 <b>Asosiy Menyu</b>\n\nMarhamat, bot yaratishni boshlash uchun quyidagi tugmalardan birini tanlang:",
        reply_markup=get_main_menu_kb(),
        parse_mode="HTML"
    )
    await callback.answer()
