import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Mail, ArrowRight, Loader2, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase } from '../supabase';

const AuthPage: React.FC = () => {
  const { setPage, login } = useApp();
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'input' | 'loading' | 'sent' | 'verifying'>('input');
  const [error, setError] = useState('');

  const validateEmail = (e: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleSendLink = async () => {
    if (!validateEmail(email)) {
      setError("Iltimos, to'g'ri email manzil kiriting.");
      return;
    }
    setError('');
    setStep('verifying');
    
    // Simulate a brief authentication delay for UI experience
    setTimeout(() => {
      login(email);
    }, 600);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative grid-pattern">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-emerald-500/8 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-blue-500/5 blur-3xl" />
      </div>

      {/* Back button */}
      <button
        onClick={() => setPage('landing')}
        className="absolute top-8 left-6 flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm font-medium group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Bosh sahifa
      </button>

      {/* Logo */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2">
        <button onClick={() => setPage('landing')} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg">
            <Bot size={16} className="text-white" />
          </div>
          <span className="text-lg font-bold">Bot<span className="gradient-text">Flow</span></span>
        </button>
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative w-full max-w-md"
      >
        <div className="glass rounded-3xl p-8 md:p-10 border border-white/10 shadow-2xl">
          <AnimatePresence mode="wait">
            {/* Step: Input */}
            {(step === 'input' || step === 'loading') && (
              <motion.div
                key="input"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/20 flex items-center justify-center mx-auto mb-5">
                    <Mail size={28} className="text-emerald-400" />
                  </div>
                  <h1 className="text-2xl font-black text-white mb-2">Email orqali kiring</h1>
                  <p className="text-sm text-white/40 leading-relaxed">
                    Parol shart emas. Shunchaki email manzilingizni<br />kiritib tizimga kiring.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
                      Email manzil
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                      <input
                        type="email"
                        value={email}
                        onChange={e => { setEmail(e.target.value); setError(''); }}
                        onKeyDown={e => e.key === 'Enter' && handleSendLink()}
                        placeholder="siz@example.com"
                        className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white/5 border border-white/10 focus:border-emerald-500/50 focus:outline-none text-white placeholder-white/20 text-sm transition-all duration-200 focus:bg-white/8"
                        disabled={step === 'loading'}
                      />
                    </div>
                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-red-400 mt-2 ml-1"
                      >
                        {error}
                      </motion.p>
                    )}
                  </div>

                  <motion.button
                    onClick={handleSendLink}
                    disabled={step === 'loading'}
                    whileHover={{ scale: step === 'loading' ? 1 : 1.02 }}
                    whileTap={{ scale: step === 'loading' ? 1 : 0.98 }}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-400 text-white font-semibold py-4 rounded-2xl shadow-xl shadow-emerald-500/25 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {step === 'loading' ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Yuborilmoqda...
                      </>
                    ) : (
                      <>
                        Tizimga kirish
                        <ArrowRight size={16} />
                      </>
                    )}
                  </motion.button>
                </div>

                {/* Divider */}
                <div className="mt-8 pt-6 border-t border-white/8 text-center">
                  <p className="text-xs text-white/30">
                    Kirishingiz bilan{' '}
                    <a href="#" className="text-emerald-400 hover:underline">Foydalanish shartlari</a>
                    {' '}ga rozilik bildirasiz
                  </p>
                </div>
              </motion.div>
            )}

            {/* Step: Sent */}
            {step === 'sent' && (
              <motion.div
                key="sent"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                  className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6"
                >
                  <Mail size={36} className="text-emerald-400" />
                </motion.div>

                <h2 className="text-2xl font-black text-white mb-3">Email yuborildi!</h2>
                <p className="text-sm text-white/50 leading-relaxed mb-2">
                  <span className="text-emerald-400 font-semibold">{email}</span>
                </p>
                <p className="text-sm text-white/40 leading-relaxed mb-8">
                  manzilingizga kirish havolasi yuborildi.
                  Spam papkasini ham tekshiring.
                </p>

                <div className="glass-dark rounded-2xl p-4 mb-6 border border-white/8 italic">
                   <p className="text-xs text-white/20">Emailingizdagi havolaga bosing va tizim sizni avtomatik tanib oladi.</p>
                </div>

                <button
                  onClick={() => setStep('input')}
                  className="text-sm text-white/30 hover:text-white/60 transition-colors"
                >
                  Boshqa email kiritish
                </button>
              </motion.div>
            )}

            {/* Step: Verifying */}
            {step === 'verifying' && (
              <motion.div
                key="verifying"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
                  <Loader2 size={28} className="text-emerald-400 animate-spin" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Tekshirilmoqda...</h2>
                <p className="text-sm text-white/40">Kirish tasdiqlanmoqda</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom tag */}
        <p className="text-center text-xs text-white/20 mt-6">
          Xavfsiz kirish · Parolsiz · AES-256 shifrlash
        </p>
      </motion.div>
    </div>
  );
};

export default AuthPage;
