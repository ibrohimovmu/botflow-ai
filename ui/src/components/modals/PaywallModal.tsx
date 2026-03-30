import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Zap, Shield, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const PaywallModal: React.FC = () => {
  const { showPaywall, setShowPaywall, setIsPro } = useApp();

  if (!showPaywall) return null;

  const handleUpgrade = () => {
    // Simulated successful payment
    setIsPro(true);
    setShowPaywall(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowPaywall(false)}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md bg-[#0d1225] border border-emerald-500/20 rounded-3xl shadow-2xl shadow-emerald-500/10 overflow-hidden"
        >
          {/* Header Glow */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-emerald-500/20 to-transparent pointer-events-none" />

          <button
            onClick={() => setShowPaywall(false)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors z-10"
          >
            <X size={18} />
          </button>

          <div className="p-8 text-center relative z-10">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Sparkles size={32} className="text-white" />
            </div>

            <h2 className="text-2xl font-black text-white mb-2">PRO Ta'rifiga O'ting</h2>
            <p className="text-white/60 text-sm mb-8 leading-relaxed">
              Botni kodini generatsiya qilish va uni real vaqtda serverga ulash uchun PRO ta'rif kerak.
            </p>

            <div className="space-y-4 mb-8 text-left bg-black/20 p-5 rounded-2xl border border-white/5">
              {[
                "Cheksiz AI bot generatsiyasi",
                "Tayyor kodni ko'chirish huquqi",
                "1 bosish orqali avto-deploy (serverga)",
                "Premium tezlik va 24/7 ishlab turish"
              ].map((feat, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-sm text-white/80 font-medium">{feat}</span>
                </div>
              ))}
            </div>

            <button
              onClick={handleUpgrade}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-white font-bold text-lg transition-all active:scale-95 shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 mb-3"
            >
              <Zap size={20} fill="currentColor" />
              Sotib olish ($9.99/oy)
            </button>
            <button
              onClick={() => setShowPaywall(false)}
              className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white font-semibold text-sm transition-all"
            >
              Hozircha kerak emas
            </button>

            <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-white/30 font-medium">
              <Shield size={12} />
              Xavfsiz ulanish. Istalgan vaqtda bekor qiling.
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PaywallModal;
