import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Search, ArrowRight, Code } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { categories, templates as t1 } from '../../data/templates';
import { templatesPage2 as t2 } from '../../data/templates-p2';
import { templatesPage3 as t3 } from '../../data/templates-p3';
import { templatesPage4 as t4 } from '../../data/templates-p4';

const allTemplates = [...t1, ...t2, ...t3, ...t4];

export const TemplatesPanel: React.FC = () => {
  const { addMessage, sessions, activeSessionId, createNewSession, setGeneratedCode, setBotName } = useApp();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTemplates = useMemo(() => {
    return allTemplates.filter(t => {
      const matchesCat = activeCategory === 'all' || t.category === activeCategory;
      const matchesQuery = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           t.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesQuery;
    });
  }, [activeCategory, searchQuery]);

  const handleUseTemplate = (template: typeof allTemplates[0]) => {
    const currentSession = sessions.find(s => s.id === activeSessionId);
    if (!currentSession || (currentSession.generatedCode && currentSession.generatedCode.length > 50)) {
       createNewSession();
       setTimeout(() => applyTemplate(template), 100);
       return;
    }
    applyTemplate(template);
  };

  const applyTemplate = (template: typeof allTemplates[0]) => {
    const tsFeatures = template.features.map(f => "✅ " + f).join("\n");
    
    addMessage({
      role: 'ai',
      content: `🎉 **${template.title}** shabloni tanlandi va kod tahrirlovchiga yuklandi!\n\n**Bot qanday ishlaydi?**\n${template.description}\n\n**Asosiy imkoniyatlar (Features):**\n${tsFeatures}\n\nEndi ushbu botni jonlantirish uchun menga @BotFather'dan olingan **YANGI TOKEN** yuboring.`
    });
    
    setGeneratedCode(template.code);
    setBotName(template.title);
  };

  return (
    <div className="flex flex-col h-full bg-[#0d1225] text-white">
      {/* Header */}
      <div className="p-6 border-b border-white/5 bg-gradient-to-br from-[#0d1225] to-[#121935] shrink-0 sticky top-0 z-20">
        <h2 className="text-2xl font-black flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <Sparkles className="text-emerald-400" size={24} />
          </div>
          Shablonlar Galereyasi
          <span className="text-xs font-bold bg-white/10 px-2 py-1 rounded w-max text-white/50">{allTemplates.length} ta Bot</span>
        </h2>
        <p className="text-white/40 text-sm mt-2 ml-14">Hech qanday dasturlash bilimisiz, tayyor Telegram botlarni 1 marta bosish orqali ishga tushiring.</p>
        
        {/* Search */}
        <div className="mt-6 relative ml-14">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
          <input 
            type="text"
            placeholder="Shablon izlash (masalan: Do'kon, Admin)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-sm text-white placeholder-white/20 focus:outline-none focus:border-emerald-500/50 transition-colors"
          />
        </div>

        {/* Categories Tabs */}
        <div className="flex gap-2 mt-4 ml-14 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setActiveCategory('all')}
            className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeCategory === 'all' ? 'bg-emerald-500 text-black' : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
            }`}
          >
            Barchasi
          </button>
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeCategory === c.id ? 'bg-emerald-500 text-black' : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid List */}
      <div className="flex-1 overflow-y-auto p-6 bg-[#0a0f1e]">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredTemplates.map((t) => (
              <motion.div
                layout
                key={t.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ y: -6, scale: 1.01 }}
                transition={{ duration: 0.2 }}
                className="group relative flex flex-col glass-dark rounded-2xl border border-white/5 hover:border-emerald-500/50 transition-all overflow-hidden shadow-lg hover:shadow-emerald-500/20"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 via-transparent to-emerald-500/0 group-hover:from-emerald-500/10 group-hover:to-transparent transition-colors duration-500 pointer-events-none" />
                <div className="relative z-10 p-5 flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-white/10 to-transparent border border-white/5 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform shrink-0">
                    {t.title.split(' ')[0]} {/* Emoji ekstraktsiya */}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white text-lg truncate pr-4">{t.title.replace(/^[^\s]+\s/,'')}</h3>
                    <p className="text-white/40 text-sm mt-1 line-clamp-2 leading-relaxed h-10">{t.description}</p>
                    
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {t.features.slice(0,3).map(f => (
                        <span key={f} className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-white/5 border border-white/5 rounded text-emerald-400/80">
                          {f}
                        </span>
                      ))}
                      {t.features.length > 3 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-white/5 border border-white/5 rounded text-white/30">+{t.features.length - 3}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="relative z-10 mt-auto border-t border-white/5 p-4 bg-white/[0.02] flex items-center justify-between group-hover:bg-emerald-500/5 transition-colors">
                  <div className="text-xs font-mono text-white/20 flex items-center gap-1.5">
                    <Code size={12} /> Aiogram v3
                  </div>
                  <button 
                    onClick={() => handleUseTemplate(t)}
                    className="px-4 py-2 bg-white/5 hover:bg-emerald-500 group-hover:bg-emerald-500 hover:text-black group-hover:text-black rounded-lg font-bold text-xs transition-all flex items-center gap-2 group-hover:shadow-lg group-hover:shadow-emerald-500/20"
                  >
                    Ishlatish <ArrowRight size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {filteredTemplates.length === 0 && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 text-white/20">
                <Search size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Natija topilmadi</h3>
              <p className="text-white/40 text-sm">Boshqa so'z bilan qidirib ko'ring yoki toifalarni o'zgartiring.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
