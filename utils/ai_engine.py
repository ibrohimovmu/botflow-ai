import json
import httpx
import re
from config import GROQ_KEY

SYSTEM_PROMPT = """Sen — Professional Telegram Bot Arxitektorisan. Sening vazifang foydalanuvchi so'roviga ko'ra juda MURAKKAB va ENTERPRISE darajasidagi bot strukturasini (JSON) yaratish yoki mavjudini tahrirlash.

MUHIM QOIDALAR:
1. MINIMALIZM TAQIQLANADI. Botda kamida 15-25 ta tugma va bo'limlar bo'lishi shart.
2. Har bir tekst HTML formatda, professional va emoji bilan boyitilgan bo'lsin.
3. Agar foydalanuvchi tahrirlashni so'rasa, mavjud JSON-ni o'zgartirib bering.
4. FAQAT JSON QAYTAR.

Format:
{
  "start": {"type": "menu", "text": "...", "buttons": ["...", "..."]},
  "node_id": {"type": "menu", "text": "...", "buttons": ["...", "..."]}
}"""

async def edit_template_with_ai(original_config, user_request):
    """Mavjud shablonni AI yordamida foydalanuvchi xohishiga qarab tahrirlash"""
    prompt = f"Mavjud JSON:\n{json.dumps(original_config)}\n\nFoydalanuvchi o'zgartirish so'rovi: {user_request}\n\nIltimos, ushbu shablonni o'zgartirib, yangi professional JSON qaytar."
    
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={"Authorization": f"Bearer {GROQ_KEY}", "Content-Type": "application/json"},
                json={
                    "model": "llama-3.3-70b-versatile",
                    "messages": [
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": 0.3
                },
                timeout=60
            )
        content = resp.json()["choices"][0]["message"]["content"]
        match = re.search(r'\{.*\}', content, re.DOTALL)
        return json.loads(match.group(0)) if match else json.loads(content)
    except Exception as e:
        print(f"AI Engine Error: {e}")
        return None
