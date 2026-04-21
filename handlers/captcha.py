from aiogram import types, Router, F
from aiogram.fsm.context import FSMContext
from .start import AuthStates
from database.db import update_captcha_status
from .onboarding import show_onboarding

router = Router()

@router.message(AuthStates.waiting_captcha)
async def check_captcha(message: types.Message, state: FSMContext):
    data = await state.get_data(); correct_answer = data.get("correct_answer")
    if message.text == str(correct_answer):
        await state.clear()
        await update_captcha_status(message.from_user.id, 1)
        await message.answer("✅ <b>Tasdiqlandi!</b>")
        await show_onboarding(message)
    else: await message.answer("❌ Xato! Qayta urinib ko'ring.")
