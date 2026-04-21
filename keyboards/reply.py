from aiogram.types import ReplyKeyboardMarkup, KeyboardButton, WebAppInfo

def get_main_reply_kb():
    return ReplyKeyboardMarkup(
        keyboard=[
            [
                KeyboardButton(text="📱 Boshqaruv Paneli", web_app=WebAppInfo(url="https://ibrohmwvgmai-vault.hf.space/app")),
                KeyboardButton(text="🤖 Bot yaratish")
            ],
            [
                KeyboardButton(text="👤 Profil"),
                KeyboardButton(text="🎁 Referal")
            ]
        ],
        resize_keyboard=True,
        input_field_placeholder="Menyuni tanlang..."
    )
