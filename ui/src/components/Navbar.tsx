import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Menu, X, Zap, Globe, User } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Navbar: React.FC = () => {
  const { page, setPage, isLoggedIn, logout, userEmail } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const navLinks = [
    { label: 'Galereya', icon: <Globe size={14} />, onClick: () => setPage('showcase') },
    { label: 'Muallif', icon: <User size={14} />, onClick: () => setPage('author') },
    { label: 'Imkoniyatlar', href: '#features' },
    { label: 'Narxlar', href: '#pricing' },
  ];

  const scrollTo = (href: string) => {
    if (page !== 'landing') { 
      setPage('landing'); 
      setTimeout(() => {
        document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
      }, 100); 
    }
    else document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'py-3' : 'py-5'}`}
    >
      <div className={`mx-auto max-w-7xl px-6 rounded-2xl transition-all duration-300 ${scrolled ? 'glass shadow-2xl' : ''}`}>
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <motion.button
            onClick={() => setPage('landing')}
            className="flex items-center gap-2.5 group"
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Bot size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Bot<span className="gradient-text">Flow</span>
            </span>
          </motion.button>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(l => (
              <button
                key={l.label}
                onClick={() => l.onClick ? l.onClick() : l.href && scrollTo(l.href)}
                className="flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors duration-200 font-medium"
              >
                {l.icon && <span className="text-emerald-400/50">{l.icon}</span>}
                {l.label}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <button
                  onClick={() => setPage('builder')}
                  className="text-sm font-bold text-emerald-400 hover:text-emerald-300 transition-colors px-4 py-2"
                >
                  DASHBOARD
                </button>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full glass text-sm border border-white/5">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-xs font-bold text-white">
                    {userEmail[0]?.toUpperCase()}
                  </div>
                  <span className="text-white/70 max-w-[100px] truncate">{userEmail}</span>
                </div>
                <button
                  onClick={logout}
                  className="text-xs font-bold text-white/30 hover:text-red-400 transition-colors px-3 py-2"
                >
                  CHIQISH
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setPage('auth')}
                  className="text-sm text-white/70 hover:text-white transition-colors px-4 py-2 rounded-full font-medium"
                >
                  Kirish
                </button>
                <motion.button
                  onClick={() => setPage('auth')}
                  className="flex items-center gap-1.5 text-sm font-bold bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-white px-5 py-2.5 rounded-full shadow-lg shadow-emerald-500/25 transition-all duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Zap size={14} />
                  BOSHLASH
                </motion.button>
              </>
            )}
          </div>

          {/* Mobile burger */}
          <button
            onClick={() => setMobileOpen(v => !v)}
            className="md:hidden text-white/70 hover:text-white transition-colors p-2"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden mx-4 mt-2 rounded-2xl glass overflow-hidden border border-white/10"
          >
            <div className="p-4 flex flex-col gap-2">
              {navLinks.map(l => (
                <button
                  key={l.label}
                  onClick={() => {
                    if (l.onClick) l.onClick();
                    else if (l.href) scrollTo(l.href);
                    setMobileOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white hover:bg-white/5 rounded-xl transition-all text-sm font-medium"
                >
                  {l.icon && <span className="text-emerald-400">{l.icon}</span>}
                  {l.label}
                </button>
              ))}
              <div className="border-t border-white/10 my-2" />
              {isLoggedIn ? (
                <>
                  <button onClick={() => { setPage('builder'); setMobileOpen(false); }} className="text-left px-4 py-3 text-emerald-400 hover:bg-white/5 rounded-xl text-sm font-bold">DASHBOARD</button>
                  <button onClick={() => { logout(); setMobileOpen(false); }} className="text-left px-4 py-3 text-red-400 hover:bg-white/5 rounded-xl text-sm font-bold">CHIQISH</button>
                </>
              ) : (
                <>
                  <button onClick={() => { setPage('auth'); setMobileOpen(false); }} className="text-left px-4 py-3 text-white/70 hover:text-white hover:bg-white/5 rounded-xl text-sm font-medium">Kirish</button>
                  <button onClick={() => { setPage('auth'); setMobileOpen(false); }} className="px-4 py-3 bg-emerald-500 text-white rounded-xl text-sm font-bold text-center">BOSHLASH</button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
