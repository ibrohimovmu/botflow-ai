import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Zap, BarChart3, Shield, Globe, Bot, Cpu, Check,
  ChevronRight, ArrowRight, Code2, Layers, Rocket,
  MessageSquare, Terminal
} from 'lucide-react';
import { useApp } from '../context/AppContext';

/* ── Spotlight ─────────────────────────────────────────────── */
const SpotlightHero: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="spotlight"
        style={{
          width: 700, height: 700,
          left: pos.x - 350, top: pos.y - 350,
        }}
      />
      {/* Static glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-blue-500/8 blur-3xl" />
    </div>
  );
};

/* ── Animated Bot Illustration ─────────────────────────────── */
const BotIllustration: React.FC = () => {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick(p => p + 1), 1200);
    return () => clearInterval(t);
  }, []);

  const messages = [
    { text: "Salom! Bot yaratamizmi?", from: 'bot' },
    { text: "Ha, do'kon boti kerak", from: 'user' },
    { text: "Ajoyib! Kod generatsiya qilaman...", from: 'bot' },
  ];

  return (
    <div className="relative w-full max-w-sm mx-auto">
      {/* Phone frame */}
      <div className="relative mx-auto w-64 h-auto glass rounded-3xl p-4 shadow-2xl shadow-black/50 border border-white/10">
        {/* Status bar */}
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="w-16 h-3 rounded-full bg-white/10" />
          <div className="w-16 h-4 rounded-full bg-black/40 border border-white/10 flex items-center justify-center">
            <div className="w-8 h-1.5 rounded-full bg-white/20" />
          </div>
          <div className="w-16 h-3 rounded-full bg-white/10" />
        </div>
        {/* Chat header */}
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
            <Bot size={14} className="text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold text-white">MyShopBot</p>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <p className="text-xs text-emerald-400">online</p>
            </div>
          </div>
        </div>
        {/* Messages */}
        <div className="space-y-2 min-h-[120px]">
          {messages.slice(0, Math.min(tick + 1, 3)).map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                m.from === 'bot'
                  ? 'bg-white/10 text-white/90 rounded-bl-sm'
                  : 'bg-emerald-500 text-white rounded-br-sm'
              }`}>
                {m.text}
              </div>
            </motion.div>
          ))}
          {tick >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="px-3 py-2 rounded-2xl bg-white/10 flex gap-1 items-center">
                <span className="typing-dot w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                <span className="typing-dot w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                <span className="typing-dot w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              </div>
            </motion.div>
          )}
        </div>
        {/* Input */}
        <div className="mt-3 flex gap-2 items-center">
          <div className="flex-1 h-8 rounded-full bg-white/5 border border-white/10" />
          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
            <ArrowRight size={12} className="text-white" />
          </div>
        </div>
      </div>
      {/* Floating badges */}
      <motion.div
        animate={{ y: [-4, 4, -4] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-4 -right-4 glass rounded-2xl px-3 py-2 border border-white/10 shadow-xl"
      >
        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
          <Zap size={12} />
          <span>5 daqiqada tayyor</span>
        </div>
      </motion.div>
      <motion.div
        animate={{ y: [4, -4, 4] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -bottom-4 -left-4 glass rounded-2xl px-3 py-2 border border-white/10 shadow-xl"
      >
        <div className="flex items-center gap-1.5 text-xs text-blue-400 font-semibold">
          <Code2 size={12} />
          <span>AI kod generatsiya</span>
        </div>
      </motion.div>
    </div>
  );
};

/* ── Feature Card ──────────────────────────────────────────── */
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
  color: string;
  delay: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, desc, color, delay }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className="glass rounded-2xl p-6 card-hover cursor-default"
    >
      <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center mb-4 shadow-lg`}>
        {icon}
      </div>
      <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-white/50 leading-relaxed">{desc}</p>
    </motion.div>
  );
};

