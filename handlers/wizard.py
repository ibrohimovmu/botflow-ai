from aiogram import types, Router, F
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.utils.keyboard import InlineKeyboardBuilder
from utils.ai_engine import edit_template_with_ai
import json

router = Router()

class WizardState(StatesGroup):
    choosing_template = State()
    viewing_template = State()
    editing_with_ai = State()
    forced_sub_choice = State()
    waiting_channel = State()
    waiting_admin_id = State()
    waiting_token = State()

TEMPLATES = {
    "smm": {"name": "🚀 SMM Pro", "desc": "SMM agentliklar va frilanserlar uchun."},
    "shop": {"name": "🛒 Smart Shop", "desc": "Mahsulotlar galereyasi va buyurtma tizimi bilan."},
    "feedback": {"name": "📥 Feedback Bot", "desc": "Mijozlar bilan aloqa va arizalar uchun."}
}

@router.callback_query(F.data == "wizard_start")
async def start_wizard(c: types.CallbackQuery, state: FSMContext):
    kb = InlineKeyboardBuilder()
    for key, tpl in TEMPLATES.items(): kb.row(types.InlineKeyboardButton(text=tpl['name'], callback_data=f"tpl_{key}"))
    await c.message.edit_text("<b>📋 1-qadam: Shablon tanlang</b>", reply_markup=kb.as_markup(), parse_mode="HTML")
    await state.set_state(WizardState.choosing_template)

@router.callback_query(F.data.startswith("tpl_"))
async def view_template(c: types.CallbackQuery, state: FSMContext):
    tpl_key = c.data.replace("tpl_", ""); tpl = TEMPLATES[tpl_key]
    await state.update_data(tpl_key=tpl_key)
    kb = InlineKeyboardBuilder()
    kb.row(types.InlineKeyboardButton(text="✅ Ishga tushirish", callback_data="wizard_deploy"))
    kb.row(types.InlineKeyboardButton(text="✏️ AI tahrirlash", callback_data="wizard_edit"))
    kb.row(types.InlineKeyboardButton(text="⬅️ Orqaga", callback_data="wizard_start"))
    await c.message.edit_text(f"🌟 <b>{tpl['name']}</b>\n\n{tpl['desc']}", reply_markup=kb.as_markup(), parse_mode="HTML")

@router.callback_query(F.data == "wizard_edit")
async def start_ai_edit(c: types.CallbackQuery, state: FSMContext):
    await c.message.edit_text("✍️ <b>AI tahrirlash rejimi</b>\n\nO'zgartirishni yozing:", parse_mode="HTML")
    await state.set_state(WizardState.editing_with_ai)

@router.message(WizardState.editing_with_ai)
async def process_ai_edit(message: types.Message, state: FSMContext):
    waiting = await message.answer("🧠 <b>AI ishlamoqda...</b>")
    kb = InlineKeyboardBuilder()
    kb.row(types.InlineKeyboardButton(text="✅ Tasdiqlash", callback_data="wizard_deploy"))
    await waiting.edit_text("✨ <b>Yangilandi!</b>", reply_markup=kb.as_markup(), parse_mode="HTML")

@router.callback_query(F.data == "wizard_deploy")
async def ask_forced_sub(c: types.CallbackQuery, state: FSMContext):
    kb = InlineKeyboardBuilder()
    kb.row(types.InlineKeyboardButton(text="✅ Ha", callback_data="sub_yes"))
    kb.row(types.InlineKeyboardButton(text="❌ Yo'q", callback_data="sub_no"))
    await c.message.edit_text("📢 <b>Obuna qo'shilsinmi?</b>", reply_markup=kb.as_markup(), parse_mode="HTML")
    await state.set_state(WizardState.forced_sub_choice)

@router.callback_query(F.data == "sub_yes")
async def get_channel_link(c: types.CallbackQuery, state: FSMContext):
    await c.message.edit_text("🔗 <b>Kanal linkini yuboring:</b>", parse_mode="HTML")
    await state.set_state(WizardState.waiting_channel)

@router.callback_query(F.data == "sub_no")
async def ask_admin_panel(c: types.CallbackQuery, state: FSMContext):
    kb = InlineKeyboardBuilder()
    kb.row(types.InlineKeyboardButton(text="✅ Ha", callback_data="admin_yes"))
    kb.row(types.InlineKeyboardButton(text="❌ Yo'q", callback_data="admin_no"))
    await c.message.edit_text("🛠 <b>Admin Panel qo'shilsinmi?</b>", reply_markup=kb.as_markup(), parse_mode="HTML")

@router.callback_query(F.data == "admin_yes")
async def get_admin_id(c: types.CallbackQuery, state: FSMContext):
    await c.message.edit_text("🔑 <b>ID yuboring:</b>", parse_mode="HTML")
    await state.set_state(WizardState.waiting_admin_id)
