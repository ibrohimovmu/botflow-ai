import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Square, Terminal, Bot, Send,
  Clock, Trash2, Loader2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import confetti from 'canvas-confetti';

interface SimMessage {
  id: string;
  text: string;
  from: 'user' | 'bot';
  time: string;
}

const COUNTDOWN_SECONDS = 600; // 10 minutes

const botReplies: Record<string, string[]> = {
  '/start': [
    "👋 Salom! Men BotFlow AI bilan yaratilgan botman.\n\nBuyruqlar:\n/help — Yordam\n/menu — Menyu"
  ],
  '/help': ["📖 Yordam bo'limi:\n/start — Qayta boshlash\n/menu — Menyuni ko'rish\n/info — Ma'lumot"],
  '/menu': ["📋 Asosiy menyu:\n• 📊 Statistika\n• ⚙️ Sozlamalar\n• 📞 Aloqa"],
  'salom': ["Salom! 😊 Qanday yordam bera olaman?"],
};

function getBotReply(text: string): string {
  const lower = text.toLowerCase().trim();
  for (const [key, replies] of Object.entries(botReplies)) {
    if (lower === key || lower.includes(key)) {
      return replies[Math.floor(Math.random() * replies.length)];
    }
  }
  return "🤖 Men real vaqtda Telegram'da ishlayapman! Xabar yuborib ko'ring.";
}

