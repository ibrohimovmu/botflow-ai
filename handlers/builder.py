from aiogram import Router, types, F
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.utils.keyboard import InlineKeyboardBuilder
from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup
from sqlalchemy import select
import json, asyncio
from datetime import datetime, timedelta

from database.models import async_session, UserBot
from services.ai_service import groq_edit_config, groq_verify_payment

router = Router()

class BuilderStates(StatesGroup):
    choosing_category = State()
    waiting_idea = State()
    waiting_answers = State()
    waiting_token = State()
    testing = State()
    awaiting_payment = State()
    waiting_for_receipt = State()

@router.message(F.web_app_data)
async def process_webapp_data(message: types.Message, state: FSMContext):
    data = json.loads(message.web_app_data.data)
    action = data.get("action")
    
    if action == "deploy_trial":
        await state.update_data(
            token=data.get("token"),
            selected_template=data.get("template")
        )
        # Validate token first
        from .finalize import validate_token
        bot_info = await validate_token(data.get("token"))
        if not bot_info:
            await message.answer("❌ Token xato! Mini App-ga qaytib tekshiring.")
            return
        
        await state.update_data(bot_username=bot_info.get("username", "unknown"))
        # Call the existing start_test logic
        # We simulate a callback to reuse code or just call a shared function
        class MockCallback:
            def __init__(self, msg):
                self.message = msg
                self.from_user = msg.from_user
        
        await start_test(MockCallback(message), state)

    elif action == "ai_edit":
        prompt = data.get("prompt")
        user_bots = await state.get_data()
        # Find the latest testing bot for this user 
        # (Simplified: assumes user has one trial bot)
        async with async_session() as session:
            q = select(UserBot).where(UserBot.owner_id == message.from_user.id, UserBot.status == "testing")
            bot = (await session.execute(q)).scalars().first()
            if bot:
                await message.answer(f"🚀 AI '{prompt}' so'rovi bo'yicha botingizni yangilamoqda...")
                new_config = await groq_edit_config(prompt, bot.config or "{}")
                bot.config = new_config
                await session.commit()
                await message.answer("✅ Bot yangilandi!")
    
    elif action == "payment_confirm":
        await message.answer("📸 Iltimos, to'lov chekini (screenshot) chatga yuboring. AI uni tekshiradi.")
        await state.set_state(BuilderStates.waiting_for_receipt)

# Template descriptions
TEMPLATE_DESC = {
    "shop": "🛒 <b>Do'kon boti</b>\n\n• Mahsulotlar katalogi\n• Savatcha va Buyurtma\n• To'lov tizimlari",
    "smm": "📢 <b>SMM boti</b>\n\n• Avto-post\n• Obuna tekshiruvi\n• Statistika",
    "game": "🎮 <b>O'yin boti</b>\n\n• Mini o'yinlar\n• Reyting tizimi\n• Bonuslar",
}

@router.callback_query(F.data == "wizard_start")
async def start_builder(callback: types.CallbackQuery, state: FSMContext):
    await state.clear()
    from keyboards.inline import get_categories_kb
    await callback.message.edit_text(
        "🛠 <b>Bot Konstruktor</b>\n\nQuyidagi yo'nalishlardan birini tanlang:",
        reply_markup=get_categories_kb(),
        parse_mode="HTML"
    )
    await state.set_state(BuilderStates.choosing_category)

@router.callback_query(F.data.startswith("cat_"))
async def start_idea_input(callback: types.CallbackQuery, state: FSMContext):
    category = callback.data.replace("cat_", "")
    await state.update_data(selected_category=category)
    await callback.message.edit_text(
        "💡 <b>Ajoyib tanlov!</b>\n\nEndi botingiz haqidagi g'oyangizni batafsilroq yozing. "
        "AI uni tahlil qilib, sizga savollar beradi.",
        parse_mode="HTML"
    )
    await state.set_state(BuilderStates.waiting_idea)

@router.message(BuilderStates.waiting_idea)
async def process_idea(message: types.Message, state: FSMContext):
    idea = message.text
    waiting = await message.answer("🧠 <b>G'oyangiz tahlil qilinmoqda...</b>")
    
    from services.ai_service import groq_ask_questions
    questions = await groq_ask_questions(idea)
    
    await waiting.delete()
    await message.answer(
        f"📝 <b>Botni mukammal qilish uchun quyidagi savollarga javob bering:</b>\n\n{questions}"
    )
    await state.update_data(user_idea=idea)
    await state.set_state(BuilderStates.waiting_answers)

