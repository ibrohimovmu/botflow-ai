"""
handlers/edtech_start.py
Ed-Tech boti (SMM bot) uchun /start va ro'yxatdan o'tish.
Supabase orqali ishlaydi.
"""
import secrets
import logging
from aiogram import Router, F
from aiogram.types import Message, CallbackQuery, InlineKeyboardMarkup, \
    InlineKeyboardButton, ReplyKeyboardMarkup, KeyboardButton, ReplyKeyboardRemove
from aiogram.filters import Command
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
import config
import database.supabase_db as db

router = Router()
logger = logging.getLogger(__name__)

# Faqat EdTech boti uchun filter
from aiogram.filters import Filter
class IsEdTech(Filter):
    async def __call__(self, event) -> bool:
        bot = getattr(event, "bot", None) or (event.bot if hasattr(event, "bot") else None)
        return getattr(bot, "role", "") == "edtech"


class RegState(StatesGroup):
    fullname   = State()
    phone      = State()
    region     = State()
    district   = State()
    school     = State()
    category   = State()
    experience = State()
    password   = State()


# Parol hashlash
import hashlib
def _hash(pw: str) -> str:
    return hashlib.sha256(pw.encode()).hexdigest()


# Menyu
def main_menu(tg_id: int) -> InlineKeyboardMarkup:
    is_admin = tg_id in config.ADMIN_IDS
    rows = [
        [InlineKeyboardButton(text="📚 Guruhlarim", callback_data="my_classes"),
         InlineKeyboardButton(text="👤 Profilim", callback_data="my_profile")],
        [InlineKeyboardButton(text="🌐 Saytga kirish", url=config.SITE_URL)],
    ]
    if is_admin:
        rows.append([InlineKeyboardButton(text="⚙️ Admin Panel", callback_data="admin_panel")])
    return InlineKeyboardMarkup(inline_keyboard=rows)


# ── /start ────────────────────────────────────────────────────────────────────
@router.message(Command("start"), IsEdTech())
async def cmd_start(message: Message, state: FSMContext):
    await state.clear()
    tg_id = message.from_user.id

    user = await db.get_user_by_tg(tg_id)

    if user and user.get("is_approved"):
        name = user.get("full_name", "Foydalanuvchi")
        role = "O'qituvchi" if user.get("role") == "teacher" else "O'quvchi"
        await message.answer(
            f"👋 <b>Xush kelibsiz, {name}!</b>\n\n"
            f"🎭 Sizning rolingiz: <b>{role}</b>\n\n"
            f"Quyidagi menyudan foydalaning:",
            reply_markup=main_menu(tg_id),
            parse_mode="HTML"
        )
        return

    if user and not user.get("is_approved") and user.get("role") == "teacher":
        await message.answer(
            "⏳ <b>Arizangiz ko'rib chiqilmoqda.</b>\n\nAdmin tasdiqlashini kuting.",
            parse_mode="HTML"
        )
        return

    # Yangi foydalanuvchi — ro'yxatdan o'tish
    kb = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🎓 O'quvchi bo'lib kirish", callback_data="reg_student")],
        [InlineKeyboardButton(text="👨‍🏫 O'qituvchi sifatida ariza topshirish", callback_data="reg_teacher")],
    ])
    await message.answer(
        "👋 <b>Assalomu alaykum!</b>\n\n"
        "Precise Ed-Tech platformasiga xush kelibsiz.\n"
        "Iltimos, o'zingizga mos variantni tanlang:",
        reply_markup=kb,
        parse_mode="HTML"
    )


# ── RO'YXATDAN O'TISH ────────────────────────────────────────────────────────

@router.callback_query(F.data.in_({"reg_student", "reg_teacher"}))
async def reg_start(call: CallbackQuery, state: FSMContext):
    role = "student" if "student" in call.data else "teacher"
    await state.update_data(role=role)
    await state.set_state(RegState.fullname)
    await call.message.edit_text("📝 <b>To'liq ism va familyangizni kiriting:</b>", parse_mode="HTML")
    await call.answer()


@router.message(RegState.fullname, F.text)
async def reg_name(message: Message, state: FSMContext):
    name = message.text.strip()
    if len(name) < 3:
        return await message.answer("⚠️ Ism juda qisqa, to'liqroq kiriting.")
    await state.update_data(fullname=name)
    data = await state.get_data()

    if data["role"] == "student":
        # O'quvchi uchun darhol parol so'raymiz
        clean = "".join(c for c in name.lower() if c.isalnum())
        username = f"{clean[:8]}_{secrets.randbelow(900)+100}"
        await state.update_data(username=username)
        await state.set_state(RegState.password)
        await message.answer(
            f"✅ Ism qabul qilindi!\n\n"
            f"👤 Loginингиз: <code>{username}</code>\n"
            f"🔑 Endi parol o'ylab yozing (kamida 6 belgi):",
            parse_mode="HTML"
        )
    else:
        # O'qituvchi uchun telefon so'raymiz
        await state.set_state(RegState.phone)
        kb = ReplyKeyboardMarkup(
            keyboard=[[KeyboardButton(text="📱 Raqamni yuborish", request_contact=True)]],
            resize_keyboard=True, one_time_keyboard=True
        )
        await message.answer("📱 Telefon raqamingizni yuboring:", reply_markup=kb)


