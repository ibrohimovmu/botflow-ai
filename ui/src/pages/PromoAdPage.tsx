import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Play, Code, Server, CheckCircle, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import confetti from 'canvas-confetti';

const PromoAdPage: React.FC = () => {
  const { setPage } = useApp();
  const [scene, setScene] = useState(0);

  const startAd = () => {
    setScene(1);
    
    const timeline = [
      { s: 2, delay: 3500 },
      { s: 3, delay: 6500 },
      { s: 4, delay: 9000 },
      { s: 5, delay: 13000 },
      { s: 6, delay: 17000 },
    ];

    timeline.forEach(t => {
      setTimeout(() => {
        setScene(t.s);
        if (t.s === 5) {
          confetti({
            particleCount: 200,
            spread: 120,
            origin: { y: 0.6 },
            colors: ['#10b981', '#34d399', '#ffffff'],
          });
        }
      }, t.delay);
    });
  };

  return (
    <div className="h-screen w-full bg-[#0a0f1e] overflow-hidden relative flex items-center justify-center font-sans text-white">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] mix-blend-screen" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[80px] mix-blend-screen" />
      </div>

      <AnimatePresence mode="wait">
        {scene === 0 && (
          <motion.div
            key="scene0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center gap-6 z-10"
          >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Bot size={40} className="text-white" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-center">BotFlow AI<br/><span className="text-emerald-400">Promo Video</span></h1>
            <p className="text-white/50 text-sm">Ekranni yozishni yoqing (Screen Record) va tugmani bosing</p>
            <button 
              onClick={startAd}
              className="mt-4 px-8 py-4 bg-white text-black rounded-full font-black flex items-center gap-2 hover:scale-105 transition-transform"
            >
              <Play fill="currentColor" size={18} /> Videoni Boshlash
            </button>
            <button onClick={() => setPage('landing')} className="text-xs text-white/30 underline mt-4">Ortga qaytish</button>
          </motion.div>
        )}

        {scene === 1 && (
          <motion.div
            key="scene1"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, filter: 'blur(10px)' }}
            transition={{ duration: 0.8 }}
            className="text-center z-10 px-6 max-w-3xl"
          >
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight drop-shadow-2xl">
              Telegram Bot yaratish<br/>
              <span className="text-red-400">qiyin va qimmatmi?</span>
            </h1>
            <motion.p 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
              className="mt-6 text-2xl text-white/60 font-medium"
            >
              Dasturchi yollash... Oylab kutish...
            </motion.p>
          </motion.div>
        )}

        {scene === 2 && (
          <motion.div
            key="scene2"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ type: 'spring', damping: 20 }}
            className="flex flex-col items-center gap-8 z-10 w-full px-10"
          >
            <h2 className="text-4xl font-bold text-red-400">Tinimsiz muammolar:</h2>
            <div className="flex gap-6 justify-center">
              {[
                { i: <Code size={30}/>, t: "Kod yozish" },
                { i: <Server size={30}/>, t: "Server sozlash" },
                { i: <Zap size={30}/>, t: "API ulash" }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.4 + 0.5 }}
                  className="w-32 h-32 rounded-2xl bg-red-500/10 border border-red-500/20 flex flex-col items-center justify-center gap-3 text-red-300"
                >
                  {item.i}
                  <span className="text-sm font-semibold">{item.t}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {scene === 3 && (
          <motion.div
            key="scene3"
            initial={{ opacity: 0, zoom: 0.5 }}
            animate={{ opacity: 1, zoom: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
            transition={{ duration: 0.5 }}
            className="text-center z-10 bg-emerald-500 text-black px-12 py-8 rounded-full shadow-[0_0_100px_rgba(16,185,129,0.5)] transform scale-150"
          >
            <h1 className="text-6xl font-black tracking-tighter uppercase italic">
              ENDI YO'Q!
            </h1>
          </motion.div>
        )}

        {scene === 4 && (
          <motion.div
            key="scene4"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="text-center z-10 px-6 max-w-4xl"
          >
            <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 mb-8 mb-6">
              <Bot size={20} />
              <span className="font-bold tracking-widest uppercase text-sm">BotFlow AI Bilan tanishing</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight drop-shadow-2xl">
              Shunchaki botga yozing.<br/>
              <span className="text-emerald-400">Sun'iy Intellekt uni yaratadi!</span>
            </h1>
          </motion.div>
        )}

        {scene === 5 && (
          <motion.div
            key="scene5"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, filter: 'blur(20px)' }}
            className="flex flex-col items-center justify-center z-10 w-full max-w-2xl"
          >
            {/* Fake Mockup UI */}
            <div className="w-full bg-[#0d1225] rounded-3xl border border-white/10 shadow-2xl overflow-hidden shadow-emerald-500/10">
              <div className="px-6 py-4 border-b border-white/10 bg-white/5 flex items-center gap-3">
                <Bot className="text-emerald-400" />
                <div className="font-bold">BotFlow AI Architect</div>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-end">
                  <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }} className="bg-blue-500 px-4 py-2 rounded-2xl rounded-tr-sm text-sm inline-block shadow-lg">Menga ovqat yetkazib beruvchi bot kerak.</motion.div>
                </div>
                <div className="flex justify-start">
                  <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.5 }} className="bg-emerald-500 text-black px-4 py-3 rounded-2xl rounded-tl-sm text-sm block shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                    <strong>✅ Tayyor!</strong> Botingiz to'liq kodlandi va API ulandi!<br/>
                    <button className="mt-3 bg-black text-white px-4 py-2 rounded-lg text-xs font-bold w-full">🚀 Ishga tushirish</button>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {scene === 6 && (
          <motion.div
            key="scene6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center z-10 flex flex-col items-center gap-6"
          >
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center shadow-[0_0_80px_rgba(16,185,129,0.5)]">
              <Bot size={48} className="text-white" />
            </div>
            <h1 className="text-6xl font-black tracking-tighter">BotFlow AI</h1>
            <p className="text-2xl text-white/60 mb-6">Kelajak bu yerda. Hozir sinab ko'ring!</p>
            <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-6 py-3 rounded-full border border-emerald-500/20 font-bold text-lg">
              <CheckCircle size={20} />
              BEPUL SINOV MUDDATI
            </div>
            <button onClick={() => setPage('landing')} className="mt-10 px-8 py-3 bg-white/10 hover:bg-white/20 transition-colors rounded-xl text-sm font-semibold text-white/80 border border-white/10">
              Orqaga qaytish (Ad yakunlandi)
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PromoAdPage;
