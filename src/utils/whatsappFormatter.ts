import { VaultItem, MessageTemplateConfig, CustomMessage } from '../types';

export const DEFAULT_TEMPLATE_CONFIG: MessageTemplateConfig = {
  headerStyle: 'botanical',
  separatorStyle: 'line',
  showCategory: true,
  showSource: true,
  showBenefit: true,
  showRepeatCount: true,
  footerText: 'بوت أذكار المسلم اليومية',
  customSignature: 'نسألكم صالح الدعاء 🤲',
  antiBanDelaySeconds: 3,
};

/**
 * Returns separator string according to chosen style
 */
export function getSeparatorString(style: MessageTemplateConfig['separatorStyle']): string {
  switch (style) {
    case 'line':
      return '───────────────────';
    case 'stars':
      return '✧ ✦ ✧ ✦ ✧ ✦ ✧ ✦ ✧';
    case 'dots':
      return '• • • • • • • • • • •';
    case 'islamic':
      return '❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖ ❖';
    case 'none':
      return '';
  }
}

/**
 * Formats a VaultItem into WhatsApp Markdown based on user's custom template
 */
export function formatThikrForWhatsApp(
  item: VaultItem,
  groupName?: string,
  template: MessageTemplateConfig = DEFAULT_TEMPLATE_CONFIG
): string {
  const sep = getSeparatorString(template.separatorStyle);

  // Header construction
  let header = '';
  switch (template.headerStyle) {
    case 'islamic_bracket':
      header = `﷽\n﴾ *${template.showCategory ? `${item.categoryLabel} : ` : ''}${item.title}* ﴿`;
      break;
    case 'botanical':
      header = `🌿 *[ ${template.showCategory ? `${item.categoryLabel} : ` : ''}${item.title} ]* 🌿`;
      break;
    case 'clean_bold':
      header = `*${item.title}*`;
      break;
    case 'minimal':
      header = `*${item.title}*`;
      break;
  }

  // Metadata items
  const lines: string[] = [];
  if (header) lines.push(header);
  if (sep) lines.push(sep);
  lines.push('');

  // Main Text
  lines.push(item.text);

  // Optional extras
  if (template.showRepeatCount && item.repeatCount > 1) {
    lines.push(`\n🔢 *التكرار:* ${item.repeatCount} مرات`);
  }

  if (template.showBenefit && item.benefit) {
    lines.push(`✨ *الفضل والتدبر:* ${item.benefit}`);
  }

  if (template.showSource && (item.surahOrBook || item.narrator)) {
    const src = [item.surahOrBook, item.narrator].filter(Boolean).join(' · ');
    lines.push(`📜 *المصدر:* ${src}`);
  }

  // Footer
  if (sep) {
    lines.push('');
    lines.push(sep);
  }

  const footerParts: string[] = [];
  if (template.footerText) {
    footerParts.push(`🤖 *${template.footerText}*`);
  }
  if (groupName) {
    footerParts.push(`👥 _${groupName}_`);
  }
  if (template.customSignature) {
    footerParts.push(`_${template.customSignature}_`);
  }

  if (footerParts.length > 0) {
    lines.push(footerParts.join('\n'));
  }

  return lines.join('\n');
}

/**
 * Formats a user-created custom message for WhatsApp
 */
export function formatCustomMessageForWhatsApp(
  msg: CustomMessage,
  groupName?: string,
  template: MessageTemplateConfig = DEFAULT_TEMPLATE_CONFIG
): string {
  const sep = getSeparatorString(template.separatorStyle);
  const lines: string[] = [];

  lines.push(`📢 *[ ${msg.title} ]*`);
  if (sep) lines.push(sep);
  lines.push('');
  lines.push(msg.text);

  if (sep) {
    lines.push('');
    lines.push(sep);
  }

  const footerParts: string[] = [];
  if (groupName) {
    footerParts.push(`👥 _${groupName}_`);
  }
  if (template.customSignature) {
    footerParts.push(`_${template.customSignature}_`);
  }

  if (footerParts.length > 0) {
    lines.push(footerParts.join('\n'));
  }

  return lines.join('\n');
}

/**
 * Synthesizes a gentle, spiritual chime sound via Web Audio API
 */
export function playNotificationChime(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(880, ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(1174.66, ctx.currentTime + 0.25);

    gainNode.gain.setValueAtTime(0.12, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(ctx.currentTime + 0.8);
    osc2.stop(ctx.currentTime + 0.8);
  } catch (err) {
    console.debug('Audio playback blocked or unavailable:', err);
  }
}

/**
 * Formats time string into localized Arabic display
 */
export function formatArabicTime(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('ar-EG', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }).format(date);
}
