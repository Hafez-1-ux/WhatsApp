import React, { useState, useEffect, useCallback } from 'react';
import { Header, AppTab } from './components/Header';
import { OperationsDashboard } from './components/OperationsDashboard';
import { GroupManager } from './components/GroupManager';
import { TemplateCustomizer } from './components/TemplateCustomizer';
import { SeparatedVaults } from './components/SeparatedVaults';
import { CustomMessagesStudio } from './components/CustomMessagesStudio';
import { SchedulerControl } from './components/SchedulerControl';
import { BroadcastLogs } from './components/BroadcastLogs';
import { PhoneConnectionModal } from './components/PhoneConnectionModal';
import { ExportBotModal } from './components/ExportBotModal';
import { WhatsAppServerState } from './components/LiveConnectionCard';
import { INITIAL_VAULT_ITEMS } from './data/athkarData';
import { 
  BotSettings, 
  BroadcastLog, 
  VaultItem, 
  WhatsAppGroup, 
  CustomMessage, 
  MessageTemplateConfig 
} from './types';
import { 
  formatArabicTime, 
  formatThikrForWhatsApp, 
  formatCustomMessageForWhatsApp, 
  playNotificationChime,
  DEFAULT_TEMPLATE_CONFIG 
} from './utils/whatsappFormatter';

const STORAGE_KEY_SETTINGS = 'athkar_bot_production_v4_settings';
const STORAGE_KEY_VAULT = 'athkar_bot_production_v4_vault';
const STORAGE_KEY_LOGS = 'athkar_bot_production_v4_logs';

const DEFAULT_CUSTOM_MESSAGES: CustomMessage[] = [
  {
    id: 'cmsg_1',
    title: 'تذكير سنن وصلاة الجمعة المباركة 🕌',
    text: '🌿 *تذكير بيوم الجمعة* 🌿\n\nنذكّركم بقراءة سورة الكهف، والإكثار من الصلاة والسلام على نبينا وحبيبنا محمد ﷺ، وسؤال الله في ساعة الإجابة.\n\nتقبل الله منا ومنكم صالح الأعمال.',
    includeInSchedule: true,
    createdAt: new Date().toLocaleDateString('ar-EG'),
  }
];

const DEFAULT_SETTINGS: BotSettings = {
  isActive: true,
  mode: 'both',
  intervalMinutes: 60,
  morningTime: '06:00',
  eveningTime: '17:00',
  sleepTime: '22:30',
  groups: [],
  phoneConnection: {
    status: 'disconnected',
    phoneNumber: '',
    deviceName: 'AthkarBot Engine',
  },
  soundEnabled: true,
  template: DEFAULT_TEMPLATE_CONFIG,
  customMessages: DEFAULT_CUSTOM_MESSAGES,
};

