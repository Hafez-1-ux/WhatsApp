export type VaultCategory = 
  | 'quran'       // آيات قرآنية
  | 'hadith'      // أحاديث نبوية شريفة
  | 'dua'         // أدعية مأثورة وجامعة
  | 'morning'     // أذكار الصباح
  | 'evening'     // أذكار المساء
  | 'sleep'       // أذكار النوم
  | 'tasbeeh';    // تسابيح واستغفار

export interface VaultItem {
  id: string;
  category: VaultCategory;
  categoryLabel: string;
  title: string;
  text: string;
  surahOrBook?: string; // e.g. "سورة البقرة: 255" or "صحيح البخاري: 6306"
  narrator?: string;    // e.g. "عن شداد بن أوس رضي الله عنه"
  repeatCount: number;
  benefit?: string;     // فضل الذكر أو هداية الآية
  isCustom?: boolean;
}

export type BroadcastStatus = 'sent' | 'failed';

export interface BroadcastLog {
  id: string;
  contentId?: string;
  title: string;
  text: string;
  category: VaultCategory | 'custom';
  categoryLabel: string;
  timestamp: string;
  targetGroup: string;
  targetGroupId?: string;
  messageId?: string;
  status: BroadcastStatus;
  errorMessage?: string;
}

export interface WhatsAppGroup {
  id: string;
  name: string;
  linkOrId?: string;
  memberCount?: number;
  enabled: boolean;
  categories: VaultCategory[];
  frequency: 'all' | 'morning_evening' | 'interval';
}

export interface PhoneConnection {
  status: 'connected' | 'connecting' | 'qr_ready' | 'disconnected';
  phoneNumber: string;
  deviceName: string;
  connectedAt?: string;
  pairingCode?: string;
  method?: 'qr' | 'pairing_code';
}

export interface MessageTemplateConfig {
  headerStyle: 'islamic_bracket' | 'botanical' | 'clean_bold' | 'minimal';
  separatorStyle: 'line' | 'stars' | 'dots' | 'islamic' | 'none';
  showCategory: boolean;
  showSource: boolean;
  showBenefit: boolean;
  showRepeatCount: boolean;
  footerText: string;
  customSignature: string;
  antiBanDelaySeconds: number; // ثواني الانتظار بين المجموعات لتجنب الحظر
}

export interface CustomMessage {
  id: string;
  title: string;
  text: string;
  includeInSchedule: boolean;
  createdAt: string;
  targetGroupId?: string; // 'all' or specific group id
}

export interface BotSettings {
  isActive: boolean;
  mode: 'interval' | 'morning_evening' | 'both';
  intervalMinutes: number;
  morningTime: string; // "06:00"
  eveningTime: string; // "17:00"
  sleepTime: string;   // "22:30"
  groups: WhatsAppGroup[];
  phoneConnection: PhoneConnection;
  soundEnabled: boolean;
  template: MessageTemplateConfig;
  customMessages: CustomMessage[];
}
