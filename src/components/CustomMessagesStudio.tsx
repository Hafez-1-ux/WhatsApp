import React, { useState } from 'react';
import { 
  MessageSquare, 
  Send, 
  Plus, 
  Trash2, 
  Clock, 
  Check, 
  Copy, 
  Sparkles, 
  Calendar, 
  Share2, 
  ToggleLeft, 
  ToggleRight,
  X 
} from 'lucide-react';
import { CustomMessage, WhatsAppGroup, MessageTemplateConfig } from '../types';
import { formatCustomMessageForWhatsApp } from '../utils/whatsappFormatter';

interface CustomMessagesStudioProps {
  customMessages: CustomMessage[];
  onAddCustomMessage: (msg: CustomMessage) => void;
  onUpdateCustomMessage: (id: string, updated: Partial<CustomMessage>) => void;
  onDeleteCustomMessage: (id: string) => void;
  onBroadcastCustomMessage: (msg: CustomMessage, targetGroupId?: string) => void;
  groups: WhatsAppGroup[];
  template: MessageTemplateConfig;
  isConnected: boolean;
  isBroadcasting: boolean;
}

export const CustomMessagesStudio: React.FC<CustomMessagesStudioProps> = ({
  customMessages,
  onAddCustomMessage,
  onUpdateCustomMessage,
  onDeleteCustomMessage,
  onBroadcastCustomMessage,
  groups,
  template,
  isConnected,
  isBroadcasting,
}) => {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [includeInSchedule, setIncludeInSchedule] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Quick ready-made templates
  const presets = [
    {
      title: 'تذكير سنن وصلاة الجمعة 🕌',
      text: '🌿 *تذكير بيوم الجمعة المباركة* 🌿\n\nلا تنسوا قراءة سورة الكهف، والإكثار من الصلاة على نبينا محمد ﷺ، والدعاء في ساعة الاستجابة.\n\nاللهم صل وسلم على نبينا محمد وعلى آله وصحبه أجمعين.'
    },
    {
      title: 'تذكير صيام الإثنين والخميس 🌙',
      text: '🌸 *تذكير بسنة الصيام* 🌸\n\nتُعرض الأعمال على الله يومي الإثنين والخميس، فطوبى لمن صام ورُفع عمله وهو صائم.'
    },
    {
      title: 'تذكير قيام الليل والوتر ✨',
      text: '✨ *سهام الليل لا تخطئ* ✨\n\nركعة في جوف الليل تناجي بها ربك، تسأله ما في نفسك، وتستغفره لذنبك، خير من الدنيا وما فيها.'
    }
  ];

  const handleApplyPreset = (p: { title: string; text: string }) => {
    setTitle(p.title);
    setText(p.text);
  };

  const handleSaveAndBroadcastNow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !text.trim()) return;

    const newMsg: CustomMessage = {
      id: `custom_msg_${Date.now()}`,
      title: title.trim(),
      text: text.trim(),
      includeInSchedule,
      createdAt: new Date().toLocaleDateString('ar-EG'),
      targetGroupId: selectedGroup === 'all' ? undefined : selectedGroup,
    };

    onAddCustomMessage(newMsg);
    onBroadcastCustomMessage(newMsg, selectedGroup === 'all' ? undefined : selectedGroup);

    // Reset
    setTitle('');
    setText('');
  };

  const handleSaveOnly = () => {
    if (!title.trim() || !text.trim()) return;

    const newMsg: CustomMessage = {
      id: `custom_msg_${Date.now()}`,
      title: title.trim(),
      text: text.trim(),
      includeInSchedule,
      createdAt: new Date().toLocaleDateString('ar-EG'),
      targetGroupId: selectedGroup === 'all' ? undefined : selectedGroup,
    };

    onAddCustomMessage(newMsg);
    setTitle('');
    setText('');
  };

  const handleCopy = (msg: CustomMessage) => {
    const formatted = formatCustomMessageForWhatsApp(msg, '', template);
    navigator.clipboard.writeText(formatted);
    setCopiedId(msg.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-400" />
            <span>استوديو الرسائل والإعلانات المخصصة</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            صمم رسائلك وتنبيهاتك الخاصة (مثل رسائل يوم الجمعة، صيام التطوع، أو إعلانات المجموعات) وأرسلها فوراً أو أدرجها في الجدولة
          </p>
        </div>
      </div>

      {/* Grid: Composer & Saved Messages */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Message Composer */}
        <div className="lg:col-span-7 bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>صياغة رسالة مخصصة جديدة</span>
            </h3>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">قوالب جاهزة:</span>
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className="px-2.5 py-1 rounded-lg text-[10px] bg-slate-950 hover:bg-slate-800 text-emerald-400 border border-slate-800 transition-colors"
                >
                  {p.title.split(' ')[1]}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSaveAndBroadcastNow} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">عنوان الرسالة أو التنبيه:</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثلاً: تنبيه هام لأعضاء المجموعة أو دعاء ختام المجلس"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">نص الرسالة الكامل:</label>
              <textarea
                required
                rows={6}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="اكتب رسالتك هنا بكل حرية، يمكنك استخدام التشكيل والرموز التعبيرية والأسطر المتعددة..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-white font-quran leading-relaxed placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">المجموعة المستهدفة:</label>
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="all">جميع المجموعات النشطة ({groups.filter(g => g.enabled).length})</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 mt-5 sm:mt-0">
                <div>
                  <div className="text-xs font-bold text-white">تضمين في الجدولة الدورية</div>
                  <div className="text-[10px] text-slate-400">بثها عشوائياً ضمن الأذكار المجدولة</div>
                </div>
                <input
                  type="checkbox"
                  checked={includeInSchedule}
                  onChange={(e) => setIncludeInSchedule(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleSaveOnly}
                disabled={!title.trim() || !text.trim()}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 transition-colors border border-slate-700"
              >
                حفظ في القائمة فقط
              </button>

              <button
                type="submit"
                disabled={!title.trim() || !text.trim() || !isConnected || isBroadcasting}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white transition-colors shadow-md"
              >
                <Send className="w-3.5 h-3.5" />
                <span>حفظ وبث حقيقي الآن</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right: Saved Custom Messages */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
            <span>الرسائل المخصصة المحفوظة ({customMessages.length})</span>
          </div>

          <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1">
            {customMessages.map((msg) => {
              const isCopied = copiedId === msg.id;

              return (
                <div
                  key={msg.id}
                  className="bg-slate-900 rounded-3xl p-5 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-800/80">
                    <div>
                      <h4 className="text-xs font-bold text-white font-quran">{msg.title}</h4>
                      <div className="text-[10px] text-slate-400 font-mono-numbers mt-0.5">
                        {msg.createdAt}
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteCustomMessage(msg.id)}
                      className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                      title="حذف الرسالة"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-200 font-quran leading-relaxed whitespace-pre-line bg-slate-950 p-3 rounded-xl border border-slate-800/80 max-h-32 overflow-y-auto">
                    {msg.text}
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <span className="text-slate-400">الجدولة التلقائية:</span>
                      <button
                        onClick={() => onUpdateCustomMessage(msg.id, { includeInSchedule: !msg.includeInSchedule })}
                        className="text-slate-300 hover:text-white"
                        title="تفعيل أو إيقاف من دورة الجدولة"
                      >
                        {msg.includeInSchedule ? (
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <ToggleRight className="w-5 h-5" />
                            <span>مفعل</span>
                          </span>
                        ) : (
                          <span className="text-slate-500 flex items-center gap-1">
                            <ToggleLeft className="w-5 h-5" />
                            <span>متوقف</span>
                          </span>
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(msg)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                        title="نسخ النص"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => onBroadcastCustomMessage(msg, msg.targetGroupId)}
                        disabled={!isConnected || isBroadcasting}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white transition-colors"
                        title="بث هذه الرسالة الآن"
                      >
                        <Send className="w-3 h-3" />
                        <span>بث الآن</span>
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}

            {customMessages.length === 0 && (
              <div className="py-16 text-center text-slate-500 bg-slate-900 rounded-3xl border border-slate-800 p-6">
                <MessageSquare className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                <p className="text-xs font-bold text-slate-300">لا توجد رسائل مخصصة محفوظة</p>
                <p className="text-[11px] text-slate-500 mt-1">اكتب رسالتك في النموذج وأرسلها أو احفظها للمستقبل.</p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
