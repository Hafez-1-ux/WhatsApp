import React from 'react';
import { 
  Clock, 
  Sun, 
  Moon, 
  Play, 
  Pause, 
  Send, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  ShieldCheck 
} from 'lucide-react';
import { BotSettings, VaultItem } from '../types';

interface SchedulerControlProps {
  settings: BotSettings;
  onUpdateSettings: (newSettings: Partial<BotSettings>) => void;
  secondsUntilNext: number;
  onBroadcastNow: () => void;
  vaultItems: VaultItem[];
}

export const SchedulerControl: React.FC<SchedulerControlProps> = ({
  settings,
  onUpdateSettings,
  secondsUntilNext,
  onBroadcastNow,
}) => {
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

  const intervalPresets = [
    { label: 'كل 15 دقيقة', value: 15 },
    { label: 'كل 30 دقيقة', value: 30 },
    { label: 'كل ساعة', value: 60 },
    { label: 'كل ساعتين', value: 120 },
    { label: 'كل 3 ساعات', value: 180 },
    { label: 'كل 4 ساعات', value: 240 },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Top Banner: Automation Status & Countdown */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-sm relative overflow-hidden">
        
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                settings.isActive 
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                  : 'bg-amber-950 text-amber-400 border border-amber-800'
              }`}>
                <span className={`w-2 h-2 rounded-full ${settings.isActive ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
                {settings.isActive ? 'محرك الجدولة التلقائية يعمل' : 'محرك الجدولة متوقف مؤقتاً'}
              </span>

              <span className="text-xs text-slate-400 font-mono-numbers">
                {settings.mode === 'morning_evening' ? 'أذكار الصباح والمساء فقط' :
                 settings.mode === 'interval' ? `دوري كل ${settings.intervalMinutes} دقيقة` :
                 `مختلط (الصباح والمساء + دوري كل ${settings.intervalMinutes} دقيقة)`}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {settings.isActive ? (
                <span className="flex items-center gap-2">
                  <span>الذكر القادم خلال:</span>
                  <span className="text-emerald-400 font-mono-numbers font-extrabold">
                    {formatCountdown(secondsUntilNext)}
                  </span>
                </span>
              ) : (
                <span className="text-slate-400">الجدولة متوقفة، انقر للتشغيل</span>
              )}
            </h2>

            <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
              يقوم المحرك باختيار نصوص متنوعة من الآيات والأحاديث والأدعية والأذكار تلقائياً وإرسالها في الموعد المحدد مباشرة عبر مقبس واتساب.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => onUpdateSettings({ isActive: !settings.isActive })}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all shadow-md ${
                settings.isActive
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {settings.isActive ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>إيقاف مؤقت للجدولة</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>تفعيل الجدولة التلقائية</span>
                </>
              )}
            </button>

            <button
              onClick={onBroadcastNow}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md"
            >
              <Send className="w-4 h-4" />
              <span>إرسال فوري الآن</span>
            </button>
          </div>
        </div>

      </div>

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Schedule Mode Selector */}
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <Layers className="w-4 h-4 text-emerald-400" />
            <h3>نظام ونمط الجدولة</h3>
          </div>
          <p className="text-xs text-slate-400">
            حدد كيف ترغب في توزيع الأذكار والنصوص القرآنية والنبوية طوال اليوم
          </p>

          <div className="space-y-2.5 pt-2">
            {[
              {
                id: 'both',
                title: 'شامل: الصباح والمساء + نصوص وتسابيح دورية (موصى به)',
                desc: 'يرسل أذكار الصباح والمساء في أوقاتها المحددة، مع آيات وأحاديث وتسابيح على فترات دورية.'
              },
              {
                id: 'morning_evening',
                title: 'أذكار الصباح والمساء والنوم فقط',
                desc: 'يرسل فقط في أوقات الصباح والمساء وقبل النوم دون رسائل متكررة أثناء ساعات العمل والنهار.'
              },
              {
                id: 'interval',
                title: 'نصوص دورية متكررة فقط',
                desc: 'يرسل آيات وتسابيح متجددة باستمرار كل فترة زمنية تختارها.'
              }
            ].map(item => (
              <label
                key={item.id}
                className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  settings.mode === item.id
                    ? 'bg-emerald-950/40 border-emerald-500/60 text-white shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/40'
                }`}
              >
                <input
                  type="radio"
                  name="schedule_mode"
                  checked={settings.mode === item.id}
                  onChange={() => onUpdateSettings({ mode: item.id as BotSettings['mode'] })}
                  className="mt-1 text-emerald-500 focus:ring-emerald-500"
                />
                <div>
                  <div className="text-xs font-bold text-slate-100">{item.title}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{item.desc}</div>
                </div>
              </label>
            ))}
          </div>

          {/* Interval slider & presets */}
          {(settings.mode === 'interval' || settings.mode === 'both') && (
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300">وتيرة الإرسال الدوري:</span>
                <span className="text-emerald-400 font-mono-numbers font-bold">
                  كل {settings.intervalMinutes} دقيقة
                </span>
              </div>

              {/* Preset buttons */}
              <div className="flex flex-wrap gap-2">
                {intervalPresets.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => onUpdateSettings({ intervalMinutes: preset.value })}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                      settings.intervalMinutes === preset.value
                        ? 'bg-emerald-600 text-white font-bold'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Daily Fixed Times Config */}
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <Clock className="w-4 h-4 text-emerald-400" />
            <h3>مواقيت أذكار اليوم والليلة</h3>
          </div>
          <p className="text-xs text-slate-400">
            حدد الأوقات اليومية الدقيقة لبث أذكار الصباح والمساء والنوم
          </p>

          <div className="space-y-4 pt-2">
            
            {/* Morning Time */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                  <Sun className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200">توقيت أذكار الصباح</div>
                  <div className="text-[11px] text-slate-400">يبدأ من بعد الفجر حتى الشروق</div>
                </div>
              </div>
              <input
                type="time"
                value={settings.morningTime}
                onChange={(e) => onUpdateSettings({ morningTime: e.target.value })}
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono-numbers focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Evening Time */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
                  <Moon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200">توقيت أذكار المساء</div>
                  <div className="text-[11px] text-slate-400">يبدأ من بعد العصر حتى الغروب</div>
                </div>
              </div>
              <input
                type="time"
                value={settings.eveningTime}
                onChange={(e) => onUpdateSettings({ eveningTime: e.target.value })}
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono-numbers focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Sleep Time */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
                  <span className="text-base">🌙</span>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200">توقيت أذكار النوم</div>
                  <div className="text-[11px] text-slate-400">أدعية النوم وخواتيم سورة البقرة</div>
                </div>
              </div>
              <input
                type="time"
                value={settings.sleepTime}
                onChange={(e) => onUpdateSettings({ sleepTime: e.target.value })}
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono-numbers focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

          </div>
        </div>

      </div>

      {/* Safety & Performance banner */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>حماية الحساب: يتم تطبيق فاصل زمني ({settings.template?.antiBanDelaySeconds || 3} ثوانٍ) بين كل مجموعة والأخرى تلقائياً.</span>
        </div>
      </div>

    </div>
  );
};
