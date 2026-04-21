from aiogram import types, Router, F
from aiogram.filters import CommandStart
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from keyboards.inline import get_main_menu_kb
from keyboards.reply import get_main_reply_kb
from utils.captcha_gen import generate_captcha
from aiogram.types import BufferedInputFile
from database.models import async_session, User
from sqlalchemy import select
import json

router = Router()

class AuthStates(StatesGroup):
    waiting_captcha = State()
    waiting_name = State()
    waiting_terms = State()

@router.message(CommandStart())
async def cmd_start(message: types.Message, state: FSMContext):
    async with async_session() as session:
        user = await session.get(User, message.from_user.id)
        if user and user.is_registered:
            from handlers.onboarding import show_main_menu_logic
            await show_main_menu_logic(message)
            return

    captcha_text, captcha_img = generate_captcha()
    await state.update_data(captcha_text=captcha_text)
    await state.set_state(AuthStates.waiting_captcha)
    
    await message.answer_photo(
        BufferedInputFile(captcha_img.read(), filename="captcha.png"),
        caption=(
            "🛡 <b>Xavfsizlik testi (CAPTCHA)</b>\n\n"
            "Botdan foydalanish uchun rasmdagi belgilarni yozib yuboring:"
        )
    )

@router.message(AuthStates.waiting_captcha)
async def verify_captcha(message: types.Message, state: FSMContext):
    data = await state.get_data()
    correct = data.get("captcha_text")
    
    if message.text and message.text.upper() == correct:
        await state.set_state(AuthStates.waiting_name)
        await message.answer("✅ <b>To'g'ri!</b>\n\nEndi botda foydalanishingiz uchun Ism va Familiyangizni kiriting:")
    else:
        captcha_text, captcha_img = generate_captcha()
        await state.update_data(captcha_text=captcha_text)
        await message.answer_photo(
            BufferedInputFile(captcha_img.read(), filename="captcha.png"),
            caption="❌ <b>Xato kiritdingiz!</b>\n\nQayta urinib ko'ring (yangi rasm):"
        )

@router.message(AuthStates.waiting_name)
async def process_name(message: types.Message, state: FSMContext):
    if not message.text or len(message.text) < 3:
        await message.answer("⚠️ <b>Ism juda qisqa!</b>\nIltimos, to'liq ismingizni kiriting:")
        return
        
    await state.update_data(full_name=message.text)
    await state.set_state(AuthStates.waiting_terms)
    
    from keyboards.inline import get_terms_kb
    await message.answer(
        "📜 <b>Foydalanish shartlari</b>\n\n"
        "Aura Studio xizmatidan foydalanish orqali siz barcha qoidalarga rozilik bildirasiz.\n"
        "Bot orqali noqonuniy harakatlarni amalga oshirish taqiqlanadi.",
        reply_markup=get_terms_kb()
    )

@router.callback_query(AuthStates.waiting_terms, F.data == "accept_terms")
async def accept_terms(callback: types.CallbackQuery, state: FSMContext):
    data = await state.get_data()
    full_name = data.get("full_name")
    
    async with async_session() as session:
        new_user = User(
            user_id=callback.from_user.id,
            username=callback.from_user.username,
            full_name=full_name,
            is_verified=True,
            is_registered=True,
            is_terms_accepted=True
        )
        await session.merge(new_user)
        await session.commit()
        
    await callback.answer("🎉 Ro'yxatdan o'tish muvaffaqiyatli yakunlandi!")
    await callback.message.delete()
    
    from handlers.onboarding import show_onboarding
    await show_onboarding(callback.message)
    await state.clear()

# 📱 Mini App'dan keladigan ma'lumotlarni qabul qilish
@router.message(F.web_app_data)
async def handle_webapp_data(message: types.Message, state: FSMContext):
    data = json.loads(message.web_app_data.data)
    action = data.get("action")
    
    if action == "wizard_start":
        from handlers.builder import start_builder
        # Callback kabi emulyatsiya qilamiz
        await message.answer("🛠 <b>Bot yaratish boshlanmoqda...</b>")
        from keyboards.inline import get_categories_kb
        await message.answer("Quyidagi yo'nalishlardan birini tanlang:", reply_markup=get_categories_kb())
    
    elif action == "my_profile":
        from handlers.analytics import show_profile
        # Fake callback object to reuse existing logic
        class FakeCB:
            def __init__(self, msg, user): self.message = msg; self.from_user = user
        await show_profile(FakeCB(message, message.from_user))

# 🔘 Reply tugmalar mantiqi
@router.message(F.text == "🤖 Bot yaratish")
async def reply_wizard(message: types.Message, state: FSMContext):
    from keyboards.inline import get_categories_kb
    await message.answer("🛠 <b>Bot Konstruktor</b>\n\nYo'nalishni tanlang:", reply_markup=get_categories_kb())

@router.message(F.text == "👤 Profil")
async def reply_profile(message: types.Message, state: FSMContext):
    from handlers.analytics import show_profile
    class FakeCB:
        def __init__(self, msg, user): self.message = msg; self.from_user = user
    await show_profile(FakeCB(message, message.from_user))

@router.message(F.text == "🎁 Referal")
async def reply_ref(message: types.Message, state: FSMContext):
    from handlers.referral import referral_info
    class FakeCB:
        def __init__(self, msg, user): self.message = msg; self.from_user = user
    await referral_info(FakeCB(message, message.from_user))
