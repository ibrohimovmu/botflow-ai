import os
import sys
import json
import threading
import time
import requests
from urllib.parse import unquote

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from dotenv import load_dotenv
import google.generativeai as genai
import re

# ─── Boot ────────────────────────────────────────────────────────────────────
print("\n" + "="*50, flush=True)
print("  TG BOT BUILDER — STARTING UP", flush=True)
print("="*50, flush=True)
# ─── AI API Keys ─────────────────────────────────────────────────────────────
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "AIzaSyBZpddBc5j7zEUMr7sUHVb0DS8ZXcSvp_w")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "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")

genai.configure(api_key=GEMINI_API_KEY)

# ─── AI Engine Logic ─────────────────────────────────────────────────────────
SYSTEM_INSTRUCTION = (
    "You are a Senior AI Architect for the TG Bot Builder platform. Uzbek language speaker.\n"
    "1. Speak ONLY as the BUILDER/ENGINEER in Uzbek.\n"
    "2. If user just greets, set 'status': 'chat' and ask how you can help.\n"
    "3. IMPORTANT: If user gives a brief short idea (e.g., 'Kaffe uchun bot', 'Magazin boti'), DO NOT generate code yet. Set 'status': 'chat'. Ask them to clarify its main purpose by explicitly describing 4 distinct variants (e.g., 1. Buyurtma qabul, 2. Xodimlar uchun, 3. Mijozlarga yordamchi, 4. Katalog). Let them choose!\n"
    "4. When the user selects a variant and is ready for the code, DO NOT generate code immediately. First, set 'status': 'ask_token' and ask them: 'Botni ishga tushirish uchun BotFather'dan olingan TOKEN kerak. Iltimos, pastdagi oynaga tokeningizni kiriting.'\n"
    "5. ONLY set 'status': 'ready' when the user has provided the token AND code is complete.\n"
    "6. The 'message' field MUST contain ONLY friendly markdown text meant for the user. NEVER include raw JSON tags or python code inside 'message'.\n"
    "7. 'python_code' MUST be a complete, executable Python script using ONLY 'aiogram' version 3.x. Include 'async def main():', 'dp = Dispatcher()', and 'await dp.start_polling(bot)'. NEVER use v2.x. Add logging and basic error handling.\n"
    "STRICT JSON ONLY: { 'status': 'chat'/'ask_token'/'ready', 'message': 'Faqa inson oqiydigan xabar...', 'bot_name': '...', 'bot_topic': '...', 'instructions': '...', 'kb_data': '...', 'python_code': '...' }"
)

# Models to try (in order of preference)
MODELS_TO_TRY = ["gemini-1.5-flash", "gemini-2.0-flash", "google/gemini-2.0-flash-exp:free", "meta-llama/llama-3.1-8b-instruct:free"]

def get_ai_response(history, last_msg, as_json=False, sys_instruct=SYSTEM_INSTRUCTION):
    """Robust helper to get response from multiple providers (OpenRouter & Gemini)"""
    
    # 1. Try OpenRouter first (very resilient)
    if OPENROUTER_API_KEY and OPENROUTER_API_KEY != "sk-or-v1-...":
        or_models = ["google/gemini-2.0-flash-exp:free", "meta-llama/llama-3.1-8b-instruct:free", "openrouter/auto"]
        for or_m in or_models:
            try:
                url = "https://openrouter.ai/api/v1/chat/completions"
                headers = {
                    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://huggingface.co/spaces/ibrohmwvgmai/filmflowbot",
                    "X-OpenRouter-Title": "TG Bot Builder"
                }
                
                # Format history for OpenAI style
                or_msgs = [{"role": "system", "content": sys_instruct}]
                for m in history:
                    or_msgs.append({"role": "user" if m["role"] == "user" else "assistant", "content": m["parts"][0]})
                or_msgs.append({"role": "user", "content": last_msg})
                
                payload = {
                    "model": or_m,
                    "messages": or_msgs,
                    "response_format": {"type": "json_object"} if as_json else None
                }
                
                res = requests.post(url, headers=headers, json=payload, timeout=15)
                if res.status_code == 200:
                    data = res.json()
                    return data["choices"][0]["message"]["content"], f"OpenRouter:{or_m}"
            except Exception as e:
                print(f"  [OpenRouter Fallback] {or_m} failed: {e}", flush=True)

    # 2. Try direct Google Gemini (second priority)
    for model_name in MODELS_TO_TRY:
        if "/" in model_name: continue # Skip OpenRouter names
        try:
            model = genai.GenerativeModel(model_name, system_instruction=sys_instruct)
            chat = model.start_chat(history=history)
            
            gen_config = {"response_mime_type": "application/json"} if as_json else None
            resp = chat.send_message(last_msg, generation_config=gen_config)
            
            if resp and resp.text:
                return resp.text, f"Gemini:{model_name}"
        except Exception as e:
            print(f"  [Gemini Fallback] Model {model_name} failed: {e}", flush=True)
            continue
            
    return None, None

