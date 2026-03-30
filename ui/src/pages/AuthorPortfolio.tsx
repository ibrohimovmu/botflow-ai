import React from 'react';
import { motion } from 'framer-motion';
import { 
  Send, Mail, 
  ExternalLink, Code2, Globe, 
  Bot, Award, Sparkles, User
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const AuthorPortfolio: React.FC = () => {
  const { setPage } = useApp();

  const stats = [
    { label: 'Tajriba', value: '4+ yil', icon: <Sparkles size={16} /> },
    { label: 'Loyihalar', value: '120+', icon: <Bot size={16} /> },
    { label: 'Mijozlar', value: '50+', icon: <User size={16} /> },
  ];

  const socialLinks = [
    { 
      name: 'Telegram', 
      handle: '@ibrohmwv', 
      icon: <Send size={20} />, 
      url: 'https://t.me/ibrohmwv',
      color: 'bg-[#0088cc]'
    },
    { 
      name: 'Email', 
      handle: 'ibrohmwv@gmail.com', 
      icon: <Mail size={20} />, 
      url: 'mailto:ibrohmwv@gmail.com',
      color: 'bg-emerald-500'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 pb-20 pt-10">
      {/* ── Hero / Profile Section ── */}
      <div className="relative mb-16">
        <div className="absolute inset-x-0 -top-40 -z-10 flex justify-center overflow-hidden">
          <div className="w-[800px] h-[400px] bg-emerald-500/10 blur-[120px] rounded-full" />
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          {/* Avatar Area */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <div className="w-40 h-40 md:w-48 md:h-48 rounded-3xl bg-gradient-to-br from-[#1a1f35] to-[#0d1020] border border-white/10 flex items-center justify-center p-1 shadow-2xl overflow-hidden group">
               <div className="absolute inset-x-0 h-1/2 bottom-0 bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors" />
               <User size={80} className="text-white/20 group-hover:text-emerald-400 transition-colors" />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-xl shadow-lg border border-white/20">
              <Award size={20} />
            </div>
          </motion.div>

          {/* Info Area */}
          <div className="flex-1 text-center md:text-left">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h1 className="text-4xl md:text-6xl font-black mb-4">
                Ibrohim<span className="gradient-text">wv</span>
              </h1>
              <p className="text-xl text-white/60 mb-8 max-w-xl">
                Senior Full-Stack dasturchi va AI muhandisi. 
                BotFlow platformasining asoschisi va bosh arxitektori.
              </p>
            </motion.div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              {stats.map((s, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="glass px-4 py-2 rounded-xl border border-white/5 flex items-center gap-2"
                >
                  <span className="text-emerald-400">{s.icon}</span>
                  <span className="text-sm font-bold text-white/90">{s.value}</span>
                  <span className="text-xs text-white/40">{s.label}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Expertise Section ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass rounded-3xl p-8 border border-white/10"
        >
          <div className="flex items-center gap-3 mb-6 font-bold text-lg">
            <Code2 className="text-emerald-400" />
            <h3>Mutaxassislik</h3>
          </div>
          <div className="space-y-4">
            {[
              { name: 'AI Integration', level: '95%' },
              { name: 'Node.js / Python', level: '90%' },
              { name: 'Cloud Architecture', level: '85%' },
              { name: 'Full-Stack (React/Vue)', level: '92%' }
            ].map((skill, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-white/60">{skill.name}</span>
                  <span className="text-emerald-400">{skill.level}</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: skill.level }}
                    transition={{ delay: 0.5 + i * 0.1, duration: 1 }}
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass rounded-3xl p-8 border border-white/10 flex flex-col justify-center"
        >
          <h3 className="text-2xl font-bold mb-4">Haqimda</h3>
          <p className="text-white/50 leading-relaxed mb-6 italic text-lg">
            "Maqsadim — murakkab texnologiyalarni oddiy odamlar uchun qulay va tushunarli qilish. 
            BotFlow orqali minglab odamlarga o'z bizneslarini avtomatlashtirishda yordam bermoqdaman."
          </p>
          <div className="flex gap-4">
            <button 
              onClick={() => setPage('showcase')}
              className="px-8 bg-emerald-500 hover:bg-emerald-400 py-3 rounded-xl text-sm font-bold text-white transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              <Globe size={16} /> Botlar Galereyasi
            </button>
          </div>
        </motion.div>
      </div>

      {/* ── Contact Section ── */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-8">Aloqa kanallari</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {socialLinks.map((link, i) => (
            <motion.a
              key={i}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              whileHover={{ y: -5 }}
              className="glass rounded-2xl p-6 border border-white/10 group cursor-pointer"
            >
              <div className={`w-12 h-12 ${link.color} rounded-xl mx-auto flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                {link.icon}
              </div>
              <p className="text-sm font-bold text-white mb-1 uppercase tracking-widest">{link.name}</p>
              <p className="text-xs text-white/40 flex items-center justify-center gap-1 group-hover:text-emerald-400 transition-colors">
                {link.handle} <ExternalLink size={12} />
              </p>
            </motion.a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AuthorPortfolio;