@router.message(BuilderStates.waiting_answers)
async def process_answers(message: types.Message, state: FSMContext):
    answers = message.text
    await state.update_data(user_answers=answers)
    
    await message.answer(
        "✅ <b>Ma'lumotlar qabul qilindi!</b>\n\nEndi botingizni sinab ko'rish uchun <b>Bot Token</b> kiritishingiz kerak.\n"
        "Tokenni @BotFather orqali olishingiz mumkin.",
        reply_markup=InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="🔑 Token kiritish", callback_data="input_token")]
        ])
    )

@router.callback_query(F.data == "input_token")
async def ask_token(callback: types.CallbackQuery, state: FSMContext):
    await callback.message.edit_text("🔑 <b>Bot tokenini yuboring:</b>")
    await state.set_state(BuilderStates.waiting_token)

@router.callback_query(F.data.startswith("select_"))
async def select_template_confirm(callback: types.CallbackQuery, state: FSMContext):
    template_id = callback.data.replace("select_", "")
    await state.update_data(selected_template=template_id)
    await callback.message.edit_text(
        "🔑 <b>Ajoyib! Bot tokenini kiriting:</b>",
        parse_mode="HTML"
    )
    await state.set_state(BuilderStates.waiting_token)

@router.message(BuilderStates.waiting_token)
async def process_token(message: types.Message, state: FSMContext):
    token = message.text.strip()
    if ":" not in token or len(token) < 30:
        await message.answer("❌ Noto'g'ri token. @BotFather'dan to'g'ri tokenni yuboring.")
        return
    
    waiting = await message.answer("⏳ <b>Token tekshirilmoqda...</b>")
    from .finalize import validate_token
    bot_info = await validate_token(token)
    
    if not bot_info:
        await waiting.edit_text("❌ <b>Token xato!</b> Iltimos, qaytadan kiriting.")
        return
    
    await state.update_data(token=token, bot_username=bot_info.get("username", "unknown"))
    await waiting.delete()
    
    # Offer 10-minute test mode
    kb = InlineKeyboardBuilder()
    kb.button(text="🚀 Boshlash: 10-minut test", callback_data="start_test")
    await message.answer(
        "✅ Token tasdiqlandi!\n\n💡 Endi 10 minutlik test rejimini boshlashingiz mumkin. Bot darhol ishga tushadi.",
        reply_markup=kb.as_markup(),
        parse_mode="HTML"
    )
    await state.set_state(BuilderStates.testing)

@router.callback_query(F.data == "start_test")
async def start_test(callback: types.CallbackQuery, state: FSMContext):
    data = await state.get_data()
    token = data.get("token")
    
    waiting = await callback.message.edit_text("🚀 <b>Bot ishga tushirilmoqda...</b>")
    
    # Generate code via AI
    from services.ai_service import generate_bot_architecture
    prompt = f"Kategoriya: {data.get('selected_category')}\nG'oya: {data.get('user_idea')}\nJavoblar: {data.get('user_answers')}"
    bot_code_raw = await generate_bot_architecture(prompt)
    
    # Extract code from Markdown
    import re
    code_match = re.search(r"```python\n(.*?)```", bot_code_raw, re.DOTALL)
    bot_code = code_match.group(1) if code_match else bot_code_raw
    
    # Inject token into code (safety check)
    bot_code = bot_code.replace("YOUR_BOT_TOKEN", token).replace("TOKEN", token)
    
    # Start subprocess
    import subprocess, sys, os
    script_name = f"temp_bot_{callback.from_user.id}.py"
    with open(script_name, "w", encoding="utf-8") as f:
        f.write(bot_code)
    
    try:
        process = subprocess.Popen([sys.executable, script_name])
        await state.update_data(proc_pid=process.pid, script_path=script_name)
    except Exception as e:
        await waiting.edit_text(f"❌ Xatolik: {e}")
        return

    async with async_session() as session:
        new_bot = UserBot(
            owner_id=callback.from_user.id,
            bot_name=data.get("bot_username", "unknown"),
            template=data.get("selected_category", "custom"),
            config=json.dumps({"pid": process.pid}),
            token=token,
            expires_at=datetime.utcnow() + timedelta(minutes=10),
            status="testing",
        )
        session.add(new_bot)
        await session.commit()
    
    asyncio.create_task(schedule_deletion(new_bot.id, 600, process.pid, script_name))
    
    kb = InlineKeyboardBuilder()
    kb.button(text="🛑 Testni to'xtatish", callback_data=f"stop_test:{new_bot.id}")
    kb.button(text="💎 Hostingga qo'yish (160k)", callback_data=f"pay_full:{new_bot.id}")
    kb.adjust(1)
    
    await waiting.edit_text(
        f"✅ <b>Bot muvaffaqiyatli ishga tushdi!</b>\n\n"
        f"👤 <b>Username:</b> @{data.get('bot_username')}\n"
        f"⏳ <b>Amal qilish muddati:</b> 10 daqiqa\n\n"
        f"Botingizga kirib ko'ring va natijani tekshiring.",
        reply_markup=kb.as_markup()
    )

