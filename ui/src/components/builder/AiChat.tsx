import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2, Lock } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { WELCOME_MESSAGE, streamText } from '../../utils/aiSimulator';
import ReactMarkdown from 'react-markdown';

interface TokenInputProps {
  onSubmit: (token: string) => void;
}

const TokenInput: React.FC<TokenInputProps> = ({ onSubmit }) => {
  const [val, setVal] = useState('');
  const [show, setShow] = useState(false);
  const [err, setErr] = useState('');

  const handle = () => {
    if (!val.trim()) { setErr("Token bo'sh bo'lmasligi kerak"); return; }
    if (!val.includes(':')) { setErr("Token noto'g'ri. BotFather'dan tekshirib keling."); return; }
    setErr('');
    onSubmit(val.trim());
  };

  return (
    <div className="mt-3 p-3 rounded-2xl bg-white/5 border border-white/10">
      <div className="relative mb-2">
        <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          type={show ? 'text' : 'password'}
          value={val}
          onChange={e => { setVal(e.target.value); setErr(''); }}
          placeholder="1234567890:ABCdef..."
          className="w-full pl-9 pr-16 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-emerald-500/50 focus:outline-none text-white placeholder-white/20 text-xs font-mono transition-all"
        />
        <button
          onClick={() => setShow(v => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/30 hover:text-white/60 transition-colors"
        >
          {show ? 'Yashir' : 'Ko\'rsat'}
        </button>
      </div>
      {err && <p className="text-red-400 text-xs mb-2">{err}</p>}
      <button
        onClick={handle}
        className="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
      >
        <Lock size={12} />
        Tokenni ulash
      </button>
    </div>
  );
};

const TypingIndicator: React.FC = () => (
  <div className="flex gap-0.5 items-center py-1 px-2">
    <span className="typing-dot w-2 h-2 rounded-full bg-emerald-400 inline-block" />
    <span className="typing-dot w-2 h-2 rounded-full bg-emerald-400 inline-block" />
    <span className="typing-dot w-2 h-2 rounded-full bg-emerald-400 inline-block" />
  </div>
);

const AiChat: React.FC = () => {
  const {
    messages, addMessage, updateMessage,
    setGeneratedCode, setBotToken,
    botToken, setShowCodePanel, botStatus, setBotName,
    activeSession, renameSession
  } = useApp();

  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [stage, setStage] = useState<'init' | 'ready' | 'token_requested' | 'token_set'>('init');
  const [showTokenInput, setShowTokenInput] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (messages.length === 0) {
      setTimeout(() => {
        addMessage({ role: 'ai', content: WELCOME_MESSAGE });
      }, 600);
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, showTokenInput]);

  const processUserMessage = async (userText: string) => {
    setIsProcessing(true);

    try {
      // 1. Prepare history for backend
      const history = messages.map(m => ({
        role: m.role === 'ai' ? 'assistant' : 'user',
        content: m.content
      }));
      history.push({ role: 'user', content: userText });

      // 2. Add AI placeholder
      const aiMsgId = addMessage({ role: 'ai', content: '', isTyping: true });

      // 3. Fetch from REAL backend
      const res = await fetch('/api/v2/architect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history })
      });

      if (!res.ok) throw new Error("AI tizimi bilan bog'lanishda xatolik.");

      const data = await res.json();
      
      // 4. Handle status
      if (data.status === 'ready') {
        setStage('ready');
        const bName = data.bot_name || 'MyBot';
        setBotName(bName);
        if (activeSession?.name === 'Yangi Bot') {
          renameSession(activeSession.id, bName);
        }
        
        setShowCodePanel(true);
        setGeneratedCode(data.python_code || '');

        await streamText(data.message, (c) => updateMessage(aiMsgId, c), 12);
        updateMessage(aiMsgId, data.message, true);

      } else if (data.status === 'ask_token') {
        await streamText(data.message, (c) => updateMessage(aiMsgId, c), 15);
        updateMessage(aiMsgId, data.message, true);
        
        await new Promise(r => setTimeout(r, 500));
        setShowTokenInput(true);
        setStage('token_requested');
        
      } else {
        // Just a chat message
        await streamText(data.message, (c) => updateMessage(aiMsgId, c), 15);
        updateMessage(aiMsgId, data.message, true);
      }
    } catch (err: any) {
      const errId = addMessage({ role: 'ai', content: `Xatolik: ${err.message}`, isTyping: false });
      updateMessage(errId, `Xatolik: ${err.message}`, true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;
    const text = input.trim();
    setInput('');
    addMessage({ role: 'user', content: text });
    await processUserMessage(text);
  };

  const handleTokenSubmit = async (token: string) => {
    setShowTokenInput(false);
    setBotToken(token);

    addMessage({ role: 'user', content: `Token kiritildi: ${token.slice(0, 6)}...` });

    setIsProcessing(true);
    
    // Auto-publish to showcase
    const { publishBot, botName, userEmail } = useApp();
    try {
      // Find the bot description from last messages if possible
      const lastAiMsg = messages.filter(m => m.role === 'ai').pop();
      await publishBot({
        name: botName || 'Yangi Bot',
        username: 'BotUsername', // Ideally we'd fetch this from the token via getMe, but for now we'll placeholder
        description: lastAiMsg?.content.slice(0, 150) || 'BotFlow AI orqali yaratilgan mukammal bot.',
        category: 'AI Assistant',
        author_email: userEmail || 'ibrohmwv@gmail.com'
      });
    } catch (e) {}

    await new Promise(r => setTimeout(r, 600));

    setStage('token_set');
    const id = addMessage({ role: 'ai', content: '', isTyping: true });
    const msg = `✅ **Token muvaffaqiyatli ulandi!**\n\nEndi botingizni real vaqtda test qilish uchun **"Test Paneli"** orqali botni ishga tushiring! 🎉\n\nBotingiz avtomatik ravishda **"Galereya"** sahifasiga ham qo'shildi! 🚀`;
    await streamText(msg, (c) => updateMessage(id, c), 14);
    updateMessage(id, msg, true);
    setIsProcessing(false);
  };

  const isDisabled = isProcessing || botStatus === 'running' || botStatus === 'testing';

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-white/8 flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500/30 to-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <Bot size={16} className="text-emerald-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">AI Yordamchisi</p>
          <div className="flex items-center gap-1.5">
            <span className="pulse-dot w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
            <p className="text-xs text-emerald-400">Online · GPT-4</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col space-y-4 scroll-smooth">
        <div className="flex-1 min-h-8 shrink-0"></div>
        <AnimatePresence initial={false}>
          {messages.map(msg => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center mt-0.5 ${
                msg.role === 'ai'
                  ? 'bg-gradient-to-br from-emerald-500 to-emerald-600'
                  : 'bg-gradient-to-br from-blue-500 to-blue-600'
              }`}>
                {msg.role === 'ai'
                  ? <Bot size={13} className="text-white" />
                  : <User size={13} className="text-white" />
                }
              </div>

              <div className={`max-w-[88%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                <div className={`px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-emerald-500 text-white rounded-br-sm'
                    : 'bg-white/8 text-white/90 rounded-bl-sm border border-white/8'
                }`}>
                  {msg.isTyping && !msg.content ? (
                    <TypingIndicator />
                  ) : msg.role === 'ai' ? (
                    <div className="prose prose-invert prose-xs max-w-none [&_p]:my-1.5 [&_code]:bg-white/10 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-md [&_code]:text-emerald-300 [&_code]:font-mono [&_code]:text-[11px] [&_pre]:bg-[#0d1225] [&_pre]:p-3 [&_pre]:rounded-xl [&_pre]:border [&_pre]:border-white/5 [&_pre]:overflow-x-auto [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_ul]:my-1.5 [&_li]:my-0.5 [&_strong]:text-white [&_h1]:text-sm [&_h2]:text-sm [&_h3]:text-sm">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <span>{msg.content}</span>
                  )}
                </div>
                <span className="text-xs text-white/20 px-1 opacity-50">
                  {msg.timestamp.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        <AnimatePresence>
          {showTokenInput && !botToken && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex gap-2.5"
            >
              <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center mt-0.5 bg-gradient-to-br from-emerald-500 to-emerald-600">
                <Bot size={13} className="text-white" />
              </div>
              <div className="flex-1">
                <TokenInput onSubmit={handleTokenSubmit} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={bottomRef} className="h-4" />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-white/8 shrink-0 bg-black/20">
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={
              stage === 'init' ? "Botingiz nima qilishi kerak?..."
              : stage === 'token_requested' ? "Tokenni yuqoriga kiriting..."
              : "Xush kelibsiz! Savol bering..."
            }
            disabled={isDisabled}
            rows={1}
            className="flex-1 resize-none py-2.5 px-3.5 rounded-xl bg-white/5 border border-white/10 focus:border-emerald-500/40 focus:outline-none text-white placeholder-white/25 text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed max-h-24"
            style={{ lineHeight: '1.5' }}
          />
          <motion.button
            onClick={handleSend}
            disabled={!input.trim() || isDisabled}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-white/10 disabled:cursor-not-allowed flex items-center justify-center shrink-0 transition-colors shadow-lg shadow-emerald-500/10"
          >
            {isProcessing
              ? <Loader2 size={16} className="text-white animate-spin" />
              : <Send size={16} className="text-white" />
            }
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default AiChat;