/* ── Stats Counter ─────────────────────────────────────────── */
const StatItem: React.FC<{ value: string; label: string; delay: number }> = ({ value, label, delay }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5, delay }}
      className="text-center"
    >
      <p className="text-4xl font-black gradient-text mb-1">{value}</p>
      <p className="text-sm text-white/50">{label}</p>
    </motion.div>
  );
};

/* ── Pricing Card ──────────────────────────────────────────── */
interface PricingProps {
  title: string; price: string; period?: string; desc: string;
  features: string[]; cta: string; popular?: boolean; delay: number;
  onCta: () => void;
}

const PricingCard: React.FC<PricingProps> = ({ title, price, period, desc, features, cta, popular, delay, onCta }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      className={`relative rounded-2xl p-8 card-hover flex flex-col h-full ${
        popular
          ? 'bg-gradient-to-b from-emerald-500/20 to-emerald-900/10 border border-emerald-500/40 shadow-xl shadow-emerald-500/10'
          : 'glass border border-white/10'
      }`}
    >
      {popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-400 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg shadow-emerald-500/30">
            ⭐ Eng mashhur
          </div>
        </div>
      )}
      <div className="mb-6">
        <p className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-2">{title}</p>
        <div className="flex items-end gap-1 mb-3">
          <span className="text-5xl font-black text-white">{price}</span>
          {period && <span className="text-white/40 mb-2 text-sm">{period}</span>}
        </div>
        <p className="text-sm text-white/50">{desc}</p>
      </div>
      <ul className="space-y-3 mb-8 flex-1">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-white/70">
            <Check size={15} className="text-emerald-400 mt-0.5 shrink-0" />
            {f}
          </li>
        ))}
      </ul>
      <motion.button
        onClick={onCta}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className={`w-full py-3 rounded-full font-semibold text-sm transition-all duration-200 ${
          popular
            ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50'
            : 'glass text-white/80 hover:text-white border border-white/10 hover:border-white/20'
        }`}
      >
        {cta}
      </motion.button>
    </motion.div>
  );
};

/* ── How It Works ──────────────────────────────────────────── */
const steps = [
  { icon: <MessageSquare size={20} className="text-white" />, title: "Tasvirlab bering", desc: "Botingiz nima qilishi kerakligini o'zbek tilida yozing. AI tushunadi." },
  { icon: <Cpu size={20} className="text-white" />, title: "AI kod yozadi", desc: "GPT-4 real vaqtda to'liq Node.js kodni generatsiya qiladi." },
  { icon: <Terminal size={20} className="text-white" />, title: "Token ulang", desc: "BotFather'dan token kiriting — AI avtomatik integratsiya qiladi." },
  { icon: <Rocket size={20} className="text-white" />, title: "Ishga tushiring", desc: "Bir tugma bilan botingizni 10 daqiqalik sinov rejimida ishga tushiring." },
];

