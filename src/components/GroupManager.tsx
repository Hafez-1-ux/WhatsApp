import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Trash2, 
  Edit3, 
  Send, 
  RefreshCw, 
  Check, 
  ToggleLeft, 
  ToggleRight, 
  CheckCircle2, 
  AlertCircle,
  X 
} from 'lucide-react';
import { WhatsAppGroup, VaultItem, VaultCategory } from '../types';

interface GroupManagerProps {
  groups: WhatsAppGroup[];
  onAddGroup: (group: WhatsAppGroup) => void;
  onUpdateGroup: (id: string, updated: Partial<WhatsAppGroup>) => void;
  onDeleteGroup: (id: string) => void;
  onBroadcastToGroup: (group: WhatsAppGroup, item?: VaultItem) => void;
  athkarList?: VaultItem[];
  isConnected: boolean;
  onSyncRealGroups: () => void;
  isSyncing: boolean;
}

export const GroupManager: React.FC<GroupManagerProps> = ({
  groups,
  onAddGroup,
  onUpdateGroup,
  onDeleteGroup,
  onBroadcastToGroup,
  isConnected,
  onSyncRealGroups,
  isSyncing,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);

  // Form states
  const [groupName, setGroupName] = useState('');
  const [linkOrId, setLinkOrId] = useState('');
  const [memberCount, setMemberCount] = useState(50);
  const [frequency, setFrequency] = useState<'all' | 'morning_evening' | 'interval'>('all');
  const [selectedCategories, setSelectedCategories] = useState<VaultCategory[]>([
    'quran',
    'hadith',
    'dua',
    'morning',
    'evening',
    'tasbeeh'
  ]);

  const handleOpenAdd = () => {
    setEditingGroupId(null);
    setGroupName('');
    setLinkOrId('');
    setMemberCount(45);
    setFrequency('all');
    setSelectedCategories(['quran', 'hadith', 'dua', 'morning', 'evening', 'tasbeeh']);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (group: WhatsAppGroup) => {
    setEditingGroupId(group.id);
    setGroupName(group.name);
    setLinkOrId(group.linkOrId || '');
    setMemberCount(group.memberCount || 50);
    setFrequency(group.frequency);
    setSelectedCategories(group.categories);
    setIsAddModalOpen(true);
  };

  const handleSaveGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;

    if (editingGroupId) {
      onUpdateGroup(editingGroupId, {
        name: groupName.trim(),
        linkOrId: linkOrId.trim(),
        memberCount: Number(memberCount) || 1,
        frequency,
        categories: selectedCategories,
      });
    } else {
      const newGroup: WhatsAppGroup = {
        id: `grp_${Date.now()}`,
        name: groupName.trim(),
        linkOrId: linkOrId.trim(),
        memberCount: Number(memberCount) || 1,
        enabled: true,
        frequency,
        categories: selectedCategories,
      };
      onAddGroup(newGroup);
    }

    setIsAddModalOpen(false);
  };

  const toggleCategory = (cat: VaultCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const activeGroupsCount = groups.filter((g) => g.enabled).length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Header & Sync Bar */}
      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            <span>المجموعات والقنوات المستهدفة بالنشر</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            خصص المجموعات التي يقوم البوت ببث الأذكار إليها تلقائياً مع تحديد فئات الأذكار المسموحة لكل مجموعة
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          {isConnected && (
            <button
              onClick={onSyncRealGroups}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 transition-colors"
              title="جلب المجموعات التي تشارك فيها فعلياً من حسابك"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>مزامنة مجموعات حسابك</span>
            </button>
          )}

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة مجموعة يدوياً</span>
          </button>
        </div>
      </div>

      {/* Connection notice if not connected */}
      {!isConnected && (
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/80 flex items-start gap-3 text-xs text-amber-300">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold text-white block mb-0.5">تنبيه: حساب واتساب غير متصل حالياً</span>
            يرجى التوجه إلى قسم <span className="font-bold text-emerald-400">"لوحة التحكم والاتصال"</span> ومسح رمز الـ QR من هاتفك لتفعيل الإرسال التلقائي للمجموعات.
          </div>
        </div>
      )}

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {groups.map((group) => {
          return (
            <div
              key={group.id}
              className={`rounded-2xl p-5 border transition-all flex flex-col justify-between space-y-4 ${
                group.enabled 
                  ? 'bg-slate-900 border-slate-800 hover:border-slate-700' 
                  : 'bg-slate-900/50 border-slate-900 opacity-60'
              }`}
            >
              <div>
                {/* Top Row: Group name, members, status switch */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-700/30 text-emerald-300 flex items-center justify-center font-bold text-lg border border-emerald-500/20 shadow-inner">
                      👥
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>{group.name}</span>
                        {group.enabled && (
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        )}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-slate-400 font-mono-numbers mt-0.5">
                        {group.memberCount ? <span>{group.memberCount} عضواً</span> : null}
                        {group.linkOrId && (
                          <>
                            {group.memberCount ? <span>·</span> : null}
                            <span className="text-slate-500 font-mono truncate max-w-[160px]">
                              {group.linkOrId}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onUpdateGroup(group.id, { enabled: !group.enabled })}
                    className="p-1 text-slate-400 hover:text-white transition-colors"
                    title={group.enabled ? 'إيقاف البث لهذه المجموعة' : 'تفعيل البث لهذه المجموعة'}
                  >
                    {group.enabled ? (
                      <ToggleRight className="w-7 h-7 text-emerald-400" />
                    ) : (
                      <ToggleLeft className="w-7 h-7 text-slate-600" />
                    )}
                  </button>
                </div>

                {/* Categories & Frequency badges */}
                <div className="pt-3 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>نظام الإرسال:</span>
                    <span className="text-slate-200 font-bold">
                      {group.frequency === 'morning_evening' ? 'أذكار الصباح والمساء فقط' :
                       group.frequency === 'interval' ? 'أذكار دورية متكررة' : 'جميع الأذكار والمواقيت'}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {group.categories.map((cat) => {
                      const labels: Record<string, string> = {
                        morning: 'الصباح',
                        evening: 'المساء',
                        sleep: 'النوم',
                        tasbeeh: 'تسابيح دورية',
                        quranic: 'أدعية قرآنية'
                      };
                      return (
                        <span
                          key={cat}
                          className="text-[11px] px-2.5 py-0.5 rounded-md bg-slate-950 text-slate-300 border border-slate-800"
                        >
                          {labels[cat] || cat}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => onBroadcastToGroup(group)}
                  disabled={!isConnected}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white transition-colors"
                  title="إرسال ذكر فوري حقيقي لهذه المجموعة الآن"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>إرسال ذكر الآن</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(group)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    title="تعديل المجموعة"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onDeleteGroup(group.id)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition-colors"
                    title="حذف المجموعة"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {groups.length === 0 && (
        <div className="py-20 text-center text-slate-500 bg-slate-900 rounded-2xl border border-slate-800">
          <Users className="w-10 h-10 mx-auto text-slate-600 mb-3" />
          <p className="text-sm font-bold text-slate-300">لا توجد مجموعات مضافة حالياً</p>
          <p className="text-xs text-slate-500 mt-1">
            اضغط "مزامنة مجموعات حسابك" لجلب جروباتك تلقائياً بعد مسح QR، أو أضف مجموعة يدوياً.
          </p>
        </div>
      )}

      {/* Add / Edit Group Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>{editingGroupId ? 'تعديل بيانات المجموعة' : 'إضافة مجموعة جديدة'}</span>
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveGroup} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">اسم المجموعة:</label>
                <input
                  type="text"
                  required
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="مثلاً: جروب العائلة اليومي 🌿 أو قناة الأذكار"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">معرف الجروب أو رقم الهاتف (JID):</label>
                  <input
                    type="text"
                    value={linkOrId}
                    onChange={(e) => setLinkOrId(e.target.value)}
                    placeholder="1203630248... أو رقم الهاتف"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">عدد الأعضاء التقريبي:</label>
                  <input
                    type="number"
                    min="1"
                    max="1024"
                    value={memberCount}
                    onChange={(e) => setMemberCount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono-numbers focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">نظام الإرسال:</label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as WhatsAppGroup['frequency'])}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="all">شامل: أذكار الصباح والمساء + التسابيح الدورية</option>
                  <option value="morning_evening">أذكار الصباح والمساء فقط</option>
                  <option value="interval">تسابيح وأدعية دورية فقط</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">أنواع الأذكار والنصوص المصرح بها:</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { id: 'quran', label: 'آيات قرآنية' },
                    { id: 'hadith', label: 'أحاديث نبوية' },
                    { id: 'dua', label: 'أدعية جامعة' },
                    { id: 'morning', label: 'أذكار الصباح' },
                    { id: 'evening', label: 'أذكار المساء' },
                    { id: 'sleep', label: 'أذكار النوم' },
                    { id: 'tasbeeh', label: 'تسابيح واستغفار' },
                  ].map((cat) => {
                    const isSelected = selectedCategories.includes(cat.id as VaultCategory);
                    return (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => toggleCategory(cat.id as VaultCategory)}
                        className={`p-2.5 rounded-xl border text-right transition-colors flex items-center justify-between ${
                          isSelected
                            ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 font-bold'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        <span>{cat.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                      </button>
                    );
                  })}
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
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                >
                  {editingGroupId ? 'حفظ التعديلات' : 'إضافة المجموعة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
