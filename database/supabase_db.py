"""
database/supabase_db.py
Ed-Tech platform uchun Supabase (PostgreSQL) operatsiyalari.
Film boti bu fayl ishlatmaydi.
"""
import logging, re, secrets as _sec
from typing import Optional, Dict, Any, List
from config import SUPABASE_URL, SUPABASE_KEY

def _make_username(full_name: str) -> str:
    """Ism asosida chiroyli username yaratadi: alijonumarov_349"""
    clean = re.sub(r"[^a-z0-9]", "", full_name.lower())
    base  = clean[:12] if clean else "user"
    return f"{base}_{_sec.randbelow(9000)+1000}"

logger = logging.getLogger(__name__)
_client = None


async def get_client():
    """Supabase async client (lazy init)."""
    global _client
    if _client is None:
        from supabase import create_async_client
        _client = await create_async_client(SUPABASE_URL, SUPABASE_KEY)
    return _client


# ── FOYDALANUVCHILAR ─────────────────────────────────────────────────────────

async def get_user_by_tg(tg_id: int) -> Optional[Dict]:
    """Telegram ID orqali foydalanuvchini topish."""
    try:
        c = await get_client()
        r = await c.table("platform_users").select("*").eq("telegram_id", tg_id).execute()
        return r.data[0] if r.data else None
    except Exception as e:
        logger.error(f"[SB] get_user_by_tg: {e}")
        return None


async def get_user_by_username(username: str) -> Optional[Dict]:
    """Username orqali foydalanuvchini topish."""
    try:
        c = await get_client()
        r = await c.table("platform_users").select("*").eq("username", username).execute()
        return r.data[0] if r.data else None
    except Exception as e:
        logger.error(f"[SB] get_user_by_username: {e}")
        return None


async def get_user_by_login(login: str) -> Optional[Dict]:
    """Username YOKI Telegram ID orqali foydalanuvchini topish."""
    try:
        c = await get_client()
        # Avval username sifatida tekshir
        r = await c.table("platform_users").select("*").eq("username", login).execute()
        if r.data:
            return r.data[0]
        # Raqam bo'lsa telegram_id sifatida tekshir
        if login.lstrip("-").isdigit():
            r2 = await c.table("platform_users").select("*").eq("telegram_id", int(login)).execute()
            return r2.data[0] if r2.data else None
        return None
    except Exception as e:
        logger.error(f"[SB] get_user_by_login: {e}")
        return None


async def save_user(data: Dict) -> bool:
    """Foydalanuvchini saqlash yoki yangilash (upsert)."""
    try:
        c = await get_client()
        await c.table("platform_users").upsert(data, on_conflict="telegram_id").execute()
        return True
    except Exception as e:
        logger.error(f"[SB] save_user: {e}")
        return False


async def approve_user(tg_id: int) -> bool:
    """O'qituvchi arizasini tasdiqlash."""
    try:
        c = await get_client()
        await c.table("platform_users").update({"is_approved": True}).eq("telegram_id", tg_id).execute()
        return True
    except Exception as e:
        logger.error(f"[SB] approve_user: {e}")
        return False


async def apply_as_teacher(tg_id: int, full_name: str, bio: str = "") -> bool:
    """O'qituvchi arizasini saqlash (pending)."""
    # Avval mavjudmi tekshiramiz (username saqlansin)
    existing = await get_user_by_tg(tg_id)
    username = existing.get("username") if existing else None
    if not username or username.startswith("pending_"):
        username = _make_username(full_name)
    data = {
        "telegram_id": tg_id,
        "username": username,
        "full_name": full_name,
        "role": "teacher",
        "is_approved": False,
        "password_hash": "pending",
    }
    # bio ustuni bo'lsa qo'shamiz
    try:
        c = await get_client()
        await c.table("platform_users").upsert({**data, "bio": bio[:300]}, on_conflict="telegram_id").execute()
        return True
    except Exception as e:
        if "PGRST204" in str(e) or "bio" in str(e).lower():
            try:
                c = await get_client()
                await c.table("platform_users").upsert(data, on_conflict="telegram_id").execute()
                return True
            except Exception as e2:
                logger.error(f"[SB] apply_as_teacher fallback: {e2}")
        else:
            logger.error(f"[SB] apply_as_teacher: {e}")
        return False


async def get_pending_teachers() -> List[Dict]:
    try:
        c = await get_client()
        r = await c.table("platform_users").select("*").eq("role", "teacher").eq("is_approved", False).execute()
        return r.data or []
    except Exception as e:
        logger.error(f"[SB] get_pending_teachers: {e}")
        return []


async def get_stats() -> Dict[str, int]:
    try:
        c = await get_client()
        r = await c.table("platform_users").select("role, is_approved").execute()
        d = r.data or []
        return {
            "total": len(d),
            "teachers": sum(1 for u in d if u["role"] == "teacher" and u["is_approved"]),
            "pending": sum(1 for u in d if u["role"] == "teacher" and not u["is_approved"]),
            "students": sum(1 for u in d if u["role"] == "student"),
        }
    except Exception as e:
        logger.error(f"[SB] get_stats: {e}")
        return {"total": 0, "teachers": 0, "pending": 0, "students": 0}


# ── GURUHLAR ─────────────────────────────────────────────────────────────────

async def get_classrooms(user_id: int, role: str) -> List[Dict]:
    try:
        c = await get_client()
        if role == "teacher":
            r = await c.table("platform_classrooms").select("*").eq("teacher_id", user_id).execute()
        else:
            m = await c.table("platform_members").select("classroom_id").eq("student_id", user_id).execute()
            ids = [x["classroom_id"] for x in (m.data or [])]
            if not ids:
                return []
            r = await c.table("platform_classrooms").select("*").in_("id", ids).execute()
        return r.data or []
    except Exception as e:
        logger.error(f"[SB] get_classrooms: {e}")
        return []


async def create_classroom(teacher_id: int, name: str, subject: str, code: str) -> bool:
    try:
        c = await get_client()
        await c.table("platform_classrooms").insert({
            "teacher_id": teacher_id,
            "name": name,
            "subject": subject,
            "invite_code": code.upper(),
        }).execute()
        return True
    except Exception as e:
        logger.error(f"[SB] create_classroom: {e}")
        return False


async def join_classroom(student_id: int, invite_code: str) -> str:
    try:
        c = await get_client()
        r = await c.table("platform_classrooms").select("id").eq("invite_code", invite_code.upper()).execute()
        if not r.data:
            return "not_found"
        cid = r.data[0]["id"]
        await c.table("platform_members").insert({"classroom_id": cid, "student_id": student_id}).execute()
        return "success"
    except Exception as e:
        if "duplicate" in str(e).lower():
            return "already_joined"
        logger.error(f"[SB] join_classroom: {e}")
        return "error"


async def get_classroom_members(cid: int) -> List[Dict]:
    try:
        c = await get_client()
        r = await c.table("platform_members").select("*, platform_users(full_name, username)").eq("classroom_id", cid).execute()
        return r.data or []
    except Exception as e:
        logger.error(f"[SB] get_classroom_members: {e}")
        return []
