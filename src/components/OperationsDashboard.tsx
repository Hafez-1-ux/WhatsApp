import React from 'react';
import { 
  Send, 
  Clock, 
  Users, 
  Sparkles, 
  Palette, 
  BookOpen, 
  MessageSquarePlus, 
  ArrowLeft, 
  CheckCircle2, 
  ShieldCheck, 
  RefreshCw 
} from 'lucide-react';
import { LiveConnectionCard, WhatsAppServerState } from './LiveConnectionCard';
import { BotSettings } from '../types';
import { AppTab } from './Header';

interface OperationsDashboardProps {
  serverState: WhatsAppServerState;
  isServerLoading: boolean;
  onRefreshQR: () => void;
  onDisconnect: () => void;
  settings: BotSettings;
  onUpdateSettings: (newSettings: Partial<BotSettings>) => void;
  secondsUntilNext: number;
  onBroadcastRealNow: () => void;
  isBroadcasting: boolean;
  onSyncRealGroups: () => void;
  isSyncingGroups: boolean;
  onChangeTab: (tab: AppTab) => void;
}

export const OperationsDashboard: React.FC<OperationsDashboardProps> = ({
  serverState,
  isServerLoading,
  onRefreshQR,
  onDisconnect,
  settings,
  secondsUntilNext,
  onBroadcastRealNow,
  isBroadcasting,
  onSyncRealGroups,
  isSyncingGroups,
  onChangeTab,
}) => {
  const isConnected = serverState.status === 'connected';
  const activeGroups = settings.groups?.filter((g) => g.enabled) || [];

  const formatCountdown = (totalSeconds: number): string => {
    if (totalSeconds <= 0) return 'جاري الإرسال الفعلي...';
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (hours > 0) {
      return `${hours} ساعة و ${minutes} دقيقة و ${secs} ثانية`;
    }
    return `${minutes} دقيقة و ${secs} ثانية`;
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* 1. Real Connection Terminal (Live QR or Connected Card) */}
      <LiveConnectionCard
        serverState={serverState}
        isLoading={isServerLoading}
        onRefreshQR={onRefreshQR}
        onDisconnect={onDisconnect}
      />

      {/* 2. Operations & Schedule Control Center */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Next Scheduled Dispatch Panel */}
        <div className="lg:col-span-7 bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-sm flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">الجدولة والبث الآلي للمجموعات</h3>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                settings.isActive
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : 'bg-amber-950 text-amber-400 border border-amber-800'
              }`}>
                {settings.isActive ? 'الجدولة تعمل' : 'متوقفة'}
              </span>
            </div>

            <div className="mt-6 space-y-2">
              <span className="text-xs text-slate-400 block font-medium">موعد البث الآلي القادم:</span>
              <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-mono-numbers">
                {settings.isActive ? (
                  <span className="text-emerald-400">{formatCountdown(secondsUntilNext)}</span>
                ) : (
                  <span className="text-slate-500 text-2xl font-sans">الجدولة متوقفة مؤقتاً</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6 text-xs font-mono-numbers">
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[11px] mb-0.5 font-sans">أذكار الصباح</span>
                <span className="text-amber-300 font-bold">{settings.morningTime} ص</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[11px] mb-0.5 font-sans">أذكار المساء</span>
                <span className="text-indigo-300 font-bold">{settings.eveningTime} م</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 col-span-2 sm:col-span-1">
                <span className="text-slate-400 block text-[11px] mb-0.5 font-sans">فترة التسابيح</span>
                <span className="text-emerald-400 font-bold">كل {settings.intervalMinutes} دقيقة</span>
              </div>
            </div>
          </div>

          {/* Quick Action Button */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={onBroadcastRealNow}
              disabled={!isConnected || isBroadcasting || activeGroups.length === 0}
              className="w-full sm:flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-2xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white transition-colors shadow-md"
            >
              <Send className={`w-4 h-4 ${isBroadcasting ? 'animate-bounce' : ''}`} />
              <span>
                {isBroadcasting
                  ? 'جاري الإرسال لمجموعات واتساب...'
                  : `إرسال ذكر حقيقي الآن (${activeGroups.length} مجموعات مفعلة)`}
              </span>
            </button>

            <button
              onClick={() => onChangeTab('schedule')}
              className="w-full sm:w-auto px-4 py-3 rounded-2xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700 whitespace-nowrap"
            >
              إعدادات الأوقات
            </button>
          </div>
        </div>

        {/* Real Groups Overview Panel */}
        <div className="lg:col-span-5 bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-sm flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">المجموعات المستهدفة</h3>
              </div>

              {isConnected && (
                <button
                  onClick={onSyncRealGroups}
                  disabled={isSyncingGroups}
                  className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300"
                  title="جلب المجموعات التي يشارك فيها حسابك تلقائياً"
                >
                  <RefreshCw className={`w-3 h-3 ${isSyncingGroups ? 'animate-spin' : ''}`} />
                  <span>مزامنة المجموعات</span>
                </button>
              )}
            </div>

            <div className="mt-4 space-y-2.5 max-h-[200px] overflow-y-auto pr-1">
              {settings.groups?.map((group) => (
                <div
                  key={group.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800/80"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="text-sm">👥</span>
                    <div className="truncate">
                      <div className="text-xs font-bold text-white truncate max-w-[170px]">
                        {group.name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono-numbers">
                        {group.memberCount ? `${group.memberCount} عضواً` : 'مجموعة نشطة'}
                      </div>
                    </div>
                  </div>

                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md font-mono-numbers ${
                    group.enabled
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-slate-900 text-slate-500 border border-slate-800'
                  }`}>
                    {group.enabled ? 'مفعل' : 'متوقف'}
                  </span>
                </div>
              ))}

              {(!settings.groups || settings.groups.length === 0) && (
                <div className="text-center py-6 text-xs text-slate-500">
                  لا توجد مجموعات مضافة حالياً. امسح QR لمزامنة مجموعاتك.
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono-numbers">
              {activeGroups.length} من {settings.groups?.length || 0} مجموعة مفعلة
            </span>

            <button
              onClick={() => onChangeTab('groups')}
              className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>إدارة المجموعات</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* 3. Quick Navigation Hub Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Template Customizer Banner */}
        <div 
          onClick={() => onChangeTab('template')}
          className="bg-slate-900 rounded-3xl p-5 border border-slate-800 hover:border-emerald-500/50 cursor-pointer transition-all group shadow-sm flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">تخصيص شكل وقالب الرسائل</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">تعديل الفواصل والترويسة والتوقيع</p>
            </div>
          </div>
          <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
        </div>

        {/* Vault Library Banner */}
        <div 
          onClick={() => onChangeTab('vault')}
          className="bg-slate-900 rounded-3xl p-5 border border-slate-800 hover:border-emerald-500/50 cursor-pointer transition-all group shadow-sm flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">موسوعة الآيات والأحاديث والأدعية</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">أقسام مفصولة مع التشكيل والمصادر</p>
            </div>
          </div>
          <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
        </div>

        {/* Custom Messages Banner */}
        <div 
          onClick={() => onChangeTab('custom')}
          className="bg-slate-900 rounded-3xl p-5 border border-slate-800 hover:border-emerald-500/50 cursor-pointer transition-all group shadow-sm flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <MessageSquarePlus className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">الرسائل والإعلانات المخصصة</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">كتابة وبث رسائل خاصة وجدولتها</p>
            </div>
          </div>
          <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
        </div>

      </div>

    </div>
  );
};
