export interface BotTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  features: string[];
  code: string;
}

export const categories = [
  { id: 'shop', label: '🛒 Do\'kon & Biznes', count: 15 },
  { id: 'admin', label: '👤 Admin Panel', count: 10 },
  { id: 'edu', label: '📚 Ta\'lim', count: 10 },
  { id: 'game', label: '🎮 O\'yin', count: 10 },
  { id: 'channel', label: '📢 Kanal & Guruh', count: 10 },
  { id: 'chat', label: '💬 Muloqot', count: 10 },
  { id: 'tools', label: '🛠 Foydali', count: 10 },
  { id: 'creative', label: '🎨 Ijodiy', count: 5 },
  { id: 'finance', label: '💰 Moliya', count: 5 },
  { id: 'health', label: '🏥 Salomatlik', count: 5 },
  { id: 'news', label: '📰 Yangiliklar', count: 5 },
  { id: 'ai', label: '🤖 AI Assistant', count: 5 },
];

export const templates: BotTemplate[] = [
  // ═══════════════════════════════════════════
  // 🛒 DO'KON & BIZNES (1-15)
  // ═══════════════════════════════════════════
  {
    id: 'shop-1',
    title: '🛒 Onlayn Do\'kon Bot',
    description: 'Mahsulot katalogi, savatcha va buyurtma qabul qilish tizimi.',
    category: 'shop',
    features: ['Katalog', 'Savatcha', 'Buyurtma', 'Admin xabar'],
    code: `import asyncio, logging
from aiogram import Bot, Dispatcher, types, F
from aiogram.filters import Command
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton

TOKEN = "YOUR_TOKEN_HERE"
ADMIN_ID = 123456789  # O'zingizning Telegram ID

logging.basicConfig(level=logging.INFO)
cart = {}
products = {
    "iphone": {"name": "📱 iPhone 15", "price": 12000000},
    "macbook": {"name": "💻 MacBook Air", "price": 18000000},
    "airpods": {"name": "🎧 AirPods Pro", "price": 2500000},
}

async def main():
    bot = Bot(token=TOKEN)
    dp = Dispatcher()

    @dp.message(Command("start"))
    async def start(m: types.Message):
        await m.answer("🛍 Do'konimizga xush kelibsiz!\\n/katalog - Mahsulotlarni ko'rish\\n/savat - Savatchani ko'rish\\n/buyurtma - Buyurtma berish")

    @dp.message(Command("katalog"))
    async def catalog(m: types.Message):
        kb = InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text=f"{p['name']} - {p['price']:,} so'm", callback_data=f"add_{pid}")]
            for pid, p in products.items()
        ])
        await m.answer("📦 Mahsulotlar ro'yxati:", reply_markup=kb)

    @dp.callback_query(F.data.startswith("add_"))
    async def add_to_cart(cb: types.CallbackQuery):
        pid = cb.data.replace("add_", "")
        uid = cb.from_user.id
        if uid not in cart: cart[uid] = []
        cart[uid].append(pid)
        await cb.answer(f"✅ {products[pid]['name']} savatchaga qo'shildi!")

    @dp.message(Command("savat"))
    async def show_cart(m: types.Message):
        items = cart.get(m.from_user.id, [])
        if not items:
            await m.answer("🛒 Savatcha bo'sh")
            return
        total = sum(products[i]["price"] for i in items)
        text = "🛒 Savatchangiz:\\n" + "\\n".join(f"• {products[i]['name']}" for i in items)
        text += f"\\n\\n💰 Jami: {total:,} so'm"
        await m.answer(text)

    @dp.message(Command("buyurtma"))
    async def order(m: types.Message):
        items = cart.get(m.from_user.id, [])
        if not items:
            await m.answer("❌ Avval mahsulot tanlang! /katalog")
            return
        total = sum(products[i]["price"] for i in items)
        text = f"🆕 Yangi buyurtma!\\nMijoz: {m.from_user.full_name}\\nID: {m.from_user.id}\\n"
        text += "\\n".join(f"• {products[i]['name']}" for i in items)
        text += f"\\nJami: {total:,} so'm"
        await bot.send_message(ADMIN_ID, text)
        cart[m.from_user.id] = []
        await m.answer("✅ Buyurtmangiz qabul qilindi! Tez orada bog'lanamiz.")

    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())`
  },
  {
    id: 'shop-2',
    title: '🍕 Yetkazib Berish Bot',
    description: 'Ovqat yetkazib berish xizmati uchun buyurtma boti.',
    category: 'shop',
    features: ['Menyu', 'Manzil', 'Buyurtma holati', 'Admin'],
    code: `import asyncio, logging
from aiogram import Bot, Dispatcher, types, F
from aiogram.filters import Command
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup

TOKEN = "YOUR_TOKEN_HERE"
ADMIN_ID = 123456789
logging.basicConfig(level=logging.INFO)

class OrderState(StatesGroup):
    menu = State()
    address = State()
    phone = State()

menu_items = {"pizza": "🍕 Pizza - 45,000", "burger": "🍔 Burger - 30,000", "lavash": "🌯 Lavash - 25,000"}

async def main():
    bot = Bot(token=TOKEN)
    dp = Dispatcher()

    @dp.message(Command("start"))
    async def start(m: types.Message):
        await m.answer("🍕 Yetkazib Berish Xizmatiga Xush Kelibsiz!\\n/menyu - Taomlar\\n/buyurtma - Buyurtma berish")

    @dp.message(Command("menyu"))
    async def show_menu(m: types.Message):
        text = "📋 Menyu:\\n" + "\\n".join(f"• {v}" for v in menu_items.values())
        await m.answer(text)

    @dp.message(Command("buyurtma"))
    async def start_order(m: types.Message, state: FSMContext):
        await m.answer("Nima buyurtma qilasiz? (pizza/burger/lavash)")
        await state.set_state(OrderState.menu)

    @dp.message(OrderState.menu)
    async def get_menu(m: types.Message, state: FSMContext):
        await state.update_data(item=m.text)
        await m.answer("📍 Manzilingizni yozing:")
        await state.set_state(OrderState.address)

    @dp.message(OrderState.address)
    async def get_address(m: types.Message, state: FSMContext):
        await state.update_data(address=m.text)
        await m.answer("📞 Telefon raqamingiz:")
        await state.set_state(OrderState.phone)

    @dp.message(OrderState.phone)
    async def get_phone(m: types.Message, state: FSMContext):
        data = await state.get_data()
        await state.clear()
        text = f"🆕 YANGI BUYURTMA\\n👤 {m.from_user.full_name}\\n🍽 {data['item']}\\n📍 {data['address']}\\n📞 {m.text}"
        await bot.send_message(ADMIN_ID, text)
        await m.answer("✅ Buyurtma qabul qilindi! 30-40 daqiqada yetkazamiz.")

    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())`
  },
  {
    id: 'shop-3',
    title: '💈 Barber Shop Bot',
    description: 'Sartaroshxona uchun navbat va bron qilish tizimi.',
    category: 'shop',
    features: ['Bron', 'Vaqt tanlash', 'Eslatma', 'Admin'],
    code: `import asyncio, logging
from aiogram import Bot, Dispatcher, types, F
from aiogram.filters import Command
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton

TOKEN = "YOUR_TOKEN_HERE"
ADMIN_ID = 123456789
logging.basicConfig(level=logging.INFO)
bookings = {}
times = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"]

async def main():
    bot = Bot(token=TOKEN)
    dp = Dispatcher()

    @dp.message(Command("start"))
    async def start(m: types.Message):
        await m.answer("💈 Sartaroshxonaga xush kelibsiz!\\n/bron - Navbat olish\\n/navbatlar - Navbatlarimni ko'rish")

    @dp.message(Command("bron"))
    async def book(m: types.Message):
        kb = InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text=f"🕐 {t}", callback_data=f"book_{t}")]
            for t in times if t not in bookings
        ])
        await m.answer("Bo'sh vaqtlarni tanlang:", reply_markup=kb)

    @dp.callback_query(F.data.startswith("book_"))
    async def confirm_book(cb: types.CallbackQuery):
        time = cb.data.replace("book_", "")
        bookings[time] = cb.from_user.id
        await cb.message.edit_text(f"✅ {time} ga bron qilindi!\\nSizni kutamiz!")
        await bot.send_message(ADMIN_ID, f"📋 Yangi bron: {cb.from_user.full_name} - {time}")

    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())`
  },
  {
    id: 'shop-4',
    title: '🏨 Mehmonxona Bot',
    description: 'Xona bron qilish va narxlar haqida ma\'lumot.',
    category: 'shop',
    features: ['Xonalar', 'Bron', 'Narxlar', 'Aloqa'],
    code: `import asyncio, logging
from aiogram import Bot, Dispatcher, types, F
from aiogram.filters import Command
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton

TOKEN = "YOUR_TOKEN_HERE"
ADMIN_ID = 123456789
logging.basicConfig(level=logging.INFO)
rooms = {"standard": "🛏 Standard - 300,000/tun", "deluxe": "🏨 Deluxe - 500,000/tun", "suite": "👑 Suite - 1,000,000/tun"}

async def main():
    bot = Bot(token=TOKEN)
    dp = Dispatcher()

    @dp.message(Command("start"))
    async def start(m: types.Message):
        await m.answer("🏨 Mehmonxonamizga xush kelibsiz!\\n/xonalar - Xonalar\\n/bron - Bron qilish")

    @dp.message(Command("xonalar"))
    async def show_rooms(m: types.Message):
        text = "🏨 Mavjud xonalar:\\n" + "\\n".join(f"• {v}" for v in rooms.values())
        await m.answer(text)

    @dp.message(Command("bron"))
    async def book_room(m: types.Message):
        kb = InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text=v, callback_data=f"room_{k}")] for k, v in rooms.items()
        ])
        await m.answer("Qaysi xonani bron qilasiz?", reply_markup=kb)

    @dp.callback_query(F.data.startswith("room_"))
    async def confirm(cb: types.CallbackQuery):
        room = cb.data.replace("room_", "")
        await bot.send_message(ADMIN_ID, f"🆕 Bron: {cb.from_user.full_name} - {rooms[room]}")
        await cb.message.edit_text("✅ So'rov qabul qilindi! Tez orada bog'lanamiz.")

    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())`
  },
  {
    id: 'shop-5',
    title: '🚗 Avto Salon Bot',
    description: 'Avtomobil katalogi va test-drayv bron qilish.',
    category: 'shop',
    features: ['Katalog', 'Test-drayv', 'Kredit', 'Admin'],
    code: `import asyncio, logging
from aiogram import Bot, Dispatcher, types, F
from aiogram.filters import Command
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton

TOKEN = "YOUR_TOKEN_HERE"
ADMIN_ID = 123456789
logging.basicConfig(level=logging.INFO)
cars = {"cobalt": "🚗 Cobalt - 150 mln", "malibu": "🚙 Malibu - 300 mln", "tahoe": "🚐 Tahoe - 700 mln"}

async def main():
    bot = Bot(token=TOKEN)
    dp = Dispatcher()

    @dp.message(Command("start"))
    async def start(m: types.Message):
        await m.answer("🚗 Avto Salonga Xush Kelibsiz!\\n/katalog - Mashinalar\\n/testdrive - Test-drayv")

    @dp.message(Command("katalog"))
    async def catalog(m: types.Message):
        text = "🚗 Mavjud avtomobillar:\\n" + "\\n".join(f"• {v}" for v in cars.values())
        await m.answer(text)

    @dp.message(Command("testdrive"))
    async def test_drive(m: types.Message):
        kb = InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text=v.split(" - ")[0], callback_data=f"td_{k}")] for k, v in cars.items()
        ])
        await m.answer("Qaysi mashina uchun test-drayv?", reply_markup=kb)

    @dp.callback_query(F.data.startswith("td_"))
    async def td_confirm(cb: types.CallbackQuery):
        car = cb.data.replace("td_", "")
        await bot.send_message(ADMIN_ID, f"🆕 Test-drayv: {cb.from_user.full_name} - {cars[car]}")
        await cb.message.edit_text("✅ Test-drayv so'rovi yuborildi!")

    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())`
  },
  {
    id: 'shop-6',
    title: '👗 Kiyim Do\'koni Bot',
    description: 'Online kiyim-kechak do\'koni boti.',
    category: 'shop',
    features: ['Kategoriyalar', 'O\'lcham', 'Buyurtma', 'Narx'],
    code: `import asyncio, logging
from aiogram import Bot, Dispatcher, types, F
from aiogram.filters import Command
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton

TOKEN = "YOUR_TOKEN_HERE"
ADMIN_ID = 123456789
logging.basicConfig(level=logging.INFO)

async def main():
    bot = Bot(token=TOKEN)
    dp = Dispatcher()

    @dp.message(Command("start"))
    async def start(m: types.Message):
        kb = InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="👔 Erkaklar", callback_data="cat_men")],
            [InlineKeyboardButton(text="👗 Ayollar", callback_data="cat_women")],
            [InlineKeyboardButton(text="👶 Bolalar", callback_data="cat_kids")]
        ])
        await m.answer("👗 Kiyim Do'koniga Xush Kelibsiz!", reply_markup=kb)

    @dp.callback_query(F.data.startswith("cat_"))
    async def show_cat(cb: types.CallbackQuery):
        cats = {"men": "👔 Ko'ylak, Shim, Kostyum", "women": "👗 Ko'ylak, Yubka, Palto", "kids": "👶 Futbolka, Shim"}
        cat = cb.data.replace("cat_", "")
        await cb.message.edit_text(f"Mahsulotlar: {cats.get(cat, '')}\\nBuyurtma: /order")

    @dp.message(Command("order"))
    async def order(m: types.Message):
        await bot.send_message(ADMIN_ID, f"🆕 Buyurtma: {m.from_user.full_name} (ID: {m.from_user.id})")
        await m.answer("✅ Buyurtma qabul qilindi!")

    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())`
  },
  {
    id: 'shop-7', title: '💊 Dorixona Bot', description: 'Dori-darmonlar katalogi va buyurtma.', category: 'shop',
    features: ['Dorilar', 'Qidiruv', 'Yetkazish', 'Maslahat'],
    code: `import asyncio, logging
from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command
TOKEN = "YOUR_TOKEN_HERE"
ADMIN_ID = 123456789
logging.basicConfig(level=logging.INFO)
medicines = {"paracetamol": "💊 Paracetamol - 5,000", "aspirin": "💊 Aspirin - 8,000", "vitamin_c": "🍊 Vitamin C - 15,000"}

async def main():
    bot = Bot(token=TOKEN)
    dp = Dispatcher()
    @dp.message(Command("start"))
    async def start(m: types.Message):
        await m.answer("💊 Dorixonaga xush kelibsiz!\\n/dorilar - Ro'yxat\\n/qidiruv [nom] - Qidirish")
    @dp.message(Command("dorilar"))
    async def meds(m: types.Message):
        text = "💊 Dorilar:\\n" + "\\n".join(f"• {v}" for v in medicines.values())
        await m.answer(text)
    @dp.message(Command("qidiruv"))
    async def search(m: types.Message):
        q = m.text.replace("/qidiruv", "").strip().lower()
        found = [v for k, v in medicines.items() if q in k]
        await m.answer("\\n".join(found) if found else "❌ Topilmadi")
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())`
  },
  {
    id: 'shop-8', title: '🌺 Gul Do\'koni Bot', description: 'Gullar katalogi va yetkazib berish.', category: 'shop',
    features: ['Bukletlar', 'Yetkazish', 'Bayram', 'Sovg\'a'],
    code: `import asyncio, logging
from aiogram import Bot, Dispatcher, types, F
from aiogram.filters import Command
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
TOKEN = "YOUR_TOKEN_HERE"
ADMIN_ID = 123456789
logging.basicConfig(level=logging.INFO)
flowers = {"rose": "🌹 Atirgul buketi - 150,000", "tulip": "🌷 Lola buketi - 120,000", "mix": "💐 Aralash buket - 200,000"}

async def main():
    bot = Bot(token=TOKEN)
    dp = Dispatcher()
    @dp.message(Command("start"))
    async def start(m: types.Message):
        kb = InlineKeyboardMarkup(inline_keyboard=[[InlineKeyboardButton(text=v.split(" - ")[0], callback_data=f"fl_{k}")] for k, v in flowers.items()])
        await m.answer("🌺 Gul Do'koniga Xush Kelibsiz!", reply_markup=kb)
    @dp.callback_query(F.data.startswith("fl_"))
    async def order_flower(cb: types.CallbackQuery):
        fid = cb.data.replace("fl_", "")
        await bot.send_message(ADMIN_ID, f"🌺 Buyurtma: {cb.from_user.full_name} - {flowers[fid]}")
        await cb.message.edit_text(f"✅ {flowers[fid]} buyurtma qilindi! Yetkazamiz.")
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())`
  },
  {
    id: 'shop-9', title: '📱 Telefon Do\'koni', description: 'Smartfonlar va aksessuarlar.', category: 'shop',
    features: ['Telefon katalog', 'Narx', 'Taqqoslash', 'Buyurtma'],
    code: `import asyncio, logging
from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command
TOKEN = "YOUR_TOKEN_HERE"
ADMIN_ID = 123456789
logging.basicConfig(level=logging.INFO)

async def main():
    bot = Bot(token=TOKEN)
    dp = Dispatcher()
    @dp.message(Command("start"))
    async def start(m: types.Message):
        await m.answer("📱 Telefon Do'koniga Xush Kelibsiz!\\n/phones - Telefonlar\\n/aksessuar - Aksessuarlar")
    @dp.message(Command("phones"))
    async def phones(m: types.Message):
        await m.answer("📱 Telefonlar:\\n• iPhone 15 - 12 mln\\n• Samsung S24 - 10 mln\\n• Xiaomi 14 - 5 mln\\n\\nBuyurtma: /order")
    @dp.message(Command("order"))
    async def order(m: types.Message):
        await bot.send_message(ADMIN_ID, f"📱 Buyurtma: {m.from_user.full_name}")
        await m.answer("✅ Qabul qilindi!")
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())`
  },
  {
    id: 'shop-10', title: '🎂 Tort Buyurtma Bot', description: 'Tort va shirinliklar buyurtma qilish.', category: 'shop',
    features: ['Tort katalog', 'Maxsus buyurtma', 'Sana tanlash', 'Admin'],
    code: `import asyncio, logging
from aiogram import Bot, Dispatcher, types, F
from aiogram.filters import Command
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
TOKEN = "YOUR_TOKEN_HERE"
ADMIN_ID = 123456789
logging.basicConfig(level=logging.INFO)
class TortOrder(StatesGroup):
    flavor = State()
    date = State()
    phone = State()

async def main():
    bot = Bot(token=TOKEN)
    dp = Dispatcher()
    @dp.message(Command("start"))
    async def start(m: types.Message):
        await m.answer("🎂 Tort Buyurtma Botiga Xush Kelibsiz!\\n/buyurtma - Tort buyurtma qilish")
    @dp.message(Command("buyurtma"))
    async def order(m: types.Message, state: FSMContext):
        await m.answer("Qanday tort? (shokoladli/mevalii/oqlangan)")
        await state.set_state(TortOrder.flavor)
    @dp.message(TortOrder.flavor)
    async def flavor(m: types.Message, state: FSMContext):
        await state.update_data(flavor=m.text)
        await m.answer("📅 Qachonga kerak? (kun.oy)")
        await state.set_state(TortOrder.date)
    @dp.message(TortOrder.date)
    async def date(m: types.Message, state: FSMContext):
        await state.update_data(date=m.text)
        await m.answer("📞 Telefon raqamingiz:")
        await state.set_state(TortOrder.phone)
    @dp.message(TortOrder.phone)
    async def phone(m: types.Message, state: FSMContext):
        data = await state.get_data()
        await state.clear()
        await bot.send_message(ADMIN_ID, f"🎂 BUYURTMA\\n{m.from_user.full_name}\\nTort: {data['flavor']}\\nSana: {data['date']}\\nTel: {m.text}")
        await m.answer("✅ Buyurtma qabul qilindi!")
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())`
  },
  {
    id: 'shop-11', title: '🧹 Tozalash Xizmati', description: 'Uy tozalash xizmati buyurtma qilish.', category: 'shop',
    features: ['Xizmat turlari', 'Manzil', 'Vaqt', 'Narx'],
    code: `import asyncio, logging
from aiogram import Bot, Dispatcher, types, F
from aiogram.filters import Command
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
TOKEN = "YOUR_TOKEN_HERE"
ADMIN_ID = 123456789
logging.basicConfig(level=logging.INFO)

async def main():
    bot = Bot(token=TOKEN)
    dp = Dispatcher()
    @dp.message(Command("start"))
    async def start(m: types.Message):
        kb = InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="🏠 Uy tozalash - 200k", callback_data="clean_home")],
            [InlineKeyboardButton(text="🏢 Ofis tozalash - 500k", callback_data="clean_office")],
            [InlineKeyboardButton(text="🧽 Gilam yuvish - 100k", callback_data="clean_carpet")]
        ])
        await m.answer("🧹 Tozalash Xizmatiga Xush Kelibsiz!", reply_markup=kb)
    @dp.callback_query(F.data.startswith("clean_"))
    async def book(cb: types.CallbackQuery):
        await bot.send_message(ADMIN_ID, f"🧹 Xizmat: {cb.data} - {cb.from_user.full_name}")
        await cb.message.edit_text("✅ So'rov yuborildi! Operator aloqaga chiqadi.")
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())`
  },
  {
    id: 'shop-12', title: '🏋️ Sport Zal Bot', description: 'Abonement sotish va dars jadvali.', category: 'shop',
    features: ['Jadval', 'Abonement', 'Trener', 'Aksiya'],
    code: `import asyncio, logging
from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command
TOKEN = "YOUR_TOKEN_HERE"
ADMIN_ID = 123456789
logging.basicConfig(level=logging.INFO)

async def main():
    bot = Bot(token=TOKEN)
    dp = Dispatcher()
    @dp.message(Command("start"))
    async def start(m: types.Message):
        await m.answer("🏋️ Sport Zalga Xush Kelibsiz!\\n/jadval - Dars jadvali\\n/abonement - Narxlar\\n/trener - Trenerlar")
    @dp.message(Command("jadval"))
    async def schedule(m: types.Message):
        await m.answer("📅 Jadval:\\n🕐 08:00 - Yoga\\n🕙 10:00 - Kardio\\n🕐 14:00 - Kuch mashqlari\\n🕔 17:00 - Box")
    @dp.message(Command("abonement"))
    async def pricing(m: types.Message):
        await m.answer("💳 Narxlar:\\n• 1 oy - 300,000\\n• 3 oy - 750,000\\n• 1 yil - 2,500,000\\n\\nYozilish: /yozilish")
    @dp.message(Command("yozilish"))
    async def signup(m: types.Message):
        await bot.send_message(ADMIN_ID, f"🏋️ Yangi a'zo: {m.from_user.full_name} (ID: {m.from_user.id})")
        await m.answer("✅ So'rov yuborildi!")
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())`
  },
  {
    id: 'shop-13', title: '🎓 Kurs Sotish Bot', description: 'Online kurslar katalogi va sotib olish.', category: 'shop',
    features: ['Kurslar', 'To\'lov', 'Sertifikat', 'Chegirma'],
    code: `import asyncio, logging
from aiogram import Bot, Dispatcher, types, F
from aiogram.filters import Command
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
TOKEN = "YOUR_TOKEN_HERE"
ADMIN_ID = 123456789
logging.basicConfig(level=logging.INFO)
courses = {"python": "🐍 Python - 500,000", "english": "🇬🇧 Ingliz tili - 300,000", "design": "🎨 Dizayn - 400,000"}

async def main():
    bot = Bot(token=TOKEN)
    dp = Dispatcher()
    @dp.message(Command("start"))
    async def start(m: types.Message):
        await m.answer("🎓 Online Kurslar!\\n/kurslar - Barcha kurslar")
    @dp.message(Command("kurslar"))
    async def show(m: types.Message):
        kb = InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text=v, callback_data=f"buy_{k}")] for k, v in courses.items()
        ])
        await m.answer("📚 Mavjud kurslar:", reply_markup=kb)
    @dp.callback_query(F.data.startswith("buy_"))
    async def buy(cb: types.CallbackQuery):
        cid = cb.data.replace("buy_", "")
        await bot.send_message(ADMIN_ID, f"💳 Kurs: {courses[cid]} - {cb.from_user.full_name}")
        await cb.message.edit_text(f"✅ {courses[cid]} uchun so'rov yuborildi!")
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())`
  },
  {
    id: 'shop-14', title: '🏠 Ko\'chmas Mulk Bot', description: 'Uy va kvartiralar e\'lonlari.', category: 'shop',
    features: ['E\'lonlar', 'Filtr', 'Aloqa', 'Joylashuv'],
    code: `import asyncio, logging
from aiogram import Bot, Dispatcher, types, F
from aiogram.filters import Command
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
TOKEN = "YOUR_TOKEN_HERE"
ADMIN_ID = 123456789
logging.basicConfig(level=logging.INFO)

async def main():
    bot = Bot(token=TOKEN)
    dp = Dispatcher()
    @dp.message(Command("start"))
    async def start(m: types.Message):
        kb = InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="🏠 Sotish", callback_data="type_sell")],
            [InlineKeyboardButton(text="🔑 Ijara", callback_data="type_rent")],
            [InlineKeyboardButton(text="📝 E'lon berish", callback_data="type_post")]
        ])
        await m.answer("🏠 Ko'chmas Mulk Botiga Xush Kelibsiz!", reply_markup=kb)
    @dp.callback_query(F.data.startswith("type_"))
    async def handle(cb: types.CallbackQuery):
        await bot.send_message(ADMIN_ID, f"🏠 So'rov: {cb.data} - {cb.from_user.full_name}")
        await cb.message.edit_text("✅ Operator tez orada bog'lanadi!")
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())`
  },
  {
    id: 'shop-15', title: '✂️ Go\'zallik Saloni', description: 'Go\'zallik saloni bron va xizmatlar.', category: 'shop',
    features: ['Xizmatlar', 'Master tanlash', 'Bron', 'Aksiya'],
    code: `import asyncio, logging
from aiogram import Bot, Dispatcher, types, F
from aiogram.filters import Command
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
TOKEN = "YOUR_TOKEN_HERE"
ADMIN_ID = 123456789
logging.basicConfig(level=logging.INFO)
services = {"soch": "✂️ Soch turmaklash - 80k", "tirnoq": "💅 Manikur - 60k", "makiyaj": "💄 Makiyaj - 150k"}

async def main():
    bot = Bot(token=TOKEN)
    dp = Dispatcher()
    @dp.message(Command("start"))
    async def start(m: types.Message):
        kb = InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text=v, callback_data=f"srv_{k}")] for k, v in services.items()
        ])
        await m.answer("💅 Go'zallik Saloniga Xush Kelibsiz!", reply_markup=kb)
    @dp.callback_query(F.data.startswith("srv_"))
    async def book(cb: types.CallbackQuery):
        sid = cb.data.replace("srv_", "")
        await bot.send_message(ADMIN_ID, f"💅 Bron: {services[sid]} - {cb.from_user.full_name}")
        await cb.message.edit_text(f"✅ {services[sid]} ga bron qilindi!")
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())`
  },

  // ═══════════════════════════════════════════
  // 👤 ADMIN PANEL (16-25)
  // ═══════════════════════════════════════════
  {
    id: 'admin-1',
    title: '👤 Universal Admin Bot',
    description: 'To\'liq admin panel: foydalanuvchilar, xabar yuborish, statistika.',
    category: 'admin',
    features: ['Foydalanuvchi boshqaruv', 'Broadcast', 'Statistika', 'Ban/Unban'],
    code: `import asyncio, logging, json, os
from aiogram import Bot, Dispatcher, types, F
from aiogram.filters import Command

TOKEN = "YOUR_TOKEN_HERE"
ADMIN_ID = 123456789  # O'zingizning Telegram ID
logging.basicConfig(level=logging.INFO)
USERS_FILE = "users.json"

def load_users():
    if os.path.exists(USERS_FILE):
        with open(USERS_FILE) as f: return json.load(f)
    return {"users": [], "banned": []}

def save_users(data):
    with open(USERS_FILE, "w") as f: json.dump(data, f)

async def main():
    bot = Bot(token=TOKEN)
    dp = Dispatcher()

    @dp.message(Command("start"))
    async def start(m: types.Message):
        data = load_users()
        if m.from_user.id not in data["users"]:
            data["users"].append(m.from_user.id)
            save_users(data)
        if m.from_user.id == ADMIN_ID:
            await m.answer("👑 Admin Panel\\n/stats - Statistika\\n/broadcast [xabar] - Hammaga yuborish\\n/ban [id] - Bloklash\\n/unban [id] - Blokdan chiqarish\\n/users - Foydalanuvchilar")
        else:
            await m.answer("Salom! Botga xush kelibsiz! 🎉")

    @dp.message(Command("stats"))
    async def stats(m: types.Message):
        if m.from_user.id != ADMIN_ID: return
        data = load_users()
        await m.answer(f"📊 Statistika:\\n👥 Foydalanuvchilar: {len(data['users'])}\\n🚫 Bloklangan: {len(data['banned'])}")

    @dp.message(Command("broadcast"))
    async def broadcast(m: types.Message):
        if m.from_user.id != ADMIN_ID: return
        text = m.text.replace("/broadcast", "").strip()
        if not text:
            await m.answer("❌ Xabar yozing: /broadcast Salom hammaga!")
            return
        data = load_users()
        sent = 0
        for uid in data["users"]:
            try:
                await bot.send_message(uid, text)
                sent += 1
            except: pass
        await m.answer(f"✅ {sent} kishiga yuborildi")

    @dp.message(Command("ban"))
    async def ban(m: types.Message):
        if m.from_user.id != ADMIN_ID: return
        uid = int(m.text.replace("/ban", "").strip())
        data = load_users()
        if uid not in data["banned"]: data["banned"].append(uid)
        save_users(data)
        await m.answer(f"🚫 {uid} bloklandi")

    @dp.message(Command("unban"))
    async def unban(m: types.Message):
        if m.from_user.id != ADMIN_ID: return
        uid = int(m.text.replace("/unban", "").strip())
        data = load_users()
        if uid in data["banned"]: data["banned"].remove(uid)
        save_users(data)
        await m.answer(f"✅ {uid} blokdan chiqarildi")

    @dp.message(Command("users"))
    async def users(m: types.Message):
        if m.from_user.id != ADMIN_ID: return
        data = load_users()
        await m.answer(f"👥 Jami: {len(data['users'])} foydalanuvchi")

    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())`
  },
  {
    id: 'admin-2', title: '📊 Statistika Bot', description: 'Foydalanuvchi statistikasi va grafiklar.', category: 'admin',
    features: ['Kunlik stat', 'Haftalik', 'Oylik', 'Export'],
    code: `import asyncio, logging, json, os
from datetime import datetime
from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command
TOKEN = "YOUR_TOKEN_HERE"
ADMIN_ID = 123456789
logging.basicConfig(level=logging.INFO)
stats = {"daily": {}, "total": 0}

async def main():
    bot = Bot(token=TOKEN)
    dp = Dispatcher()
    @dp.message(Command("start"))
    async def start(m: types.Message):
        today = datetime.now().strftime("%Y-%m-%d")
        stats["daily"][today] = stats["daily"].get(today, 0) + 1
        stats["total"] += 1
        await m.answer("Salom! /stats - Statistikani ko'rish")
    @dp.message(Command("stats"))
    async def show_stats(m: types.Message):
        if m.from_user.id != ADMIN_ID: return
        today = datetime.now().strftime("%Y-%m-%d")
        await m.answer(f"📊 Statistika:\\n📅 Bugun: {stats['daily'].get(today, 0)}\\n📈 Jami: {stats['total']}")
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())`
  },
  {
    id: 'admin-3', title: '📨 Broadcast Bot', description: 'Barcha foydalanuvchilarga xabar yuborish.', category: 'admin',
    features: ['Xabar tarqatish', 'Rasm bilan', 'Statistika', 'Scheduled'],
    code: `import asyncio, logging, json, os
from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command
TOKEN = "YOUR_TOKEN_HERE"
ADMIN_ID = 123456789
logging.basicConfig(level=logging.INFO)
users = set()

async def main():
    bot = Bot(token=TOKEN)
    dp = Dispatcher()
    @dp.message(Command("start"))
    async def start(m: types.Message):
        users.add(m.from_user.id)
        await m.answer("✅ Siz ro'yxatga olindingiz!")
    @dp.message(Command("send"))
    async def send(m: types.Message):
        if m.from_user.id != ADMIN_ID: return
        text = m.text.replace("/send", "").strip()
        sent = 0
        for uid in users:
            try:
                await bot.send_message(uid, text)
                sent += 1
            except: pass
        await m.answer(f"✅ {sent}/{len(users)} ga yuborildi")
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())`
  },
  {
    id: 'admin-4', title: '🔐 Obuna Tekshiruv', description: 'Kanalga obuna bo\'lganini tekshirish.', category: 'admin',
    features: ['Obuna tekshiruv', 'Kanal link', 'Avtomatik', 'Admin'],
    code: `import asyncio, logging
from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command
TOKEN = "YOUR_TOKEN_HERE"
CHANNEL_ID = "@your_channel"
logging.basicConfig(level=logging.INFO)

async def main():
    bot = Bot(token=TOKEN)
    dp = Dispatcher()
    @dp.message(Command("start"))
    async def start(m: types.Message):
        try:
            member = await bot.get_chat_member(CHANNEL_ID, m.from_user.id)
            if member.status in ["member", "administrator", "creator"]:
                await m.answer("✅ Siz obuna bo'lgansiz! Botdan foydalanishingiz mumkin.")
            else:
                await m.answer(f"❌ Avval kanalga obuna bo'ling: {CHANNEL_ID}")
        except:
            await m.answer(f"❌ Avval kanalga obuna bo'ling: {CHANNEL_ID}")
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())`
  },
  {
    id: 'admin-5', title: '🎰 Referral Bot', description: 'Taklif tizimi va mukofotlar.', category: 'admin',
    features: ['Referal link', 'Ball tizimi', 'Liderlar', 'Mukofot'],
    code: `import asyncio, logging
from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command
TOKEN = "YOUR_TOKEN_HERE"
logging.basicConfig(level=logging.INFO)
refs = {}

async def main():
    bot = Bot(token=TOKEN)
    dp = Dispatcher()
    @dp.message(Command("start"))
    async def start(m: types.Message):
        args = m.text.split()
        if len(args) > 1:
            ref_id = int(args[1])
            if ref_id != m.from_user.id:
                refs[ref_id] = refs.get(ref_id, 0) + 1
                try: await bot.send_message(ref_id, f"🎉 Yangi referal qo'shildi! Jami: {refs[ref_id]}")
                except: pass
        await m.answer(f"Salom!\\nSizning referal linkingiz:\\nhttps://t.me/BOT_USERNAME?start={m.from_user.id}\\n\\n/referallar - Statistika")
    @dp.message(Command("referallar"))
    async def my_refs(m: types.Message):
        count = refs.get(m.from_user.id, 0)
        await m.answer(f"👥 Sizning referallaringiz: {count}")
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())`
  },
  {
    id: 'admin-6', title: '📋 So\'rovnoma Bot', description: 'Ovoz berish va so\'rovnomalar yaratish.', category: 'admin',
    features: ['So\'rovnoma', 'Ovoz berish', 'Natijalar', 'Admin'],
    code: `import asyncio, logging
from aiogram import Bot, Dispatcher, types, F
from aiogram.filters import Command
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
TOKEN = "YOUR_TOKEN_HERE"
ADMIN_ID = 123456789
logging.basicConfig(level=logging.INFO)
votes = {"ha": 0, "yoq": 0}
voted = set()

async def main():
    bot = Bot(token=TOKEN)
    dp = Dispatcher()
    @dp.message(Command("sorovnoma"))
    async def poll(m: types.Message):
        if m.from_user.id != ADMIN_ID: return
        kb = InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="✅ Ha", callback_data="vote_ha"), InlineKeyboardButton(text="❌ Yo'q", callback_data="vote_yoq")]
        ])
        await m.answer("📋 So'rovnoma: Yangi bot kerakmi?", reply_markup=kb)
    @dp.callback_query(F.data.startswith("vote_"))
    async def vote(cb: types.CallbackQuery):
        if cb.from_user.id in voted:
            await cb.answer("Siz allaqachon ovoz bergansiz!")
            return
        voted.add(cb.from_user.id)
        choice = cb.data.replace("vote_", "")
        votes[choice] += 1
        await cb.answer(f"✅ Ovozingiz qabul qilindi! Ha: {votes['ha']} | Yo'q: {votes['yoq']}")
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())`
  },
  {
    id: 'admin-7', title: '🛡 Guruh Moderator', description: 'Guruhni boshqarish va moderatsiya.', category: 'admin',
    features: ['Ban/Mute', 'Filtr', 'Salomlash', 'Qoidalar'],
    code: `import asyncio, logging
from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command
TOKEN = "YOUR_TOKEN_HERE"
ADMIN_ID = 123456789
logging.basicConfig(level=logging.INFO)
bad_words = ["spam", "reklama", "havolak"]

async def main():
    bot = Bot(token=TOKEN)
    dp = Dispatcher()
    @dp.message(Command("start"))
    async def start(m: types.Message):
        await m.answer("🛡 Moderator Bot tayyor!\\n/qoidalar - Guruh qoidalari\\n/ban [reply] - Foydalanuvchini ban")
    @dp.message(Command("ban"))
    async def ban(m: types.Message):
        if m.from_user.id != ADMIN_ID: return
        if m.reply_to_message:
            await m.chat.ban(m.reply_to_message.from_user.id)
            await m.answer(f"🚫 {m.reply_to_message.from_user.full_name} bloklandi!")
    @dp.message()
    async def filter_msg(m: types.Message):
        if any(w in m.text.lower() for w in bad_words):
            await m.delete()
            await m.answer(f"⚠️ {m.from_user.first_name}, spam taqiqlangan!")
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())`
  },
  {
    id: 'admin-8', title: '📝 Feedback Bot', description: 'Anonim fikr va takliflar yig\'ish.', category: 'admin',
    features: ['Anonim', 'Javob', 'Kategoriya', 'Admin panel'],
    code: `import asyncio, logging
from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command
TOKEN = "YOUR_TOKEN_HERE"
ADMIN_ID = 123456789
logging.basicConfig(level=logging.INFO)

async def main():
    bot = Bot(token=TOKEN)
    dp = Dispatcher()
    @dp.message(Command("start"))
    async def start(m: types.Message):
        await m.answer("📝 Fikr-mulohaza boti\\nIstagan xabaringizni yozing, admin ko'radi.")
    @dp.message(lambda m: m.from_user.id != ADMIN_ID and not m.text.startswith("/"))
    async def forward_to_admin(m: types.Message):
        await bot.send_message(ADMIN_ID, f"📨 Yangi xabar\\nKim: {m.from_user.full_name} (ID: {m.from_user.id})\\n\\n{m.text}")
        await m.answer("✅ Xabaringiz admin'ga yuborildi!")
    @dp.message(Command("reply"))
    async def reply(m: types.Message):
        if m.from_user.id != ADMIN_ID: return
        parts = m.text.split(maxsplit=2)
        if len(parts) < 3: return
        uid, text = int(parts[1]), parts[2]
        await bot.send_message(uid, f"💬 Admin javobi: {text}")
        await m.answer("✅ Javob yuborildi")
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())`
  },
  {
    id: 'admin-9', title: '⏰ Eslatma Bot', description: 'Vaqtli eslatmalar va xabarnomalar.', category: 'admin',
    features: ['Eslatma', 'Timer', 'Takroriy', 'Xabarnoma'],
    code: `import asyncio, logging
from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command
TOKEN = "YOUR_TOKEN_HERE"
logging.basicConfig(level=logging.INFO)

async def main():
    bot = Bot(token=TOKEN)
    dp = Dispatcher()
    @dp.message(Command("start"))
    async def start(m: types.Message):
        await m.answer("⏰ Eslatma Bot\\n/eslatma [daqiqa] [matn] - Eslatma qo'yish")
    @dp.message(Command("eslatma"))
    async def remind(m: types.Message):
        parts = m.text.split(maxsplit=2)
        if len(parts) < 3:
            await m.answer("❌ Format: /eslatma 5 Choy ichish")
            return
        mins, text = int(parts[1]), parts[2]
        await m.answer(f"⏰ {mins} daqiqadan so'ng eslataman: {text}")
        await asyncio.sleep(mins * 60)
        await m.answer(f"🔔 ESLATMA: {text}")
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())`
  },
  {
    id: 'admin-10', title: '🎫 Tiket Tizimi', description: 'Murojaat va tiketlar tizimi.', category: 'admin',
    features: ['Tiket yaratish', 'Holat', 'Javob', 'Tarix'],
    code: `import asyncio, logging
from aiogram import Bot, Dispatcher, types, F
from aiogram.filters import Command
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
TOKEN = "YOUR_TOKEN_HERE"
ADMIN_ID = 123456789
logging.basicConfig(level=logging.INFO)
tickets = {}
ticket_counter = 0

async def main():
    bot = Bot(token=TOKEN)
    dp = Dispatcher()
    @dp.message(Command("start"))
    async def start(m: types.Message):
        await m.answer("🎫 Tiket Tizimi\\n/yangi [muammo] - Yangi tiket\\n/tiketlarim - Tiketlarim")
    @dp.message(Command("yangi"))
    async def new_ticket(m: types.Message):
        global ticket_counter
        ticket_counter += 1
        text = m.text.replace("/yangi", "").strip()
        tickets[ticket_counter] = {"user": m.from_user.id, "text": text, "status": "ochiq"}
        await bot.send_message(ADMIN_ID, f"🎫 Tiket #{ticket_counter}\\n{m.from_user.full_name}: {text}\\n\\nJavob: /javob {ticket_counter} [matn]")
        await m.answer(f"✅ Tiket #{ticket_counter} yaratildi!")
    @dp.message(Command("javob"))
    async def answer_ticket(m: types.Message):
        if m.from_user.id != ADMIN_ID: return
        parts = m.text.split(maxsplit=2)
        tid, reply = int(parts[1]), parts[2]
        if tid in tickets:
            tickets[tid]["status"] = "javob berildi"
            await bot.send_message(tickets[tid]["user"], f"💬 Tiket #{tid} javob:\\n{reply}")
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())`
  },
];