/* ── Landing Page ──────────────────────────────────────────── */
const LandingPage: React.FC = () => {
  const { setPage } = useApp();

  const features = [
    { icon: <Zap size={20} className="text-white" />, title: "Tezkor Deployment", desc: "Botingizni bir necha soniya ichida ishga tushiring. Zero-config, zero-hassle.", color: "bg-emerald-500/20 border border-emerald-500/30", delay: 0 },
    { icon: <Bot size={20} className="text-white" />, title: "AI Kod Generatsiya", desc: "GPT-4 real vaqtda to'liq funksional bot kodi yozadi. Siz faqat tasvirlab bering.", color: "bg-blue-500/20 border border-blue-500/30", delay: 0.1 },
    { icon: <Shield size={20} className="text-white" />, title: "Enterprise Himoya", desc: "AES-256 shifrlash, Docker sandboxing va Supabase RLS bilan xavfsizlik.", color: "bg-purple-500/20 border border-purple-500/30", delay: 0.2 },
    { icon: <BarChart3 size={20} className="text-white" />, title: "Real-time Analitika", desc: "Bot faoliyatini jonli kuzatib boring. Xabarlar soni, foydalanuvchilar, funnel.", color: "bg-orange-500/20 border border-orange-500/30", delay: 0.3 },
    { icon: <Globe size={20} className="text-white" />, title: "API Gateway", desc: "Tashqi servislar bilan integratsiya. Webhook, REST, GraphQL — hammasi tayyor.", color: "bg-pink-500/20 border border-pink-500/30", delay: 0.4 },
    { icon: <Layers size={20} className="text-white" />, title: "Multi-bot Boshqaruv", desc: "Bitta dashboard'dan bir nechta botingizni boshqaring. Team collaboration bilan.", color: "bg-cyan-500/20 border border-cyan-500/30", delay: 0.5 },
  ];

  return (
    <div className="relative min-h-screen grid-pattern">
      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center pt-24 pb-20 px-6">
        <SpotlightHero />
        <div className="relative z-10 max-w-7xl mx-auto w-full">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            {/* Left */}
            <div className="flex-1 text-center lg:text-left max-w-2xl mx-auto lg:mx-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 text-xs font-semibold text-emerald-400 mb-6 border border-emerald-500/20"
              >
                <span className="pulse-dot w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                GPT-4 Powered · Hoziroq sinab ko'ring
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight mb-6"
              >
                100+ Shablonlarni ko'rib{' '}
                <span className="gradient-text">o'zingizning shaxsiy</span>{' '}
                botingizni ishga tushiring
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-lg text-white/50 leading-relaxed mb-10 max-w-xl mx-auto lg:mx-0"
              >
                Kod bilmasangiz ham muammo yo'q. Tayyor shablonlardan birini tanlang yoki AI bilan suhbatlashib nima kutayotganingizni tasvirlang – qolganini biz hal qilamiz.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <motion.button
                  onClick={() => setPage('auth')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-white font-semibold px-8 py-4 rounded-full shadow-xl shadow-emerald-500/30 transition-all duration-200 text-base"
                >
                  <Zap size={18} />
                  Bepul boshlash
                  <ChevronRight size={16} />
                </motion.button>
                <motion.button
                  onClick={() => document.querySelector('#features')?.scrollIntoView({ behavior: 'smooth' })}
                  whileHover={{ scale: 1.03 }}
                  className="flex items-center justify-center gap-2 glass text-white/70 hover:text-white font-medium px-8 py-4 rounded-full border border-white/10 hover:border-white/20 transition-all duration-200 text-base"
                >
                  Imkoniyatlarni ko'rish
                </motion.button>
              </motion.div>

              {/* Social proof */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-10 flex items-center gap-4 justify-center lg:justify-start"
              >
                <div className="flex -space-x-2">
                  {['E', 'A', 'B', 'C', 'D'].map((l, i) => (
                    <div key={i} className={`w-8 h-8 rounded-full border-2 border-[#0a0f1e] flex items-center justify-center text-xs font-bold text-white ${['bg-emerald-500', 'bg-blue-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500'][i]}`}>{l}</div>
                  ))}
                </div>
                <div>
                  <div className="flex gap-0.5 text-yellow-400 text-xs">{'★★★★★'}</div>
                  <p className="text-xs text-white/40 mt-0.5">2,400+ foydalanuvchi</p>
                </div>
              </motion.div>
            </div>

            {/* Right – Illustration */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
              className="flex-1 flex justify-center w-full max-w-sm mx-auto lg:max-w-none"
            >
              <BotIllustration />
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/20"
        >
          <div className="w-5 h-8 rounded-full border border-white/10 flex justify-center pt-1.5">
            <div className="w-1 h-2 rounded-full bg-white/30" />
          </div>
        </motion.div>
      </section>

      {/* ── STATS ── */}
      <section className="py-20 px-6 border-y border-white/5">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12">
          <StatItem value="5min" label="Deploy vaqti" delay={0} />
          <StatItem value="2400+" label="Aktiv foydalanuvchi" delay={0.1} />
          <StatItem value="18k+" label="Bot yaratilgan" delay={0.2} />
          <StatItem value="99.9%" label="Uptime kafolati" delay={0.3} />
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-4">Imkoniyatlar</p>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Hamma narsa bir joyda
            </h2>
            <p className="text-white/40 max-w-xl mx-auto">
              Professional bot yaratish uchun kerakli barcha vositalar tayyor. Sozlashga vaqt sarflamang.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <FeatureCard key={i} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="architecture" className="py-24 px-6 bg-white/2">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-4">Qanday ishlaydi</p>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              4 qadam, va bot tayyor
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative"
              >
                <div className="glass rounded-2xl p-6 h-full border border-white/8 hover:border-emerald-500/30 transition-colors group">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/30 to-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shrink-0 group-hover:border-emerald-500/40 transition-colors">
                      {s.icon}
                    </div>
                    <span className="text-5xl font-black text-white/5">0{i + 1}</span>
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">{s.title}</h3>
                  <p className="text-sm text-white/40 leading-relaxed">{s.desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    <ChevronRight size={20} className="text-white/20" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-4">Narxlar</p>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Har bir ehtiyoj uchun tarif
            </h2>
            <p className="text-white/40">Yashirin to'lovlar yo'q. Istalgan vaqt bekor qilishingiz mumkin.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            <PricingCard
              title="Starter"
              price="Bepul"
              desc="Boshlash uchun ideal"
              features={[
                '1 ta bot',
                '1,000 xabar/oy',
                'Asosiy analitika',
                '10 daqiqalik sinov',
                'Community support',
              ]}
              cta="Bepul boshlash"
              delay={0}
              onCta={() => setPage('auth')}
            />
            <PricingCard
              title="Pro"
              price="$29"
              period="/oy"
              desc="Professional foydalanuvchilar uchun"
              features={[
                '10 ta bot',
                'Cheksiz xabarlar',
                'AI kod generatsiya',
                'Priority support',
                'Custom webhook',
                'Team access (5 kishi)',
              ]}
              cta="Pro ga o'tish"
              popular
              delay={0.1}
              onCta={() => setPage('auth')}
            />
            <PricingCard
              title="Enterprise"
              price="Custom"
              desc="Katta kompaniyalar uchun"
              features={[
                'Cheksiz botlar',
                'White-label yechim',
                'Dedicated server',
                'SLA kafolati',
                '24/7 support',
                'Custom integratsiya',
              ]}
              cta="Bog'lanish"
              delay={0.2}
              onCta={() => setPage('auth')}
            />
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative glass rounded-3xl p-16 text-center border border-white/10 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-blue-500/5 pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
                Shablonlardan shaxsiy{' '}
                <span className="gradient-text">botingizni yarating</span>
              </h2>
              <p className="text-white/50 mb-10 max-w-xl mx-auto text-lg">
                100 ta professional shablonlar va AI yordamchilari sizni kutmoqda. Botingizni 5 daqiqada ishga tushiring.
              </p>
              <motion.button
                onClick={() => setPage('auth')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-400 text-white font-bold px-10 py-5 rounded-full shadow-2xl shadow-emerald-500/30 text-lg transition-all duration-200"
              >
                <Rocket size={20} />
                Hoziroq boshlash
                <ArrowRight size={18} />
              </motion.button>
              <p className="text-white/30 text-sm mt-6 flex items-center justify-center gap-4">
                <span className="flex items-center gap-1"><Check size={14} className="text-emerald-400" />Bepul tarif</span>
                <span className="flex items-center gap-1"><Check size={14} className="text-emerald-400" />Karta shart emas</span>
                <span className="flex items-center gap-1"><Check size={14} className="text-emerald-400" />5 daqiqada tayyor</span>
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
              <Bot size={14} className="text-white" />
            </div>
            <span className="font-bold text-white">Bot<span className="gradient-text">Flow</span></span>
          </div>
          <p className="text-white/30 text-sm">© 2025 BotFlow. Barcha huquqlar himoyalangan.</p>
          <div className="flex gap-6 text-sm text-white/30">
            <a href="#" className="hover:text-white transition-colors">Maxfiylik</a>
            <a href="#" className="hover:text-white transition-colors">Shartlar</a>
            <a href="#" className="hover:text-white transition-colors">Yordam</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
