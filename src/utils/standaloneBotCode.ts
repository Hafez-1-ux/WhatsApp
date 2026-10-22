import { BotSettings, VaultItem } from '../types';

export function generateStandaloneNodeScript(settings: BotSettings, vaultItems: VaultItem[]): string {
  const groups = settings.groups && settings.groups.length > 0 
    ? settings.groups 
    : [{ id: 'grp_1', name: 'مجموعة أذكار المسلم', enabled: true, frequency: 'all', categories: ['morning', 'evening', 'tasbeeh'] }];
  
  const morningTime = settings.morningTime || '06:00';
  const eveningTime = settings.eveningTime || '17:00';
  const intervalMins = settings.intervalMinutes || 60;

  const [mHour, mMin] = morningTime.split(':');
  const [eHour, eMin] = eveningTime.split(':');

  return `/**
 * =========================================================================
 * 🌿 بوت واتساب لنشر الأذكار والآيات والأحاديث في المجموعات (Baileys Engine)
 * =========================================================================
 * للتشغيل برقم هاتفك الشخصي ومسح رمز QR:
 * 1. npm install @whiskeysockets/baileys qrcode-terminal node-cron dotenv
 * 2. node bot.js
 * 3. امسح رمز الـ QR من تطبيق واتساب بهاتفك (الأجهزة المرتبطة > ربط جهاز)
 * =========================================================================
 */

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const cron = require('node-cron');
require('dotenv').config();

// قائمة المجموعات وإعداداتها
const TARGET_GROUPS = ${JSON.stringify(groups, null, 2)};

// إعدادات القالب
const TEMPLATE = ${JSON.stringify(settings.template, null, 2)};

// مستودع النصوص الإسلامية
const VAULT = ${JSON.stringify(
  vaultItems.map(a => ({
    title: a.title,
    text: a.text,
    category: a.category,
    categoryLabel: a.categoryLabel,
    surahOrBook: a.surahOrBook || '',
    narrator: a.narrator || '',
    repeatCount: a.repeatCount,
    benefit: a.benefit || ''
  })),
  null,
  2
)};

// دالة تنسيق النص لواتساب
function formatMessage(item, groupName) {
  const lines = [];
  lines.push(\`🌿 *[ \${item.categoryLabel} : \${item.title} ]* 🌿\`);
  lines.push('───────────────────\\n');
  lines.push(item.text);

  if (item.repeatCount > 1) {
    lines.push(\`\\n🔢 *التكرار:* \${item.repeatCount} مرات\`);
  }
  if (item.benefit) {
    lines.push(\`✨ *الفضل والتدبر:* \${item.benefit}\`);
  }
  if (item.surahOrBook || item.narrator) {
    const src = [item.surahOrBook, item.narrator].filter(Boolean).join(' · ');
    lines.push(\`📜 *المصدر:* \${src}\`);
  }

  lines.push('\\n───────────────────');
  if (TEMPLATE.footerText) lines.push(\`🤖 *\${TEMPLATE.footerText}*\`);
  if (groupName) lines.push(\`👥 _\${groupName}_\`);
  if (TEMPLATE.customSignature) lines.push(\`_\${TEMPLATE.customSignature}_\`);

  return lines.join('\\n');
}

let sock;

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_session');

  sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log('📱 يرجى مسح رمز الـ QR أعلاه من هاتفك (الأجهزة المرتبطة > ربط جهاز)');
    }

    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('⚠️ انقطع الاتصال، جاري إعادة المحاولة...', shouldReconnect);
      if (shouldReconnect) startBot();
    } else if (connection === 'open') {
      console.log('✅ تم ربط حسابك بنجاح! البوت متصل الآن ويراقب الجداول.');
      setupSchedules();
    }
  });
}

// إرسال ذكر إلى الجروبات المؤهلة مع تأخير الحماية (Anti-Ban Delay)
async function broadcastCategory(category) {
  const list = VAULT.filter(i => i.category === category);
  if (!list.length) return;
  const chosen = list[Math.floor(Math.random() * list.length)];

  for (const group of TARGET_GROUPS) {
    if (!group.enabled) continue;
    if (group.categories && !group.categories.includes(category)) continue;

    const formatted = formatMessage(chosen, group.name);
    console.log(\`📢 جاري الإرسال لمجموعة: \${group.name}...\`);

    if (sock && group.linkOrId && group.linkOrId.includes('@')) {
      try {
        await sock.sendMessage(group.linkOrId, { text: formatted });
        console.log(\`✅ تم إرسال: \${chosen.title} إلى \${group.name}\`);
      } catch (err) {
        console.error(\`❌ فشل الإرسال:\`, err.message);
      }
    }

    // تأخير الحماية بين المجموعات
    await new Promise(r => setTimeout(r, (TEMPLATE.antiBanDelaySeconds || 3) * 1000));
  }
}

function setupSchedules() {
  console.log('⏰ بدأت الجداول الزمنية:');
  console.log(\`   - أذكار الصباح: يومياً الساعة ${morningTime}\`);
  console.log(\`   - أذكار المساء: يومياً الساعة ${eveningTime}\`);
  console.log(\`   - التسابيح والآيات الدورية: كل ${intervalMins} دقيقة\`);

  // الصباح
  cron.schedule('${mMin || '00'} ${mHour || '06'} * * *', () => broadcastCategory('morning'));
  // المساء
  cron.schedule('${eMin || '00'} ${eHour || '17'} * * *', () => broadcastCategory('evening'));
  // الدورية (آيات وأحاديث وتسابيح)
  cron.schedule('*/${Math.max(1, Math.min(60, intervalMins))} * * * *', () => {
    const cats = ['quran', 'hadith', 'dua', 'tasbeeh'];
    const chosenCat = cats[Math.floor(Math.random() * cats.length)];
    broadcastCategory(chosenCat);
  });
}

startBot();
`;
}

export function generatePackageJson(): string {
  return JSON.stringify({
    name: "whatsapp-athkar-bot",
    version: "3.0.0",
    description: "بوت واتساب حقيقي لنشر الأذكار والآيات والأحاديث في المجموعات",
    main: "bot.js",
    scripts: {
      "start": "node bot.js"
    },
    dependencies: {
      "@whiskeysockets/baileys": "^6.7.9",
      "qrcode-terminal": "^0.12.0",
      "dotenv": "^16.4.5",
      "node-cron": "^3.0.3"
    }
  }, null, 2);
}

export function generateReadme(settings: BotSettings): string {
  return `# 🌿 بوت واتساب للأذكار والآيات والأحاديث (WhatsApp Engine)

بوت حقيقي ينشر الآيات القرآنية والأحاديث والأدعية والأذكار في مجموعاتك برقم هاتفك عبر مقبس Baileys.

## 📱 خطوات التشغيل السريع:
\`\`\`bash
npm install
npm start
\`\`\`
امسح رمز الـ QR من هاتفك في خيار **الأجهزة المرتبطة** وسيعمل البوت تلقائياً 24/7!
`;
}
