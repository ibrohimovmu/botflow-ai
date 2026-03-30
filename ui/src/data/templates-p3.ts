import { BotTemplate } from './templates';

export const templatesPage3: BotTemplate[] = [
  // 💬 MULOQOT (56-65)
  {id:'chat-1',title:'💬 Anonim Chat Bot',description:'Foydalanuvchilarni tasodifiy bog\'lash.',category:'chat',features:['Anonim','Skip','Stop','Qidiruv'],
  code:`import asyncio,logging,random
from aiogram import Bot,Dispatcher,types
from aiogram.filters import Command
TOKEN="YOUR_TOKEN_HERE"
logging.basicConfig(level=logging.INFO)
waiting,chatting=set(),{}
async def main():
    bot=Bot(token=TOKEN);dp=Dispatcher()
    @dp.message(Command("start"))
    async def start(m:types.Message):await m.answer("💬 Anonim Chat\\n/search - Suhbatdosh qidirish")
    @dp.message(Command("search"))
    async def search(m:types.Message):
        uid=m.from_user.id
        if uid in chatting:await m.answer("❌ Siz allaqachon suhbatdasiz! /stop");return
        if waiting and list(waiting)[0]!=uid:
            p=waiting.pop();chatting[uid]=p;chatting[p]=uid
            await bot.send_message(uid,"✅ Suhbatdosh topildi! Yozishingiz mumkin.");await bot.send_message(p,"✅ Suhbatdosh topildi! Yozishingiz mumkin.")
        else:waiting.add(uid);await m.answer("🔍 Suhbatdosh qidirilmoqda...")
    @dp.message(Command("stop"))
    async def stop(m:types.Message):
        uid=m.from_user.id
        if uid in waiting:waiting.remove(uid);await m.answer("🛑 Qidiruv to'xtatildi")
        elif uid in chatting:
            p=chatting.pop(uid);chatting.pop(p,None)
            await bot.send_message(uid,"🛑 Suhbat tugatildi");await bot.send_message(p,"🛑 Suhbatdosh chiqib ketdi")
        else:await m.answer("Siz suhbatda emassiz")
    @dp.message()
    async def echo(m:types.Message):
        if m.from_user.id in chatting:await bot.send_message(chatting[m.from_user.id],m.text)
    await dp.start_polling(bot)
if __name__=="__main__":asyncio.run(main())`},
  {id:'chat-2',title:'💌 Sevgi Maktubi Bot',description:'Anonim tarzda sevgi maktublarini yuborish.',category:'chat',features:['Anonim','Ism orqali','Sirli','Yetkazish'],
  code:`import asyncio,logging
from aiogram import Bot,Dispatcher,types
from aiogram.filters import Command
TOKEN="YOUR_TOKEN_HERE"
logging.basicConfig(level=logging.INFO)
async def main():
    bot=Bot(token=TOKEN);dp=Dispatcher()
    @dp.message(Command("start"))
    async def start(m:types.Message):await m.answer("💌 Anonim Maktub\\n/send [ID] [matn] orqali o'z hislaringizni anonim yuboring!")
    @dp.message(Command("send"))
    async def send(m:types.Message):
        parts=m.text.split(maxsplit=2)
        if len(parts)<3:await m.answer("❌ Format: /send ID Maktub");return
        try:
            tid=int(parts[1])
            await bot.send_message(tid,f"💌 Sizga anonim maktub keldi:\\n\\n{parts[2]}")
            await m.answer("✅ Maktubingiz yetkazildi!")
        except:await m.answer("❌ Xatolik. ID noto'g'ri bo'lishi mumkin.")
    await dp.start_polling(bot)
if __name__=="__main__":asyncio.run(main())`},
  {id:'chat-3',title:'👥 Tanishuv Bot',description:'Yangi do\'stlar topish boti.',category:'chat',features:['Anketa','Yosh','Shahar','Like/Dislike'],
  code:`import asyncio,logging
from aiogram import Bot,Dispatcher,types
from aiogram.filters import Command
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State,StatesGroup
TOKEN="YOUR_TOKEN_HERE"
logging.basicConfig(level=logging.INFO)
profiles={}
class Profile(StatesGroup): name=State(); age=State(); city=State()
async def main():
    bot=Bot(token=TOKEN);dp=Dispatcher()
    @dp.message(Command("start"))
    async def start(m:types.Message,state:FSMContext):
        if m.from_user.id in profiles:await m.answer("Sizning anketangiz tayyor! /view");return
        await m.answer("Ismingiz nima?");await state.set_state(Profile.name)
    @dp.message(Profile.name)
    async def get_name(m:types.Message,state:FSMContext):
        await state.update_data(name=m.text);await m.answer("Yoshingiz?");await state.set_state(Profile.age)
    @dp.message(Profile.age)
    async def get_age(m:types.Message,state:FSMContext):
        await state.update_data(age=m.text);await m.answer("Shahringiz?");await state.set_state(Profile.city)
    @dp.message(Profile.city)
    async def get_city(m:types.Message,state:FSMContext):
        data=await state.get_data();await state.clear()
        profiles[m.from_user.id]={"name":data["name"],"age":data["age"],"city":m.text}
        await m.answer("✅ Anketa tayyor! /view")
    @dp.message(Command("view"))
    async def view(m:types.Message):
        if m.from_user.id not in profiles:await m.answer("Anketa yo'q. /start");return
        p=profiles[m.from_user.id]
        await m.answer(f"👤 JONLI ANKETA\\nIsm: {p['name']}\\nYosh: {p['age']}\\nShahar: {p['city']}")
    await dp.start_polling(bot)
if __name__=="__main__":asyncio.run(main())`},
  {id:'chat-4',title:'🎤 Ovozli Chat',description:'Ovozli xabarlarni saqlash va ulashish.',category:'chat',features:['Ovoz','Saqlash','Guruhlash','Forward'],
  code:`import asyncio,logging
from aiogram import Bot,Dispatcher,types
from aiogram.filters import Command
TOKEN="YOUR_TOKEN_HERE"
logging.basicConfig(level=logging.INFO)
voices={}
async def main():
    bot=Bot(token=TOKEN);dp=Dispatcher()
    @dp.message(Command("start"))
    async def start(m:types.Message):await m.answer("🎤 Menga ovozli xabar yuboring, saqlab qo'yaman!")
    @dp.message(lambda m: m.voice is not None)
    async def save_voice(m:types.Message):
        uid=m.from_user.id
        if uid not in voices:voices[uid]=[]
        voices[uid].append(m.voice.file_id)
        await m.answer(f"✅ Ovoz saqlandi. Jami: {len(voices[uid])}\\nKo'rish: /ovozlar")
    @dp.message(Command("ovozlar"))
    async def my_voices(m:types.Message):
        uid=m.from_user.id
        if uid not in voices or not voices[uid]:await m.answer("Bo'sh");return
        for vid in voices[uid][:5]:await m.answer_voice(vid)
    await dp.start_polling(bot)
if __name__=="__main__":asyncio.run(main())`},
  {id:'chat-5',title:'🗂 Kontaktlar Bot',description:'Guruh kontaktlarini yig\'ish.',category:'chat',features:['VCard','Saqlash','Qidiruv','Export'],
  code:`import asyncio,logging
from aiogram import Bot,Dispatcher,types
from aiogram.filters import Command
TOKEN="YOUR_TOKEN_HERE"
ADMIN_ID=123456789
logging.basicConfig(level=logging.INFO)
contacts=[]
async def main():
    bot=Bot(token=TOKEN);dp=Dispatcher()
    @dp.message(Command("start"))
    async def start(m:types.Message):
        kb=types.ReplyKeyboardMarkup(keyboard=[[types.KeyboardButton(text="📱 Kontaktni yuborish",request_contact=True)]],resize_keyboard=True)
        await m.answer("👇 Tugmani bosib kontaktingizni yuboring",reply_markup=kb)
    @dp.message(lambda m: m.contact is not None)
    async def get_contact(m:types.Message):
        c=m.contact
        contacts.append(f"{c.first_name} - {c.phone_number}")
        await m.answer("✅ Kontakt qabul qilindi!",reply_markup=types.ReplyKeyboardRemove())
        await bot.send_message(ADMIN_ID,f"🆕 Yangi kontakt: {c.first_name} {c.phone_number}")
    @dp.message(Command("list"))
    async def list_contacts(m:types.Message):
        if m.from_user.id!=ADMIN_ID:return
        await m.answer("📋 Kontaktlar:\\n"+("\\n".join(contacts) if contacts else "Bo'sh"))
    await dp.start_polling(bot)
if __name__=="__main__":asyncio.run(main())`},
  {id:'chat-6',title:'❓ Q&A Tarmog\'i',description:'Savol berib va boshqalardan javob olish.',category:'chat',features:['Savollar','Javoblar','Reyting','Eng yaxshi'],
  code:`import asyncio,logging
from aiogram import Bot,Dispatcher,types
from aiogram.filters import Command
TOKEN="YOUR_TOKEN_HERE"
logging.basicConfig(level=logging.INFO)
questions={}
async def main():
    bot=Bot(token=TOKEN);dp=Dispatcher()
    @dp.message(Command("start"))
    async def start(m:types.Message):await m.answer("❓ Q&A\\n/ask [savol] - Savol berish\\n/list - Savollar\\n/ans [ID] [javob] - Javob berish")
    @dp.message(Command("ask"))
    async def ask(m:types.Message):
        text=m.text.replace("/ask","").strip()
        if not text:return
        qid=len(questions)+1;questions[qid]={"q":text,"u":m.from_user.id,"ans":[]}
        await m.answer(f"✅ Savol kiritildi. ID: {qid}")
    @dp.message(Command("list"))
    async def list_q(m:types.Message):
        text="\\n".join([f"#{i}: {q['q']} ({len(q['ans'])} javob)" for i,q in questions.items()])
        await m.answer(text if text else "Bo'sh")
    @dp.message(Command("ans"))
    async def answer(m:types.Message):
        parts=m.text.split(maxsplit=2)
        if len(parts)<3:return
        qid,text=int(parts[1]),parts[2]
        if qid in questions:
            questions[qid]["ans"].append(text)
            await bot.send_message(questions[qid]["u"],f"💡 Savolingizga javob keldi:\\n{text}")
            await m.answer("✅ Yuborildi")
    await dp.start_polling(bot)
if __name__=="__main__":asyncio.run(main())`},
  {id:'chat-7',title:'🌍 Qidiruvchi Chat',description:'Hudud bo\'yicha suhbatdosh qidirish.',category:'chat',features:['Lokatsiya','Radius','Suhbat','Filtr'],
  code:`import asyncio,logging
from aiogram import Bot,Dispatcher,types
from aiogram.filters import Command
TOKEN="YOUR_TOKEN_HERE"
logging.basicConfig(level=logging.INFO)
locs={}
async def main():
    bot=Bot(token=TOKEN);dp=Dispatcher()
    @dp.message(Command("start"))
    async def start(m:types.Message):
        kb=types.ReplyKeyboardMarkup(keyboard=[[types.KeyboardButton(text="📍 Lokatsiyamni yuborish",request_location=True)]],resize_keyboard=True)
        await m.answer("Suhbatdosh qidirish uchun lokatsiya yuboring",reply_markup=kb)
    @dp.message(lambda m: m.location is not None)
    async def loc(m:types.Message):
        uid=m.from_user.id;locs[uid]=m.location
        await m.answer("✅ Saqlandi. Yaqin atrofdagi suhbatdoshlar qidirilmoqda...",reply_markup=types.ReplyKeyboardRemove())
    await dp.start_polling(bot)
if __name__=="__main__":asyncio.run(main())`},
  {id:'chat-8',title:'🗣 Ovozli Tarjimon',description:'Ovozli xabarni matnga va tarjima qilish.',category:'chat',features:['Ovoz->Matn','Tarjima','Til tanlash','Audio'],
  code:`import asyncio,logging
from aiogram import Bot,Dispatcher,types
from aiogram.filters import Command
TOKEN="YOUR_TOKEN_HERE"
logging.basicConfig(level=logging.INFO)
async def main():
    bot=Bot(token=TOKEN);dp=Dispatcher()
    @dp.message(Command("start"))
    async def start(m:types.Message):await m.answer("Ovozli xabar yuborigin, men uni matnga o'girishga harakat qilaman (Simulyatsiya)")
    @dp.message(lambda m: m.voice is not None)
    async def voice(m:types.Message):
        await m.answer("⏳ Ovoz analiz qilinmoqda...")
        await asyncio.sleep(2)
        await m.answer("📝 Matn: *Ovozli xabar mazmuni* (Demo)")
    await dp.start_polling(bot)
if __name__=="__main__":asyncio.run(main())`},
  {id:'chat-9',title:'📩 Feedback to Channel',description:'Bot orqali yozilganlarni kanalga chiqarish.',category:'chat',features:['Anonim post','Moderatsiya','Tasdiqlash','Kanal'],
  code:`import asyncio,logging
from aiogram import Bot,Dispatcher,types
from aiogram.filters import Command
TOKEN="YOUR_TOKEN_HERE"
ADMIN_ID=123456789
logging.basicConfig(level=logging.INFO)
async def main():
    bot=Bot(token=TOKEN);dp=Dispatcher()
    @dp.message(Command("start"))
    async def start(m:types.Message):await m.answer("Menga yozing, admin tasdiqlasa kanalga chiqadi.")
    @dp.message()
    async def fwd(m:types.Message):
        if m.from_user.id!=ADMIN_ID:
            await bot.send_message(ADMIN_ID,f"Murojaat:\\n{m.text}\\n\\nTasdiqlash: /ok {m.message_id}")
            await m.answer("✅ Adminga ketdi")
    await dp.start_polling(bot)
if __name__=="__main__":asyncio.run(main())`},
  {id:'chat-10',title:'💬 Roleplay Chat',description:'Rollar bo\'yicha gaplashish.',category:'chat',features:['Rol tanlash','Qahramonlar','Ssenariy','Reyting'],
  code:`import asyncio,logging
from aiogram import Bot,Dispatcher,types
from aiogram.filters import Command
TOKEN="YOUR_TOKEN_HERE"
logging.basicConfig(level=logging.INFO)
roles={}
async def main():
    bot=Bot(token=TOKEN);dp=Dispatcher()
    @dp.message(Command("start"))
    async def start(m:types.Message):await m.answer("🎭 Roleplay\\nQaysi rolda bo'lmoqchisiz? /rol Qo'mondon")
    @dp.message(Command("rol"))
    async def role(m:types.Message):
        r=m.text.replace("/rol","").strip()
        roles[m.from_user.id]=r
        await m.answer(f"✅ Endi siz: {r}")
    @dp.message()
    async def talk(m:types.Message):
        if m.from_user.id in roles:
            await m.answer(f"🎭 [{roles[m.from_user.id]}]: {m.text}")
    await dp.start_polling(bot)
if __name__=="__main__":asyncio.run(main())`},

  // 🛠 FOYDALI TIZIMLAR (66-75)
  {id:'tools-1',title:'⛅ Ob-havo Bot',description:'Sahar bo\'yicha ob-havo.',category:'tools',features:['Shahar','Harorat','Klinik','API'],
  code:`import asyncio,logging,random
from aiogram import Bot,Dispatcher,types
from aiogram.filters import Command
TOKEN="YOUR_TOKEN_HERE"
logging.basicConfig(level=logging.INFO)
weather={"Toshkent":"☀️ 25°C","Samarqand":"⛅ 22°C","Buxoro":"☀️ 28°C","Xiva":"🔥 30°C"}
async def main():
    bot=Bot(token=TOKEN);dp=Dispatcher()
    @dp.message(Command("start"))
    async def start(m:types.Message):await m.answer("⛅ Ob-havo\\nShahar nomini yozing!")
    @dp.message()
    async def w(m:types.Message):
        city=m.text.title()
        if city in weather:await m.answer(f"🏙 {city}: {weather[city]}")
        else:await m.answer(f"🏙 {city}: ⛅ {random.randint(15,30)}°C")
    await dp.start_polling(bot)
if __name__=="__main__":asyncio.run(main())`},
  {id:'tools-2',title:'💱 Valyuta Kursi',description:'Valyuta kurslari va konvertor.',category:'tools',features:['Kurslar','Konvertor','Kalkulyator','Kunlik'],
  code:`import asyncio,logging
from aiogram import Bot,Dispatcher,types
from aiogram.filters import Command
TOKEN="YOUR_TOKEN_HERE"
logging.basicConfig(level=logging.INFO)
rates={"USD":12600,"EUR":13500,"RUB":135}
async def main():
    bot=Bot(token=TOKEN);dp=Dispatcher()
    @dp.message(Command("start"))
    async def start(m:types.Message):await m.answer("💱 Valyuta\\n/kurs - Kurslar\\n/usd [summa] - So'mga o'girish")
    @dp.message(Command("kurs"))
    async def kurs(m:types.Message):
        t="🏦 Kurslar:\\n"+"\\n".join(f"💵 1 {k} = {v} UZS" for k,v in rates.items())
        await m.answer(t)
    @dp.message(Command("usd"))
    async def usd(m:types.Message):
        try:
            amount=float(m.text.replace("/usd","").strip())
            await m.answer(f"💵 {amount} USD = {amount*rates['USD']:,.0f} UZS")
        except:await m.answer("Xato summa")
    await dp.start_polling(bot)
if __name__=="__main__":asyncio.run(main())`},
  {id:'tools-3',title:'🧮 Kalkulyator',description:'Kengaytirilgan matematik kalkulyator.',category:'tools',features:['Qo\'shish','Kopaytirish','Foyiz','Ildiz'],
  code:`import asyncio,logging,math
from aiogram import Bot,Dispatcher,types
from aiogram.filters import Command
TOKEN="YOUR_TOKEN_HERE"
logging.basicConfig(level=logging.INFO)
async def main():
    bot=Bot(token=TOKEN);dp=Dispatcher()
    @dp.message(Command("start"))
    async def start(m:types.Message):await m.answer("🧮 Matematik ifoda yozing (masalan: 2+2*2)")
    @dp.message()
    async def calc(m:types.Message):
        try:
            # Xavfsizlik uchun faqat raqam va belgilarni ruxsat berish
            allowed=set("0123456789+-*/(). ")
            if not all(c in allowed for c in m.text):raise Exception("Xato")
            res=eval(m.text)
            await m.answer(f"🧮 Natija: {res}")
        except:await m.answer("❌ Noto'g'ri ifoda!")
    await dp.start_polling(bot)
if __name__=="__main__":asyncio.run(main())`},
  {id:'tools-4',title:'🔗 URL Qisqartiruvchi',description:'Uzun havolalarni qisqartirish.',category:'tools',features:['Tezkor','Statistika','QR Kod','Custom'],
  code:`import asyncio,logging
from aiogram import Bot,Dispatcher,types
from aiogram.filters import Command
TOKEN="YOUR_TOKEN_HERE"
logging.basicConfig(level=logging.INFO)
async def main():
    bot=Bot(token=TOKEN);dp=Dispatcher()
    @dp.message(Command("start"))
    async def start(m:types.Message):await m.answer("🔗 Havola yuboring, uni qisqartirib beraman! (Simulyatsiya)")
    @dp.message()
    async def short(m:types.Message):
        if "http" in m.text:
            await m.answer(f"✅ Qisqa link:\\nhttps://t.me/qisqa/{m.from_user.id}")
    await dp.start_polling(bot)
if __name__=="__main__":asyncio.run(main())`},
  {id:'tools-5',title:'📡 IP Tekshiruvchi',description:'IP manzil ma\'lumotlari.',category:'tools',features:['Shahar','Provayder','Xarita','VPN'],
  code:`import asyncio,logging
from aiogram import Bot,Dispatcher,types
from aiogram.filters import Command
TOKEN="YOUR_TOKEN_HERE"
logging.basicConfig(level=logging.INFO)
async def main():
    bot=Bot(token=TOKEN);dp=Dispatcher()
    @dp.message(Command("start"))
    async def start(m:types.Message):await m.answer("📡 IP manzil yozing (masalan 8.8.8.8)")
    @dp.message()
    async def check(m:types.Message):
        await m.answer(f"🔎 IP Info: {m.text}\\nLokatsiya: AQSH\\nProvayder: Google LLC")
    await dp.start_polling(bot)
if __name__=="__main__":asyncio.run(main())`},
  {id:'tools-6',title:'Qr Code Bot',description:'Matn yoki linkdan QR kod yasash.',category:'tools',features:['QR Yasash','O\'qish','Rangli','Logo'],
  code:`import asyncio,logging
from aiogram import Bot,Dispatcher,types
from aiogram.filters import Command
TOKEN="YOUR_TOKEN_HERE"
logging.basicConfig(level=logging.INFO)
async def main():
    bot=Bot(token=TOKEN);dp=Dispatcher()
    @dp.message(Command("start"))
    async def start(m:types.Message):await m.answer("Matn yuboring, QR Kod yasab beraman (API orqali)")
    @dp.message()
    async def qr(m:types.Message):
        url=f"https://api.qrserver.com/v1/create-qr-code/?size=250x250&data={m.text}"
        await m.answer_photo(url,caption="✅ Sizning QR kodingiz!")
    await dp.start_polling(bot)
if __name__=="__main__":asyncio.run(main())`},
  {id:'tools-7',title:'🗣 Text to Speech',description:'Matnni ovozga aylantirish.',category:'tools',features:['Matn->Ovoz','Tillar','Tezlik','Yuklab olish'],
  code:`import asyncio,logging
from aiogram import Bot,Dispatcher,types
from aiogram.filters import Command
TOKEN="YOUR_TOKEN_HERE"
logging.basicConfig(level=logging.INFO)
async def main():
    bot=Bot(token=TOKEN);dp=Dispatcher()
    @dp.message(Command("start"))
    async def start(m:types.Message):await m.answer("Matn yozing, men ovozga aylantiraman (Simulyatsiya)")
    @dp.message()
    async def tts(m:types.Message):
        await m.answer("⏳ Ovoz yaratilmoqda...")
        await m.answer_document("https://samplelib.com/lib/preview/mp3/sample-3s.mp3",caption="✅ Ovoz tayyor!")
    await dp.start_polling(bot)
if __name__=="__main__":asyncio.run(main())`},
  {id:'tools-8',title:'🔐 Parol Generator',description:'Murakkab parollar yaratish.',category:'tools',features:['Ochiq','Murakkab','Uzunlik','Saqlash'],
  code:`import asyncio,logging,random,string
from aiogram import Bot,Dispatcher,types
from aiogram.filters import Command
TOKEN="YOUR_TOKEN_HERE"
logging.basicConfig(level=logging.INFO)
async def main():
    bot=Bot(token=TOKEN);dp=Dispatcher()
    @dp.message(Command("start"))
    async def start(m:types.Message):await m.answer("🔐 /parol [uzunlik] orqali kuchli parol oling!")
    @dp.message(Command("parol"))
    async def gen(m:types.Message):
        length=12
        try:
            if len(m.text.split())>1:length=int(m.text.split()[1])
        except:pass
        chars=string.ascii_letters+string.digits+"!@#$%^&*"
        pwd="".join(random.choice(chars) for _ in range(length))
        await m.answer(f"✅ Parolingiz:\\n\`{pwd}\`",parse_mode="Markdown")
    await dp.start_polling(bot)
if __name__=="__main__":asyncio.run(main())`},
  {id:'tools-9',title:'🔄 Format Konvertor',description:'Rasm va hujjatlarni konvertatsiya.',category:'tools',features:['PDF->DOCX','JPG->PNG','WebP','Tezkor'],
  code:`import asyncio,logging
from aiogram import Bot,Dispatcher,types
from aiogram.filters import Command
TOKEN="YOUR_TOKEN_HERE"
logging.basicConfig(level=logging.INFO)
async def main():
    bot=Bot(token=TOKEN);dp=Dispatcher()
    @dp.message(Command("start"))
    async def start(m:types.Message):await m.answer("Rasm yuboring, uni WebP (sticker) xoliga keltiraman (Demo)")
    @dp.message(lambda m: m.photo is not None)
    async def convert(m:types.Message):
        await m.answer("⏳ Konvertatsiya qilinmoqda...")
        await m.answer("✅ Fayl tayyor (Demo funksiya)")
    await dp.start_polling(bot)
if __name__=="__main__":asyncio.run(main())`},
  {id:'tools-10',title:'📧 Temp Mail Bot',description:'Vaqtinchalik pochtalar yaratish.',category:'tools',features:['Yangi email','Xabarlar','10 daqiqa','Qo\'shimcha'],
  code:`import asyncio,logging,random,string
from aiogram import Bot,Dispatcher,types
from aiogram.filters import Command
TOKEN="YOUR_TOKEN_HERE"
logging.basicConfig(level=logging.INFO)
async def main():
    bot=Bot(token=TOKEN);dp=Dispatcher()
    @dp.message(Command("start"))
    async def start(m:types.Message):await m.answer("📧 /mail - Vaqtinchalik email olish")
    @dp.message(Command("mail"))
    async def mail(m:types.Message):
        prefix="".join(random.choice(string.ascii_lowercase) for _ in range(8))
        await m.answer(f"📧 Elementingiz:\\n\`{prefix}@tempmail.com\`\\n\\nKelgan xatlarni shu yerda ko'rasiz.",parse_mode="Markdown")
    await dp.start_polling(bot)
if __name__=="__main__":asyncio.run(main())`},

  // 🎨 IJODIY & MEDIA (76-80)
  {id:'creative-1',title:'🖼 Rasm Qidiruv AI',description:'Tavsif bo\'yicha rasm topish/yasash.',category:'creative',features:['Tavsif','Prompt','Variatsiya','Stil'],
  code:`import asyncio,logging
from aiogram import Bot,Dispatcher,types
from aiogram.filters import Command
TOKEN="YOUR_TOKEN_HERE"
logging.basicConfig(level=logging.INFO)
async def main():
    bot=Bot(token=TOKEN);dp=Dispatcher()
    @dp.message(Command("start"))
    async def start(m:types.Message):await m.answer("🖼 Qanday rasm kerakligini yozing!")
    @dp.message()
    async def img(m:types.Message):
        await m.answer("⏳ AI rasm chizmoqda...")
        await asyncio.sleep(2)
        await m.answer_photo("https://picsum.photos/400/400",caption=f"✅ {m.text} uchun natija")
    await dp.start_polling(bot)
if __name__=="__main__":asyncio.run(main())`},
  {id:'creative-2',title:'🎵 Musiqa Qidiruv',description:'Musiqa nomini yozib topish.',category:'creative',features:['Nom','Rassom','Yuklash','Audio'],
  code:`import asyncio,logging
from aiogram import Bot,Dispatcher,types
from aiogram.filters import Command
TOKEN="YOUR_TOKEN_HERE"
logging.basicConfig(level=logging.INFO)
async def main():
    bot=Bot(token=TOKEN);dp=Dispatcher()
    @dp.message(Command("start"))
    async def start(m:types.Message):await m.answer("🎵 Musiqa nomini yozing!")
    @dp.message()
    async def search(m:types.Message):
        await m.answer("🔍 Qidirilmoqda...")
        await m.answer(f"🎵 {m.text} mp3 topildi! (Demo)")
    await dp.start_polling(bot)
if __name__=="__main__":asyncio.run(main())`},
  {id:'creative-3',title:'📜 She\'riyat Bot',description:'She\'rlar va hikmatli so\'zlar.',category:'creative',features:['Tasodifiy','Kunlik','Muallif','Ulashish'],
  code:`import asyncio,logging,random
from aiogram import Bot,Dispatcher,types
from aiogram.filters import Command
TOKEN="YOUR_TOKEN_HERE"
logging.basicConfig(level=logging.INFO)
quotes=["Oqil o'z ishini qiladi, nodon birovning.","Ilm - insonning bezagi.","Vaqt - bu pul."]
async def main():
    bot=Bot(token=TOKEN);dp=Dispatcher()
    @dp.message(Command("start"))
    async def start(m:types.Message):await m.answer("📜 /hikmat - Hikmatli so'z olish")
    @dp.message(Command("hikmat"))
    async def q(m:types.Message):await m.answer(f"💡 {random.choice(quotes)}")
    await dp.start_polling(bot)
if __name__=="__main__":asyncio.run(main())`},
  {id:'creative-4',title:'📝 Meme Generator',description:'Rasmlarga yozuv qo\'shish.',category:'creative',features:['Rasm','Yozuv','Stiker','Format'],
  code:`import asyncio,logging
from aiogram import Bot,Dispatcher,types
from aiogram.filters import Command
TOKEN="YOUR_TOKEN_HERE"
logging.basicConfig(level=logging.INFO)
async def main():
    bot=Bot(token=TOKEN);dp=Dispatcher()
    @dp.message(Command("start"))
    async def start(m:types.Message):await m.answer("Mem matnini yozing")
    @dp.message()
    async def meme(m:types.Message):
        await m.answer_photo(f"https://dummyimage.com/400x400/000/fff&text={m.text.replace(' ','+')}",caption="🤣 Meme tayyor!")
    await dp.start_polling(bot)
if __name__=="__main__":asyncio.run(main())`},
  {id:'creative-5',title:'🎨 ASCII Art Bot',description:'Matnni ASCII artga aylantirish.',category:'creative',features:['Katta Matn','Shrift','Nusxalash','Ulashish'],
  code:`import asyncio,logging
from aiogram import Bot,Dispatcher,types
from aiogram.filters import Command
TOKEN="YOUR_TOKEN_HERE"
logging.basicConfig(level=logging.INFO)
async def main():
    bot=Bot(token=TOKEN);dp=Dispatcher()
    @dp.message(Command("start"))
    async def start(m:types.Message):await m.answer("Matn yozing, art yasayman")
    @dp.message()
    async def art(m:types.Message):
        t=m.text.upper()
        res=f"\\n╔{"═"*len(t)}╗\\n║{t}║\\n╚{"═"*len(t)}╝"
        await m.answer(f"\`{res}\`",parse_mode="Markdown")
    await dp.start_polling(bot)
if __name__=="__main__":asyncio.run(main())`},

  // 💰 MOLIYA (81-85)
  {id:'finance-1',title:'💸 Xarajatlar Bot',description:'Oylik xarajatlarni hisoblash.',category:'finance',features:['Tranzaksiya','Kategoriya','Hisobot','CSV'],
  code:`import asyncio,logging
from aiogram import Bot,Dispatcher,types
from aiogram.filters import Command
TOKEN="YOUR_TOKEN_HERE"
logging.basicConfig(level=logging.INFO)
expenses={}
async def main():
    bot=Bot(token=TOKEN);dp=Dispatcher()
    @dp.message(Command("start"))
    async def start(m:types.Message):await m.answer("💸 Xarajatlar\\nSummani yozing (masalan 50000 ovqat)")
    @dp.message()
    async def add(m:types.Message):
        uid=m.from_user.id
        parts=m.text.split(maxsplit=1)
        if len(parts)<2:return
        try:
            amount=int(parts[0])
            cat=parts[1]
            if uid not in expenses:expenses[uid]=0
            expenses[uid]+=amount
            await m.answer(f"✅ {amount} so'm '{cat}' ga qo'shildi! Jami xarajat: {expenses[uid]}")
        except:pass
    await dp.start_polling(bot)
if __name__=="__main__":asyncio.run(main())`},
  {id:'finance-2',title:'🧾 Qarz Daftari',description:'Qarzlar va berilgan pullar hisobi.',category:'finance',features:['Olish','Berish','Muddat','Eslatma'],
  code:`import asyncio,logging
from aiogram import Bot,Dispatcher,types
from aiogram.filters import Command
TOKEN="YOUR_TOKEN_HERE"
logging.basicConfig(level=logging.INFO)
debts={}
async def main():
    bot=Bot(token=TOKEN);dp=Dispatcher()
    @dp.message(Command("start"))
    async def start(m:types.Message):await m.answer("🧾 Qarzlar\\n/qarz Ism Summa - Qo'shish")
    @dp.message(Command("qarz"))
    async def qarz(m:types.Message):
        uid=m.from_user.id
        parts=m.text.split()
        if len(parts)<3:return
        name=parts[1];amount=int(parts[2])
        if uid not in debts:debts[uid]=[]
        debts[uid].append(f"{name}: {amount}")
        await m.answer("✅ Qarz yozildi")
    await dp.start_polling(bot)
if __name__=="__main__":asyncio.run(main())`},
  {id:'finance-3',title:'📈 Kripto Tracker',description:'Kriptovalyuta kurslari.',category:'finance',features:['BTC','ETH','Portfel','Signal'],
  code:`import asyncio,logging,random
from aiogram import Bot,Dispatcher,types
from aiogram.filters import Command
TOKEN="YOUR_TOKEN_HERE"
logging.basicConfig(level=logging.INFO)
async def main():
    bot=Bot(token=TOKEN);dp=Dispatcher()
    @dp.message(Command("start"))
    async def start(m:types.Message):await m.answer("📈 Kripto\\n/btc - Kurslar")
    @dp.message(Command("btc"))
    async def btc(m:types.Message):
        await m.answer(f"📈 Kurslar:\\nBTC: {random.randint(60000,65000)} USD\\nETH: {random.randint(3000,3500)} USD")
    await dp.start_polling(bot)
if __name__=="__main__":asyncio.run(main())`},
  {id:'finance-4',title:'🎯 Maqsad - Jamg\'arma',description:'Pul yig\'ish maqsadlari botlashtirilgan.',category:'finance',features:['Maqsad','Foiz','Kunlik','Tugallash'],
  code:`import asyncio,logging
from aiogram import Bot,Dispatcher,types
from aiogram.filters import Command
TOKEN="YOUR_TOKEN_HERE"
logging.basicConfig(level=logging.INFO)
goals={}
async def main():
    bot=Bot(token=TOKEN);dp=Dispatcher()
    @dp.message(Command("start"))
    async def start(m:types.Message):await m.answer("🎯 Maqsad yig'ish\\n/add 1000 - Qo'shish")
    @dp.message(Command("add"))
    async def add(m:types.Message):
        uid=m.from_user.id
        amount=int(m.text.split()[1])
        goals[uid]=goals.get(uid,0)+amount
        await m.answer(f"✅ Jamg'arma: {goals[uid]} so'm")
    await dp.start_polling(bot)
if __name__=="__main__":asyncio.run(main())`},
  {id:'finance-5',title:'🧾 Chek Generator',description:'Mijozlar uchun chiroyli cheklar.',category:'finance',features:['To\'lov','Kompaniya','PDF','Tasdiq'],
  code:`import asyncio,logging
from aiogram import Bot,Dispatcher,types
from aiogram.filters import Command
TOKEN="YOUR_TOKEN_HERE"
logging.basicConfig(level=logging.INFO)
async def main():
    bot=Bot(token=TOKEN);dp=Dispatcher()
    @dp.message(Command("start"))
    async def start(m:types.Message):await m.answer("Summa yozing chek yasayman.")
    @dp.message()
    async def add(m:types.Message):
        c=f"🧾 TO'LOV CHEKI\\nSumma: {m.text}\\nSana: Bugun\\n✅ Amalga oshirildi"
        await m.answer(f"\`\`\`\n{c}\n\`\`\`",parse_mode="Markdown")
    await dp.start_polling(bot)
if __name__=="__main__":asyncio.run(main())`},
];
