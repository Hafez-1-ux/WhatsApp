import React, { useState } from 'react';
import { 
  Palette, 
  Eye, 
  RotateCcw, 
  Check, 
  Sliders, 
  ShieldCheck, 
  Sparkles, 
  AlignRight, 
  Type, 
  Layers 
} from 'lucide-react';
import { MessageTemplateConfig, VaultItem } from '../types';
import { DEFAULT_TEMPLATE_CONFIG, formatThikrForWhatsApp } from '../utils/whatsappFormatter';

interface TemplateCustomizerProps {
  template: MessageTemplateConfig;
  onSaveTemplate: (newTemplate: MessageTemplateConfig) => void;
  sampleItem: VaultItem;
  groupName?: string;
}

export const TemplateCustomizer: React.FC<TemplateCustomizerProps> = ({
  template,
  onSaveTemplate,
  sampleItem,
  groupName = 'مجموعة الأذكار اليومية 🌿',
}) => {
  const [current, setCurrent] = useState<MessageTemplateConfig>(template);
  const [isSaved, setIsSaved] = useState(false);

  const previewText = formatThikrForWhatsApp(sampleItem, groupName, current);

  const handleSave = () => {
    onSaveTemplate(current);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleReset = () => {
    setCurrent(DEFAULT_TEMPLATE_CONFIG);
    onSaveTemplate(DEFAULT_TEMPLATE_CONFIG);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Palette className="w-5 h-5 text-emerald-400" />
            <span>نظام تحكم وتخصيص قوالب الرسائل</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            خصص مظهر وفواصل وتذييل الرسائل التي تصل إلى مجموعاتك مع معاينة حية للشكل النهائي
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>استعادة الافتراضي</span>
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-md"
          >
            {isSaved ? <Check className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            <span>{isSaved ? 'تم حفظ القالب' : 'حفظ التعديلات'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Controls + Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Header Style Selector */}
          <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <Type className="w-4 h-4 text-emerald-400" />
              <span>نمط الترويسة والعنوان:</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {[
                { id: 'botanical', title: '🌿 زخرفة نباتية هادئة', preview: '🌿 [ أذكار : سيد الاستغفار ] 🌿' },
                { id: 'islamic_bracket', title: '﷽ أقواس إسلامية', preview: '﷽ ﴾ سيد الاستغفار ﴿' },
                { id: 'clean_bold', title: 'خط عريض مباشر', preview: '*سيد الاستغفار*' },
                { id: 'minimal', title: 'مبسّط بدون إطارات', preview: 'سيد الاستغفار' },
              ].map((style) => (
                <button
                  type="button"
                  key={style.id}
                  onClick={() => setCurrent(prev => ({ ...prev, headerStyle: style.id as any }))}
                  className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between ${
                    current.headerStyle === style.id
                      ? 'bg-emerald-950/50 border-emerald-500 text-white shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="text-xs font-bold text-slate-200">{style.title}</span>
                  <span className="text-[11px] text-emerald-400/90 font-mono mt-1 font-quran">{style.preview}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Separator Style Selector */}
          <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>شكل الفاصل الزخرفي بين الفقرات:</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
              {[
                { id: 'line', label: 'خط رفيع', visual: '───────────────' },
                { id: 'stars', label: 'نجوم وتألق', visual: '✧ ✦ ✧ ✦ ✧' },
                { id: 'dots', label: 'نقاط متباعدة', visual: '• • • • • •' },
                { id: 'islamic', label: 'زخرفة هندسية', visual: '❖ ❖ ❖ ❖ ❖' },
                { id: 'none', label: 'بدون فواصل', visual: '(فراغ)' },
              ].map((sep) => (
                <button
                  type="button"
                  key={sep.id}
                  onClick={() => setCurrent(prev => ({ ...prev, separatorStyle: sep.id as any }))}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    current.separatorStyle === sep.id
                      ? 'bg-emerald-950/50 border-emerald-500 text-emerald-300 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="text-xs block text-slate-200">{sep.label}</span>
                  <span className="text-[10px] text-emerald-400 font-mono mt-1 block">{sep.visual}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Metadata Toggles */}
          <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>البيانات الإضافية المضمنة في الرسالة:</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {[
                { key: 'showCategory', label: 'إظهار اسم التصنيف في الترويسة' },
                { key: 'showSource', label: 'إظهار المصدر أو رقم الآية والراوي' },
                { key: 'showBenefit', label: 'إظهار فضل الذكر والتدبر' },
                { key: 'showRepeatCount', label: 'إظهار عدد مرات التكرار' },
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors"
                >
                  <span className="text-xs text-slate-300">{item.label}</span>
                  <input
                    type="checkbox"
                    checked={(current as any)[item.key]}
                    onChange={(e) => setCurrent(prev => ({ ...prev, [item.key]: e.target.checked }))}
                    className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Footer & Signature */}
          <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <AlignRight className="w-4 h-4 text-emerald-400" />
              <span>تخصيص التذييل والتوقيع:</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">اسم البوت أو المؤسسة في التذييل:</label>
                <input
                  type="text"
                  value={current.footerText}
                  onChange={(e) => setCurrent(prev => ({ ...prev, footerText: e.target.value }))}
                  placeholder="بوت أذكار المسلم اليومية"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">نص التوقيع أو الدعاء المخصص:</label>
                <input
                  type="text"
                  value={current.customSignature}
                  onChange={(e) => setCurrent(prev => ({ ...prev, customSignature: e.target.value }))}
                  placeholder="صدقة جارية - نسألكم صالح الدعاء 🤲"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Anti-Ban Delay Protection */}
          <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>حماية وتأخير البث بين المجموعات (Anti-Ban Delay):</span>
              </h3>
              <span className="text-emerald-400 font-mono-numbers font-bold text-xs">
                {current.antiBanDelaySeconds} ثوانٍ
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              فاصل زمني تلقائي يفصل بين إرسال الرسالة إلى المجموعة الأولى والثانية لتجنب تقييد الحساب من قبل واتساب.
            </p>
            <input
              type="range"
              min="1"
              max="15"
              step="1"
              value={current.antiBanDelaySeconds}
              onChange={(e) => setCurrent(prev => ({ ...prev, antiBanDelaySeconds: Number(e.target.value) }))}
              className="w-full accent-emerald-500"
            />
          </div>

        </div>

        {/* Right Column: Live Message Preview */}
        <div className="lg:col-span-5 sticky top-24 space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
            <span className="flex items-center gap-1.5 text-white">
              <Eye className="w-4 h-4 text-emerald-400" />
              <span>المعاينة الحية للرسالة في واتساب</span>
            </span>
            <span className="text-emerald-400 font-normal">تحديث فوري</span>
          </div>

          {/* WhatsApp Message Preview Bubble */}
          <div className="bg-[#0b141a] rounded-3xl p-5 border border-slate-800 shadow-2xl relative">
            
            {/* Bubble decoration */}
            <div className="bg-[#005c4b] text-slate-100 rounded-2xl rounded-tr-sm p-4 shadow-lg border border-emerald-600/30">
              <div className="text-[11px] text-emerald-300 font-bold pb-1.5 mb-2 border-b border-emerald-500/30 flex items-center justify-between">
                <span>🌿 رسالة واتساب منسقة</span>
                <span className="text-[10px] text-emerald-200/70 font-mono-numbers">الآن</span>
              </div>

              <div className="text-xs leading-relaxed font-quran text-slate-100 whitespace-pre-line select-text">
                {previewText}
              </div>

              <div className="flex items-center justify-end gap-1 text-[10px] text-emerald-200/70 mt-3 font-mono-numbers">
                <span>09:41 ص</span>
                <span className="text-sky-300 font-bold">✓✓</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 text-center mt-4">
              هكذا ستظهر جميع الرسائل والأذكار المجدولة عند إرسالها إلى مجموعاتك
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
