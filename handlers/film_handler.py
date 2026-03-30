"""
handlers/film_handler.py  — FilmFlow boti (mukammal versiya)
──────────────────────────────────────────────────────────
• Foydalanuvchi: kino izlash, profil, kanallar, referal, mukofot
• Admin: kino qo'shish/o'chirish, e'lon yuborish, statistika
• Har 10 ta kino = 5000 so'm mukofot (murojaat orqali)
"""
import logging
from aiogram import Router, F
from aiogram.types import (
    Message, CallbackQuery,
    InlineKeyboardMarkup, InlineKeyboardButton,
    ReplyKeyboardMarkup, KeyboardButton, ReplyKeyboardRemove
)
from aiogram.filters import Command
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
import config
import database.film_db as fdb

router = Router()
logger = logging.getLogger(__name__)


# ── FILTER ───────────────────────────────────────────────────────────────────
from aiogram.filters import Filter
class IsFilm(Filter):
    async def __call__(self, event) -> bool:
        bot = getattr(event, "bot", None)
        return getattr(bot, "role", "") == "film"


# ── STATES ───────────────────────────────────────────────────────────────────
class FilmState(StatesGroup):
    add_code    = State()
    add_title   = State()
    add_file    = State()
    delete_code = State()
    broadcast   = State()


# ── MENYULAR ─────────────────────────────────────────────────────────────────
def user_menu() -> ReplyKeyboardMarkup:
    return ReplyKeyboardMarkup(
        keyboard=[
            [KeyboardButton(text="➕ Kino qo'shish"), KeyboardButton(text="👤 Profilim")],
            [KeyboardButton(text="🎬 Kanallarimiz"),  KeyboardButton(text="🎁 Mukofot olish")],
            [KeyboardButton(text="🔗 Referal")],
        ],
        resize_keyboard=True
    )

def admin_menu() -> ReplyKeyboardMarkup:
    return ReplyKeyboardMarkup(
        keyboard=[
            [KeyboardButton(text="🎬 Kanallarimiz"), KeyboardButton(text="👤 Profilim")],
            [KeyboardButton(text="🎁 Mukofot olish"),  KeyboardButton(text="🔗 Referal")],
            [KeyboardButton(text="➕ Kino qo'shish"),  KeyboardButton(text="🗑 Kino o'chirish")],
            [KeyboardButton(text="📢 E'lon yuborish"),  KeyboardButton(text="⚙️ Admin panel")],
        ],
        resize_keyboard=True
    )

def channels_keyboard() -> InlineKeyboardMarkup:
    """Kanallar tugmalari."""
    buttons = [
        [InlineKeyboardButton(text=ch["name"], url=ch["url"])]
        for ch in config.FILM_CHANNELS
    ]
    return InlineKeyboardMarkup(inline_keyboard=buttons)


