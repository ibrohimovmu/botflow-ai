import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, Search, 
  ArrowRight, Globe, Plus, LayoutGrid
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const ShowcasePage: React.FC = () => {
  const { publicBots, fetchPublicBots, setPage } = useApp();
  const [filter, setFilter] = useState('Barchasi');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPublicBots();
  }, [fetchPublicBots]);

  const categories = ['Barchasi', 'E-commerce', 'Support', 'Admin', 'AI Assistant', 'Utility'];

  const filteredBots = publicBots.filter(bot => {
    const matchesFilter = filter === 'Barchasi' || bot.category === filter;
    const matchesSearch = bot.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          bot.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 pb-20 pt-10">
      {/* ── Hero / Header ── */}
      <div className="text-center mb-12">
        <motion.div
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           className="inline-flex items-center gap-2 mb-6 px-4 py-2 glass rounded-full border border-emerald-500/20 text-xs font-bold text-emerald-400"
        >
          <Globe size={14} className="pulse-dot" />
          Kommuniti Galereyasi · Jonli Dashboard
        </motion.div>
        
        <h1 className="text-4xl md:text-6xl font-black mb-4">
          Botlar <span className="gradient-text">Ko'rgazmasi</span>
        </h1>
        <p className="text-white/40 max-w-2xl mx-auto">
          BotFlow foydalanuvchilari tomonidan yaratilgan va serverga ulanib, ishlayotgan eng yaxshi botlar to'plami.
        </p>
      </div>

      {/* ── Search & Filter ── */}
      <div className="flex flex-col md:flex-row gap-4 mb-12">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
          <input 
            type="text" 
            placeholder="Botlarni qidirish..."
            className="w-full bg-[#0d1225] border border-white/8 rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-emerald-500/50 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scroll-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-5 py-3 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all border ${
                filter === cat 
                  ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20' 
                  : 'bg-white/5 text-white/40 border-white/5 hover:border-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Bot Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredBots.map((bot, i) => (
            <motion.div
              key={bot.username + i}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2, delay: i * 0.05 }}
              className="glass relative rounded-3xl border border-white/8 p-5 flex flex-col group card-hover shadow-xl overflow-hidden"
            >
              {/* Status Badge */}
              <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-400/20">
                <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                JONLI
              </div>

              {/* Bot Icon */}
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1a1f35] to-[#0d1020] border border-white/10 flex items-center justify-center mb-4 text-white p-2">
                 <Bot size={24} className="text-emerald-400" />
              </div>

              {/* Details */}
              <h3 className="text-lg font-bold mb-1 group-hover:text-emerald-400 transition-colors uppercase truncate">{bot.name}</h3>
              <p className="text-[11px] text-white/30 font-semibold uppercase tracking-wider mb-3">@{bot.username}</p>
              
              <p className="text-sm text-white/50 leading-relaxed mb-6 line-clamp-3 h-15">
                {bot.description}
              </p>

              <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] font-bold text-white/20 uppercase">{bot.category}</span>
                <a 
                  href={`https://t.me/${bot.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-500 transition-colors"
                >
                  OCHISH <ArrowRight size={14} />
                </a>
              </div>
            </motion.div>
          ))}
          
          {/* Add your bot CTA */}
          <motion.button
            onClick={() => setPage('builder')}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-3xl border border-dashed border-white/10 p-6 flex flex-col items-center justify-center gap-4 hover:border-emerald-500/40 hover:bg-emerald-500/5 group text-center transition-all min-h-[250px]"
          >
            <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center text-white/20 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all">
              <Plus size={30} className="group-hover:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white mb-1">Botingizni qo'shing</p>
              <p className="text-xs text-white/30">Bot yarating va u avtomatik <br/> shu yerda paydo bo'ladi.</p>
            </div>
            <div className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-3 py-1 rounded-full border border-emerald-400/20 opacity-0 group-hover:opacity-100 transition-opacity">
               HOZIROQ BOSHLASH
            </div>
          </motion.button>
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredBots.length === 0 && (
        <div className="py-20 text-center">
          <LayoutGrid size={40} className="mx-auto text-white/10 mb-4" />
          <p className="text-white/40">Hech qanday bot topilmadi.</p>
        </div>
      )}
    </div>
  );
};

export default ShowcasePage;
