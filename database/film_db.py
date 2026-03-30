"""
database/film_db.py
Film boti uchun local SQLite operatsiyalari.
HF Dataset orqali zaxiralanadi (ShadowSync).
"""
import sqlite3
import os
import logging
from typing import Optional, Dict, List, Any

logger = logging.getLogger(__name__)
DB_PATH = "data/film.db"


def get_conn():
    os.makedirs("data", exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_film_db():
    """Barcha jadvallarni yaratish."""
    with get_conn() as conn:
        conn.executescript("""
        CREATE TABLE IF NOT EXISTS film_users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tg_id INTEGER UNIQUE NOT NULL,
            full_name TEXT,
            username TEXT,
            balance INTEGER DEFAULT 0,
            approved_movies INTEGER DEFAULT 0,
            referral_count INTEGER DEFAULT 0,
            rewards_claimed INTEGER DEFAULT 0,
            referrer_id INTEGER,
            joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS movies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code TEXT UNIQUE NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            file_id TEXT NOT NULL,
            file_type TEXT DEFAULT 'video',
            views INTEGER DEFAULT 0,
            added_by INTEGER,
            added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS movie_views (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            movie_id INTEGER,
            user_id INTEGER,
            viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(movie_id, user_id)
        );
        """)
    logger.info("[FilmDB] Jadvallar tayyor ✅")


# ── FOYDALANUVCHILAR ─────────────────────────────────────────────────────────

def get_film_user(tg_id: int) -> Optional[Dict]:
    with get_conn() as c:
        r = c.execute("SELECT * FROM film_users WHERE tg_id=?", (tg_id,)).fetchone()
        return dict(r) if r else None


def ensure_film_user(tg_id: int, full_name: str = "", username: str = "", referrer_id: int = None) -> Dict:
    """Foydalanuvchini yaratish yoki mavjudini qaytarish."""
    with get_conn() as c:
        existing = c.execute("SELECT * FROM film_users WHERE tg_id=?", (tg_id,)).fetchone()
        if existing:
            return dict(existing)
        c.execute(
            "INSERT INTO film_users (tg_id, full_name, username, referrer_id) VALUES (?,?,?,?)",
            (tg_id, full_name, username, referrer_id)
        )
        r = c.execute("SELECT * FROM film_users WHERE tg_id=?", (tg_id,)).fetchone()
        return dict(r)


def increment_user_movies(tg_id: int):
    """Foydalanuvchi qo'shgan kinolar sonini +1 qilish."""
    with get_conn() as c:
        c.execute("UPDATE film_users SET approved_movies = approved_movies + 1 WHERE tg_id=?", (tg_id,))


def get_all_user_ids() -> list:
    """Barcha foydalanuvchilar ID larini qaytarish (broadcast uchun)."""
    with get_conn() as c:
        rows = c.execute("SELECT tg_id FROM film_users").fetchall()
        return [r["tg_id"] for r in rows]


def update_film_user_balance(tg_id: int, amount: int):
    with get_conn() as c:
        c.execute("UPDATE film_users SET balance = balance + ? WHERE tg_id=?", (amount, tg_id))


def get_film_user_stats(tg_id: int) -> Dict:
    u = get_film_user(tg_id)
    return u or {}


# ── KINOLAR ──────────────────────────────────────────────────────────────────

def add_movie(code: str, title: str, file_id: str, file_type: str = "video",
              description: str = "", added_by: int = None) -> bool:
    try:
        with get_conn() as c:
            c.execute(
                "INSERT INTO movies (code, title, description, file_id, file_type, added_by) VALUES (?,?,?,?,?,?)",
                (code.upper(), title, description, file_id, file_type, added_by)
            )
        return True
    except sqlite3.IntegrityError:
        return False  # code allaqachon mavjud


def get_movie(code: str) -> Optional[Dict]:
    with get_conn() as c:
        r = c.execute("SELECT * FROM movies WHERE code=?", (code.upper(),)).fetchone()
        return dict(r) if r else None


def delete_movie(code: str) -> bool:
    with get_conn() as c:
        cur = c.execute("DELETE FROM movies WHERE code=?", (code.upper(),))
        return cur.rowcount > 0


def search_movies(query: str) -> List[Dict]:
    with get_conn() as c:
        rows = c.execute(
            "SELECT * FROM movies WHERE title LIKE ? OR code LIKE ? LIMIT 10",
            (f"%{query}%", f"%{query}%")
        ).fetchall()
        return [dict(r) for r in rows]


def get_all_movies(limit: int = 50, offset: int = 0) -> List[Dict]:
    with get_conn() as c:
        rows = c.execute("SELECT * FROM movies ORDER BY added_at DESC LIMIT ? OFFSET ?", (limit, offset)).fetchall()
        return [dict(r) for r in rows]


def increment_views(movie_code: str, user_id: int):
    with get_conn() as c:
        movie = c.execute("SELECT id FROM movies WHERE code=?", (movie_code.upper(),)).fetchone()
        if not movie:
            return
        try:
            c.execute("INSERT INTO movie_views (movie_id, user_id) VALUES (?,?)", (movie["id"], user_id))
            c.execute("UPDATE movies SET views = views + 1 WHERE id=?", (movie["id"],))
        except sqlite3.IntegrityError:
            pass  # allaqachon ko'rgan


def get_movie_count() -> int:
    with get_conn() as c:
        return c.execute("SELECT COUNT(*) FROM movies").fetchone()[0]


def get_user_count() -> int:
    with get_conn() as c:
        return c.execute("SELECT COUNT(*) FROM film_users").fetchone()[0]
