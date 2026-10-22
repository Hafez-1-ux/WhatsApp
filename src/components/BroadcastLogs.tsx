import React, { useState } from 'react';
import { 
  Sparkles, 
  Trash2, 
  Copy, 
  Check, 
  Send, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw,
  Wrench,
  Filter
} from 'lucide-react';
import { BroadcastLog, VaultItem } from '../types';

interface BroadcastLogsProps {
  logs: BroadcastLog[];
  onClearLogs: () => void;
  onClearFailedLogs: () => void;
  onRetryAllFailed: () => Promise<void>;
  onRebroadcast: (log: BroadcastLog) => Promise<void> | void;
  athkarList?: VaultItem[];
}

export const BroadcastLogs: React.FC<BroadcastLogsProps> = ({
  logs,
  onClearLogs,
  onClearFailedLogs,
  onRetryAllFailed,
  onRebroadcast,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'sent' | 'failed'>('all');
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryingLogId, setRetryingLogId] = useState<string | null>(null);

  const handleCopy = (log: BroadcastLog) => {
    navigator.clipboard.writeText(log.text);
    setCopiedId(log.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRetryAll = async () => {
    setIsRetrying(true);
    try {
      await onRetryAllFailed();
    } finally {
      setIsRetrying(false);
    }
  };

  const handleSingleRetry = async (log: BroadcastLog) => {
    setRetryingLogId(log.id);
    try {
      await onRebroadcast(log);
    } finally {
      setRetryingLogId(null);
    }
  };

  const failedCount = logs.filter(l => l.status === 'failed').length;
  const sentCount = logs.filter(l => l.status === 'sent').length;

  const filteredLogs = logs.filter(log => {
    if (filterType === 'sent') return log.status === 'sent';
    if (filterType === 'failed') return log.status === 'failed';
    return true;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <span>سجل عمليات الإرسال الفعلي إلى واتساب</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            سجل دقيق وموثق لكافة الأذكار والرسائل المرسلة عبر مقبس واتساب مع أدوات فحص وتصحيح الأخطاء
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
          {failedCount > 0 && (
            <button
              onClick={onClearFailedLogs}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-amber-300 hover:text-amber-200 bg-amber-950/40 hover:bg-amber-950/70 border border-amber-800/60 transition-colors"
              title="حذف السجلات التي تعذر إرسالها فقط"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>مسح الأخطاء فقط ({failedCount})</span>
            </button>
          )}

          {logs.length > 0 && (
            <button
              onClick={onClearLogs}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-rose-900/40 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>تفريغ السجل كاملاً</span>
            </button>
          )}
        </div>
      </div>

      {/* Failed Errors Notice & Quick Fix Action Banner */}
      {failedCount > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/60 to-amber-950/40 border border-rose-900/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-rose-900/50 text-rose-300 shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-rose-200">
                يوجد {failedCount} عملية متعثرة في السجل
              </h3>
              <p className="text-xs text-rose-300/80 mt-0.5">
                حدثت هذه الأخطاء قبل تثبيت الاتصال، أو لعدم توفر معرف الجروب الصحيح. يمكنك إعادة إرسالها وتصحيحها الآن مباشرة.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
            <button
              onClick={handleRetryAll}
              disabled={isRetrying}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/50 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
              <span>{isRetrying ? 'جاري إعادة الإرسال...' : 'إصلاح وإعادة إرسال الكل الآن'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      {logs.length > 0 && (
        <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800 w-fit">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              filterType === 'all' 
                ? 'bg-slate-800 text-white' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            الكل ({logs.length})
          </button>
          <button
            onClick={() => setFilterType('sent')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
              filterType === 'sent' 
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/80' 
                : 'text-slate-400 hover:text-emerald-400'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>تم التسليم ({sentCount})</span>
          </button>
          <button
            onClick={() => setFilterType('failed')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
              filterType === 'failed' 
                ? 'bg-rose-950 text-rose-300 border border-rose-800/80' 
                : 'text-slate-400 hover:text-rose-400'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
            <span>تعذر الإرسال ({failedCount})</span>
          </button>
        </div>
      )}

      {/* Logs Table / List */}
      {filteredLogs.length > 0 ? (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 select-none">
                  <th className="py-3.5 px-4 font-bold">وقت الإرسال</th>
                  <th className="py-3.5 px-4 font-bold">عنوان الذكر</th>
                  <th className="py-3.5 px-4 font-bold">التصنيف</th>
                  <th className="py-3.5 px-4 font-bold">المجموعة المستهدفة</th>
                  <th className="py-3.5 px-4 font-bold">الحالة عبر المقبس</th>
                  <th className="py-3.5 px-4 font-bold text-center">إجراء / تصحيح</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono-numbers">
                {filteredLogs.map((log) => {
                  const isCopied = copiedId === log.id;
                  const isSuccess = log.status === 'sent';
                  const isItemRetrying = retryingLogId === log.id;

                  return (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 text-slate-300 font-bold whitespace-nowrap">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{log.timestamp}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-white font-quran text-sm font-bold">
                        <div>{log.title}</div>
                        {log.errorMessage && (
                          <div className="text-[11px] font-sans font-normal text-rose-400/90 mt-0.5">
                            السبب: {log.errorMessage}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-300 whitespace-nowrap">
                        <span className="text-emerald-400 font-bold">
                          {log.categoryLabel}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-200 font-bold whitespace-nowrap">
                        {log.targetGroup}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isSuccess ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>تم التسليم</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] bg-rose-950 text-rose-400 border border-rose-800 font-bold">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>تعذر الإرسال</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleCopy(log)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="نسخ نص الذكر"
                          >
                            {isCopied ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <button
                            onClick={() => handleSingleRetry(log)}
                            disabled={isItemRetrying}
                            className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                              isSuccess 
                                ? 'bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300' 
                                : 'bg-rose-900/60 hover:bg-rose-800 text-rose-200 hover:text-white border border-rose-700/60'
                            }`}
                            title={isSuccess ? "إعادة البث الفوري الآن" : "إصلاح وإعادة الإرسال الآن"}
                          >
                            {isItemRetrying ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : isSuccess ? (
                              <Send className="w-3.5 h-3.5" />
                            ) : (
                              <Wrench className="w-3.5 h-3.5 text-rose-300" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="py-20 text-center text-slate-500 bg-slate-900 rounded-2xl border border-slate-800">
          <Clock className="w-10 h-10 mx-auto text-slate-600 mb-3" />
          <p className="text-sm font-bold text-slate-300">
            {filterType === 'all' 
              ? 'لا توجد عمليات إرسال مسجلة بعد'
              : filterType === 'failed' 
                ? 'لا توجد أي أخطاء أو عمليات متعثرة في السجل!' 
                : 'لا توجد رسائل مكتملة بهذا التصنيف حالياً'}
          </p>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {filterType === 'failed'
              ? 'جميع العمليات السابقة تمت بنجاح وسلاسة دون أخطاء.'
              : 'بعد مسح رمز QR وبدء البث الآلي أو اليدوي، ستُسجل هنا جميع الرسائل المنقولة بالتفصيل.'}
          </p>
        </div>
      )}

    </div>
  );
};
