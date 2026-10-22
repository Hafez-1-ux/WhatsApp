import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Copy, 
  Check, 
  FileCode, 
  Package, 
  BookOpen, 
  Terminal, 
  ExternalLink 
} from 'lucide-react';
import { BotSettings, VaultItem } from '../types';
import { 
  generateStandaloneNodeScript, 
  generatePackageJson, 
  generateReadme 
} from '../utils/standaloneBotCode';

interface ExportBotModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: BotSettings;
  vaultItems: VaultItem[];
}

export const ExportBotModal: React.FC<ExportBotModalProps> = ({
  isOpen,
  onClose,
  settings,
  vaultItems,
}) => {
  const [activeFile, setActiveFile] = useState<'bot' | 'package' | 'readme'>('bot');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const botCode = generateStandaloneNodeScript(settings, vaultItems);
  const packageJson = generatePackageJson();
  const readme = generateReadme(settings);

  const getCurrentContent = () => {
    switch (activeFile) {
      case 'bot': return { name: 'bot.js', content: botCode, type: 'text/javascript' };
      case 'package': return { name: 'package.json', content: packageJson, type: 'application/json' };
      case 'readme': return { name: 'README.md', content: readme, type: 'text/markdown' };
    }
  };

  const current = getCurrentContent();

  const handleCopy = () => {
    navigator.clipboard.writeText(current.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const blob = new Blob([current.content], { type: current.type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = current.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAll = () => {
    [
      { name: 'bot.js', content: botCode, type: 'text/javascript' },
      { name: 'package.json', content: packageJson, type: 'application/json' },
      { name: 'README.md', content: readme, type: 'text/markdown' },
    ].forEach((file) => {
      const blob = new Blob([file.content], { type: file.type });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl p-6 shadow-2xl relative my-8 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">تصدير حزمة كود البوت المستقل (Node.js)</h2>
              <p className="text-xs text-slate-400">
                شغّل البوت على مدار الساعة 24/7 على أي خادم مجاناً بدون الحاجة لإبقاء المتصفح مفتوحاً
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* File Tabs & Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 my-4 shrink-0">
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveFile('bot')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeFile === 'bot' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>bot.js (الكود الرئيسي)</span>
            </button>

            <button
              onClick={() => setActiveFile('package')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeFile === 'package' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>package.json</span>
            </button>

            <button
              onClick={() => setActiveFile('readme')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeFile === 'readme' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>README.md (دليل التشغيل)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">تم النسخ</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>نسخ الملف</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadFile}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تنزيل {current.name}</span>
            </button>
          </div>
        </div>

        {/* Code Preview Frame */}
        <div className="flex-1 min-h-[260px] max-h-[380px] bg-slate-950 rounded-xl border border-slate-800 p-4 overflow-auto font-mono text-xs text-emerald-300 leading-relaxed select-text" dir="ltr">
          <pre>{current.content}</pre>
        </div>

        {/* Deployment Recommendation & Footer */}
        <div className="pt-4 mt-4 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
          <div className="text-xs text-slate-400">
            <span className="font-bold text-slate-200">منصات مجانية مقترحة للاستضافة 24/7:</span>
            <div className="flex items-center gap-3 mt-1 text-emerald-400">
              <a href="https://render.com" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                Render.com <ExternalLink className="w-3 h-3" />
              </a>
              <span>·</span>
              <a href="https://railway.app" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                Railway.app <ExternalLink className="w-3 h-3" />
              </a>
              <span>·</span>
              <a href="https://glitch.com" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                Glitch.com <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadAll}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>تنزيل جميع الملفات الثلاثة</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