# ─── State ────────────────────────────────────────────────────────────────────
tg_bots: dict = {}
tg_bot_states: dict = {}
stop_flags: dict = {}

# ─── FastAPI App ──────────────────────────────────────────────────────────────
app = FastAPI(title="TG Bot Builder", docs_url=None, redoc_url=None)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# ─── Static Files ─────────────────────────────────────────────────────────────
BASE_DIR = getattr(sys, '_MEIPASS', os.path.dirname(os.path.abspath(__file__)))
DIST_DIR = os.path.join(BASE_DIR, "dist")
DIST_INDEX = os.path.join(DIST_DIR, "index.html")

# Force serve from /dist
if os.path.exists(DIST_DIR):
    assets_path = os.path.join(DIST_DIR, "assets")
    if os.path.exists(assets_path):
        app.mount("/assets", StaticFiles(directory=assets_path), name="assets")
        print(f"  SERVING: Assets from /dist/assets ✅", flush=True)
    print(f"  SERVING: BotFlow build from /dist ✅", flush=True)
else:
    print(f"  WARNING: /dist not found! Production UI is missing.", flush=True)

# ─── Pydantic Models ─────────────────────────────────────────────────────────
class ArchitectRequest(BaseModel):
    messages: list[dict]

class BotRequest(BaseModel):
    token: str
    instructions: str = ""
    kb_full: str = ""

class StopRequest(BaseModel):
    token: str

# ─── Bot Worker Thread ────────────────────────────────────────────────────────
def add_state_log(token, log):
    current = tg_bot_states.get(token, "")
    tg_bot_states[token] = (current + "\n" + log).strip()

def tg_worker(token: str, instructions: str, kb_full: str):
    base = f"https://api.telegram.org/bot{token}"
    print(f"  [WORKER] Starting for token {token[:10]}...", flush=True)

    # 1. Clean shutdown of any OLD workers for this token
    stop_flags[token] = False 
    tg_bot_states[token] = "🔄 Bot serverga yuborilmoqda..."

    # 2. Verify token and clear webhooks
    try:
        # Delete webhook first (critical to stop conflict)
        requests.get(f"{base}/deleteWebhook?drop_pending_updates=True", timeout=10)
        time.sleep(1) 

        me_res = requests.get(f"{base}/getMe", timeout=10).json()
        if not me_res.get("ok"):
            add_state_log(token, "❌ Xatolik: Token noto'g'ri (Unauthorized)")
            return
        
        bot_username = me_res["result"].get("username", "Bot")
        add_state_log(token, f"✅ @{bot_username} ulandi!")
        add_state_log(token, "🚀 Bot ishlamoqda! Start bosing.")
    except Exception as e:
        add_state_log(token, "❌ Xatolik: Telegram API bilan ulanish bo'lmadi.")
        return

    offset = 0
    start_time = time.time()

    while not stop_flags.get(token, False):
        if time.time() - start_time > 600:
            add_state_log(token, "⏰ 10 daqiqalik sinov muddati tugadi.")
            break

        try:
            resp = requests.get(f"{base}/getUpdates", params={"offset": offset, "timeout": 20}, timeout=25)
            if not resp or not resp.ok: 
                time.sleep(2)
                continue
            
            data = resp.json()
            if not data.get("ok"): 
                time.sleep(2)
                continue

            for update in data.get("result", []):
                offset = update["update_id"] + 1
                msg = update.get("message")
                if not msg: continue
                
                chat_id = msg["chat"]["id"]
                user_text = msg.get("text", "").strip()
                if not user_text: continue

                if user_text.lower() == "/start":
                    custom_sys = f"You are a newly created telegram bot. Instructions to follow: {instructions}"
                    prompt = "Say hello and explain your purpose briefly in Uzbek."
                else:
                    custom_sys = f"{instructions}\nAdditional Knowledge Context:\n{kb_full}"
                    prompt = user_text

                raw_text, _ = get_ai_response([], prompt, as_json=False, sys_instruct=custom_sys)
                reply = raw_text if raw_text else "Kechirasiz, so'rovingiz tushunilmadi."
                
                requests.post(f"{base}/sendMessage", json={"chat_id": chat_id, "text": reply}, timeout=10)
                add_state_log(token, f"💬 Xabar yuborildi: {chat_id}")

        except Exception as e:
            print(f"  [WORKER ERROR] {e}", flush=True)
            time.sleep(3)

    tg_bot_states.pop(token, None)
    stop_flags.pop(token, None)
    tg_bots.pop(token, None)
    print(f"  WORKER STOPPED: {token[:12]}...", flush=True)

    tg_bot_states.pop(token, None)
    stop_flags.pop(token, None)
    tg_bots.pop(token, None)
    print(f"  WORKER STOPPED: {token[:12]}...", flush=True)

# ─── API Endpoints ────────────────────────────────────────────────────────────

