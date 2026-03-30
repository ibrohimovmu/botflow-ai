import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot, Code2, Terminal,
  LogOut, Menu, X, PanelLeftClose, PanelLeftOpen,
  Globe, User, Trash2, MessageSquare, MessageSquareOff
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import AiChat from '../components/builder/AiChat';
import CodeEditor from '../components/builder/CodeEditor';
import BotTesting from '../components/builder/BotTesting';
import PaywallModal from '../components/modals/PaywallModal';
import { TemplatesPanel } from '../components/builder/TemplatesPanel';

type Panel = 'chat' | 'code' | 'test';

const SidebarContent: React.FC<{ isMobile?: boolean; onClose?: () => void }> = ({ isMobile, onClose }) => {
  const { logout, userEmail, sessions, activeSessionId, createNewSession, switchSession, deleteSession, setPage } = useApp();
  
  return (
    <div className="w-[280px] bg-[#0d1225] border-r border-white/8 flex flex-col h-full shrink-0 shadow-2xl md:shadow-none">
      <div className="p-4 border-b border-white/8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Bot size={18} />
          </div>
          <span className="font-bold">Loyihalar</span>
        </div>
        {isMobile && (
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <X size={18} className="text-white/40" />
          </button>
        )}
      </div>

      <div className="p-3">
        <button 
          onClick={() => { createNewSession(); onClose && onClose(); }}
          className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-[#0a0f1e] rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
        >
          <Bot size={16} /> Yangi Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        <div className="px-3 py-2 text-[10px] font-bold text-white/20 uppercase tracking-widest">Suhbatlar</div>
        {sessions.map(s => (
          <div key={s.id} className="relative group">
            <button
              onClick={() => { switchSession(s.id); onClose && onClose(); }}
              className={`w-full text-left px-3 py-3 rounded-xl transition-all flex items-center justify-between gap-3 ${
                s.id === activeSessionId ? 'bg-white/10 text-white' : 'text-white/40 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className={`w-2 h-2 rounded-full shrink-0 ${s.generatedCode ? 'bg-emerald-400' : 'bg-white/10'}`} />
                <span className="truncate text-sm font-medium">{s.name}</span>
              </div>
            </button>
            {sessions.length > 1 && (
              <button 
                onClick={(e) => { e.stopPropagation(); deleteSession(s.id); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 transition-all"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Showcase & Author links in Sidebar */}
      <div className="p-3 border-t border-white/8 space-y-2">
        <button 
          onClick={() => { setPage('showcase'); onClose && onClose(); }}
          className="w-full py-2.5 px-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold text-[10px] flex items-center gap-3 transition-all border border-white/5"
        >
          <Globe size={14} className="text-emerald-400/70" /> GALEREYA
        </button>
        <button 
          onClick={() => { setPage('author'); onClose && onClose(); }}
          className="w-full py-2.5 px-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold text-[10px] flex items-center gap-3 transition-all border border-white/5"
        >
          <User size={14} className="text-blue-400/70" /> MUALLIF
        </button>
      </div>

      <div className="p-4 border-t border-white/8 bg-black/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold ring-1 ring-white/10">
            {userEmail[0]?.toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs text-white truncate font-medium">{userEmail}</p>
            <p className="text-[10px] text-white/30 truncate">BotFlow Pro</p>
          </div>
        </div>
        <button 
          onClick={logout}
          className="w-full py-2 flex items-center justify-center gap-2 text-xs text-white/30 hover:text-red-400 transition-colors"
        >
          <LogOut size={12} /> Chiqish
        </button>
      </div>
    </div>
  );
};

const BuilderPage: React.FC = () => {
  const { showCodePanel, mobilePanel, setMobilePanel } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [aiPanelOpen, setAiPanelOpen] = useState(true);

  const panels: { id: Panel; label: string; icon: React.ReactNode; color: string }[] = [
    { id: 'chat', label: 'AI Yordamchi', icon: <Bot size={14} />, color: 'text-emerald-400' },
    { id: 'code', label: 'Kod Muharrir', icon: <Code2 size={14} />, color: 'text-blue-400' },
    { id: 'test', label: 'Test Paneli', icon: <Terminal size={14} />, color: 'text-purple-400' },
  ];

  return (
    <div className="h-screen flex flex-col bg-[#0a0f1e] overflow-hidden relative">
      
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
            />
            <motion.div
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 md:hidden"
            >
              <SidebarContent isMobile onClose={() => setSidebarOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Top bar - STICKY */}
      <div className="sticky top-0 z-30 h-12 border-b border-white/8 flex items-center justify-between px-4 shrink-0 glass-dark">
        <div className="flex items-center gap-3">
          {/* Mobile Menu */}
          <button onClick={() => setSidebarOpen(true)} className="md:hidden text-white/40 hover:text-white transition-colors p-1">
            <Menu size={20} />
          </button>
          
          {/* Desktop Toggle Sidebar */}
          <button 
            onClick={() => setDesktopSidebarOpen(!desktopSidebarOpen)} 
            className="hidden md:flex text-white/40 hover:text-white transition-colors p-1.5 hover:bg-white/5 rounded-lg"
            title={desktopSidebarOpen ? "Menyuni yopish" : "Menyuni ochish"}
          >
            {desktopSidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
          </button>
          
          {/* AI Chat Toggle */}
          <button 
            onClick={() => setAiPanelOpen(!aiPanelOpen)} 
            className="hidden md:flex text-white/40 hover:text-white transition-colors p-1.5 hover:bg-white/5 rounded-lg ml-1"
            title={aiPanelOpen ? "AI Chatni yashirish" : "AI Chatni ko'rsatish"}
          >
            {aiPanelOpen ? <MessageSquare size={18} /> : <MessageSquareOff size={18} />}
          </button>

          <div className="flex md:hidden items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
              <Bot size={12} className="text-white" />
            </div>
            <span className="font-bold text-sm">Bot<span className="gradient-text">Flow</span></span>
          </div>
        </div>

        {/* Mobile panel switcher - IN HEADER */}
        <div className="md:hidden flex items-center gap-1 glass rounded-full px-1 py-1">
          {panels.map(p => (
            <button
              key={p.id}
              onClick={() => setMobilePanel(p.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-2 ${
                mobilePanel === p.id ? 'bg-white/10 text-white' : 'text-white/40'
              }`}
            >
              {p.icon}
              {mobilePanel === p.id && <span className="text-[10px] uppercase tracking-wider">{p.id}</span>}
            </button>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          {/* Top right actions if needed */}
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 overflow-hidden flex">
        
        {/* Desktop Permanent Sidebar with Collapse */}
        <AnimatePresence>
          {desktopSidebarOpen && (
            <motion.div 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="hidden md:flex shrink-0 overflow-hidden"
            >
              <SidebarContent />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop: 3 column layout for Main Workspace */}
        <div className="hidden md:flex flex-1 overflow-hidden">
          {/* Left: AI Chat */}
          <AnimatePresence>
            {aiPanelOpen && (
              <motion.div 
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 384, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="shrink-0 border-r border-white/8 flex flex-col overflow-hidden"
              >
                <AiChat />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Center: Code Editor */}
          <AnimatePresence>
            {showCodePanel ? (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 'auto', flex: 1, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                className="border-r border-white/8 flex flex-col overflow-hidden min-w-0"
              >
                <CodeEditor />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex-1 border-r border-white/8 flex flex-col overflow-hidden bg-[#0d1225]"
              >
                <TemplatesPanel />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Right: Testing */}
          <div className="w-72 xl:w-80 shrink-0 flex flex-col overflow-hidden">
            <BotTesting />
          </div>
        </div>

        {/* Mobile: Single panel view */}
        <div className="flex md:hidden flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={mobilePanel}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex-1 overflow-hidden flex flex-col"
            >
              {mobilePanel === 'chat' && <AiChat />}
              {mobilePanel === 'code' && (
                showCodePanel ? <CodeEditor /> : <TemplatesPanel />
              )}
              {mobilePanel === 'test' && <BotTesting />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      
      {/* Paywall Overlay */}
      <PaywallModal />
    </div>
  );
};

export default BuilderPage;
