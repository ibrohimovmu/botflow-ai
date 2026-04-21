from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from sqlalchemy import Column, BigInteger, String, Boolean, DateTime, Integer, Text, ForeignKey
import datetime

from config import settings

Base = declarative_base()

# Use Supabase PostgreSQL from settings, fallback to local SQLite for safety
DB_URL = settings.DATABASE_URL or "sqlite+aiosqlite:///aura_studio.db"

engine = create_async_engine(DB_URL, echo=False)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

class User(Base):
    __tablename__ = "users"
    user_id      = Column(BigInteger, primary_key=True)
    username     = Column(String, nullable=True)
    full_name    = Column(String, nullable=True)
    is_verified  = Column(Boolean, default=False)
    is_registered= Column(Boolean, default=False)
    is_terms_accepted = Column(Boolean, default=False)
    join_date    = Column(DateTime, default=datetime.datetime.utcnow)
    referral_code= Column(String, nullable=True)
    referred_by  = Column(BigInteger, nullable=True)
    ref_count    = Column(Integer, default=0)
    bots         = relationship("UserBot", back_populates="owner")

class UserBot(Base):
    __tablename__ = "user_bots"
    id           = Column(Integer, primary_key=True, autoincrement=True)
    owner_id     = Column(BigInteger, ForeignKey("users.user_id"))
    bot_name     = Column(String)
    template     = Column(String)
    token        = Column(String, nullable=True)
    channel      = Column(String, nullable=True)
    admin_id     = Column(String, nullable=True)
    features     = Column(Text, nullable=True)   # JSON string
    config       = Column(Text, nullable=True)   # JSON configuration for bot
    status       = Column(String, default="active")
    expires_at   = Column(DateTime, nullable=True)  # trial expiry timestamp
    owner        = relationship("User", back_populates="bots")

class Referral(Base):
    __tablename__ = "referrals"
    id           = Column(Integer, primary_key=True, autoincrement=True)
    referrer_id  = Column(BigInteger)
    referred_id  = Column(BigInteger)
    joined_at    = Column(DateTime, default=datetime.datetime.utcnow)

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
