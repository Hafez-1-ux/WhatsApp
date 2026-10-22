import React from 'react';
import { 
  Bell, 
  BellOff, 
  Play, 
  Pause, 
  Palette, 
  Sparkles, 
  Clock, 
  BookOpen, 
  Users,
  LayoutDashboard,
  MessageSquarePlus,
  Share2
} from 'lucide-react';
import { BotSettings } from '../types';
import { WhatsAppServerState } from './LiveConnectionCard';

export type AppTab = 
  | 'dashboard' 
  | 'groups' 
  | 'template' 
  | 'vault' 
  | 'custom' 
  | 'schedule' 
  | 'logs';

interface HeaderProps {
  settings: BotSettings;
  serverState: WhatsAppServerState;
  onUpdateSettings: (newSettings: Partial<BotSettings>) => void;
  onOpenExportModal: () => void;
  vaultCount: number;
  sentCount: number;
  groupsCount: number;
  customMessagesCount: number;
  activeTab: AppTab;
  onChangeTab: (tab: AppTab) => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  serverState,
  onUpdateSettings,
  onOpenExportModal,
  vaultCount,
  sentCount,
  groupsCount,
  customMessagesCount,
  activeTab,
  onChangeTab,
}) => {
  const isConnected = serverState.status === 'connected';

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
              <span className="text-xl">🌿</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white whitespace-nowrap">
                  بوت أذكار واتساب
                </h1>
                <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono-numbers">
                  Engine v3
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                إدارة وبث الآيات والأحاديث والأذكار لمجموعاتك الفعلية
              </p>
            </div>
          </div>

          {/* Zone 2: Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-slate-800/80 overflow-x-auto">
            <button
              onClick={() => onChangeTab('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-600 text-white shadow-sm font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>الرئيسية</span>
            </button>

            <button
              onClick={() => onChangeTab('groups')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'groups'
                  ? 'bg-emerald-600 text-white shadow-sm font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>المجموعات ({groupsCount})</span>
            </button>

            <button
              onClick={() => onChangeTab('template')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'template'
                  ? 'bg-emerald-600 text-white shadow-sm font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>شكل الرسالة</span>
            </button>

            <button
              onClick={() => onChangeTab('vault')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'vault'
                  ? 'bg-emerald-600 text-white shadow-sm font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>الموسوعة ({vaultCount})</span>
            </button>

            <button
              onClick={() => onChangeTab('custom')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'custom'
                  ? 'bg-emerald-600 text-white shadow-sm font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <MessageSquarePlus className="w-3.5 h-3.5" />
              <span>رسائل مخصصة ({customMessagesCount})</span>
            </button>

            <button
              onClick={() => onChangeTab('schedule')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'schedule'
                  ? 'bg-emerald-600 text-white shadow-sm font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>الجدولة</span>
            </button>

            <button
              onClick={() => onChangeTab('logs')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'logs'
                  ? 'bg-emerald-600 text-white shadow-sm font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>السجل ({sentCount})</span>
            </button>
          </nav>

          {/* Zone 3: Actions & Quick Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Audio Toggle */}
            <button
              onClick={() => onUpdateSettings({ soundEnabled: !settings.soundEnabled })}
              title={settings.soundEnabled ? 'كتم صوت الإشعار' : 'تفعيل صوت الإشعار'}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            >
              {settings.soundEnabled ? (
                <Bell className="w-4 h-4 text-emerald-400" />
              ) : (
                <BellOff className="w-4 h-4 text-slate-500" />
              )}
            </button>

            {/* Standalone Bot Script Exporter */}
            <button
              onClick={onOpenExportModal}
              title="تصدير كود البوت المستقل للتشغيل على سيرفر خارجي 24/7"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>كود الخادم</span>
            </button>

            {/* Main Bot Activation Toggle */}
            <button
              onClick={() => onUpdateSettings({ isActive: !settings.isActive })}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all shadow-sm ${
                settings.isActive
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-amber-600/90 hover:bg-amber-500 text-white'
              }`}
            >
              {settings.isActive ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span className="hidden sm:inline">الجدولة تعمل</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span className="hidden sm:inline">تشغيل الجدولة</span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
