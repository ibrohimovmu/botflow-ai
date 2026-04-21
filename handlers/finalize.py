from aiogram import Router, types, F
from aiogram.fsm.context import FSMContext
from aiogram.utils.keyboard import InlineKeyboardBuilder
from aiogram.types import InlineKeyboardButton
import httpx

router = Router()

async def show_summary(message: types.Message, state: FSMContext):
    data = await state.get_data()
    tpl_name = data.get("selected_template", "Noma'lum")
    f_sub = data.get("channel", "Yo'q")
    admin_id = data.get("admin_id", "Yo'q")
    features = data.get("admin_features", [])
    summary_text = f"🎉 <b>Botingiz tayyor!</b>\n\n📋 <b>Shablon:</b> {tpl_name}\n📢 <b>Obuna:</b> {f_sub}\n🔐 <b>Admin:</b> {admin_id}\n🛠 <b>Funksiyalar:</b> {', '.join(features) if features else 'Standard'}\n\nToken yuboring."
    kb = InlineKeyboardBuilder()
    kb.row(InlineKeyboardButton(text="✅ Tasdiqlash", callback_data="confirm_deploy"))
    kb.row(InlineKeyboardButton(text="✏️ Tahrirlash", callback_data="wizard_start"))
    if isinstance(message, types.CallbackQuery): await message.message.edit_text(summary_text, reply_markup=kb.as_markup(), parse_mode="HTML")
    else: await message.answer(summary_text, reply_markup=kb.as_markup(), parse_mode="HTML")

@router.callback_query(F.data == "finalize_wizard")
async def finalize_process(callback: types.CallbackQuery, state: FSMContext):
    await show_summary(callback.message, state)

@router.callback_query(F.data == "confirm_deploy")
async def request_token(callback: types.CallbackQuery, state: FSMContext):
    await callback.message.edit_text("🔑 <b>BotFather tokenini yuboring:</b>", parse_mode="HTML")
    from .builder import BuilderStates
    await state.set_state(BuilderStates.waiting_token)

async def validate_token(token: str):
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(f"https://api.telegram.org/bot{token}/getMe")
            if resp.status_code == 200:
                return resp.json().get("result", {})
            return None
        except: return None
