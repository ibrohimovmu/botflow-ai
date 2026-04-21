import httpx, base64
from config import settings

async def generate_bot_architecture(user_prompt: str):
    """Senior darajadagi AI arxitektura tahlili"""
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {settings.GROQ_KEY}",
        "Content-Type": "application/json"
    }
    
    system_prompt = (
        "Siz Senior Telegram Bot Arxitektori siz. "
        "Foydalanuvchi so'roviga asosan juda murakkab va xavfsiz bot kodini yozing. "
        "Kodni doimo Markdown code block ichida bering. "
        "Tushuntirishni doimo Telegram 'blockquote' formatida bering."
    )
    
    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "temperature": 0.7
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, headers=headers, json=payload, timeout=30)
            result = response.json()
            return result['choices'][0]['message']['content']
        except Exception as e:
            return f"❌ AI Tahlilida xatolik: {str(e)}"

async def groq_ask_questions(user_prompt: str):
    """Generate 3 clarifying questions based on user's initial idea."""
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {settings.GROQ_KEY}",
        "Content-Type": "application/json"
    }
    
    system_prompt = (
        "Siz Senior Product Manager-siz. Foydalanuvchi yangi Telegram bot yaratmoqchi. "
        "Uning g'oyasini tahlil qiling va botni mukammal darajaga olib chiqish uchun 3 ta eng muhim savolni so'rang. "
        "Savollaringiz qisqa va tushunarli bo'lsin. Jiddiy va professional ohangda gapiring."
    )
    
    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Mening g'oyam: {user_prompt}"}
        ],
        "temperature": 0.8
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, headers=headers, json=payload, timeout=30)
            result = response.json()
            return result['choices'][0]['message']['content']
        except Exception as e:
            return "Kechirasiz, g'oyangizni tahlil qilishda xatolik yuz berdi. Bot turini batafsilroq yozing."

async def groq_edit_config(prompt: str, current_config: str) -> str:
    """Send prompt + current config to Groq LLM and return edited JSON config."""
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {settings.GROQ_KEY}",
        "Content-Type": "application/json"
    }
    
    system_prompt = (
        "Siz Senior Telegram Bot Developer-siz. "
        "Foydalanuvchi so'roviga ko'ra botning JSON konfiguratsiyasini yangilang. "
        "Faqat JSON formatida javob bering, boshqa matn qo'shmang."
    )
    
    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Hozirgi config: {current_config}\nSo'rov: {prompt}"}
        ],
        "temperature": 0.2, # Lower temperature for stable JSON
        "response_format": {"type": "json_object"}
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, headers=headers, json=payload, timeout=30)
            result = response.json()
            return result['choices'][0]['message']['content']
        except Exception as e:
            print(f"Groq Edit Error: {e}")
            return current_config

async def groq_verify_payment(photo_bytes: bytes) -> bool:
    """Send payment screenshot to Groq (Vision) for verification."""
    # Placeholder: In a real production scenario, we'd use a vision model.
    # For now, we simulate a check by returning True for any provided receipt image.
    return True
