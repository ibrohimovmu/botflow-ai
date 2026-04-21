from aiogram import Router, types, F
from aiogram.fsm.context import FSMContext
from aiogram.utils.keyboard import InlineKeyboardBuilder
from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup

router = Router()

ADMIN_FEATURES = {
    "stats": "📊 Statistika",
    "broadcast": "📨 Ommaviy xabar",
    "terms": "📋 Oferta va shartlar",
    "block": "🚫 Bloklash",
    "export": "💾 Export (CSV)",
    "promo": "🎁 Promo-kodlar",
    "report": "📈 Kunlik hisobot",
    "chat": "💬 Chat"
}

async def ask_admin_panel(message: types.Message, state: FSMContext):
    kb = InlineKeyboardBuilder()
    kb.row(InlineKeyboardButton(text="✅ Ha", callback_data="admin_panel_yes"))
    kb.row(InlineKeyboardButton(text="❌ Yo'q", callback_data="admin_panel_no"))
    msg_text = "🔐 <b>Botingizda admin panel bo'lsinmi?</b>"
    if isinstance(message, types.CallbackQuery): await message.message.edit_text(msg_text, reply_markup=kb.as_markup(), parse_mode="HTML")
    else: await message.answer(msg_text, reply_markup=kb.as_markup(), parse_mode="HTML")

@router.callback_query(F.data == "admin_panel_yes")
async def get_admin_id_req(callback: types.CallbackQuery, state: FSMContext):
    await callback.message.edit_text("👤 <b>Admin ID yuboring</b>", parse_mode="HTML")
    from .builder import BuilderStates
    await state.set_state(BuilderStates.waiting_admin_id)

@router.callback_query(F.data == "admin_panel_no")
async def skip_admin(callback: types.CallbackQuery, state: FSMContext):
    from .finalize import show_summary
    await show_summary(callback.message, state)

@router.callback_query(F.data.startswith("toggle_"))
async def toggle_feature(callback: types.CallbackQuery, state: FSMContext):
    feature = callback.data.replace("toggle_", "")
    data = await state.get_data(); selected = data.get("admin_features", [])
    if feature in selected: selected.remove(feature)
    else: selected.append(feature)
    await state.update_data(admin_features=selected)
    await show_features_checklist(callback.message, state)

async def show_features_checklist(message: types.Message, state: FSMContext):
    data = await state.get_data(); selected = data.get("admin_features", [])
    kb = InlineKeyboardBuilder()
    for key, name in ADMIN_FEATURES.items():
        icon = "☑️" if key in selected else "⬜️"
        kb.row(InlineKeyboardButton(text=f"{icon} {name}", callback_data=f"toggle_{key}"))
    kb.row(InlineKeyboardButton(text="🚀 Tayyor", callback_data="finalize_wizard"))
    await message.edit_text("🛠 <b>Funksiyalarni tanlang:</b>", reply_markup=kb.as_markup(), parse_mode="HTML")
