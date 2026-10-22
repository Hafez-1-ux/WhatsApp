import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  QrCode, 
  Key, 
  CheckCircle2, 
  RefreshCw, 
  Power, 
  ShieldCheck, 
  ArrowLeft, 
  Copy, 
  Check 
} from 'lucide-react';
import { PhoneConnection } from '../types';

interface PhoneConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  connection: PhoneConnection;
  onUpdateConnection: (conn: Partial<PhoneConnection>) => void;
}

export const PhoneConnectionModal: React.FC<PhoneConnectionModalProps> = ({
  isOpen,
  onClose,
  connection,
  onUpdateConnection,
}) => {
  const [method, setMethod] = useState<'qr' | 'pairing_code'>('qr');
  const [phoneInput, setPhoneInput] = useState(connection.phoneNumber || '+966 50 123 4567');
  const [isPairing, setIsPairing] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('ATHK-9824');
  const [codeCopied, setCodeCopied] = useState(false);

  if (!isOpen) return null;

  const handleStartPairing = () => {
    setIsPairing(true);
    const randomCode = `ATHK-${Math.floor(1000 + Math.random() * 9000)}`;
    setGeneratedCode(randomCode);

    // Simulate connection completion
    setTimeout(() => {
      onUpdateConnection({
        status: 'connected',
        phoneNumber: phoneInput.trim(),
        deviceName: 'AthkarBot Engine (Web)',
        connectedAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        pairingCode: randomCode,
        method: 'pairing_code'
      });
      setIsPairing(false);
    }, 1500);
  };

  const handleSimulateQrScan = () => {
    setIsPairing(true);
    setTimeout(() => {
      onUpdateConnection({
        status: 'connected',
        phoneNumber: phoneInput.trim() || '+966 50 123 4567',
        deviceName: 'AthkarBot Studio (WhatsApp Web)',
        connectedAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        method: 'qr'
      });
      setIsPairing(false);
    }, 1200);
  };

  const handleDisconnect = () => {
    onUpdateConnection({
      status: 'disconnected',
      phoneNumber: '',
      connectedAt: undefined,
      pairingCode: undefined
    });
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl p-6 sm:p-8 shadow-2xl relative my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">ربط رقم هاتفك بـ بوت واتساب</h2>
              <p className="text-xs text-slate-400">اربط رقمك الشخصي أو رقم البوت لإرسال الأذكار إلى الجروبات تلقائياً</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status view when connected */}
        {connection.status === 'connected' ? (
          <div className="py-6 space-y-6">
            <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-800/80 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>الهاتف متصل وجاهز للبث</span>
                  </div>
                  <h3 className="text-base font-bold text-white font-mono-numbers mt-0.5">
                    {connection.phoneNumber || '+966 50 123 4567'}
                  </h3>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-1">
                    <span>الجهاز: {connection.deviceName}</span>
                    <span>·</span>
                    <span>آخر مزامنة: {connection.connectedAt || 'الآن'}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleDisconnect}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800 transition-colors"
                title="فصل الرقم الحالي"
              >
                <Power className="w-3.5 h-3.5" />
                <span>فصل الرقم</span>
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2">
              <div className="font-bold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>ماذا يحدث الآن بعد ربط الرقم؟</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                يقوم البوت الآن باستخدام جلسة الواتساب المرتبطة لإرسال الأذكار المجدولة تلقائياً إلى جميع المجموعات التي حددتها في لوحة التحكم، كما يمكنك الإرسال الفوري لأي جروب بنقرة زر.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
              >
                تم، العودة للوحة التحكم
              </button>
            </div>
          </div>
        ) : (
          /* Connecting flow */
          <div className="py-4 space-y-5">
            
            {/* Method selection tabs */}
            <div className="flex items-center gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
              <button
                onClick={() => setMethod('qr')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                  method === 'qr' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>مسح رمز QR (مثل واتساب ويب)</span>
              </button>

              <button
                onClick={() => setMethod('pairing_code')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                  method === 'pairing_code' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Key className="w-3.5 h-3.5" />
                <span>الربط برقم الهاتف وكود التأكيد</span>
              </button>
            </div>

            {method === 'qr' ? (
              /* QR Code view */
              <div className="flex flex-col items-center space-y-4">
                <div className="p-4 bg-white rounded-2xl shadow-xl border-4 border-emerald-500/20 relative group">
                  {/* Stylized QR placeholder */}
                  <svg className="w-48 h-48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="100" height="100" fill="white"/>
                    {/* Corners */}
                    <rect x="5" y="5" width="28" height="28" rx="4" fill="#0F172A"/>
                    <rect x="9" y="9" width="20" height="20" rx="2" fill="white"/>
                    <rect x="13" y="13" width="12" height="12" rx="1" fill="#10B981"/>
                    
                    <rect x="67" y="5" width="28" height="28" rx="4" fill="#0F172A"/>
                    <rect x="71" y="9" width="20" height="20" rx="2" fill="white"/>
                    <rect x="75" y="13" width="12" height="12" rx="1" fill="#10B981"/>

                    <rect x="5" y="67" width="28" height="28" rx="4" fill="#0F172A"/>
                    <rect x="9" y="71" width="20" height="20" rx="2" fill="white"/>
                    <rect x="13" y="75" width="12" height="12" rx="1" fill="#10B981"/>

                    {/* Matrix patterns */}
                    <rect x="38" y="10" width="8" height="8" fill="#0F172A"/>
                    <rect x="50" y="15" width="10" height="6" fill="#0F172A"/>
                    <rect x="38" y="24" width="14" height="6" fill="#0F172A"/>
                    <rect x="10" y="38" width="6" height="12" fill="#0F172A"/>
                    <rect x="22" y="42" width="10" height="8" fill="#0F172A"/>
                    <rect x="38" y="36" width="24" height="24" rx="2" fill="#0F172A"/>
                    <rect x="42" y="40" width="16" height="16" fill="white"/>
                    <rect x="46" y="44" width="8" height="8" fill="#10B981"/>
                    <rect x="68" y="38" width="8" height="14" fill="#0F172A"/>
                    <rect x="80" y="44" width="14" height="8" fill="#0F172A"/>
                    <rect x="38" y="68" width="12" height="10" fill="#0F172A"/>
                    <rect x="54" y="66" width="8" height="18" fill="#0F172A"/>
                    <rect x="68" y="70" width="16" height="8" fill="#0F172A"/>
                    <rect x="68" y="82" width="22" height="12" fill="#0F172A"/>
                  </svg>

                  <div className="absolute inset-0 bg-slate-950/70 rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity p-4 text-center">
                    <span className="text-xs text-white font-bold mb-2">اضغط للربط المباشر الآن</span>
                    <button
                      onClick={handleSimulateQrScan}
                      className="px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 text-white shadow-md hover:bg-emerald-400"
                    >
                      تأكيد المسح والربط
                    </button>
                  </div>
                </div>

                {/* Steps instructions */}
                <ol className="text-xs text-slate-300 space-y-1.5 list-decimal list-inside leading-relaxed text-right w-full bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <li>افتح تطبيق واتساب على هاتفك.</li>
                  <li>اضغط على <span className="text-emerald-400 font-bold">الإعدادات</span> (أو القائمة الثلاثية ⋮) ثم <span className="text-emerald-400 font-bold">الأجهزة المرتبطة</span>.</li>
                  <li>اضغط على <span className="text-emerald-400 font-bold">ربط جهاز</span> ووجّه الكاميرا نحو الرمز أعلاه.</li>
                </ol>

                <button
                  onClick={handleSimulateQrScan}
                  disabled={isPairing}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white transition-colors shadow-md"
                >
                  <RefreshCw className={`w-4 h-4 ${isPairing ? 'animate-spin' : ''}`} />
                  <span>{isPairing ? 'جاري التحقق والمزامنة...' : 'تأكيد مسح الرمز والربط بنجاح'}</span>
                </button>
              </div>
            ) : (
              /* Pairing code view */
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    رقم الهاتف مع مفتاح الدولة:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      placeholder="+966 50 123 4567"
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono-numbers focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <button
                      onClick={handleStartPairing}
                      disabled={isPairing || !phoneInput.trim()}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white transition-colors"
                    >
                      {isPairing ? 'جاري التوليد...' : 'توليد كود الربط'}
                    </button>
                  </div>
                </div>

                {generatedCode && (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-2">
                    <div className="text-xs text-slate-400">أدخل هذا الرمز في تطبيق واتساب عندما يُطلب منك:</div>
                    <div className="flex items-center justify-center gap-3">
                      <div className="text-2xl font-extrabold tracking-widest text-emerald-400 font-mono bg-slate-900 px-5 py-2 rounded-xl border border-emerald-500/40 select-all">
                        {generatedCode}
                      </div>
                      <button
                        onClick={handleCopyCode}
                        className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        title="نسخ الكود"
                      >
                        {codeCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 space-y-1.5 leading-relaxed">
                  <div className="text-slate-200 font-bold">خطوات الربط بالكود:</div>
                  <p>1. سيصلك إشعار على هاتفك في واتساب بعنوان: "جاري ربط جهاز جديد".</p>
                  <p>2. انقر على الإشعار وأدخل الرمز المكون من 8 أحرف وأرقام أعلاه.</p>
                  <p>3. سيتم الربط تلقائياً وتفعيل البوت للإرسال إلى جروباتك.</p>
                </div>

                <button
                  onClick={handleStartPairing}
                  disabled={isPairing}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white transition-colors shadow-md"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تأكيد الربط وتفعيل البوت الآن</span>
                </button>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
