import { BotTemplate } from './templates';

export const templatesPage4: BotTemplate[] = [
  // 🏥 SALOMATLIK (86-90)
  {id:'health-1',title:'💧 Suv Eslatma',description:'Kunlik suv ichishni eslatish.',category:'health',features:['Norma','Timer','Statistika','Motivatsiya'],
  code:`import asyncio,logging
from aiogram import Bot,Dispatcher,types
from aiogram.filters import Command
TOKEN="YOUR_TOKEN_HERE"
logging.basicConfig(level=logging.INFO)
async def main():
    bot=Bot(token=TOKEN);dp=Dispatcher()
    @dp.message(Command("start"))
    async def start(m:types.Message):await m.answer("💧 Qadamlar va Suv\\n/suv 250 - Xar ichganda yozing (ml)")
    @dp.message(Command("suv"))
    async def add(m:types.Message):
        await m.answer("✅ 250 ml qo'shildi! Kunlik: 1/10 stakan")
    await dp.start_polling(bot)
if __name__=="__main__":asyncio.run(main())`},
  {id:'health-2',title:'⚖️ BMI Kalkulyator',description:'Tana vazn indeksini hisoblash.',category:'health',features:['Vazn','Bo\'y','Diagnostika','Maslahat'],
  code:`import asyncio,logging
from aiogram import Bot,Dispatcher,types
from aiogram.filters import Command
TOKEN="YOUR_TOKEN_HERE"
logging.basicConfig(level=logging.INFO)
async def main():
    bot=Bot(token=TOKEN);dp=Dispatcher()
    @dp.message(Command("start"))
    async def start(m:types.Message):await m.answer("⚖️ BMI Hisob\\nVazningiz va bo'yingizni yozing! Masalan: 70 1.75")
    @dp.message()
    async def bmi(m:types.Message):
        parts=m.text.split()
        if len(parts)<2:return
        try:
            w,h=float(parts[0]),float(parts[1])
            b=w/(h*h)
            h_stat="Normal" if 18.5<=b<=24.9 else "Xavfli"
            await m.answer(f"⚖️ BMI: {b:.1f}\\nHolat: {h_stat}")
        except:pass
    await dp.start_polling(bot)
if __name__=="__main__":asyncio.run(main())`},
  {id:'health-3',title:'🥗 Kaloriya Hisobi',description:'Kunlik iste\'mol kaloriyasi.',category:'health',features:['Taomlar','Limit','Xabarnoma','Menyu'],
  code:`import asyncio,logging
from aiogram import Bot,Dispatcher,types
from aiogram.filters import Command
TOKEN="YOUR_TOKEN_HERE"
logging.basicConfig(level=logging.INFO)
cals={}
async def main():
    bot=Bot(token=TOKEN);dp=Dispatcher()
    @dp.message(Command("start"))
    async def start(m:types.Message):await m.answer("🥗 Kaloriya\\n/eat 300 Orlov - Taom qoshish")
    @dp.message(Command("eat"))
    async def eat(m:types.Message):
        parts=m.text.split()
        uid=m.from_user.id
        if len(parts)<2:return
        cals[uid]=cals.get(uid,0)+int(parts[1])
        await m.answer(f"✅ Jami kaloriya: {cals[uid]}")
    await dp.start_polling(bot)
if __name__=="__main__":asyncio.run(main())`},
  {id:'health-4',title:'🏃 Qadam O\'lchagich',description:'Kunlik qadamlarni qayd etish.',category:'health',features:['Kunlik','Oy','Liderboard','Stiker'],
  code:`import asyncio,logging
from aiogram import Bot,Dispatcher,types
from aiogram.filters import Command
TOKEN="YOUR_TOKEN_HERE"
logging.basicConfig(level=logging.INFO)
async def main():
    bot=Bot(token=TOKEN);dp=Dispatcher()
    @dp.message(Command("start"))
    async def start(m:types.Message):await m.answer("🏃 Qadam /step 5000")
    @dp.message(Command("step"))
    async def step(m:types.Message):await m.answer("✅ Yozildi. Maqsad 10.000!")
    await dp.start_polling(bot)
if __name__=="__main__":asyncio.run(main())`},
  {id:'health-5',title:'🛏 Uyqu Nazorati',description:'Uyqu rejimini kuzatish.',category:'health',features:['Uxlash','Uyğonish','Sifat','Jadval'],
  code:`import asyncio,logging
from aiogram import Bot,Dispatcher,types
from aiogram.filters import Command
TOKEN="YOUR_TOKEN_HERE"
logging.basicConfig(level=logging.INFO)
async def main():
    bot=Bot(token=TOKEN);dp=Dispatcher()
    @dp.message(Command("start"))
    async def start(m:types.Message):await m.answer("🛏 Uyqu nazorati. /sleep - Uxlash, /wake - Uygonish")
    @dp.message(Command("sleep"))
    async def go(m:types.Message):await m.answer("💤 Yaxshi dam oling!")
    @dp.message(Command("wake"))
    async def wake(m:types.Message):await m.answer("☀️ Xayrli tong! Yaxshi uxladizmi?")
    await dp.start_polling(bot)
if __name__=="__main__":asyncio.run(main())`},

  // 📰 YANGILIKLAR (91-95)
  {id:'news-1',title:'🌐 Texno Yangiliklar',description:'Texnologiya va IT yangiliklari.',category:'news',features:['Kunlik','Gadjet',"Dasturlash","Apple"],
  code:`import asyncio,logging
from aiogram import Bot,Dispatcher,types
from aiogram.filters import Command
TOKEN="YOUR_TOKEN_HERE"
logging.basicConfig(level=logging.INFO)
async def main():
    bot=Bot(token=TOKEN);dp=Dispatcher()
    @dp.message(Command("start"))
    async def start(m:types.Message):await m.answer("🌐 Texno News (Simulyatsiya)\\nEng so'nggi xabarlar uchun /news")
    @dp.message(Command("news"))
    async def n(m:types.Message):await m.answer("1. Apple yangi iPhone taqdim etdi.\\n2. AI vositalari rivojlanmoqda.")
    await dp.start_polling(bot)
if __name__=="__main__":asyncio.run(main())`},
  {id:'news-2',title:'⚽ Sport Yangiliklari',description:'Sport olami dagi oxirgi xabarlar.',category:'news',features:['Futbol','Transfer','Jadval','Live'],
  code:`import asyncio,logging
from aiogram import Bot,Dispatcher,types
from aiogram.filters import Command
TOKEN="YOUR_TOKEN_HERE"
logging.basicConfig(level=logging.INFO)
async def main():
    bot=Bot(token=TOKEN);dp=Dispatcher()
    @dp.message(Command("start"))
    async def start(m:types.Message):await m.answer("⚽ Sport. /live - Transferlar")
    @dp.message(Command("live"))
    async def t(m:types.Message):await m.answer("⚽ Real Madrid Mbappe bilan shartnoma qildi! (misol)")
    await dp.start_polling(bot)
if __name__=="__main__":asyncio.run(main())`},
  {id:'news-3',title:'📡 RSS O\'quvchi',description:'Saytlardan yangiliklarni o\'qish.',category:'news',features:['Kanallar','Xabarlar','Havola','Auto'],
  code:`import asyncio,logging
from aiogram import Bot,Dispatcher,types
from aiogram.filters import Command
TOKEN="YOUR_TOKEN_HERE"
logging.basicConfig(level=logging.INFO)
async def main():
    bot=Bot(token=TOKEN);dp=Dispatcher()
    @dp.message(Command("start"))
    async def start(m:types.Message):await m.answer("📡 RSS Reader")
    await dp.start_polling(bot)
if __name__=="__main__":asyncio.run(main())`},
  {id:'news-4',title:'📈 Bozor Yangiliklari',description:'Moliyaviy va bozor ma\'lumotlari.',category:'news',features:['Aksiya','Kripto','Forex','Tahlil'],
  code:`import asyncio,logging
from aiogram import Bot,Dispatcher,types
from aiogram.filters import Command
TOKEN="YOUR_TOKEN_HERE"
logging.basicConfig(level=logging.INFO)
async def main():
    bot=Bot(token=TOKEN);dp=Dispatcher()
    @dp.message(Command("start"))
    async def start(m:types.Message):await m.answer("📈 Birja va bozor.\\nOltin: 2300$")
    await dp.start_polling(bot)
if __name__=="__main__":asyncio.run(main())`},
  {id:'news-5',title:'📺 Ob-havo News',description:'Ob havo haqida kunlik byulleten.',category:'news',features:['Sahar','Tuman','Ogoh','Auto'],
  code:`import asyncio,logging
from aiogram import Bot,Dispatcher,types
from aiogram.filters import Command
TOKEN="YOUR_TOKEN_HERE"
logging.basicConfig(level=logging.INFO)
async def main():
    bot=Bot(token=TOKEN);dp=Dispatcher()
    @dp.message(Command("start"))
    async def start(m:types.Message):await m.answer("☁️ Bugun havo ochiq! Kunlik xabarlar keladi.")
    await dp.start_polling(bot)
if __name__=="__main__":asyncio.run(main())`},

  // 🤖 AI ASSISTANT (96-100)
  {id:'ai-1',title:'🤖 GPT Yordamchi',description:'Har qanday savolga javob (API).',category:'ai',features:['Matn','Chat','Tarjima','Xotira'],
  code:`import asyncio,logging
from aiogram import Bot,Dispatcher,types
from aiogram.filters import Command
TOKEN="YOUR_TOKEN_HERE"
logging.basicConfig(level=logging.INFO)
async def main():
    bot=Bot(token=TOKEN);dp=Dispatcher()
    @dp.message(Command("start"))
    async def start(m:types.Message):await m.answer("🤖 AI Chatbot tayyor! Savol bering")
    @dp.message()
    async def bot_ans(m:types.Message):await m.answer("Men AI botman. Savolingiz: "+m.text)
    await dp.start_polling(bot)
if __name__=="__main__":asyncio.run(main())`},
  {id:'ai-2',title:'📚 Matn Tahrirlovchi AI',description:'Xatolarni topuvchi aqlli bot.',category:'ai',features:['Grammatika','Tuzishish','Chiroyli','Uz/Ru/En'],
  code:`import asyncio,logging
from aiogram import Bot,Dispatcher,types
from aiogram.filters import Command
TOKEN="YOUR_TOKEN_HERE"
logging.basicConfig(level=logging.INFO)
async def main():
    bot=Bot(token=TOKEN);dp=Dispatcher()
    @dp.message(Command("start"))
    async def start(m:types.Message):await m.answer("📝 Matn Tahrirlovchi. Xato bilan yozing, men to'g'rilayman")
    @dp.message()
    async def fix(m:types.Message):await m.answer(f"✅ To'g'rilangan: {m.text.capitalize()}!")
    await dp.start_polling(bot)
if __name__=="__main__":asyncio.run(main())`},
  {id:'ai-3',title:'🇬🇧 Aqlli Tarjimon',description:'Matnni aniq tarjima qilish (Google/AI).',category:'ai',features:['Ko\'p tillar','Ovoz','Lug\'at','Sifat'],
  code:`import asyncio,logging
from aiogram import Bot,Dispatcher,types
from aiogram.filters import Command
TOKEN="YOUR_TOKEN_HERE"
logging.basicConfig(level=logging.INFO)
async def main():
    bot=Bot(token=TOKEN);dp=Dispatcher()
    @dp.message(Command("start"))
    async def start(m:types.Message):await m.answer("🇬🇧 Uz->En Tarjimon. Matn yozing")
    @dp.message()
    async def tr(m:types.Message):await m.answer("Translated: "+m.text)
    await dp.start_polling(bot)
if __name__=="__main__":asyncio.run(main())`},
  {id:'ai-4',title:'💻 Kod Yozuvchi AI',description:'Dasturchilar uchun kod fragmentlari.',category:'ai',features:['Python','JS','Html','Xato tuzatish'],
  code:`import asyncio,logging
from aiogram import Bot,Dispatcher,types
from aiogram.filters import Command
TOKEN="YOUR_TOKEN_HERE"
logging.basicConfig(level=logging.INFO)
async def main():
    bot=Bot(token=TOKEN);dp=Dispatcher()
    @dp.message(Command("start"))
    async def start(m:types.Message):await m.answer("💻 Qaysi tilda kod kerak?")
    @dp.message()
    async def py(m:types.Message):await m.answer(f"\`\`\`python\\nprint('{m.text}')\\n\`\`\`",parse_mode="Markdown")
    await dp.start_polling(bot)
if __name__=="__main__":asyncio.run(main())`},
  {id:'ai-5',title:'👩‍🍳 Pazanda AI',description:'Masalliqlarga qarab retsept yaratish.',category:'ai',features:['Retsept','Kaloriya','Pishirish','Rasm'],
  code:`import asyncio,logging
from aiogram import Bot,Dispatcher,types
from aiogram.filters import Command
TOKEN="YOUR_TOKEN_HERE"
logging.basicConfig(level=logging.INFO)
async def main():
    bot=Bot(token=TOKEN);dp=Dispatcher()
    @dp.message(Command("start"))
    async def start(m:types.Message):await m.answer("👩‍🍳 Uyda nima bor? (Masalan: tuxum, un)")
    @dp.message()
    async def rep(m:types.Message):await m.answer("🍳 Siz bulardan Quymoq qilishingiz mumkin!")
    await dp.start_polling(bot)
if __name__=="__main__":asyncio.run(main())`},
];