REGIONS = [
    "Toshkent sh.", "Toshkent vil.", "Samarqand", "Buxoro", "Andijon",
    "Farg'ona", "Namangan", "Xorazm", "Qashqadaryo", "Surxondaryo",
    "Jizzax", "Sirdaryo", "Navoiy", "Qoraqalpog'iston"
]
SUBJECTS = [
    "Matematika", "Fizika", "Kimyo", "Biologiya", "Informatika",
    "Ingliz tili", "O'zbek tili", "Tarix", "Geografiya", "Boshqa"
]


@router.message(RegState.phone, F.contact | F.text)
async def reg_phone(message: Message, state: FSMContext):
    phone = message.contact.phone_number if message.contact else message.text.strip()
    await state.update_data(phone=phone)
    await state.set_state(RegState.region)
    rows = [[InlineKeyboardButton(text=r, callback_data=f"r_{i}")] for i, r in enumerate(REGIONS)]
    await message.answer(
        "📍 <b>Viloyatingizni tanlang:</b>",
        reply_markup=InlineKeyboardMarkup(inline_keyboard=rows),
        parse_mode="HTML"
    )


@router.callback_query(RegState.region, F.data.startswith("r_"))
async def reg_region(call: CallbackQuery, state: FSMContext):
    region = REGIONS[int(call.data.split("_")[1])]
    await state.update_data(region=region)
    await state.set_state(RegState.district)
    await call.message.edit_text(
        f"📍 Viloyat: <b>{region}</b>\n\n🏙 <b>Tuman nomini yozing:</b>",
        parse_mode="HTML"
    )
    await call.answer()


@router.message(RegState.district, F.text)
async def reg_district(message: Message, state: FSMContext):
    await state.update_data(district=message.text.strip())
    await state.set_state(RegState.school)
    await message.answer("🏫 <b>Maktab nomini yozing:</b>", parse_mode="HTML")


@router.message(RegState.school, F.text)
async def reg_school(message: Message, state: FSMContext):
    await state.update_data(school=message.text.strip())
    await state.set_state(RegState.category)
    rows = [[InlineKeyboardButton(text=s, callback_data=f"subj_{i}")] for i, s in enumerate(SUBJECTS)]
    await message.answer(
        "📚 <b>Qaysi fan bo'yicha dars berasiz?</b>",
        reply_markup=InlineKeyboardMarkup(inline_keyboard=rows),
        parse_mode="HTML"
    )


@router.callback_query(RegState.category, F.data.startswith("subj_"))
async def reg_subject(call: CallbackQuery, state: FSMContext):
    subj = SUBJECTS[int(call.data.split("_")[1])]
    await state.update_data(category=subj)
    await state.set_state(RegState.experience)
    await call.message.edit_text(
        f"📚 Fan: <b>{subj}</b>\n\n⏳ <b>Necha yillik tajribangiz bor? (raqam):</b>",
        parse_mode="HTML"
    )
    await call.answer()


@router.message(RegState.experience, F.text)
async def reg_experience(message: Message, state: FSMContext):
    exp = message.text.strip()
    data = await state.get_data()
    tg_id = message.from_user.id

    bio = (f"Tel: {data.get('phone')} | {data.get('region')} | "
           f"{data.get('district')} | {data.get('school')} | "
           f"{data.get('category')} | {exp} yil tajriba")

    # Admin xabari
    admin_text = (
        f"👨‍🏫 <b>Yangi o'qituvchi arizasi:</b>\n\n"
        f"👤 Ism: {data.get('fullname')}\n"
        f"📱 Tel: {data.get('phone')}\n"
        f"📍 Viloyat: {data.get('region')}\n"
        f"🏙 Tuman: {data.get('district')}\n"
        f"🏫 Maktab: {data.get('school')}\n"
        f"📚 Fan: {data.get('category')}\n"
        f"⏳ Tajriba: {exp} yil\n"
        f"🆔 TG: <code>{tg_id}</code>"
    )
    kb = InlineKeyboardMarkup(inline_keyboard=[[
        InlineKeyboardButton(text="✅ Tasdiqlash", callback_data=f"approve_{tg_id}"),
        InlineKeyboardButton(text="❌ Rad etish", callback_data=f"reject_{tg_id}"),
    ]])

    for aid in config.ADMIN_IDS:
        try:
            await message.bot.send_message(aid, admin_text, reply_markup=kb, parse_mode="HTML")
        except Exception:
            pass

    ok = await db.apply_as_teacher(tg_id, data.get("fullname", ""), bio)
    if ok:
        await message.answer(
            "🎉 <b>Arizangiz muvaffaqiyatli topshirildi!</b>\n\nAdmin tasdiqlashini kuting.",
            reply_markup=ReplyKeyboardRemove(),
            parse_mode="HTML"
        )
    else:
        await message.answer("❌ Xatolik yuz berdi. Iltimos qayta urinib ko'ring.")
    await state.clear()