@router.callback_query(F.data.startswith("edit_ai:"))
async def edit_ai_request(callback: types.CallbackQuery, state: FSMContext):
    bot_id = int(callback.data.split(":")[1])
    await callback.message.answer("📝 Botingizga nima qo'shmoqchisiz? (Masalan: 'Start tugmasini salomlashish qilib o'zgartir' yoki 'Reklama bo'limi qo'sh')")
    await state.update_data(edit_bot_id=bot_id)
    await state.set_state(BuilderStates.awaiting_payment) # Using this state to receive prompt

@router.message(BuilderStates.awaiting_payment)
async def process_ai_edit(message: types.Message, state: FSMContext):
    data = await state.get_data()
    bot_id = data.get("edit_bot_id")
    prompt = message.text
    
    waiting = await message.answer("🧠 <b>Aura AI o'ylamoqda...</b>")
    
    async with async_session() as session:
        bot = await session.get(UserBot, bot_id)
        if not bot:
            await waiting.edit_text("❌ Bot topilmadi yoki muddati tugagan.")
            return
            
        new_config = await groq_edit_config(prompt, bot.config or "{}")
        bot.config = new_config
        await session.commit()
        
    await waiting.edit_text("✅ <b>Bajarildi!</b>\n\nAI botingiz konfiguratsiyasini yangiladi. Sinab ko'ring!")
    await state.set_state(BuilderStates.testing)

@router.callback_query(F.data.startswith("pay_full:"))
async def start_payment(callback: types.CallbackQuery, state: FSMContext):
    bot_id = int(callback.data.split(":")[1])
    await callback.message.edit_text(
        "💎 <b>Doimiy Hosting Aktivatsiya</b>\n\n"
        "💰 Narxi: 160,000 so'm (Bir martalik)\n"
        "💳 Karta: <code>4444 8888 1111 2222</code> (Humo/Uzcard)\n\n"
        "📸 To'lovdan so'ng chekni (skrinshot) shu yerga yuboring. AI uni tekshiradi.",
        parse_mode="HTML"
    )
    await state.update_data(paying_bot_id=bot_id)
    await state.set_state(BuilderStates.waiting_for_receipt)

@router.message(BuilderStates.waiting_for_receipt, F.photo)
async def process_receipt(message: types.Message, state: FSMContext):
    data = await state.get_data()
    bot_id = data.get("paying_bot_id")
    
    confirm = await message.answer("🔄 <b>Chek tekshirilmoqda...</b>")
    
    # Placeholder validation
    await asyncio.sleep(2)
    is_valid = await groq_verify_payment(b"dummy")
    
    if is_valid:
        async with async_session() as session:
            bot = await session.get(UserBot, bot_id)
            if bot:
                bot.status = "active"
                bot.expires_at = None
                await session.commit()
                await confirm.edit_text("✅ <b>Tabriklaymiz!</b>\n\nTo'lov tasdiqlandi. Botingiz bir umrlik hostingga o'tkazildi! 🚀")
            else:
                await confirm.edit_text("❌ Xatolik: Bot topilmadi.")
    else:
        await confirm.edit_text("❌ Chek tasdiqlanmadi. Iltimos, haqiqiy chek yuboring.")
    
    await state.clear()

@router.callback_query(F.data.startswith("stop_test:"))
async def stop_test_handler(callback: types.CallbackQuery, state: FSMContext):
    bot_id = int(callback.data.split(":")[1])
    async with async_session() as session:
        bot = await session.get(UserBot, bot_id)
        if bot:
            try:
                config = json.loads(bot.config)
                import os, signal
                os.kill(config['pid'], signal.SIGTERM)
                os.remove(f"temp_bot_{callback.from_user.id}.py")
            except: pass
            await session.delete(bot)
            await session.commit()
    await callback.message.edit_text("🛑 <b>Test to'xtatildi va bot o'chirildi.</b>")

async def schedule_deletion(bot_id: int, delay: int, pid: int, script_path: str):
    await asyncio.sleep(delay)
    try:
        import os, signal
        os.kill(pid, signal.SIGTERM)
        if os.path.exists(script_path): os.remove(script_path)
    except: pass
    
    async with async_session() as session:
        bot = await session.get(UserBot, bot_id)
        if bot and bot.status == "testing":
            await session.delete(bot)
            await session.commit()
            print(f"Trial Bot {bot_id} (PID {pid}) deleted after timeout.")
