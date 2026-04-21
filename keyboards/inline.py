from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo
from aiogram.utils.keyboard import InlineKeyboardBuilder
import random

def get_terms_kb():
    builder = InlineKeyboardBuilder()
    builder.row(InlineKeyboardButton(text="✅ Shartlarga roziman", callback_data="accept_terms"))
    return builder.as_markup()

def get_onboarding_kb() -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    builder.row(InlineKeyboardButton(text="🚀 Bot yaratish", callback_data="wizard_start"))
    builder.row(InlineKeyboardButton(text="📂 Loyihalarim", callback_data="my_projects"))
    builder.row(InlineKeyboardButton(text="🏠 Asosiy menyu", callback_data="show_main_menu"))
    return builder.as_markup()

def get_main_menu_kb() -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    builder.row(InlineKeyboardButton(text="🤖 Bot yaratish", callback_data="wizard_start"))
    builder.row(InlineKeyboardButton(text="📂 Loyihalarim", callback_data="my_projects"))
    builder.row(
        InlineKeyboardButton(text="👤 Profil", callback_data="my_profile"),
        InlineKeyboardButton(text="🎁 Referal", callback_data="referral_info")
    )
    return builder.as_markup()

def get_categories_kb() -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    categories = [
        ("🛒 Do'kon boti", "cat_shop"), ("📢 SMM boti", "cat_smm"), 
        ("💬 Feedback boti", "cat_feedback"), ("📅 Booking boti", "cat_booking"),
        ("🎮 O'yin boti", "cat_game"), ("🤖 AI Assistant", "cat_ai")
    ]
    for text, cb in categories:
        builder.add(InlineKeyboardButton(text=text, callback_data=cb))
    builder.adjust(2)
    builder.row(InlineKeyboardButton(text="⬅️ Orqaga", callback_data="show_main_menu"))
    return builder.as_markup()

def get_template_view_kb(template_id: str) -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    builder.row(InlineKeyboardButton(text="✅ Ushbu shablon bilan davom etish", callback_data=f"select_{template_id}"))
    builder.row(InlineKeyboardButton(text="⬅️ Boshqa shablonlar", callback_data="wizard_start"))
    return builder.as_markup()
