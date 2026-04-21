from aiogram import Router, types, F
from aiogram.fsm.context import FSMContext
from aiogram.types import WebAppInfo
from services.ai_service import generate_bot_architecture
import json

router = Router()

@router.message(F.web_app_data)
async def handle_webapp_actions(message: types.Message, state: FSMContext):
    data = json.loads(message.web_app_data.data)
    action = data.get("action")

    if action == "ai_regenerate":
        waiting = await message.answer("🧠 <b>Senior AI loyihani tahlil qilmoqda...</b>")
        # Foydalanuvchi oxirgi tanlagan shablonini olamiz
        user_data = await state.get_data()
        tpl = user_data.get("selected_template", "General Bot")
        
        analysis = await generate_bot_architecture(f"Menga {tpl} uchun murakkab va professional arxitektura yozib ber.")
        await waiting.delete()
        await message.answer(f"📊 <b>AI Arxitektura Tahlili:</b>\n\n{analysis}\n\n🚀 <b>Kod tayyor!</b> Mini App orqali 'Deploy' qilishingiz mumkin.")

    elif action == "confirm_deploy":
        await message.answer("🚀 <b>Deployment Process Started!</b>\n\nBotingiz xuddi Termux'dagidek bizning bulutli xostingimizda ishga tushirildi. Status: 🟢 Online")
        from keyboards.inline import get_main_menu_kb
        await message.answer("🏠 <b>Bosh menyu:</b>", reply_markup=get_main_menu_kb())

@router.message(F.text)
async def handle_termux_errors(message: types.Message):
    text = message.text.lower()
    # Detect Tracebacks or Errors
    if "traceback" in text or "error:" in text or "exception:" in text:
        waiting = await message.answer("🕵️‍♂️ <b>Aura AI xatoni o'rganmoqda...</b>\nBir oz kuting...")
        prompt = f"Foydalanuvchi Termuxda botni ishga tushirganda quyidagi xatolikni oldi:\n\n{message.text}\n\nIltimos, bu xatoni qanday to'g'irlashni sodda va tushunarli o'zbek tilida, qadam-baqadam yozib ber."
        solution = await generate_bot_architecture(prompt)
        await waiting.edit_text(f"🛠 <b>AI Diagnostika (Groq):</b>\n\n{solution}", parse_mode="HTML")

