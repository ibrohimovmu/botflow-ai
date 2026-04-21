from aiogram import BaseMiddleware, types
from typing import Callable, Any, Awaitable, Dict
from sqlalchemy import select
from database.models import async_session, User
from handlers.start import AuthStates

class AuthMiddleware(BaseMiddleware):
    async def __call__(
        self,
        handler: Callable[[types.TelegramObject, Dict[str, Any]], Awaitable[Any]],
        event: types.TelegramObject,
        data: Dict[str, Any]
    ) -> Any:
        # User ID olish (Message yoki CallbackQuery bo'lishi mumkin)
        user_id = data.get("event_from_user").id
        
        # FSM state ni tekshirish
        state = data.get("state")
        current_state = await state.get_state() if state else None

        # Agar foydalanuvchi captcha kutish holatida bo'lsa yoki start bosgan bo'lsa - ruxsat berish
        if current_state == AuthStates.waiting_captcha.state:
            return await handler(event, data)

        async with async_session() as session:
            result = await session.execute(select(User).where(User.user_id == user_id))
            user = result.scalar_one_or_none()

            # Agar foydalanuvchi bazada bo'lmasa yoki tasdiqlanmagan bo'lsa
            if not user or not user.is_verified:
                # FAQAT callback_query bo'lsa alert chiqarish
                if isinstance(event, types.CallbackQuery):
                    await event.answer("⚠️ Avval xavfsizlik testidan o'ting!", show_alert=True)
                    return
                # Message bo'lsa start ga yo'naltirish (bizda AuthStates mantiqi bor)
                # Shunchaki start buyrug'i bo'lsa o'tkazib yuborish
                if isinstance(event, types.Message) and event.text == "/start":
                    return await handler(event, data)
                
                return # Boshqa amallarni bloklash

        return await handler(event, data)
