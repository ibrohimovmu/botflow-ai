// UI Helpers and constants for the AI Chat
export const WELCOME_MESSAGE = `Salom! 👋 Men BotFlow AI yordamchisiman.

Telegram botingizni yaratishni boshlaymiz. Iltimos, botingiz **nima qilishi kerakligini** tasvirlab bering.

Masalan:
• "Do'kon uchun bot — mahsulot katalogi va buyurtma qabul qilsin"
• "FAQ bot — savollarni javoblar bilan qaytarsin"  
• "Xabar tarqatuvchi bot — kanalga post yuborsin"

Botingiz qanday bo'lishi kerak? 🤔`;

export async function streamText(
  text: string,
  onChunk: (chunk: string) => void,
  delayMs = 18
): Promise<void> {
  for (let i = 0; i < text.length; i++) {
    await new Promise(r => setTimeout(r, delayMs));
    onChunk(text.slice(0, i + 1));
  }
}

