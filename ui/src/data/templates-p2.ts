import { BotTemplate } from './templates';

export const templatesPage2: BotTemplate[] = [
  // 📚 TA'LIM (26-35)
  {id:'edu-1',title:'📚 Test Bot',description:'Online test va viktorina.',category:'edu',features:['Testlar','Ball','Natija','Reyting'],
  code:`import asyncio,logging
from aiogram import Bot,Dispatcher,types,F
from aiogram.filters import Command
from aiogram.types import InlineKeyboardMarkup,InlineKeyboardButton
TOKEN="YOUR_TOKEN_HERE"
logging.basicConfig(level=logging.INFO)
questions=[{"q":"Pythonda ro'yxat qanday yaratiladi?","a":["[]","{}","()"],"correct":0},{"q":"HTML nima?","a":["Til","Markup","Framework"],"correct":1}]
scores={}
async def main():
    bot=Bot(token=TOKEN);dp=Dispatcher()
    @dp.message(Command("start"))
    async def start(m:types.Message):
        await m.answer("📚 Test Botiga Xush Kelibsiz!\\n/test - Testni boshlash\\n/natija - Natijalarim")
    @dp.message(Command("test"))
    async def test(m:types.Message):
        q=questions[0]
        kb=InlineKeyboardMarkup(inline_keyboard=[[InlineKeyboardButton(text=a,callback_data=f"ans_0_{i}")]for i,a in enumerate(q["a"])])
        await m.answer(f"❓ {q['q']}",reply_markup=kb)
    @dp.callback_query(F.data.startswith("ans_"))
    async def answer(cb:types.CallbackQuery):
        _,qi,ai=cb.data.split("_");qi,ai=int(qi),int(ai)
        uid=cb.from_user.id
        if uid not in scores:scores[uid]=0
        if ai==questions[qi]["correct"]:scores[uid]+=1;await cb.answer("✅ To'g'ri!")
        else:await cb.answer("❌ Noto'g'ri!")
        if qi+1<len(questions):
            q=questions[qi+1]
            kb=InlineKeyboardMarkup(inline_keyboard=[[InlineKeyboardButton(text=a,callback_data=f"ans_{qi+1}_{i}")]for i,a in enumerate(q["a"])])
            await cb.message.edit_text(f"❓ {q['q']}",reply_markup=kb)
        else:await cb.message.edit_text(f"🏆 Test tugadi! Ball: {scores[uid]}/{len(questions)}")
    await dp.start_polling(bot)
if __name__=="__main__":asyncio.run(main())`},
  {id:'edu-2',title:'📖 Lug\'at Bot',description:'So\'z tarjimasi va lug\'at.',category:'edu',features:['Tarjima','Izoh','Saqlash','Mashq'],
  code:`import asyncio,logging
from aiogram import Bot,Dispatcher,types
from aiogram.filters import Command
TOKEN="YOUR_TOKEN_HERE"
logging.basicConfig(level=logging.INFO)
dictionary={"salom":"hello","kitob":"book","maktab":"school","olma":"apple","mushuk":"cat"}
async def main():
    bot=Bot(token=TOKEN);dp=Dispatcher()
    @dp.message(Command("start"))
    async def start(m:types.Message):
        await m.answer("📖 Lug'at Bot\\nSo'z yozing - tarjimasini beraman!\\n/sozlar - Barcha so'zlar")
    @dp.message(Command("sozlar"))
    async def words(m:types.Message):
        text="📖 Lug'at:\\n"+"\\n".join(f"• {k} = {v}" for k,v in dictionary.items())
        await m.answer(text)
    @dp.message()
    async def translate(m:types.Message):
        w=m.text.strip().lower()
        if w in dictionary:await m.answer(f"✅ {w} = {dictionary[w]}")
        else:await m.answer("❌ So'z topilmadi. /sozlar")
    await dp.start_polling(bot)
if __name__=="__main__":asyncio.run(main())`},
  {id:'edu-3',title:'🧮 Matematika Bot',description:'Matematik masalalar va mashqlar.',category:'edu',features:['Amallar','Darajalar','Reyting','Vaqt'],
  code:`import asyncio,logging,random
from aiogram import Bot,Dispatcher,types
from aiogram.filters import Command
TOKEN="YOUR_TOKEN_HERE"
logging.basicConfig(level=logging.INFO)
scores={}
async def main():
    bot=Bot(token=TOKEN);dp=Dispatcher()
    @dp.message(Command("start"))
    async def start(m:types.Message):
        await m.answer("🧮 Matematika Bot\\n/masala - Yangi masala\\n/ball - Ballarim")
    @dp.message(Command("masala"))
    async def problem(m:types.Message):
        a,b=random.randint(1,50),random.randint(1,50)
        op=random.choice(["+","-","*"])
        ans=eval(f"{a}{op}{b}")
        scores[m.from_user.id]={"ans":ans,"score":scores.get(m.from_user.id,{}).get("score",0)}
        await m.answer(f"❓ {a} {op} {b} = ?")
    @dp.message()
    async def check(m:types.Message):
        uid=m.from_user.id
        if uid in scores and "ans" in scores[uid]:
            try:
                if int(m.text)==scores[uid]["ans"]:scores[uid]["score"]+=1;await m.answer(f"✅ To'g'ri! Ball: {scores[uid]['score']}")
                else:await m.answer(f"❌ Noto'g'ri! Javob: {scores[uid]['ans']}")
            except:pass
    await dp.start_polling(bot)
if __name__=="__main__":asyncio.run(main())`},
  {id:'edu-4',title:'🇬🇧 Ingliz Tili Bot',description:'Ingliz tili o\'rganish va mashqlar.',category:'edu',features:['So\'z','Grammatika','Mashq','Audio'],
  code:`import asyncio,logging,random
from aiogram import Bot,Dispatcher,types
from aiogram.filters import Command
TOKEN="YOUR_TOKEN_HERE"
logging.basicConfig(level=logging.INFO)
words=[("apple","olma"),("book","kitob"),("water","suv"),("house","uy"),("cat","mushuk"),("dog","it"),("sun","quyosh"),("moon","oy")]
async def main():
    bot=Bot(token=TOKEN);dp=Dispatcher()
    @dp.message(Command("start"))
    async def start(m:types.Message):
        await m.answer("🇬🇧 Ingliz Tili Bot\\n/soz - Yangi so'z\\n/mashq - Mashq")
    @dp.message(Command("soz"))
    async def word(m:types.Message):
        en,uz=random.choice(words)
        await m.answer(f"📝 {en} = {uz}")
    @dp.message(Command("mashq"))
    async def exercise(m:types.Message):
        en,uz=random.choice(words)
        await m.answer(f"❓ '{uz}' ni inglizchada qanday?\\nJavobni yozing!")
    await dp.start_polling(bot)
if __name__=="__main__":asyncio.run(main())`},
  {id:'edu-5',title:'📅 Dars Jadvali',description:'Maktab/universitet dars jadvali.',category:'edu',features:['Jadval','Eslatma','Haftalik','O\'qituvchi'],
  code:`import asyncio,logging
from aiogram import Bot,Dispatcher,types
from aiogram.filters import Command
TOKEN="YOUR_TOKEN_HERE"
logging.basicConfig(level=logging.INFO)
schedule={"dushanba":"📚 9:00 Matematika\\n📖 10:00 Fizika","seshanba":"🇬🇧 9:00 Ingliz tili\\n💻 10:00 Informatika","chorshanba":"🎨 9:00 Rasm\\n⚽ 10:00 Jismoniy"}
async def main():
    bot=Bot(token=TOKEN);dp=Dispatcher()
    @dp.message(Command("start"))
    async def start(m:types.Message):
        await m.answer("📅 Dars Jadvali\\n/bugun - Bugungi darslar\\n/hafta - Haftalik jadval")
    @dp.message(Command("hafta"))
    async def week(m:types.Message):
        text="📅 Haftalik jadval:\\n\\n"+"\\n\\n".join(f"📌 {k.upper()}:\\n{v}" for k,v in schedule.items())
        await m.answer(text)
    await dp.start_polling(bot)
if __name__=="__main__":asyncio.run(main())`},
  {id:'edu-6',title:'📝 Imtihon Bot',description:'Imtihon savollari va tayyorgarlik.',category:'edu',features:['Savollar','Vaqt','Natija','Tahlil'],
  code:`import asyncio,logging
from aiogram import Bot,Dispatcher,types
from aiogram.filters import Command
TOKEN="YOUR_TOKEN_HERE"
logging.basicConfig(level=logging.INFO)
async def main():
    bot=Bot(token=TOKEN);dp=Dispatcher()
    @dp.message(Command("start"))
    async def start(m:types.Message):
        await m.answer("📝 Imtihonga Tayyorgarlik\\n/fanlar - Fanlar ro'yxati\\n/savol [fan] - Savol olish")
    @dp.message(Command("fanlar"))
    async def subjects(m:types.Message):
        await m.answer("📚 Fanlar:\\n1. Matematika\\n2. Fizika\\n3. Kimyo\\n4. Biologiya")
    await dp.start_polling(bot)
if __name__=="__main__":asyncio.run(main())`},
  {id:'edu-7',title:'🎯 Hafta Topshiriq',description:'Haftalik topshiriqlar va kuzatuv.',category:'edu',features:['Topshiriq','Deadline','Progress','Guruh'],
  code:`import asyncio,logging
from aiogram import Bot,Dispatcher,types
from aiogram.filters import Command
TOKEN="YOUR_TOKEN_HERE"
ADMIN_ID=123456789
logging.basicConfig(level=logging.INFO)
tasks={}
async def main():
    bot=Bot(token=TOKEN);dp=Dispatcher()
    @dp.message(Command("start"))
    async def start(m:types.Message):
        await m.answer("🎯 Topshiriq Bot\\n/topshiriq - Topshiriqlarim\\n/bajarildi [raqam] - Tugatish")
    @dp.message(Command("yangi"))
    async def new_task(m:types.Message):
        if m.from_user.id!=ADMIN_ID:return
        text=m.text.replace("/yangi","").strip()
        tid=len(tasks)+1;tasks[tid]={"text":text,"done":False}
        await m.answer(f"✅ Topshiriq #{tid} qo'shildi")
    await dp.start_polling(bot)
if __name__=="__main__":asyncio.run(main())`},
  {id:'edu-8',title:'📕 Kitob Bot',description:'Kitob tavsiyasi va kutubxona.',category:'edu',features:['Kitoblar','Janr','Tavsiya','Izoh'],
  code:`import asyncio,logging
from aiogram import Bot,Dispatcher,types,F
from aiogram.filters import Command
from aiogram.types import InlineKeyboardMarkup,InlineKeyboardButton
TOKEN="YOUR_TOKEN_HERE"
logging.basicConfig(level=logging.INFO)
books={"badiiy":"📖 Mehmon - Pirimqul Qodirov","ilmiy":"🔬 Cosmos - Carl Sagan","biznes":"💼 Rich Dad - R.Kiyosaki"}
async def main():
    bot=Bot(token=TOKEN);dp=Dispatcher()
    @dp.message(Command("start"))
    async def start(m:types.Message):
        kb=InlineKeyboardMarkup(inline_keyboard=[[InlineKeyboardButton(text=k.title(),callback_data=f"book_{k}")]for k in books])
        await m.answer("📕 Kitob Tavsiya\\nJanr tanlang:",reply_markup=kb)
    @dp.callback_query(F.data.startswith("book_"))
    async def show(cb:types.CallbackQuery):
        g=cb.data.replace("book_","")
        await cb.message.edit_text(f"📚 {g.title()} janri:\\n{books[g]}")
    await dp.start_polling(bot)
if __name__=="__main__":asyncio.run(main())`},
  {id:'edu-9',title:'💡 Bilim Quiz',description:'Umumiy bilim viktorinasi.',category:'edu',features:['Savollar','Timer','Reyting','Kategoriya'],
  code:`import asyncio,logging,random
from aiogram import Bot,Dispatcher,types
from aiogram.filters import Command
TOKEN="YOUR_TOKEN_HERE"
logging.basicConfig(level=logging.INFO)
quizzes=[("O'zbekiston poytaxti?","Toshkent"),("Eng katta okean?","Tinch"),("Yerning yo'ldoshi?","Oy")]
async def main():
    bot=Bot(token=TOKEN);dp=Dispatcher()
    @dp.message(Command("start"))
    async def start(m:types.Message):
        await m.answer("💡 Bilim Quiz\\n/savol - Yangi savol")
    @dp.message(Command("savol"))
    async def ask(m:types.Message):
        q,a=random.choice(quizzes)
        await m.answer(f"❓ {q}\\n\\n💡 Javob: ||{a}||",parse_mode="MarkdownV2")
    await dp.start_polling(bot)
if __name__=="__main__":asyncio.run(main())`},
  {id:'edu-10',title:'🗓 Kundalik Bot',description:'Shaxsiy kundalik va rejalar.',category:'edu',features:['Reja','Eslatma','Kunlik','Haftalik'],
  code:`import asyncio,logging
from aiogram import Bot,Dispatcher,types
from aiogram.filters import Command
TOKEN="YOUR_TOKEN_HERE"
logging.basicConfig(level=logging.INFO)
diary={}
async def main():
    bot=Bot(token=TOKEN);dp=Dispatcher()
    @dp.message(Command("start"))
    async def start(m:types.Message):
        await m.answer("🗓 Kundalik Bot\\n/yoz [matn] - Yozuv qo'shish\\n/kundalik - Yozuvlarim")
    @dp.message(Command("yoz"))
    async def write(m:types.Message):
        uid=m.from_user.id;text=m.text.replace("/yoz","").strip()
        if uid not in diary:diary[uid]=[]
        diary[uid].append(text)
        await m.answer(f"✅ Saqlandi! ({len(diary[uid])} ta yozuv)")
    @dp.message(Command("kundalik"))
    async def show(m:types.Message):
        entries=diary.get(m.from_user.id,[])
        if not entries:await m.answer("📭 Bo'sh");return
        text="🗓 Kundalik:\\n"+"\\n".join(f"{i+1}. {e}" for i,e in enumerate(entries[-10:]))
        await m.answer(text)
    await dp.start_polling(bot)
if __name__=="__main__":asyncio.run(main())`},

  // 🎮 O'YIN (36-45)
  {id:'game-1',title:'🎲 Zarlar O\'yini',description:'Zar tashlash va raqobat.',category:'game',features:['Zar','Raqobat','Reyting','Bonus'],
  code:`import asyncio,logging,random
from aiogram import Bot,Dispatcher,types
from aiogram.filters import Command
TOKEN="YOUR_TOKEN_HERE"
logging.basicConfig(level=logging.INFO)
scores={}
async def main():
    bot=Bot(token=TOKEN);dp=Dispatcher()
    @dp.message(Command("start"))
    async def start(m:types.Message):
        await m.answer("🎲 Zarlar O'yini\\n/tashla - Zar tashlash\\n/reyting - Eng ko'p yutganlar")
    @dp.message(Command("tashla"))
    async def roll(m:types.Message):
        uid=m.from_user.id;d1,d2=random.randint(1,6),random.randint(1,6)
        total=d1+d2
        if uid not in scores:scores[uid]={"name":m.from_user.first_name,"wins":0}
        if total>=10:scores[uid]["wins"]+=1;r="🏆 YUTDINGIZ!"
        else:r="😔 Yutqazdingiz"
        await m.answer(f"🎲 {d1} + {d2} = {total}\\n{r}")
    @dp.message(Command("reyting"))
    async def leaderboard(m:types.Message):
        top=sorted(scores.values(),key=lambda x:x["wins"],reverse=True)[:10]
        text="🏆 Reyting:\\n"+"\\n".join(f"{i+1}. {p['name']} - {p['wins']} yutish" for i,p in enumerate(top))
        await m.answer(text)
    await dp.start_polling(bot)
if __name__=="__main__":asyncio.run(main())`},
  {id:'game-2',title:'✊ Tosh-Qaychi-Qog\'oz',description:'Klassik o\'yin.',category:'game',features:['O\'yin','Statistika','Bot AI','Reyting'],
  code:`import asyncio,logging,random
from aiogram import Bot,Dispatcher,types,F
from aiogram.filters import Command
from aiogram.types import InlineKeyboardMarkup,InlineKeyboardButton
TOKEN="YOUR_TOKEN_HERE"
logging.basicConfig(level=logging.INFO)
async def main():
    bot=Bot(token=TOKEN);dp=Dispatcher()
    @dp.message(Command("start"))
    async def start(m:types.Message):
        kb=InlineKeyboardMarkup(inline_keyboard=[[InlineKeyboardButton(text="✊",callback_data="g_tosh"),InlineKeyboardButton(text="✌",callback_data="g_qaychi"),InlineKeyboardButton(text="🖐",callback_data="g_qogoz")]])
        await m.answer("✊✌🖐 Tanlang!",reply_markup=kb)
    @dp.callback_query(F.data.startswith("g_"))
    async def play(cb:types.CallbackQuery):
        choices={"tosh":"✊","qaychi":"✌","qogoz":"🖐"}
        wins={"tosh":"qaychi","qaychi":"qogoz","qogoz":"tosh"}
        user=cb.data.replace("g_","");bot_c=random.choice(list(choices.keys()))
        if user==bot_c:r="🤝 Durrang!"
        elif wins[user]==bot_c:r="🏆 Siz yutdingiz!"
        else:r="😔 Bot yutdi!"
        await cb.message.edit_text(f"Siz: {choices[user]} vs Bot: {choices[bot_c]}\\n{r}")
    await dp.start_polling(bot)
if __name__=="__main__":asyncio.run(main())`},
  {id:'game-3',title:'🔢 Raqam Top',description:'Raqamni topish o\'yini.',category:'game',features:['Raqam','Urinishlar','Darajalar','Vaqt'],
  code:`import asyncio,logging,random
from aiogram import Bot,Dispatcher,types
from aiogram.filters import Command
TOKEN="YOUR_TOKEN_HERE"
logging.basicConfig(level=logging.INFO)
games={}
async def main():
    bot=Bot(token=TOKEN);dp=Dispatcher()
    @dp.message(Command("start"))
    async def start(m:types.Message):
        await m.answer("🔢 Raqam Topish O'yini\\n/oyin - Boshlash")
    @dp.message(Command("oyin"))
    async def new_game(m:types.Message):
        num=random.randint(1,100);games[m.from_user.id]={"num":num,"tries":0}
        await m.answer("🎯 1-100 orasidan raqam topdim. Toping!")
    @dp.message()
    async def guess(m:types.Message):
        uid=m.from_user.id
        if uid not in games:return
        try:
            n=int(m.text);games[uid]["tries"]+=1
            if n==games[uid]["num"]:await m.answer(f"🏆 Topdingiz! {games[uid]['tries']} urinishda!");del games[uid]
            elif n<games[uid]["num"]:await m.answer("⬆️ Kattaroq!")
            else:await m.answer("⬇️ Kichikroq!")
        except:pass
    await dp.start_polling(bot)
if __name__=="__main__":asyncio.run(main())`},
  {id:'game-4',title:'🧩 So\'z O\'yini',description:'So\'z topish va jumboq.',category:'game',features:['So\'z','Harflar','Mashq','Reyting'],
  code:`import asyncio,logging,random
from aiogram import Bot,Dispatcher,types
from aiogram.filters import Command
TOKEN="YOUR_TOKEN_HERE"
logging.basicConfig(level=logging.INFO)
words=["kitob","maktab","kompyuter","telefon","mushuk"]
games={}
async def main():
    bot=Bot(token=TOKEN);dp=Dispatcher()
    @dp.message(Command("start"))
    async def start(m:types.Message):
        await m.answer("🧩 So'z O'yini\\n/boshlash - O'yinni boshlash")
    @dp.message(Command("boshlash"))
    async def new(m:types.Message):
        word=random.choice(words);hidden="_ "*len(word)
        games[m.from_user.id]={"word":word,"found":set(),"tries":6}
        await m.answer(f"🧩 So'zni toping!\\n{hidden}\\nHarf yozing! ({games[m.from_user.id]['tries']} urinish)")
    @dp.message()
    async def guess(m:types.Message):
        uid=m.from_user.id
        if uid not in games:return
        g=games[uid];letter=m.text.lower().strip()
        if len(letter)==1:
            if letter in g["word"]:g["found"].add(letter)
            else:g["tries"]-=1
            display=" ".join(c if c in g["found"] else "_" for c in g["word"])
            if "_" not in display:await m.answer(f"🏆 Topdingiz: {g['word']}!");del games[uid]
            elif g["tries"]<=0:await m.answer(f"😔 Yutqazdingiz! So'z: {g['word']}");del games[uid]
            else:await m.answer(f"{display} ({g['tries']} urinish)")
    await dp.start_polling(bot)
if __name__=="__main__":asyncio.run(main())`},
  {id:'game-5',title:'🎰 Slot Mashina',description:'Slot mashina o\'yini.',category:'game',features:['Slot','Yutuq','Balans','Jackpot'],
  code:`import asyncio,logging,random
from aiogram import Bot,Dispatcher,types
from aiogram.filters import Command
TOKEN="YOUR_TOKEN_HERE"
logging.basicConfig(level=logging.INFO)
balances={}
symbols=["🍒","🍋","🔔","⭐","7️⃣"]
async def main():
    bot=Bot(token=TOKEN);dp=Dispatcher()
    @dp.message(Command("start"))
    async def start(m:types.Message):
        uid=m.from_user.id
        if uid not in balances:balances[uid]=1000
        await m.answer(f"🎰 Slot Mashina!\\n💰 Balans: {balances[uid]}\\n/spin - O'ynash (100)\\n/balans - Balansim")
    @dp.message(Command("spin"))
    async def spin(m:types.Message):
        uid=m.from_user.id
        if balances.get(uid,0)<100:await m.answer("❌ Balans yetarli emas!");return
        balances[uid]-=100
        s=[random.choice(symbols) for _ in range(3)]
        result=f"[ {' | '.join(s)} ]"
        if s[0]==s[1]==s[2]:win=1000;balances[uid]+=win;await m.answer(f"{result}\\n🏆 JACKPOT! +{win}\\n💰 {balances[uid]}")
        elif s[0]==s[1] or s[1]==s[2]:win=200;balances[uid]+=win;await m.answer(f"{result}\\n✅ Yutdingiz! +{win}\\n💰 {balances[uid]}")
        else:await m.answer(f"{result}\\n😔 Yutqazdingiz\\n💰 {balances[uid]}")
    await dp.start_polling(bot)
if __name__=="__main__":asyncio.run(main())`},
  {id:'game-6',title:'🏆 Viktorina Bot',description:'Ko\'p o\'yinchi viktorina.',category:'game',features:['Savollar','Timer','Reyting','Kategoriya'],
  code:`import asyncio,logging,random
from aiogram import Bot,Dispatcher,types
from aiogram.filters import Command
TOKEN="YOUR_TOKEN_HERE"
logging.basicConfig(level=logging.INFO)
trivia=[("Yerning eng baland tog'i?","Everest"),("Eng kichik qit'a?","Avstraliya"),("Suvning formulasi?","H2O")]
scores={}
async def main():
    bot=Bot(token=TOKEN);dp=Dispatcher()
    @dp.message(Command("start"))
    async def start(m:types.Message):
        await m.answer("🏆 Viktorina!\\n/savol - Savol olish\\n/top - Eng yaxshilar")
    @dp.message(Command("savol"))
    async def ask(m:types.Message):
        q,a=random.choice(trivia)
        await m.answer(f"❓ {q}")
    @dp.message(Command("top"))
    async def top(m:types.Message):
        if not scores:await m.answer("Hali hech kim o'ynamadi");return
        text="🏆 Top:\\n"+"\\n".join(f"{i+1}. {v['n']} - {v['s']}" for i,(k,v) in enumerate(sorted(scores.items(),key=lambda x:x[1]['s'],reverse=True)[:5]))
        await m.answer(text)
    await dp.start_polling(bot)
if __name__=="__main__":asyncio.run(main())`},
  {id:'game-7',title:'🃏 Karta O\'yini',description:'21 karta o\'yini.',category:'game',features:['Kartalar','21','Raqobat','Balans'],
  code:`import asyncio,logging,random
from aiogram import Bot,Dispatcher,types,F
from aiogram.filters import Command
from aiogram.types import InlineKeyboardMarkup,InlineKeyboardButton
TOKEN="YOUR_TOKEN_HERE"
logging.basicConfig(level=logging.INFO)
games={}
async def main():
    bot=Bot(token=TOKEN);dp=Dispatcher()
    @dp.message(Command("start"))
    async def start(m:types.Message):
        await m.answer("🃏 21 O'yini\\n/oyin - Boshlash")
    @dp.message(Command("oyin"))
    async def new(m:types.Message):
        cards=[random.randint(1,11),random.randint(1,11)]
        games[m.from_user.id]=cards
        kb=InlineKeyboardMarkup(inline_keyboard=[[InlineKeyboardButton(text="🃏 Yana",callback_data="hit"),InlineKeyboardButton(text="✋ Yetadi",callback_data="stand")]])
        await m.answer(f"🃏 Kartalaringiz: {cards} = {sum(cards)}",reply_markup=kb)
    @dp.callback_query(F.data=="hit")
    async def hit(cb:types.CallbackQuery):
        uid=cb.from_user.id;card=random.randint(1,11)
        games[uid].append(card);total=sum(games[uid])
        if total>21:await cb.message.edit_text(f"💥 {total} - Yoqdingiz!");del games[uid]
        else:
            kb=InlineKeyboardMarkup(inline_keyboard=[[InlineKeyboardButton(text="🃏 Yana",callback_data="hit"),InlineKeyboardButton(text="✋ Yetadi",callback_data="stand")]])
            await cb.message.edit_text(f"🃏 {games[uid]} = {total}",reply_markup=kb)
    @dp.callback_query(F.data=="stand")
    async def stand(cb:types.CallbackQuery):
        uid=cb.from_user.id;total=sum(games.get(uid,[]))
        bot_total=sum(random.randint(1,11) for _ in range(random.randint(2,4)))
        if bot_total>21 or total>bot_total:r="🏆 Yutdingiz!"
        elif total==bot_total:r="🤝 Durrang!"
        else:r="😔 Bot yutdi!"
        await cb.message.edit_text(f"Siz: {total} | Bot: {bot_total}\\n{r}")
    await dp.start_polling(bot)
if __name__=="__main__":asyncio.run(main())`},
  {id:'game-8',title:'🏃 Yugurish O\'yini',description:'Virtual yugurish musobaqasi.',category:'game',features:['Poyga','Raqobat','Reyting','Bonus'],
  code:`import asyncio,logging,random
from aiogram import Bot,Dispatcher,types
from aiogram.filters import Command
TOKEN="YOUR_TOKEN_HERE"
logging.basicConfig(level=logging.INFO)
async def main():
    bot=Bot(token=TOKEN);dp=Dispatcher()
    @dp.message(Command("start"))
    async def start(m:types.Message):
        await m.answer("🏃 Yugurish O'yini!\\n/yugur - Poygani boshlash")
    @dp.message(Command("yugur"))
    async def race(m:types.Message):
        you=random.randint(50,100);bot_s=random.randint(50,100)
        if you>bot_s:r=f"🏆 Yutdingiz! {you}m vs {bot_s}m"
        elif you==bot_s:r=f"🤝 Durrang! {you}m"
        else:r=f"😔 Yutqazdingiz! {you}m vs {bot_s}m"
        await m.answer(f"🏃 Natija: {r}")
    await dp.start_polling(bot)
if __name__=="__main__":asyncio.run(main())`},
  {id:'game-9',title:'🎪 Emoji O\'yini',description:'Emoji topish o\'yini.',category:'game',features:['Emoji','Topish','Timer','Reyting'],
  code:`import asyncio,logging,random
from aiogram import Bot,Dispatcher,types
from aiogram.filters import Command
TOKEN="YOUR_TOKEN_HERE"
logging.basicConfig(level=logging.INFO)
puzzles=[("🍎+📱=?","Apple (kompaniya)"),("☀️+🌻=?","Quyoshgul"),("❄️+👑=?","Frozen")]
async def main():
    bot=Bot(token=TOKEN);dp=Dispatcher()
    @dp.message(Command("start"))
    async def start(m:types.Message):
        await m.answer("🎪 Emoji O'yini\\n/oyin - Topish o'yini")
    @dp.message(Command("oyin"))
    async def play(m:types.Message):
        q,a=random.choice(puzzles)
        await m.answer(f"🎪 Nima bu?\\n\\n{q}\\n\\n💡 Javob: ||{a}||",parse_mode="MarkdownV2")
    await dp.start_polling(bot)
if __name__=="__main__":asyncio.run(main())`},
  {id:'game-10',title:'⚽ Futbol Bashorat',description:'Futbol o\'yin natijalarini bashorat qilish.',category:'game',features:['Bashorat','Reyting','Statistika','Ligalar'],
  code:`import asyncio,logging
from aiogram import Bot,Dispatcher,types,F
from aiogram.filters import Command
from aiogram.types import InlineKeyboardMarkup,InlineKeyboardButton
TOKEN="YOUR_TOKEN_HERE"
logging.basicConfig(level=logging.INFO)
matches=[("Real Madrid","Barcelona"),("Man City","Liverpool"),("PSG","Bayern")]
predictions={}
async def main():
    bot=Bot(token=TOKEN);dp=Dispatcher()
    @dp.message(Command("start"))
    async def start(m:types.Message):
        await m.answer("⚽ Futbol Bashorat\\n/uyinlar - O'yinlar ro'yxati")
    @dp.message(Command("uyinlar"))
    async def games(m:types.Message):
        kb=InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text=f"{a} vs {b}",callback_data=f"match_{i}")]for i,(a,b) in enumerate(matches)
        ])
        await m.answer("⚽ O'yinlar:",reply_markup=kb)
    @dp.callback_query(F.data.startswith("match_"))
    async def predict(cb:types.CallbackQuery):
        i=int(cb.data.split("_")[1]);a,b=matches[i]
        kb=InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text=f"🏆 {a}",callback_data=f"pred_{i}_1"),InlineKeyboardButton(text="🤝",callback_data=f"pred_{i}_x"),InlineKeyboardButton(text=f"🏆 {b}",callback_data=f"pred_{i}_2")]
        ])
        await cb.message.edit_text(f"⚽ {a} vs {b}\\nBashoratingiz?",reply_markup=kb)
    @dp.callback_query(F.data.startswith("pred_"))
    async def save_pred(cb:types.CallbackQuery):
        await cb.message.edit_text("✅ Bashoratingiz saqlandi!")
    await dp.start_polling(bot)
if __name__=="__main__":asyncio.run(main())`},

  // 📢 KANAL & GURUH (46-55)
  {id:'channel-1',title:'📢 Auto Post Bot',description:'Kanalga avtomatik post yuborish.',category:'channel',features:['Avto-post','Timer','Rasmli','Tugmali'],
  code:`import asyncio,logging
from aiogram import Bot,Dispatcher,types
from aiogram.filters import Command
TOKEN="YOUR_TOKEN_HERE"
ADMIN_ID=123456789
CHANNEL="@your_channel"
logging.basicConfig(level=logging.INFO)
async def main():
    bot=Bot(token=TOKEN);dp=Dispatcher()
    @dp.message(Command("post"))
    async def post(m:types.Message):
        if m.from_user.id!=ADMIN_ID:return
        text=m.text.replace("/post","").strip()
        if text:await bot.send_message(CHANNEL,text);await m.answer("✅ Kanalga yuborildi!")
    @dp.message(Command("start"))
    async def start(m:types.Message):
        await m.answer("📢 Kanal Post Bot\\n/post [matn] - Kanalga yuborish")
    await dp.start_polling(bot)
if __name__=="__main__":asyncio.run(main())`},
  {id:'channel-2',title:'👋 Salomlash Bot',description:'Guruhga yangi a\'zoni kutib olish.',category:'channel',features:['Salom','Qoidalar','Avtomatik','Xabar'],
  code:`import asyncio,logging
from aiogram import Bot,Dispatcher,types
TOKEN="YOUR_TOKEN_HERE"
logging.basicConfig(level=logging.INFO)
async def main():
    bot=Bot(token=TOKEN);dp=Dispatcher()
    @dp.message(lambda m:m.new_chat_members is not None)
    async def welcome(m:types.Message):
        for user in m.new_chat_members:
            await m.answer(f"👋 Xush kelibsiz, {user.full_name}!\\n\\n📋 Guruh qoidalari:\\n1. Hurmat\\n2. Spam yo'q\\n3. Reklama yo'q")
    await dp.start_polling(bot)
if __name__=="__main__":asyncio.run(main())`},
  {id:'channel-3',title:'🔗 Link Filtr',description:'Guruhda havolalarni filtrlash.',category:'channel',features:['Filtr','Ogohlantirish','Ban','Whitelist'],
  code:`import asyncio,logging,re
from aiogram import Bot,Dispatcher,types
TOKEN="YOUR_TOKEN_HERE"
ADMIN_ID=123456789
logging.basicConfig(level=logging.INFO)
async def main():
    bot=Bot(token=TOKEN);dp=Dispatcher()
    @dp.message()
    async def check(m:types.Message):
        if m.from_user.id==ADMIN_ID:return
        if re.search(r'https?://',m.text or ""):
            await m.delete()
            await m.answer(f"⚠️ {m.from_user.first_name}, havola yuborish taqiqlangan!")
    await dp.start_polling(bot)
if __name__=="__main__":asyncio.run(main())`},
  {id:'channel-4',title:'📊 Guruh Stat',description:'Guruh statistikasi va aktivlik.',category:'channel',features:['Xabarlar soni','Top a\'zolar','Kunlik','Haftalik'],
  code:`import asyncio,logging
from aiogram import Bot,Dispatcher,types
from aiogram.filters import Command
TOKEN="YOUR_TOKEN_HERE"
logging.basicConfig(level=logging.INFO)
msg_count={}
async def main():
    bot=Bot(token=TOKEN);dp=Dispatcher()
    @dp.message(Command("stat"))
    async def stat(m:types.Message):
        top=sorted(msg_count.items(),key=lambda x:x[1],reverse=True)[:5]
        text="📊 Faol a'zolar:\\n"+"\\n".join(f"{i+1}. {n} - {c} xabar" for i,(n,c) in enumerate(top))
        await m.answer(text if top else "Hali statistika yo'q")
    @dp.message()
    async def count(m:types.Message):
        name=m.from_user.first_name
        msg_count[name]=msg_count.get(name,0)+1
    await dp.start_polling(bot)
if __name__=="__main__":asyncio.run(main())`},
  {id:'channel-5',title:'🔕 Anti-Spam',description:'Guruhda spamga qarshi.',category:'channel',features:['Spam filtr','Flood himoya','Mute','Ban'],
  code:`import asyncio,logging
from aiogram import Bot,Dispatcher,types
TOKEN="YOUR_TOKEN_HERE"
logging.basicConfig(level=logging.INFO)
flood={}
async def main():
    bot=Bot(token=TOKEN);dp=Dispatcher()
    @dp.message()
    async def anti_flood(m:types.Message):
        uid=m.from_user.id
        import time
        now=time.time()
        if uid not in flood:flood[uid]=[]
        flood[uid]=[t for t in flood[uid] if now-t<5]
        flood[uid].append(now)
        if len(flood[uid])>5:
            await m.delete()
            await m.answer(f"⚠️ {m.from_user.first_name}, flood qilmang!")
    await dp.start_polling(bot)
if __name__=="__main__":asyncio.run(main())`},
  {id:'channel-6',title:'📌 Pin Bot',description:'Muhim xabarlarni pinlash.',category:'channel',features:['Pin','Unpin','Admin','Xabar'],
  code:`import asyncio,logging
from aiogram import Bot,Dispatcher,types
from aiogram.filters import Command
TOKEN="YOUR_TOKEN_HERE"
ADMIN_ID=123456789
logging.basicConfig(level=logging.INFO)
async def main():
    bot=Bot(token=TOKEN);dp=Dispatcher()
    @dp.message(Command("pin"))
    async def pin(m:types.Message):
        if m.from_user.id!=ADMIN_ID or not m.reply_to_message:return
        await m.reply_to_message.pin()
        await m.answer("📌 Xabar pinlandi!")
    await dp.start_polling(bot)
if __name__=="__main__":asyncio.run(main())`},
  {id:'channel-7',title:'🗳 Guruh Voting',description:'Guruhda ovoz berish.',category:'channel',features:['Ovoz','Natijalar','Anonim','Timer'],
  code:`import asyncio,logging
from aiogram import Bot,Dispatcher,types
from aiogram.filters import Command
TOKEN="YOUR_TOKEN_HERE"
ADMIN_ID=123456789
logging.basicConfig(level=logging.INFO)
async def main():
    bot=Bot(token=TOKEN);dp=Dispatcher()
    @dp.message(Command("poll"))
    async def poll(m:types.Message):
        if m.from_user.id!=ADMIN_ID:return
        text=m.text.replace("/poll","").strip()
        parts=text.split("|")
        if len(parts)<3:await m.answer("/poll Savol|Variant1|Variant2");return
        await bot.send_poll(m.chat.id,parts[0],[p.strip() for p in parts[1:]],is_anonymous=False)
    await dp.start_polling(bot)
if __name__=="__main__":asyncio.run(main())`},
  {id:'channel-8',title:'📋 Qoidalar Bot',description:'Guruh qoidalarini ko\'rsatish.',category:'channel',features:['Qoidalar','Avtomatik','Tillar','Admin'],
  code:`import asyncio,logging
from aiogram import Bot,Dispatcher,types
from aiogram.filters import Command
TOKEN="YOUR_TOKEN_HERE"
logging.basicConfig(level=logging.INFO)
rules="📋 GURUH QOIDALARI:\\n\\n1. ✅ Hurmatli bo'ling\\n2. ❌ Spam taqiqlangan\\n3. ❌ Reklama yo'q\\n4. ✅ O'zbek tilida yozing\\n5. ❌ 18+ kontent taqiqlangan"
async def main():
    bot=Bot(token=TOKEN);dp=Dispatcher()
    @dp.message(Command("qoidalar"))
    async def show_rules(m:types.Message):
        await m.answer(rules)
    @dp.message(Command("start"))
    async def start(m:types.Message):
        await m.answer("📋 /qoidalar - Guruh qoidalari")
    await dp.start_polling(bot)
if __name__=="__main__":asyncio.run(main())`},
  {id:'channel-9',title:'🎁 Giveaway Bot',description:'Sovg\'a o\'tkazish va g\'olibni aniqlash.',category:'channel',features:['Ishtirok','Random','G\'olib','Eslatma'],
  code:`import asyncio,logging,random
from aiogram import Bot,Dispatcher,types,F
from aiogram.filters import Command
from aiogram.types import InlineKeyboardMarkup,InlineKeyboardButton
TOKEN="YOUR_TOKEN_HERE"
ADMIN_ID=123456789
logging.basicConfig(level=logging.INFO)
participants=set()
async def main():
    bot=Bot(token=TOKEN);dp=Dispatcher()
    @dp.message(Command("giveaway"))
    async def giveaway(m:types.Message):
        if m.from_user.id!=ADMIN_ID:return
        kb=InlineKeyboardMarkup(inline_keyboard=[[InlineKeyboardButton(text="🎁 Ishtirok etish!",callback_data="join_giveaway")]])
        await m.answer("🎁 GIVEAWAY!\\nIshtirok etish uchun tugmani bosing!",reply_markup=kb)
    @dp.callback_query(F.data=="join_giveaway")
    async def join(cb:types.CallbackQuery):
        participants.add((cb.from_user.id,cb.from_user.full_name))
        await cb.answer(f"✅ Siz ishtirok etyapsiz! ({len(participants)} ishtirokchi)")
    @dp.message(Command("winner"))
    async def winner(m:types.Message):
        if m.from_user.id!=ADMIN_ID or not participants:return
        uid,name=random.choice(list(participants))
        await m.answer(f"🏆 G'OLIB: {name}!\\nTabriklaymiz! 🎉")
        participants.clear()
    await dp.start_polling(bot)
if __name__=="__main__":asyncio.run(main())`},
  {id:'channel-10',title:'⏰ Scheduled Post',description:'Vaqtga belgilangan postlar.',category:'channel',features:['Timer','Avto-post','Qayta-qayta','Admin'],
  code:`import asyncio,logging
from aiogram import Bot,Dispatcher,types
from aiogram.filters import Command
TOKEN="YOUR_TOKEN_HERE"
ADMIN_ID=123456789
CHANNEL="@your_channel"
logging.basicConfig(level=logging.INFO)
async def main():
    bot=Bot(token=TOKEN);dp=Dispatcher()
    @dp.message(Command("timer"))
    async def timer_post(m:types.Message):
        if m.from_user.id!=ADMIN_ID:return
        parts=m.text.split(maxsplit=2)
        if len(parts)<3:await m.answer("/timer [daqiqa] [matn]");return
        mins,text=int(parts[1]),parts[2]
        await m.answer(f"⏰ {mins} daqiqadan so'ng yuboriladi")
        await asyncio.sleep(mins*60)
        await bot.send_message(CHANNEL,text)
    await dp.start_polling(bot)
if __name__=="__main__":asyncio.run(main())`},
];
