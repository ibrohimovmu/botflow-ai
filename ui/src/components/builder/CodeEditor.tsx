import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Code2, Copy, Check, Download, FileCode } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const ENV_TEMPLATE = (token: string) => `# .env — Bot konfiguratsiyasi
BOT_TOKEN=${token || 'YOUR_BOT_TOKEN_HERE'}
PYTHON_ENV=production

# Database (ixtiyoriy)
DB_URL=sqlite:///bot_data.db`;

const REQUIREMENTS_TXT = `python-telegram-bot==21.10
python-dotenv==1.0.1
requests==2.32.3
aiohttp==3.11.12`;

type FileTab = 'main.py' | '.env' | 'requirements.txt';

const CodeEditor: React.FC = () => {
  const { generatedCode, botToken } = useApp();
  const [copied, setCopied] = useState(false);
  const [activeFile, setActiveFile] = useState<FileTab>('main.py');

  const files: FileTab[] = ['main.py', '.env', 'requirements.txt'];

  const fileContents: Record<FileTab, string> = {
    'main.py': generatedCode || '# Bot kodi bu yerda paydo bo\'ladi...\n# AI bilan suhbat boshlang! 👈',
    '.env': ENV_TEMPLATE(botToken),
    'requirements.txt': REQUIREMENTS_TXT,
  };

  const language: Record<FileTab, string> = {
    'main.py': 'python',
    '.env': 'bash',
    'requirements.txt': 'python',
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(fileContents[activeFile]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([fileContents[activeFile]], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeFile;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-white/8 flex items-center justify-between shrink-0 glass-dark">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/20 flex items-center justify-center">
            <Code2 size={15} className="text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Kod muharriri</p>
            <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Python v3.12</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            onClick={handleCopy}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1.5 glass text-white/60 hover:text-white px-3 py-1.5 rounded-lg text-xs border border-white/8 transition-colors"
          >
            {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            {copied ? 'Nusxalandi' : 'Nusxa'}
          </motion.button>
          <motion.button
            onClick={handleDownload}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1.5 glass text-white/60 hover:text-white px-3 py-1.5 rounded-lg text-xs border border-white/8 transition-colors"
          >
            <Download size={12} />
          </motion.button>
        </div>
      </div>

      {/* File Tabs */}
      <div className="flex items-center gap-0 border-b border-white/8 bg-black/20 shrink-0 overflow-x-auto no-scrollbar">
        {files.map(f => (
          <button
            key={f}
            onClick={() => setActiveFile(f)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeFile === f
                ? 'border-emerald-400 text-white bg-white/5'
                : 'border-transparent text-white/30 hover:text-white/70'
            }`}
          >
            <FileCode size={11} className={activeFile === f ? 'text-emerald-400' : 'text-white/20'} />
            {f}
          </button>
        ))}
      </div>

      {/* Editor area */}
      <div className="flex-1 overflow-hidden relative">
        {!generatedCode && activeFile === 'main.py' ? (
          /* Placeholder */
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center mb-4 shadow-xl">
              <Code2 size={28} className="text-white/10" />
            </div>
            <p className="text-white/25 text-sm font-medium mb-1 uppercase tracking-widest">KOD MAVJUD EMAS</p>
            <p className="text-white/10 text-[11px] max-w-[180px] leading-relaxed">
              AI yordamchisiga botingiz haqida aytib bering.
            </p>
            <div className="mt-8 flex gap-1.5 items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
              <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
              <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
            </div>
          </div>
        ) : (
          <div className="h-full overflow-auto custom-scrollbar">
            <SyntaxHighlighter
              language={language[activeFile]}
              style={vscDarkPlus}
              showLineNumbers
              lineNumberStyle={{
                color: 'rgba(255,255,255,0.1)',
                fontSize: '10px',
                minWidth: '40px',
                paddingRight: '16px',
                textAlign: 'right'
              }}
              customStyle={{
                margin: 0,
                padding: '20px 0',
                background: 'transparent',
                fontSize: '12px',
                lineHeight: '1.7',
                height: '100%',
                minHeight: '100%',
              }}
              codeTagProps={{
                style: { fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }
              }}
            >
              {fileContents[activeFile]}
            </SyntaxHighlighter>
          </div>
        )}

        {/* Live indicator */}
        {generatedCode && activeFile === 'main.py' && (
          <div className="absolute top-4 right-4 pointer-events-none">
            <div className="flex items-center gap-1.5 bg-emerald-500/10 backdrop-blur-md rounded-full px-2.5 py-1 border border-emerald-500/20 text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
              <span className="pulse-dot w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Active
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeEditor;