@app.post("/api/v2/architect")
async def architect(req: ArchitectRequest):
    try:
        # 1. Prepare history
        history = []
        for m in req.messages[:-1]:
            role = "user" if m["role"] == "user" else "model"
            history.append({"role": role, "parts": [m["content"]]})
        
        last_msg = req.messages[-1]["content"]
        
        # 2. Get AI Response with fallback
        raw_text, model_used = get_ai_response(history, last_msg, as_json=True)
        
        if not raw_text:
            return JSONResponse({"error": "Barcha AI modellari band yoki xatolik yuz berdi. Iltimos keyinroq sinab ko'ring."}, status_code=500)

        # Robust JSON Extraction
        import re
        # Try to find ```json ... ``` blocks first
        match_md = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', raw_text, re.DOTALL | re.IGNORECASE)
        if match_md:
            clean_text = match_md.group(1)
        else:
            match_brace = re.search(r'\{.*\}', raw_text, re.DOTALL)
            if match_brace:
                clean_text = match_brace.group(0)
            else:
                clean_text = raw_text.strip()
            
        try:
            result = json.loads(clean_text)
            if "status" not in result: result["status"] = "chat"
            if "message" not in result or not result["message"]: 
                result["message"] = "Tushunarli. Yana qanday xususiyatlar qo'shamiz?"
            if "python_code" not in result: result["python_code"] = "# Kod generatsiya qilinmadi"
            return result
        except:
            clean_msg = re.sub(r'\{?\s*["\']?status["\']?\s*:\s*["\']?(ready|chat)["\']?,?\s*', '', raw_text, flags=re.IGNORECASE)
            clean_msg = re.sub(r'["\']?message["\']?\s*:\s*["\']?', '', clean_msg, flags=re.IGNORECASE)
            clean_msg = clean_msg.strip("} \n\r\"'")
            return {"status": "chat", "message": clean_msg[:800], "bot_name": "", "bot_topic": "", "instructions": "", "kb_data": "", "python_code": ""}

    except Exception as e:
        print(f"ARCHITECT ERROR: {e}")
        return JSONResponse({"error": f"Tizimda og'ir xatolik: {str(e)}"}, status_code=500)

@app.post("/api/v2/start-tg-bot")
async def start_bot(req: BotRequest):
    token = req.token.strip()
    if not token or ":" not in token:
        return JSONResponse({"error": "Token format noto'g'ri"}, status_code=400)

    # Validate before thread start
    try:
        base = f"https://api.telegram.org/bot{token}"
        me_res = requests.get(f"{base}/getMe", timeout=10).json()
        if not me_res.get("ok"):
            return JSONResponse({"error": "Token xato (Unauthorized)"}, status_code=401)
    except Exception as e:
        return JSONResponse({"error": f"API Error: {str(e)}"}, status_code=500)

    # Force kill old threads for THIS token
    stop_flags[token] = True
    time.sleep(1.5) # Give it time to break the loop

    t = threading.Thread(target=tg_worker, args=(token, req.instructions, req.kb_full), daemon=True)
    tg_bots[token] = t
    t.start()
    return {"status": "started"}

@app.post("/api/v2/stop-tg-bot")
async def stop_bot(req: StopRequest):
    token = req.token.strip()
    stop_flags[token] = True
    tg_bot_states[token] = "To'xtatildi"
    return {"status": "stopped"}

@app.get("/api/v2/tg-bot-status")
async def bot_status(token: str = ""):
    return {"status": tg_bot_states.get(token, "Offline"), "active": token in tg_bots}

@app.get("/health")
async def health():
    return {"status": "TG Bot Builder is alive", "ai": bool(GEMINI_API_KEY)}

# ─── Webhook fallback ─────────────────────────────────────────────────────────
@app.post("/webhook/{token:path}")
async def webhook(token: str, request: Request):
    token = unquote(token)
    print(f"  WEBHOOK: {token[:12]}...", flush=True)
    return {"ok": True}

# ─── Kill old Service Worker ────────────────────────────────────────────────────
@app.get("/sw.js")
async def kill_sw():
    js_code = """
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))))
  );
  self.registration.unregister();
});
"""
    return Response(content=js_code, media_type="application/javascript")

# ─── Serve React SPA (catch-all) ──────────────────────────────────────────────
@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    if os.path.exists(DIST_INDEX):
        return FileResponse(DIST_INDEX)
    return JSONResponse({"error": "Frontend not built. Run: cd ui && npm run build"}, status_code=200)

# ─── Startup ──────────────────────────────────────────────────────────────────
@app.on_event("startup")
async def on_startup():
    print("  STATUS: TG BOT BUILDER READY 🚀", flush=True)

    def heartbeat():
        while True:
            time.sleep(60)
            print("  HEARTBEAT: alive ✅", flush=True)

    threading.Thread(target=heartbeat, daemon=True).start()

# ─── Entry ────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 7860))
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="info")