export default function App() {
  const [settings, setSettings] = useState<BotSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_SETTINGS,
          ...parsed,
          template: { ...DEFAULT_TEMPLATE_CONFIG, ...(parsed.template || {}) },
          customMessages: parsed.customMessages || DEFAULT_CUSTOM_MESSAGES,
        };
      }
      return DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [vaultItems, setVaultItems] = useState<VaultItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_VAULT);
      return saved ? JSON.parse(saved) : INITIAL_VAULT_ITEMS;
    } catch {
      return INITIAL_VAULT_ITEMS;
    }
  });

  const [logs, setLogs] = useState<BroadcastLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LOGS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Live Baileys Server State
  const [serverState, setServerState] = useState<WhatsAppServerState>({
    status: 'connecting',
    phoneNumber: null,
    pushName: null,
    qrDataUrl: null,
    connectedAt: null,
    lastError: null,
  });
  const [isServerLoading, setIsServerLoading] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [isSyncingGroups, setIsSyncingGroups] = useState(false);

  // Countdown timer in seconds
  const [secondsUntilNext, setSecondsUntilNext] = useState<number>(settings.intervalMinutes * 60);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_VAULT, JSON.stringify(vaultItems));
  }, [vaultItems]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs));
  }, [logs]);

  // Fetch server connection status
  const fetchServerStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/whatsapp/status');
      if (res.ok) {
        const data: WhatsAppServerState = await res.json();
        setServerState(data);

        if (data.status === 'connected' && data.phoneNumber) {
          setSettings(prev => ({
            ...prev,
            phoneConnection: {
              ...prev.phoneConnection,
              status: 'connected',
              phoneNumber: data.phoneNumber || '',
              connectedAt: data.connectedAt || 'الآن',
            }
          }));
        } else if (data.status === 'disconnected') {
          setSettings(prev => ({
            ...prev,
            phoneConnection: {
              ...prev.phoneConnection,
              status: 'disconnected',
              phoneNumber: '',
            }
          }));
        }
      }
    } catch {
      // Backend starting up
    }
  }, []);

  useEffect(() => {
    fetchServerStatus();
    const interval = setInterval(fetchServerStatus, 2500);
    return () => clearInterval(interval);
  }, [fetchServerStatus]);

  // Refresh QR code
  const handleRefreshQR = async () => {
    setIsServerLoading(true);
    try {
      await fetch('/api/whatsapp/connect', { method: 'POST' });
      await fetchServerStatus();
      showToast('جاري تحديث رمز الـ QR من خادم الواتساب...');
    } catch {
      showToast('تعذر الاتصال بالخادم الداخلي.');
    } finally {
      setIsServerLoading(false);
    }
  };

  // Disconnect session
  const handleDisconnect = async () => {
    if (!window.confirm('هل أنت متأكد من رغبتك في قطع الاتصال بالحساب الحالي؟')) return;
    try {
      await fetch('/api/whatsapp/disconnect', { method: 'POST' });
      await fetchServerStatus();
      showToast('تم قطع الاتصال بحساب الواتساب.');
    } catch {
      showToast('فشل قطع الاتصال.');
    }
  };

  // Sync real participating groups from WhatsApp
  const handleSyncRealGroups = async (silent = false) => {
    if (serverState.status !== 'connected') {
      if (!silent) showToast('يرجى مسح رمز الـ QR أولاً لمزامنة مجموعات حسابك.');
      return;
    }

    setIsSyncingGroups(true);
    try {
      const res = await fetch('/api/whatsapp/groups');
      const data = await res.json();
      if (data.success && Array.isArray(data.groups)) {
        if (data.groups.length === 0) {
          if (!silent) showToast('حسابك لا يشارك في أي مجموعات واتساب حالياً.');
          return;
        }

        const synced: WhatsAppGroup[] = data.groups.map((g: any) => ({
          id: g.id,
          name: g.name,
          linkOrId: g.id,
          memberCount: g.memberCount || 1,
          enabled: true,
          frequency: 'all',
          categories: ['quran', 'hadith', 'dua', 'morning', 'evening', 'tasbeeh']
        }));

        setSettings(prev => ({
          ...prev,
          groups: synced,
        }));

        if (!silent) {
          showToast(`تمت مزامنة ${synced.length} مجموعة بنجاح من حسابك!`);
        }
      } else {
        if (!silent) showToast(data.error || 'تعذر جلب المجموعات من الحساب.');
      }
    } catch {
      if (!silent) showToast('فشل الاتصال بالخادم لجلب المجموعات.');
    } finally {
      setIsSyncingGroups(false);
    }
  };

  // Core Real Broadcast Dispatcher for Vault Items
  const executeRealBroadcast = useCallback(async (
    item: VaultItem,
    targetGroupId?: string
  ) => {
    if (serverState.status !== 'connected') {
      showToast('تنبيه: حساب الواتساب غير متصل! امسح رمز الـ QR من الشاشة الرئيسية.');
      return;
    }

    setIsBroadcasting(true);
    const targetGroups = targetGroupId 
      ? (settings.groups?.filter(g => g.id === targetGroupId) || [])
      : (settings.groups?.filter(g => g.enabled) || []);

    if (targetGroups.length === 0) {
      showToast('لم يتم العثور على مجموعات مفعلة للإرسال. أضف أو فعّل مجموعة أولاً.');
      setIsBroadcasting(false);
      return;
    }

    const nowTime = formatArabicTime();
    let sentSuccessCount = 0;

    for (const group of targetGroups) {
      const formattedText = formatThikrForWhatsApp(item, group.name, settings.template);
      let success = false;
      let msgId: string | undefined;
      let errorReason: string | undefined;

      if (group.linkOrId) {
        try {
          const res = await fetch('/api/whatsapp/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              targetJid: group.linkOrId,
              text: formattedText
            })
          });
          const resData = await res.json();
          success = resData.success;
          msgId = resData.messageId;
          if (!success) {
            errorReason = resData.error || 'تعذر تسليم الرسالة إلى المجموعة';
          }
        } catch (fetchErr: any) {
          success = false;
          errorReason = fetchErr?.message || 'فشل الاتصال بخادم الواتساب';
        }
      } else {
        success = false;
        errorReason = 'لا يتوفر معرف أو رابط واتساب صالح للمجموعة';
      }

      if (success) {
        sentSuccessCount++;
      }

      const newLog: BroadcastLog = {
        id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        contentId: item.id,
        title: item.title,
        text: formattedText,
        category: item.category,
        categoryLabel: item.categoryLabel,
        timestamp: nowTime,
        targetGroup: group.name,
        targetGroupId: group.linkOrId || group.id,
        messageId: msgId,
        status: success ? 'sent' : 'failed',
        errorMessage: errorReason,
      };

      setLogs(prev => [newLog, ...prev]);

      // Anti-ban delay between multiple groups
      if (targetGroups.length > 1) {
        await new Promise(r => setTimeout(r, (settings.template?.antiBanDelaySeconds || 3) * 1000));
      }
    }

    if (settings.soundEnabled) {
      playNotificationChime();
    }

    setIsBroadcasting(false);
    if (sentSuccessCount > 0) {
      showToast(`تم إرسال "${item.title}" بنجاح إلى ${sentSuccessCount} مجموعة! 🌿`);
    } else {
      showToast(`تعذر إرسال "${item.title}". يرجى التحقق من اتصال الهاتف ومعرف المجموعة.`);
    }
  }, [serverState, settings]);

  // Real Broadcast Dispatcher for Custom Messages
  const executeCustomBroadcast = useCallback(async (
    msg: CustomMessage,
    targetGroupId?: string
  ) => {
    if (serverState.status !== 'connected') {
      showToast('تنبيه: حساب الواتساب غير متصل! امسح رمز الـ QR أولاً.');
      return;
    }

    setIsBroadcasting(true);
    const targetGroups = targetGroupId 
      ? (settings.groups?.filter(g => g.id === targetGroupId) || [])
      : (settings.groups?.filter(g => g.enabled) || []);

    if (targetGroups.length === 0) {
      showToast('لا توجد مجموعات مفعلة للإرسال.');
      setIsBroadcasting(false);
      return;
    }

    const nowTime = formatArabicTime();
    let sentSuccessCount = 0;

    for (const group of targetGroups) {
      const formattedText = formatCustomMessageForWhatsApp(msg, group.name, settings.template);
      let success = false;
      let msgId: string | undefined;
      let errorReason: string | undefined;

      if (group.linkOrId) {
        try {
          const res = await fetch('/api/whatsapp/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              targetJid: group.linkOrId,
              text: formattedText
            })
          });
          const resData = await res.json();
          success = resData.success;
          msgId = resData.messageId;
          if (!success) {
            errorReason = resData.error || 'تعذر تسليم الرسالة إلى المجموعة';
          }
        } catch (err: any) {
          success = false;
          errorReason = err?.message || 'فشل الاتصال بخادم الواتساب';
        }
      } else {
        success = false;
        errorReason = 'لا يتوفر معرف أو رابط واتساب صالح للمجموعة';
      }

      if (success) sentSuccessCount++;

      const newLog: BroadcastLog = {
        id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        contentId: msg.id,
        title: msg.title,
        text: formattedText,
        category: 'custom',
        categoryLabel: 'رسالة مخصصة',
        timestamp: nowTime,
        targetGroup: group.name,
        targetGroupId: group.linkOrId || group.id,
        messageId: msgId,
        status: success ? 'sent' : 'failed',
        errorMessage: errorReason,
      };

      setLogs(prev => [newLog, ...prev]);

      if (targetGroups.length > 1) {
        await new Promise(r => setTimeout(r, (settings.template?.antiBanDelaySeconds || 3) * 1000));
      }
    }

    if (settings.soundEnabled) playNotificationChime();
    setIsBroadcasting(false);
    showToast(`تم إرسال الرسالة المخصصة بنجاح إلى ${sentSuccessCount} مجموعة!`);
  }, [serverState, settings]);

  // Automated scheduler ticker
  useEffect(() => {
    if (!settings.isActive) return;

    const intervalId = setInterval(() => {
      setSecondsUntilNext((prev) => {
        if (prev <= 1) {
          const now = new Date();
          const currentHour = now.getHours();
          const currentMinute = now.getMinutes();
          const currentTimeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;

          // Check if custom message rotation is chosen
          const scheduledCustoms = settings.customMessages?.filter(m => m.includeInSchedule) || [];
          if (scheduledCustoms.length > 0 && Math.random() < 0.25) {
            const pickedMsg = scheduledCustoms[Math.floor(Math.random() * scheduledCustoms.length)];
            executeCustomBroadcast(pickedMsg);
            return settings.intervalMinutes * 60;
          }

          let chosenCategory: VaultItem['category'] = 'tasbeeh';

          if (currentTimeStr === settings.morningTime || (currentHour >= 5 && currentHour <= 8 && Math.random() < 0.6)) {
            chosenCategory = 'morning';
          } else if (currentTimeStr === settings.eveningTime || (currentHour >= 16 && currentHour <= 18 && Math.random() < 0.6)) {
            chosenCategory = 'evening';
          } else if (currentTimeStr === settings.sleepTime || (currentHour >= 22 && Math.random() < 0.5)) {
            chosenCategory = 'sleep';
          } else {
            // General Quran, Hadith, Dua, or Tasbeeh
            const categories = ['quran', 'hadith', 'dua', 'tasbeeh'] as const;
            chosenCategory = categories[Math.floor(Math.random() * categories.length)];
          }

          const eligible = vaultItems.filter(a => a.category === chosenCategory);
          const selected = eligible.length > 0 
            ? eligible[Math.floor(Math.random() * eligible.length)]
            : vaultItems[Math.floor(Math.random() * vaultItems.length)];

          executeRealBroadcast(selected);
          return settings.intervalMinutes * 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [settings, vaultItems, executeRealBroadcast, executeCustomBroadcast]);

  // Broadcast Real Random Now
  const handleBroadcastRealNow = () => {
    const randomItem = vaultItems[Math.floor(Math.random() * vaultItems.length)];
    executeRealBroadcast(randomItem);
    setSecondsUntilNext(settings.intervalMinutes * 60);
  };

  // Handlers for Groups
  const handleAddGroup = (newGroup: WhatsAppGroup) => {
    setSettings(prev => ({
      ...prev,
      groups: [...(prev.groups || []), newGroup]
    }));
    showToast(`تمت إضافة "${newGroup.name}" بنجاح.`);
  };

  const handleUpdateGroup = (id: string, updated: Partial<WhatsAppGroup>) => {
    setSettings(prev => ({
      ...prev,
      groups: prev.groups.map(g => g.id === id ? { ...g, ...updated } : g)
    }));
    showToast('تم حفظ تعديلات المجموعة.');
  };

  const handleDeleteGroup = (id: string) => {
    setSettings(prev => ({
      ...prev,
      groups: prev.groups.filter(g => g.id !== id)
    }));
    showToast('تمت إزالة المجموعة.');
  };

  // Handlers for Vault Items
  const handleAddVaultItem = (newItem: VaultItem) => {
    setVaultItems(prev => [newItem, ...prev]);
    showToast(`تمت إضافة "${newItem.title}" إلى الموسوعة بنجاح.`);
  };

  const handleDeleteVaultItem = (id: string) => {
    setVaultItems(prev => prev.filter(i => i.id !== id));
    showToast('تم حذف النص من الموسوعة.');
  };

  // Handlers for Custom Messages
  const handleAddCustomMessage = (msg: CustomMessage) => {
    setSettings(prev => ({
      ...prev,
      customMessages: [msg, ...(prev.customMessages || [])]
    }));
    showToast('تم حفظ الرسالة المخصصة.');
  };

  const handleUpdateCustomMessage = (id: string, updated: Partial<CustomMessage>) => {
    setSettings(prev => ({
      ...prev,
      customMessages: prev.customMessages.map(m => m.id === id ? { ...m, ...updated } : m)
    }));
  };

  const handleDeleteCustomMessage = (id: string) => {
    setSettings(prev => ({
      ...prev,
      customMessages: prev.customMessages.filter(m => m.id !== id)
    }));
    showToast('تم حذف الرسالة المخصصة.');
  };

  // Handlers for Template
  const handleSaveTemplate = (newTemplate: MessageTemplateConfig) => {
    setSettings(prev => ({
      ...prev,
      template: newTemplate
    }));
    showToast('تم حفظ إعدادات القالب وتطبيقه على جميع الرسائل.');
  };

  const handleUpdateSettings = (partial: Partial<BotSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...partial };
      if (partial.intervalMinutes && partial.intervalMinutes !== prev.intervalMinutes) {
        setSecondsUntilNext(partial.intervalMinutes * 60);
      }
      return updated;
    });
  };

  // Clear only failed logs from the list
  const handleClearFailedLogs = () => {
    setLogs(prev => prev.filter(l => l.status === 'sent'));
    showToast('تم مسح جميع الرسائل المتعثرة من السجل بنجاح.');
  };

  // Re-attempt sending all failed logs
  const handleRetryAllFailed = async () => {
    const failedLogs = logs.filter(l => l.status === 'failed');
    if (failedLogs.length === 0) {
      showToast('لا توجد أي رسائل متعثرة لإعادة إرسالها.');
      return;
    }

    if (serverState.status !== 'connected') {
      showToast('حساب واتساب غير متصل حالياً! يرجى التأكد من اتصال الهاتف أولاً.');
      return;
    }

    let successCount = 0;
    const updated = [...logs];

    for (let i = 0; i < updated.length; i++) {
      const log = updated[i];
      if (log.status !== 'failed') continue;

      let targetJid = log.targetGroupId;
      if (!targetJid || !targetJid.includes('@')) {
        const found = settings.groups.find(g => g.name === log.targetGroup || g.id === log.targetGroupId);
        targetJid = found?.linkOrId || found?.id || settings.groups.find(g => g.enabled)?.linkOrId;
      }

      if (!targetJid) continue;

      try {
        const res = await fetch('/api/whatsapp/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            targetJid,
            text: log.text,
          }),
        });
        const resData = await res.json();
        if (resData.success) {
          successCount++;
          updated[i] = {
            ...log,
            status: 'sent',
            messageId: resData.messageId,
            errorMessage: undefined,
            timestamp: formatArabicTime(),
          };
        }
      } catch {
        // continue
      }
      await new Promise(r => setTimeout(r, 1200));
    }

    setLogs(updated);
    if (successCount > 0) {
      if (settings.soundEnabled) playNotificationChime();
      showToast(`تم إصلاح وإعادة إرسال ${successCount} من أصل ${failedLogs.length} عملية بنجاح! 🌿`);
    } else {
      showToast('تعذر إصلاح الرسائل المتعثرة. يرجى التحقق من صحة معرفات المجموعات.');
    }
  };

  // Single rebroadcast with in-place resolution of failed log
  const handleSingleRebroadcast = async (log: BroadcastLog) => {
    if (serverState.status !== 'connected') {
      showToast('حساب واتساب غير متصل حالياً!');
      return;
    }

    let targetJid = log.targetGroupId;
    if (!targetJid || !targetJid.includes('@')) {
      const found = settings.groups.find(g => g.name === log.targetGroup || g.id === log.targetGroupId);
      targetJid = found?.linkOrId || found?.id || settings.groups.find(g => g.enabled)?.linkOrId;
    }

    if (!targetJid) {
      showToast('لا يتوفر معرف صالح لهذه المجموعة لإعادة الإرسال إليها.');
      return;
    }

    try {
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetJid,
          text: log.text,
        }),
      });
      const resData = await res.json();
      if (resData.success) {
        setLogs(prev => prev.map(l => l.id === log.id ? {
          ...l,
          status: 'sent',
          messageId: resData.messageId,
          errorMessage: undefined,
          timestamp: formatArabicTime(),
        } : l));
        if (settings.soundEnabled) playNotificationChime();
        showToast(`تم إرسال الذكر بنجاح إلى "${log.targetGroup}"! 🌿`);
      } else {
        showToast(resData.error || 'تعذر الإرسال عبر مقبس واتساب.');
      }
    } catch (err: any) {
      showToast(err?.message || 'فشل الاتصال بالخادم.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Tajawal',sans-serif]">
      
      {/* Top Header */}
      <Header
        settings={settings}
        serverState={serverState}
        onUpdateSettings={handleUpdateSettings}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        vaultCount={vaultItems.length}
        sentCount={logs.length}
        groupsCount={settings.groups?.length || 0}
        customMessagesCount={settings.customMessages?.length || 0}
        activeTab={activeTab}
        onChangeTab={setActiveTab}
      />

      {/* Floating Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-emerald-400/40 animate-bounce">
          <span>🌿</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {activeTab === 'dashboard' && (
          <OperationsDashboard
            serverState={serverState}
            isServerLoading={isServerLoading}
            onRefreshQR={handleRefreshQR}
            onDisconnect={handleDisconnect}
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            secondsUntilNext={secondsUntilNext}
            onBroadcastRealNow={handleBroadcastRealNow}
            isBroadcasting={isBroadcasting}
            onSyncRealGroups={handleSyncRealGroups}
            isSyncingGroups={isSyncingGroups}
            onChangeTab={setActiveTab}
          />
        )}

        {activeTab === 'groups' && (
          <GroupManager
            groups={settings.groups || []}
            onAddGroup={handleAddGroup}
            onUpdateGroup={handleUpdateGroup}
            onDeleteGroup={handleDeleteGroup}
            onBroadcastToGroup={(grp, item) => executeRealBroadcast(item || vaultItems[0], grp.id)}
            athkarList={vaultItems as any}
            isConnected={serverState.status === 'connected'}
            onSyncRealGroups={handleSyncRealGroups}
            isSyncing={isSyncingGroups}
          />
        )}

        {activeTab === 'template' && (
          <TemplateCustomizer
            template={settings.template || DEFAULT_TEMPLATE_CONFIG}
            onSaveTemplate={handleSaveTemplate}
            sampleItem={vaultItems[0]}
            groupName={settings.groups?.[0]?.name || 'مجموعة أذكار العائلة 🌿'}
          />
        )}

        {activeTab === 'vault' && (
          <SeparatedVaults
            items={vaultItems}
            onBroadcastItem={(item) => executeRealBroadcast(item)}
            onAddItem={handleAddVaultItem}
            onDeleteItem={handleDeleteVaultItem}
            template={settings.template || DEFAULT_TEMPLATE_CONFIG}
            isConnected={serverState.status === 'connected'}
          />
        )}

        {activeTab === 'custom' && (
          <CustomMessagesStudio
            customMessages={settings.customMessages || []}
            onAddCustomMessage={handleAddCustomMessage}
            onUpdateCustomMessage={handleUpdateCustomMessage}
            onDeleteCustomMessage={handleDeleteCustomMessage}
            onBroadcastCustomMessage={executeCustomBroadcast}
            groups={settings.groups || []}
            template={settings.template || DEFAULT_TEMPLATE_CONFIG}
            isConnected={serverState.status === 'connected'}
            isBroadcasting={isBroadcasting}
          />
        )}

        {activeTab === 'schedule' && (
          <SchedulerControl
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            secondsUntilNext={secondsUntilNext}
            onBroadcastNow={handleBroadcastRealNow}
            vaultItems={vaultItems}
          />
        )}

        {activeTab === 'logs' && (
          <BroadcastLogs
            logs={logs}
            onClearLogs={() => {
              setLogs([]);
              showToast('تم تفريغ سجل العمليات.');
            }}
            onClearFailedLogs={handleClearFailedLogs}
            onRetryAllFailed={handleRetryAllFailed}
            onRebroadcast={handleSingleRebroadcast}
            athkarList={vaultItems as any}
          />
        )}

      </main>

      {/* Standalone Bot Script Exporter Modal */}
      <ExportBotModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        settings={settings}
        vaultItems={vaultItems}
      />

      {/* Clean Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span>🌿</span>
            <span className="font-bold text-slate-300">بوت أذكار واتساب (WhatsApp Athkar Engine)</span>
            <span>·</span>
            <span>نشر الآيات والأحاديث النبوية لوجه الله تعالى</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span className="font-mono-numbers">
              حالة الهاتف: {serverState.status === 'connected' ? `متصل (${serverState.phoneNumber})` : 'بانتظار مسح رمز QR'}
            </span>
            <span>·</span>
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="text-emerald-400 hover:underline"
            >
              كود تشغيل الخادم 24/7
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