const CountdownTimer: React.FC<{ seconds: number; onExpire: () => void }> = ({ seconds, onExpire }) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const isUrgent = seconds < 120;

  useEffect(() => {
    if (seconds <= 0) onExpire();
  }, [seconds, onExpire]);

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
      isUrgent
        ? 'bg-red-500/20 border border-red-500/40 text-red-400 urgent-pulse'
        : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
    }`}>
      <Clock size={12} className={isUrgent ? 'text-red-400' : 'text-emerald-400'} />
      <span className={isUrgent ? 'pulse-dot' : ''}>
        Sinov rejimi: {mins.toString().padStart(2, '0')}:{secs.toString().padStart(2, '0')} qoldi
      </span>
    </div>
  );
};

const BotTesting: React.FC = () => {
  const { 
    botToken, botStatus, setBotStatus, countdown, setCountdown, 
    logs, addLog, clearLogs, activeSession, setMobilePanel,
    isPro, setShowPaywall
  } = useApp();
  const [simMessages, setSimMessages] = useState<SimMessage[]>([]);
  const [simInput, setSimInput] = useState('');
  const [isStarting, setIsStarting] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'logs'>('chat');
  const [isBotReplying, setIsBotReplying] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const logsBottomRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [simMessages]);
  useEffect(() => {
    logsBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const isRunning = botStatus === 'running';
  const countdownRef = useRef(COUNTDOWN_SECONDS);

  const startCountdown = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    countdownRef.current = COUNTDOWN_SECONDS;
    setCountdown(COUNTDOWN_SECONDS);
    timerRef.current = setInterval(() => {
      countdownRef.current -= 1;
      setCountdown(countdownRef.current);
      if (countdownRef.current <= 0) {
        clearInterval(timerRef.current!);
      }
    }, 1000);
  };

  // Poll for real-time logs from backend
  useEffect(() => {
    let pollInterval: ReturnType<typeof setInterval> | null = null;

    if (isRunning && botToken) {
      pollInterval = setInterval(async () => {
        try {
          const res = await fetch(`/api/v2/tg-bot-status?token=${encodeURIComponent(botToken)}`);
          if (res.ok) {
            const data = await res.json();
            if (data.status && data.status.includes('\n')) {
              const remoteLogs = data.status.split('\n');
              // Only add new logs
              remoteLogs.forEach((line: string) => {
                if (!logs.some(l => l.message === line)) {
                  const type: any = line.includes('✅') ? 'success' : line.includes('❌') ? 'error' : line.includes('💬') ? 'info' : 'info';
                  addLog(line, type);
                }
              });
            }
          }
        } catch (e) {}
      }, 2500);
    }

    return () => { if (pollInterval) clearInterval(pollInterval); };
  }, [isRunning, botToken, logs, addLog]);

  const handleExpire = async () => {
    setBotStatus('expired');
    clearInterval(timerRef.current!);
    addLog('⏰ Sinov muddati tugadi. Bot to\'xtatildi.', 'error');
    
    try {
      await fetch('/api/v2/stop-tg-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: botToken })
      });
    } catch (e) {}

    setSimMessages(prev => [...prev, {
      id: Date.now().toString(),
      text: '⏰ Sinov muddati tugadi.\n\nBot to\'xtatildi. To\'liq versiya uchun Pro tarifga o\'ting.',
      from: 'bot',
      time: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
    }]);
  };

  const handleStart = async () => {
    if (!botToken) return;
    if (!isPro) {
      setShowPaywall(true);
      return;
    }
    setIsStarting(true);
    clearLogs();
    
    addLog('🚀 Bot serverga yuborilmoqda...', 'info');
    
    try {
      const res = await fetch('/api/v2/start-tg-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: botToken,
          instructions: activeSession?.instructions || "BotFlow AI Assistant",
          kb_full: activeSession?.kbData || activeSession?.generatedCode || ""
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Botni ishga tushirib bo'lmadi");

      addLog('✅ Token tasdiqlandi', 'success');
      addLog('🐳 Container ishga tushdi (v1.0)', 'info');
      addLog('🔌 Telegram API ulandi', 'success');
      addLog('✅ Bot muvaffaqiyatli ishga tushdi!', 'success');

      setBotStatus('running');
      startCountdown();

      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#ffffff'],
      });

      // Tabrik tugagandan so'ng (3 soniya), avtomatik ravishda Chat sahifasiga o'tadi
      setTimeout(() => {
        setMobilePanel('chat');
      }, 3000);

      setSimMessages([{
        id: '1',
        text: '👋 Salom! Men real xolatda Telegram\'da ishga tushdim.\n\nUni @BotFather orqali yaratgan botingizga kirib tekshirib ko\'rishingiz mumkin! 🚀',
        from: 'bot',
        time: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
      }]);


    } catch (err: any) {
      addLog(`❌ Xatolik: ${err.message}`, 'error');
      setBotStatus('idle');
    } finally {
      setIsStarting(false);
    }
  };

  const handleStop = async () => {
    addLog('⛔ Bot to\'xtatilmoqda...', 'warning');
    setBotStatus('idle'); // Optimistic
    
    try {
      const res = await fetch('/api/v2/stop-tg-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: botToken })
      });
      
      if (res.ok) {
        addLog('✅ Bot to\'xtatildi', 'success');
        clearInterval(timerRef.current!);
      } else {
        throw new Error();
      }
    } catch (e) {
      addLog('⚠️ Botni to\'xtatishda xatolik, lekin interfeys yangilandi', 'warning');
    }
  };

  const handleSimSend = async () => {
    if (!simInput.trim() || botStatus !== 'running' || isBotReplying) return;
    const text = simInput.trim();
    setSimInput('');

    const now = new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
    setSimMessages(prev => [...prev, { id: Date.now().toString(), text, from: 'user', time: now }]);
    
    setIsBotReplying(true);
    await new Promise(r => setTimeout(r, 1000));

    const reply = getBotReply(text);
    setSimMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: reply, from: 'bot', time: now }]);
    setIsBotReplying(false);
  };

  const canStart = botToken && (botStatus === 'idle' || botStatus === 'stopped');

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-white/8 flex items-center justify-between shrink-0 glass-dark">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/20 flex items-center justify-center">
            <Terminal size={15} className="text-purple-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Test Paneli</p>
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full inline-block ${
                isRunning ? 'bg-emerald-400 pulse-dot' :
                botStatus === 'expired' ? 'bg-red-400' :
                botStatus === 'stopped' ? 'bg-yellow-400' :
                'bg-white/20'
              }`} />
              <p className={`text-[10px] uppercase tracking-wider font-bold ${
                isRunning ? 'text-emerald-400' :
                botStatus === 'expired' ? 'text-red-400' :
                botStatus === 'stopped' ? 'text-yellow-400' :
                'text-white/30'
              }`}>
                {isRunning ? 'Online' :
                 botStatus === 'expired' ? 'Muddati tugadi' :
                 botStatus === 'stopped' ? 'To\'xtatildi' :
                 botStatus === 'building' || isStarting ? 'Yuklanmoqda...' :
                 'Oflayn'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isRunning ? (
            <motion.button
              onClick={handleStop}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            >
              <Square size={10} fill="currentColor" />
              To'xtatish
            </motion.button>
          ) : (
            <motion.button
              onClick={handleStart}
              disabled={!canStart || isStarting}
              whileHover={{ scale: canStart ? 1.05 : 1 }}
              whileTap={{ scale: canStart ? 0.95 : 1 }}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                canStart
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/20'
                  : 'bg-white/5 text-white/10 cursor-not-allowed border border-white/8'
              }`}
            >
              {isStarting ? (
                <><Loader2 size={12} className="animate-spin" /> ...</>
              ) : (
                <><Play size={10} fill="currentColor" /> Ishga tushirish</>
              )}
            </motion.button>
          )}
        </div>
      </div>

      {/* Countdown */}
      <AnimatePresence>
        {isRunning && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 py-2 border-b border-white/8 bg-emerald-500/5 shrink-0"
          >
            <CountdownTimer seconds={countdown} onExpire={handleExpire} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex border-b border-white/8 bg-black/20 shrink-0">
        {(['chat', 'logs'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-[10px] uppercase tracking-widest font-black transition-all border-b-2 ${
              activeTab === tab
                ? 'border-emerald-400 text-white bg-white/5'
                : 'border-transparent text-white/20 hover:text-white/40'
            }`}
          >
            {tab === 'chat' ? 'Preview' : 'Logs'}
          </button>
        ))}
      </div>

      {/* Chat Tab */}
      {activeTab === 'chat' && (
        <div className="flex flex-col flex-1 overflow-hidden bg-[#0d1225]/40">
          <div className="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth">
            {simMessages.length === 0 && !isRunning && (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-30">
                <Bot size={32} className="text-white mb-3" />
                <p className="text-white text-xs font-bold uppercase tracking-wider">Bot oflayn</p>
                <p className="text-white/60 text-[10px] mt-2 max-w-[160px]">
                  Botni ishga tushirganingizdan so'ng bu yerda test qilishingiz mumkin.
                </p>
              </div>
            )}

            {simMessages.map(msg => (
              <div key={msg.id} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[90%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                  msg.from === 'user'
                    ? 'bg-emerald-500 text-white rounded-br-none shadow-lg shadow-emerald-500/10'
                    : 'bg-white/10 text-white/90 rounded-bl-none border border-white/10 glass-dark'
                }`}>
                  {msg.text}
                  <div className={`text-[9px] mt-1 opacity-50 ${msg.from === 'user' ? 'text-right' : ''}`}>
                    {msg.time}
                  </div>
                </div>
              </div>
            ))}

            {isBotReplying && (
              <div className="flex justify-start">
                <div className="px-3 py-3 rounded-2xl bg-white/5 border border-white/10 rounded-bl-none">
                  <div className="flex gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/40 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/40 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/40 animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {isRunning && (
            <div className="p-3 border-t border-white/8 flex gap-2 bg-black/40">
              <input
                value={simInput}
                onChange={e => setSimInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSimSend()}
                placeholder="Xabar yozing..."
                className="flex-1 py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 focus:border-emerald-500/40 focus:outline-none text-white placeholder-white/20 text-xs transition-all"
              />
              <button
                onClick={handleSimSend}
                disabled={!simInput.trim() || isBotReplying}
                className="w-10 h-10 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-white/10 flex items-center justify-center transition-all shadow-lg shadow-emerald-500/10"
              >
                <Send size={14} className="text-white" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <div className="flex flex-col flex-1 overflow-hidden bg-black/40">
          <div className="px-4 py-2 border-b border-white/8 flex items-center justify-between shrink-0 bg-white/5">
            <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Tizim Jurnali</span>
            <button onClick={clearLogs} className="text-white/20 hover:text-red-400 transition-colors">
              <Trash2 size={12} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-1.5 font-mono text-[10px] scroll-smooth">
            {logs.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full opacity-10">
                <Terminal size={32} />
              </div>
            )}
            {logs.map(log => (
              <div key={log.id} className={`flex gap-3 leading-relaxed ${
                log.type === 'success' ? 'text-emerald-400' :
                log.type === 'error' ? 'text-red-400' :
                log.type === 'warning' ? 'text-yellow-400' :
                'text-white/40'
              }`}>
                <span className="opacity-30 shrink-0">
                  [{log.timestamp.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}]
                </span>
                <span className="break-all">{log.message}</span>
              </div>
            ))}
            <div ref={logsBottomRef} />
          </div>
        </div>
      )}
    </div>
  );
};

export default BotTesting;
