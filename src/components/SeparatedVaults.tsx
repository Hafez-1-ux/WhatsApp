import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Send, 
  Copy, 
  Check, 
  Trash2, 
  BookOpen, 
  Sparkles, 
  Scroll, 
  Sun, 
  Moon, 
  Clock, 
  Heart,
  X 
} from 'lucide-react';
import { VaultItem, VaultCategory, MessageTemplateConfig } from '../types';
import { formatThikrForWhatsApp } from '../utils/whatsappFormatter';

interface SeparatedVaultsProps {
  items: VaultItem[];
  onBroadcastItem: (item: VaultItem) => void;
  onAddItem: (item: VaultItem) => void;
  onDeleteItem: (id: string) => void;
  template: MessageTemplateConfig;
  isConnected: boolean;
}

export const SeparatedVaults: React.FC<SeparatedVaultsProps> = ({
  items,
  onBroadcastItem,
  onAddItem,
  onDeleteItem,
  template,
  isConnected,
}) => {
  const [activeCategory, setActiveCategory] = useState<VaultCategory>('quran');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states
  const [formCategory, setFormCategory] = useState<VaultCategory>('quran');
  const [formTitle, setFormTitle] = useState('');
  const [formText, setFormText] = useState('');
  const [formSource, setFormSource] = useState('');
  const [formNarrator, setFormNarrator] = useState('');
  const [formBenefit, setFormBenefit] = useState('');
  const [formRepeat, setFormRepeat] = useState(1);

  const categories = [
    { id: 'quran', label: 'آيات قرآنية', icon: '📖' },
    { id: 'hadith', label: 'أحاديث نبوية', icon: '📜' },
    { id: 'dua', label: 'أدعية جامعة', icon: '🤲' },
    { id: 'morning', label: 'أذكار الصباح', icon: '🌅' },
    { id: 'evening', label: 'أذكار المساء', icon: '🌇' },
    { id: 'sleep', label: 'أذكار النوم', icon: '🌙' },
    { id: 'tasbeeh', label: 'تسابيح واستغفار', icon: '📿' },
  ];

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchCat = item.category === activeCategory;
      const matchSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.surahOrBook && item.surahOrBook.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.narrator && item.narrator.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.benefit && item.benefit.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [items, activeCategory, searchQuery]);

  const handleCopy = (item: VaultItem) => {
    const formatted = formatThikrForWhatsApp(item, '', template);
    navigator.clipboard.writeText(formatted);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formText.trim()) return;

    const catObj = categories.find(c => c.id === formCategory);

    const created: VaultItem = {
      id: `custom_vault_${Date.now()}`,
      category: formCategory,
      categoryLabel: catObj ? catObj.label : 'نص مخصص',
      title: formTitle.trim(),
      text: formText.trim(),
      surahOrBook: formSource.trim(),
      narrator: formNarrator.trim(),
      repeatCount: Number(formRepeat) || 1,
      benefit: formBenefit.trim(),
      isCustom: true,
    };

    onAddItem(created);
    setIsAddModalOpen(false);

    // Reset
    setFormTitle('');
    setFormText('');
    setFormSource('');
    setFormNarrator('');
    setFormBenefit('');
    setFormRepeat(1);
  };

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    items.forEach(i => {
      counts[i.category] = (counts[i.category] || 0) + 1;
    });
    return counts;
  }, [items]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Search Bar & Add Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-800 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث في الآيات أو الأحاديث أو الأدعية والمصادر..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-10 pl-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          onClick={() => {
            setFormCategory(activeCategory);
            setIsAddModalOpen(true);
          }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shrink-0 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة إلى هذا القسم</span>
        </button>
      </div>

      {/* Vault Category Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-900 rounded-2xl border border-slate-800 overflow-x-auto">
        {categories.map((cat) => {
          const count = categoryCounts[cat.id] || 0;
          const isActive = activeCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as VaultCategory)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium rounded-xl transition-all whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-md font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono-numbers ${
                isActive ? 'bg-emerald-700/60 text-white' : 'bg-slate-950 text-slate-400'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map((item) => {
          const isCopied = copiedId === item.id;

          return (
            <div
              key={item.id}
              className="bg-slate-900 rounded-3xl p-6 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                {/* Meta header */}
                <div className="flex items-center justify-between text-xs text-slate-400 pb-2 mb-3 border-b border-slate-800/80 font-mono-numbers">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">{item.categoryLabel}</span>
                    {item.surahOrBook && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{item.surahOrBook}</span>
                      </>
                    )}
                    {item.repeatCount > 1 && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-amber-400 font-bold">{item.repeatCount} مرات</span>
                      </>
                    )}
                  </div>

                  {item.isCustom && (
                    <button
                      onClick={() => onDeleteItem(item.id)}
                      className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                      title="حذف هذا النص"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-white mb-2.5 font-quran">
                  {item.title}
                </h3>

                {/* Main text */}
                <div className="text-sm text-slate-100 leading-relaxed font-quran whitespace-pre-line bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80">
                  {item.text}
                </div>

                {/* Narrator or benefit */}
                {(item.narrator || item.benefit) && (
                  <div className="mt-3 space-y-1.5 text-xs text-slate-400">
                    {item.narrator && (
                      <div className="text-slate-300 font-medium">
                        📜 {item.narrator}
                      </div>
                    )}
                    {item.benefit && (
                      <div className="text-emerald-300/90 flex items-start gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{item.benefit}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => onBroadcastItem(item)}
                  disabled={!isConnected}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white transition-colors"
                  title="إرسال هذا النص فوراً عبر واتساب للمجموعات"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>إرسال الآن</span>
                </button>

                <button
                  onClick={() => handleCopy(item)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">تم النسخ</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>نسخ بالتنسيق</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="py-20 text-center text-slate-500 bg-slate-900 rounded-3xl border border-slate-800">
          <BookOpen className="w-10 h-10 mx-auto text-slate-600 mb-3" />
          <p className="text-sm font-bold text-slate-300">لا توجد عناصر مطابقة في هذا القسم</p>
          <p className="text-xs text-slate-500 mt-1">اضغط على زر الإضافة لإضافة نصوص وآيات مخصصة جديدة.</p>
        </div>
      )}

      {/* Add Item Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>إضافة نص أو ذكر جديد</span>
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">القسم المستهدف:</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as VaultCategory)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="quran">آيات قرآنية</option>
                  <option value="hadith">أحاديث نبوية</option>
                  <option value="dua">أدعية جامعة</option>
                  <option value="morning">أذكار الصباح</option>
                  <option value="evening">أذكار المساء</option>
                  <option value="sleep">أذكار النوم</option>
                  <option value="tasbeeh">تسابيح واستغفار</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">العنوان أو الموضوع:</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="مثلاً: فضل الصدقة وسعة الرزق"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">النص (يُفضل بالتشكيل):</label>
                <textarea
                  required
                  rows={4}
                  value={formText}
                  onChange={(e) => setFormText(e.target.value)}
                  placeholder="اكتب الآية الكريمة أو الحديث الشريف أو الدعاء هنا..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white font-quran leading-relaxed focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">المصدر / السورة أو الكتاب:</label>
                  <input
                    type="text"
                    value={formSource}
                    onChange={(e) => setFormSource(e.target.value)}
                    placeholder="مثلاً: سورة النور: 35 أو صحيح مسلم"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">الراوي (للأحاديث):</label>
                  <input
                    type="text"
                    value={formNarrator}
                    onChange={(e) => setFormNarrator(e.target.value)}
                    placeholder="مثلاً: عن أبي ذر رضي الله عنه"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">الفضل أو التدبر:</label>
                  <input
                    type="text"
                    value={formBenefit}
                    onChange={(e) => setFormBenefit(e.target.value)}
                    placeholder="بيان الفضل والأجر"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">عدد التكرار:</label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={formRepeat}
                    onChange={(e) => setFormRepeat(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono-numbers focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-sm"
                >
                  حفظ في المستودع
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