# ── ADMIN APPROVE / REJECT ────────────────────────────────────────────────────

@router.callback_query(F.data.startswith("approve_"))
async def admin_approve(call: CallbackQuery):
    if call.from_user.id not in config.ADMIN_IDS:
        return await call.answer("❌ Ruxsat yo'q!")
    tg_id = int(call.data.split("_")[1])

    # Foydalanuvchi ma'lumotlarini olamiz
    user_data = await db.get_user_by_tg(tg_id)

    # pending_ username bo'lsa — yangi chiroyli username yaratamiz
    if user_data and user_data.get("username", "").startswith("pending_"):
        from database.supabase_db import _make_username
        new_username = _make_username(user_data.get("full_name", "user"))
        try:
            c = await db.get_client()
            await c.table("platform_users").update({"username": new_username}).eq("telegram_id", tg_id).execute()
        except Exception as e:
            logger.warning(f"Username yangilashda xato: {e}")
            new_username = user_data.get("username")
    else:
        new_username = user_data.get("username") if user_data else f"user_{tg_id}"

    ok = await db.approve_user(tg_id)
    if ok:
        kb = InlineKeyboardMarkup(inline_keyboard=[[
            InlineKeyboardButton(text="🔑 Parol o'rnatish", callback_data="setup_pass")
        ]])
        try:
            await call.bot.send_message(
                tg_id,
                f"🎊 <b>Tabriklaymiz! Arizangiz tasdiqlandi.</b>\n\n"
                f"👤 Loginingiz: <code>{new_username}</code>\n\n"
                f"Parolni o'rnatib saytga kiring:",
                reply_markup=kb, parse_mode="HTML"
            )
        except Exception:
            pass
        await call.message.edit_text(
            call.message.text + f"\n\n✅ TASDIQLANDI | Login: {new_username}"
        )
    else:
        await call.answer("Xatolik!")
    await call.answer()


@router.callback_query(F.data.startswith("reject_"))
async def admin_reject(call: CallbackQuery):
    if call.from_user.id not in config.ADMIN_IDS:
        return await call.answer("❌ Ruxsat yo'q!")
    tg_id = int(call.data.split("_")[1])
    try:
        await call.bot.send_message(tg_id, "❌ <b>Arizangiz rad etildi.</b>", parse_mode="HTML")
    except Exception:
        pass
    await call.message.edit_text(call.message.text + "\n\n❌ RAD ETILDI")
    await call.answer()


@router.callback_query(F.data == "setup_pass")
async def setup_pass(call: CallbackQuery, state: FSMContext):
    user = await db.get_user_by_tg(call.from_user.id)
    if not user:
        return await call.answer("Xatolik!")
    await state.update_data(
        role="teacher",
        fullname=user.get("full_name", ""),
        username=user.get("username", f"teacher_{call.from_user.id}")
    )
    await state.set_state(RegState.password)
    await call.message.edit_text(
        f"👤 Loginingiz: <code>{user.get('username')}</code>\n\n🔑 <b>Parol yozing (kamida 6 belgi):</b>",
        parse_mode="HTML"
    )
    await call.answer()


@router.message(RegState.password, F.text)
async def reg_finish(message: Message, state: FSMContext):
    pw = message.text.strip()
    if len(pw) < 5:
        return await message.answer("⚠️ Parol juda qisqa!")
    data = await state.get_data()
    tg_id = message.from_user.id
    username = data.get("username", f"user_{tg_id}")
    fullname = data.get("fullname", "")
    role = data.get("role", "student")

    user_data = {
        "telegram_id": tg_id,
        "username": username,
        "full_name": fullname,
        "role": role,
        "password_hash": _hash(pw),
        "is_approved": True,
    }
    ok = await db.save_user(user_data)
    await state.clear()

    if ok:
        await message.answer(
            f"🎊 <b>Muvaffaqiyatli ro'yxatdan o'tdingiz!</b>\n\n"
            f"👤 Login: <code>{username}</code>\n"
            f"🌐 Sayt: {config.SITE_URL}\n\n"
            f"Botdan va saytdan foydalanishingiz mumkin!",
            reply_markup=main_menu(tg_id),
            parse_mode="HTML"
        )
    else:
        await message.answer("❌ Saqlashda xatolik. Admin bilan bog'laning.")
