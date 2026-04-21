🤖  AI  Bot  Builder  — Telegram  Bot
AI yordam ida Telegram  bot yaratuvchi bot.
O'rnatish
1. Python o'rnatish
Python 3.8+ kerak. Tekshirish:
Bash
python3 --version
2. Kutubxonalarni o'rnatish
Bash
pip install python-telegram-bot openai Pillow httpx
3. Sozlam alar
bot_builder.py  faylining yuqorisidagi SOZLAM ALAR bo'lim ini tahrirlang:
Python
# Telegram Bot Token (@BotFather dan oling )
BOT_TOKEN = "YOUR_BOT_TOKEN"
# Admin Telegram ID
ADMIN_TELEGRAM_ID = 123456789
# AI API sozlamalari
OPENAI_API_KEY = "YOUR_API_KEY"
OPENAI_BASE_URL = "https://api.openai.com/v1"
# AI Model
AI_MODEL = "gpt-4.1-mini"
4. Ishga tushirish
Bash
python3 bot_builder.py
AI API tanlovlari
Funksiyalar
• CAPTCHA bilan xavfsizlik tekshiruvi
• Ro'yxatdan o'tish tizim i
• Foydalanish shartlari
• AI bilan m uloqot qilib bot yaratish
• Sinov rejim i (token kiritib sinash )
• Bot tahrirlash (AI qayta yozadi)
• Hostinga qo'yish (adm in bilan bog'lanish)
• K od olish (to'lov orqali)
• Yo'riqnom a
• Foydalanuvchilar statistikasi
Serverda doim iy ishlatish
system d bilan:
Bash
Provayder Base URL M odel Narx
OpenAI https://api.openai.com /
v1 gpt-4.1-m ini ~$0.15/1M  token
Together AI https://api.together.xyz/
v1
m eta-llam a/Llam a-3-
70b-chat-hf ~$0.54/1M  token
G roq https://api.groq.com /op
enai/v1 llam a3-70b-8192 Bepul (lim itli )
Ollam a (local) http://localhost:11434/v
1 llam a3 Bepul
sudo nano /etc/systemd/system/botbuilder.service
Plain Text
[Unit]
Description=AI Bot Builder
After=network.target
[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu
ExecStart=/usr/bin/python3 /home/ubuntu/bot_builder.py
Restart=always
RestartSec=10
[Install]
WantedBy=multi-user.target
Bash
sudo systemctl enable botbuilder
sudo systemctl start botbuilder
screen bilan:
Bash
screen -S botbuilder
python3 bot_builder.py
# Ctrl+A, D — detach
Narxlarni o'zgartirish
bot_builder.py  dagi sozlam alar bo'lim ida:
Python
PRICE_SIMPLE = "50,000"
PRICE_MEDIUM = "100,000"
PRICE_CODE = "30,000"
