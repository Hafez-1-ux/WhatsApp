import React from 'react';
import { 
  QrCode, 
  RefreshCw, 
  Power, 
  CheckCircle2, 
  AlertCircle, 
  Smartphone, 
  ShieldCheck, 
  Wifi, 
  HelpCircle 
} from 'lucide-react';

export interface WhatsAppServerState {
  status: 'disconnected' | 'connecting' | 'qr_ready' | 'connected';
  phoneNumber: string | null;
  pushName: string | null;
  qrDataUrl: string | null;
  connectedAt: string | null;
  lastError: string | null;
}

interface LiveConnectionCardProps {
  serverState: WhatsAppServerState;
  isLoading: boolean;
  onRefreshQR: () => void;
  onDisconnect: () => void;
}

export const LiveConnectionCard: React.FC<LiveConnectionCardProps> = ({
  serverState,
  isLoading,
  onRefreshQR,
  onDisconnect,
}) => {
  const isConnected = serverState.status === 'connected';
  const hasAuth = Boolean(serverState.phoneNumber);
  const isReconnecting = serverState.status === 'connecting' && hasAuth;
  const showConnectedView = isConnected || hasAuth;

  return (
    <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-sm relative overflow-hidden">
      
      {/* Background ambient glow */}
      <div className={`absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl -z-10 pointer-events-none transition-all ${
        showConnectedView ? 'bg-emerald-500/10' : 'bg-amber-500/5'
      }`} />

      {/* Card Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div className="flex items-center gap-3.5">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-inner ${
            showConnectedView
              ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30'
              : 'bg-amber-600/15 text-amber-400 border-amber-500/30'
          }`}>
            <Smartphone className="w-6 h-6" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {showConnectedView ? 'حساب واتساب متصل وجاهز للبث' : 'ربط حساب واتساب الفعلي'}
              </h2>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold font-mono-numbers ${
                isConnected
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : isReconnecting
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60'
                    : 'bg-amber-950 text-amber-400 border border-amber-800'
              }`}>
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : isReconnecting ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
                {isConnected ? 'متصل ومفعل' : isReconnecting ? 'تأكيد الاستقرار (متصل)' : 'بانتظار مسح الرمز'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {showConnectedView
                ? `مرتبط بحساب: ${serverState.phoneNumber} (${serverState.pushName || 'WhatsApp User'})`
                : 'امسح رمز QR من هاتفك لربط البوت بحسابك مباشرة دون وسطاء'}
            </p>
          </div>
        </div>

        {showConnectedView ? (
          <button
            onClick={onDisconnect}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800 transition-colors"
          >
            <Power className="w-3.5 h-3.5" />
            <span>قطع الاتصال بالرقم</span>
          </button>
        ) : (
          <button
            onClick={onRefreshQR}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
            <span>تحديث رمز QR</span>
          </button>
        )}
      </div>

      {/* Main Connection Area */}
      {showConnectedView ? (
        <div className="py-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1">
            <span className="text-[11px] text-slate-400 block font-bold">رقم الهاتف المتصل:</span>
            <span className="text-base font-bold text-emerald-400 font-mono-numbers">
              {serverState.phoneNumber}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1">
            <span className="text-[11px] text-slate-400 block font-bold">وقت بدء الاتصال:</span>
            <span className="text-base font-bold text-white font-mono-numbers">
              {serverState.connectedAt || 'الآن'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1">
            <span className="text-[11px] text-slate-400 block font-bold">حالة الخادم الداخلي:</span>
            <span className="text-base font-bold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>مقبس Baileys نشط ومستقر</span>
            </span>
          </div>
        </div>
      ) : (
        <div className="py-6 flex flex-col md:flex-row items-center justify-between gap-8">
          
          {/* QR Code Container */}
          <div className="flex flex-col items-center shrink-0">
            <div className="p-4 bg-white rounded-3xl shadow-xl border-4 border-slate-700 relative flex items-center justify-center min-w-[240px] min-h-[240px]">
              {serverState.qrDataUrl ? (
                <img
                  src={serverState.qrDataUrl}
                  alt="WhatsApp Web QR Code"
                  className="w-56 h-56 rounded-xl select-none"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-700 gap-3 py-10">
                  <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
                  <span className="text-xs font-bold text-slate-900">جاري توليد رمز الـ QR من الخادم...</span>
                </div>
              )}
            </div>
            
            <p className="text-[11px] text-slate-400 mt-2 text-center">
              يتم تحديث الرمز تلقائياً كل بضع ثوانٍ لحماية الجلسة
            </p>
          </div>

          {/* Step-by-Step Instructions */}
          <div className="flex-1 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <QrCode className="w-4 h-4 text-emerald-400" />
              <span>خطوات ربط رقمك في 3 خطوات بسيطة:</span>
            </h3>

            <ol className="space-y-3 list-decimal list-inside text-xs text-slate-300 leading-relaxed">
              <li className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-bold text-white">افتح تطبيق واتساب على هاتفك.</span>
              </li>
              <li className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-bold text-white">
                  اضغط على الإعدادات (أو الثلاث نقاط ⋮ بأعلى الشاشة) واختر <span className="text-emerald-400 font-bold">"الأجهزة المرتبطة" (Linked Devices)</span>.
                </span>
              </li>
              <li className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-bold text-white">
                  اضغط على <span className="text-emerald-400 font-bold">"ربط جهاز"</span> ووجّه كاميرا هاتفك نحو الرمز المجاور.
                </span>
              </li>
            </ol>

            <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-900/50 flex items-start gap-2 text-xs text-emerald-300">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                الاتصال مشفر ومباشر بين خادم التطبيق وخوادم واتساب الرسمية دون حفظ لأي بيانات حساسة.
              </span>
            </div>
          </div>

        </div>
      )}

      {/* Error Banner if any */}
      {serverState.lastError && (
        <div className="mt-4 p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{serverState.lastError}</span>
        </div>
      )}

    </div>
  );
};