# ── /start ────────────────────────────────────────────────────────────────────
@router.message(Command("start"), IsFilm())
async def film_start(message: Message, state: FSMContext):
    await state.clear()
    tg_id   = message.from_user.id
    name    = message.from_user.full_name or "Mehmon"
    is_admin = tg_id in config.ADMIN_IDS

    # Referal aniqlash
    args = message.text.split()
    referrer_id = None
    if len(args) > 1 and args[1].startswith("ref_"):
        try:
            ref = int(args[1][4:])
            if ref != tg_id:
                referrer_id = ref
        except ValueError:
            pass

    user = fdb.ensure_film_user(
        tg_id=tg_id,
        full_name=name,
        username=message.from_user.username or "",
        referrer_id=referrer_id
    )

    added = user.get("approved_movies", 0)
    earned = (added // config.REWARD_PER_MOVIES) * config.REWARD_AMOUNT
    menu = admin_menu() if is_admin else user_menu()

    await message.answer(
        f"🎬 <b>Xush kelibsiz, {name}!</b>\n\n"
        f"FilmFlow — Kinolarni kod orqali topishning eng qulay yo'li!\n\n"
        f"📌 Kino kodini yuboring yoki kanallarimizga o'ting:",
        reply_markup=menu,
        parse_mode="HTML"
    )


# ── ASOSIY MATN HANDLERI ─────────────────────────────────────────────────────
@router.message(IsFilm(), F.text & ~F.text.startswith("/"))
async def film_text(message: Message, state: FSMContext):
    text     = message.text.strip()
    tg_id    = message.from_user.id
    is_admin = tg_id in config.ADMIN_IDS
    menu     = admin_menu() if is_admin else user_menu()

    # ── KANALLAR ─────────────────────────────────────────────────────────────
    if text == "🎬 Kanallarimiz":
        await message.answer(
            "📡 <b>Bizning kanallarimiz:</b>\n\nQiziqarli kontent uchun kanallarimizga obuna bo'ling!",
            reply_markup=channels_keyboard(),
            parse_mode="HTML"
        )
        return

    # ── PROFIL ───────────────────────────────────────────────────────────────
    if text == "👤 Profilim":
        u = fdb.get_film_user(tg_id)
        if not u:
            return await message.answer("❌ Profil topilmadi.")
        added   = u.get("approved_movies", 0)
        refs    = u.get("referral_count", 0)
        earned  = (added // config.REWARD_PER_MOVIES) * config.REWARD_AMOUNT
        next_r  = config.REWARD_PER_MOVIES - (added % config.REWARD_PER_MOVIES)
        ref_link = f"https://t.me/{config.FILM_BOT_USERNAME}?start=ref_{tg_id}"

        await message.answer(
            f"👤 <b>Profilingiz</b>\n"
            f"━━━━━━━━━━━━━━━━━\n"
            f"📛 Ism: {u.get('full_name', '-')}\n"
            f"🎬 Qo'shgan kinolar: <b>{added}</b>\n"
            f"👥 Referallar: <b>{refs}</b>\n"
            f"💰 Jami ishlagan: <b>{earned:,} so'm</b>\n"
            f"━━━━━━━━━━━━━━━━━\n"
            f"⏳ Keyingi mukofotgacha: <b>{next_r} ta kino</b>\n\n"
            f"🔗 Referal havolangiz:\n<code>{ref_link}</code>",
            parse_mode="HTML"
        )
        return

    # ── REFERAL ───────────────────────────────────────────────────────────────
    if text == "🔗 Referal":
        u = fdb.get_film_user(tg_id)
        refs = u.get("referral_count", 0) if u else 0
        ref_link = f"https://t.me/{config.FILM_BOT_USERNAME}?start=ref_{tg_id}"
        await message.answer(
            f"🔗 <b>Referal tizimi</b>\n\n"
            f"Do'stlaringizni taklif qiling va ular bilan birga o'sib boring!\n\n"
            f"👥 Sizning referallaringiz: <b>{refs}</b>\n\n"
            f"🔗 Havolangizni ulashing:\n<code>{ref_link}</code>",
            parse_mode="HTML"
        )
        return

    # ── MUKOFOT ───────────────────────────────────────────────────────────────
    if text == "🎁 Mukofot olish":
        u = fdb.get_film_user(tg_id)
        added   = u.get("approved_movies", 0) if u else 0
        claimed = u.get("rewards_claimed", 0) if u else 0
        total_reward = (added // config.REWARD_PER_MOVIES) * config.REWARD_AMOUNT
        unclaimed = total_reward - claimed

        if unclaimed <= 0:
            next_n = config.REWARD_PER_MOVIES - (added % config.REWARD_PER_MOVIES)
            await message.answer(
                f"💰 <b>Mukofot tizimi</b>\n\n"
                f"Har <b>{config.REWARD_PER_MOVIES}</b> ta kino qo'sganda "
                f"<b>{config.REWARD_AMOUNT:,} so'm</b> mukofot!\n\n"
                f"🎬 Siz qo'shgansiz: <b>{added}</b> ta kino\n"
                f"⏳ Keyingi mukofotga: <b>{next_n}</b> ta qoldi",
                parse_mode="HTML"
            )
        else:
            kb = InlineKeyboardMarkup(inline_keyboard=[[
                InlineKeyboardButton(
                    text=f"📩 Admindan {unclaimed:,} so'm so'rash",
                    url=config.ADMIN_CONTACT
                )
            ]])
            await message.answer(
                f"🎉 <b>Tabriklaymiz!</b>\n\n"
                f"🎬 Qo'shgan kinolar: <b>{added}</b> ta\n"
                f"💰 Olinmagan mukofot: <b>{unclaimed:,} so'm</b>\n\n"
                f"Pastdagi tugma orqali admindan mukofotingizni oling:",
                reply_markup=kb,
                parse_mode="HTML"
            )
        return

    # ── ADMIN TUGMALARI ───────────────────────────────────────────────────────
    if text == "🗑 Kino o'chirish" and is_admin:
        await state.set_state(FilmState.delete_code)
        return await message.answer("❌ O'chirmoqchi bo'lgan kino <b>kodini</b> yozing:", parse_mode="HTML")

    if text == "📢 E'lon yuborish" and is_admin:
        await state.set_state(FilmState.broadcast)
        return await message.answer(
            "📢 Barcha foydalanuvchilarga yuboriladigan <b>xabarni</b> yozing:",
            parse_mode="HTML"
        )
    if text == "➕ Kino qo'shish":
        await state.set_state(FilmState.add_code)
        return await message.answer(
            "📝 <b>Kino kodi</b> (masalan: <code>KK001</code>):\n\n"
            "⚠️ Eslatma: Kino 100% to'liq va sifatli bo'lishi shart!",
            parse_mode="HTML"
        )

    if text == "⚙️ Admin panel" and is_admin:
        mc = fdb.get_movie_count()
        uc = fdb.get_user_count()
        await message.answer(
            f"⚙️ <b>Admin Panel</b>\n"
            f"━━━━━━━━━━━━━━━━━\n"
            f"🎬 Kinolar: <b>{mc}</b>\n"
            f"👥 Foydalanuvchilar: <b>{uc}</b>\n"
            f"━━━━━━━━━━━━━━━━━\n"
            f"➕ Kino qo'shish\n"
            f"🗑 Kino o'chirish\n"
            f"📢 E'lon yuborish",
            parse_mode="HTML"
        )
        return

    # ── KINO KO'RISH (KOD ORQALI) ──────────────────────────────────────────────
    movie = fdb.get_movie(text.upper())
    if movie:
        await _send_movie(message, movie)
        return

    # Qidiruv olib tashlandi (Faqat qo'shish boti bo'lgani uchun)
    await message.answer(
        "❌ <b>Kino topilmadi.</b>\n\n"
        "Agar kino qo'shmoqchi bo'lsangiz, <b>➕ Kino qo'shish</b> tugmasini bosing.",
        parse_mode="HTML"
    )


# ── WATCH CALLBACK ────────────────────────────────────────────────────────────
@router.callback_query(IsFilm(), F.data.startswith("watch_"))
async def watch_movie(call: CallbackQuery):
    code  = call.data.split("_", 1)[1]
    movie = fdb.get_movie(code)
    if not movie:
        return await call.answer("❌ Kino topilmadi!", show_alert=True)
    await _send_movie(call.message, movie, user_id=call.from_user.id)
    await call.answer()


async def _send_movie(message: Message, movie: dict, user_id: int = None):
    uid = user_id or message.from_user.id
    fdb.increment_views(movie["code"], uid)
    caption = (
        f"🎬 <b>{movie['title']}</b>\n"
        f"🔑 Kod: <code>{movie['code']}</code>\n"
        f"👁 Ko'rishlar: {movie.get('views', 0)}"
    )
    if movie.get("description"):
        caption += f"\n\n📝 {movie['description']}"

    ft = movie.get("file_type", "video")
    try:
        if ft == "video":
            await message.answer_video(movie["file_id"], caption=caption, parse_mode="HTML")
        elif ft == "document":
            await message.answer_document(movie["file_id"], caption=caption, parse_mode="HTML")
        else:
            await message.answer_photo(movie["file_id"], caption=caption, parse_mode="HTML")
    except Exception as e:
        logger.error(f"Kino yuborishda xato: {e}")
        await message.answer(f"⚠️ Kino faylida muammo bor. Admin bilan bog'laning.")


# ── KINO QO'SHISH ─────────────────────────────────────────────────────────────
@router.message(FilmState.add_code, IsFilm())
async def add_code(message: Message, state: FSMContext):
    code = message.text.strip().upper()
    if fdb.get_movie(code):
        return await message.answer(f"⚠️ <b>{code}</b> allaqachon mavjud!", parse_mode="HTML")
    await state.update_data(code=code)
    await state.set_state(FilmState.add_title)
    await message.answer(f"✅ Kod: <b>{code}</b>\n\n📝 Kino <b>nomini</b> yozing:", parse_mode="HTML")


@router.message(FilmState.add_title, IsFilm())
async def add_title(message: Message, state: FSMContext):
    await state.update_data(title=message.text.strip())
    await state.set_state(FilmState.add_file)
    await message.answer("📤 Kino <b>faylini</b> yuboring (video yoki document):", parse_mode="HTML")


@router.message(FilmState.add_file, IsFilm())
async def add_file(message: Message, state: FSMContext):
    file_id, file_type = None, "video"
    if message.video:
        file_id, file_type = message.video.file_id, "video"
    elif message.document:
        file_id, file_type = message.document.file_id, "document"
    elif message.photo:
        file_id, file_type = message.photo[-1].file_id, "photo"

    if not file_id:
        return await message.answer("❌ Video, document yoki rasm yuboring!")

    data = await state.get_data()
    ok = fdb.add_movie(
        code=data["code"],
        title=data["title"],
        file_id=file_id,
        file_type=file_type,
        added_by=message.from_user.id
    )
    await state.clear()

    if ok:
        # Admin bo'lmagan bo'lsa movielar sonini oshir
        if message.from_user.id not in config.ADMIN_IDS:
            fdb.increment_user_movies(message.from_user.id)
        await message.answer(
            f"✅ <b>Kino qo'shildi!</b>\n\n"
            f"🔑 Kod: <code>{data['code']}</code>\n"
            f"🎬 Nomi: {data['title']}",
            parse_mode="HTML"
        )
    else:
        await message.answer("❌ Qo'shishda xatolik!")


# ── KINO O'CHIRISH ────────────────────────────────────────────────────────────
@router.message(FilmState.delete_code, IsFilm())
async def delete_movie(message: Message, state: FSMContext):
    code = message.text.strip().upper()
    movie = fdb.get_movie(code)
    if not movie:
        await state.clear()
        return await message.answer(f"❌ <b>{code}</b> topilmadi.", parse_mode="HTML")

    kb = InlineKeyboardMarkup(inline_keyboard=[[
        InlineKeyboardButton(text="✅ Ha, o'chir", callback_data=f"del_{code}"),
        InlineKeyboardButton(text="❌ Bekor qil",  callback_data="del_cancel"),
    ]])
    await state.clear()
    await message.answer(
        f"⚠️ <b>{movie['title']}</b> [{code}] o'chirilsinmi?",
        reply_markup=kb,
        parse_mode="HTML"
    )


@router.callback_query(IsFilm(), F.data.startswith("del_"))
async def del_confirm(call: CallbackQuery):
    if call.from_user.id not in config.ADMIN_IDS:
        return await call.answer("❌ Ruxsat yo'q!")
    data = call.data
    if data == "del_cancel":
        await call.message.edit_text("✅ Bekor qilindi.")
        return await call.answer()
    code = data.split("_", 1)[1]
    ok = fdb.delete_movie(code)
    await call.message.edit_text(
        f"✅ <b>{code}</b> o'chirildi." if ok else f"❌ {code} topilmadi.",
        parse_mode="HTML"
    )
    await call.answer()


# ── E'LON YUBORISH ────────────────────────────────────────────────────────────
@router.message(FilmState.broadcast, IsFilm())
async def broadcast_msg(message: Message, state: FSMContext):
    await state.clear()
    users = fdb.get_all_user_ids()
    sent, fail = 0, 0
    for uid in users:
        try:
            await message.copy_to(uid)
            sent += 1
        except Exception:
            fail += 1
    await message.answer(
        f"📢 <b>E'lon yuborildi!</b>\n\n"
        f"✅ Muvaffaqiyatli: {sent}\n"
        f"❌ Yuborilmadi: {fail}",
        parse_mode="HTML"
    )
