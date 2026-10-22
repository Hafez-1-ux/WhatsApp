import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import QRCode from 'qrcode';
import pino from 'pino';
import * as BaileysPkg from '@whiskeysockets/baileys';

// Handle Baileys CJS/ESM exports safely
const baileysAny = BaileysPkg as any;
const makeWASocket = baileysAny.default?.default || baileysAny.default || baileysAny.makeWASocket;
const useMultiFileAuthState = baileysAny.useMultiFileAuthState || baileysAny.default?.useMultiFileAuthState;
const DisconnectReason = baileysAny.DisconnectReason || baileysAny.default?.DisconnectReason;
const fetchLatestBaileysVersion = baileysAny.fetchLatestBaileysVersion || baileysAny.default?.fetchLatestBaileysVersion;
const Browsers = baileysAny.Browsers || baileysAny.default?.Browsers;

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const AUTH_DIR = path.resolve(process.cwd(), '.baileys_auth_info');

app.use(express.json());

// Global connection state
interface WhatsAppState {
  status: 'disconnected' | 'connecting' | 'qr_ready' | 'connected';
  phoneNumber: string | null;
  pushName: string | null;
  qrDataUrl: string | null;
  connectedAt: string | null;
  lastError: string | null;
}

let waState: WhatsAppState = {
  status: 'disconnected',
  phoneNumber: null,
  pushName: null,
  qrDataUrl: null,
  connectedAt: null,
  lastError: null,
};

let currentSocket: any = null;
let isStarting = false;
let pingInterval: NodeJS.Timeout | null = null;
let reconnectTimer: NodeJS.Timeout | null = null;

async function cleanupCurrentSocket() {
  if (pingInterval) {
    clearInterval(pingInterval);
    pingInterval = null;
  }
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  if (currentSocket) {
    try {
      currentSocket.ev?.removeAllListeners('creds.update');
      currentSocket.ev?.removeAllListeners('connection.update');
      currentSocket.ev?.removeAllListeners('messages.upsert');
      currentSocket.ws?.close();
      currentSocket.end?.();
    } catch (err) {
      console.debug('[WhatsApp Engine] Error cleaning socket:', err);
    }
    currentSocket = null;
  }
}

async function startBaileysSocket() {
  if (isStarting) return;
  isStarting = true;

  try {
    await cleanupCurrentSocket();

    if (!fs.existsSync(AUTH_DIR)) {
      fs.mkdirSync(AUTH_DIR, { recursive: true });
    }

    waState.status = 'connecting';
    waState.lastError = null;

    // Fetch latest WhatsApp Web version to prevent protocol mismatch disconnects
    let waVersion: [number, number, number] = [2, 3000, 1043857760];
    try {
      if (typeof fetchLatestBaileysVersion === 'function') {
        const vInfo = await fetchLatestBaileysVersion();
        if (vInfo?.version) {
          waVersion = vInfo.version;
        }
      }
    } catch (e) {
      console.warn('[WhatsApp Engine] Using default WA version:', e);
    }

    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

    // Initialize socket with stable browser signature & standard ping intervals
    const sock = makeWASocket({
      version: waVersion,
      auth: state,
      logger: pino({ level: 'silent' }),
      printQRInTerminal: false,
      browser: Browsers ? Browsers.ubuntu('Chrome') : ['Ubuntu', 'Chrome', '120.0.6099.109'],
      syncFullHistory: false, // Prevents giant payload timeouts
      markOnlineOnConnect: true,
      connectTimeoutMs: 60000,
      defaultQueryTimeoutMs: 90000, // Generous query timeout to avoid false drops
      keepAliveIntervalMs: 30000,   // 30s keepalive ensures diff check doesn't false-trigger
      retryRequestDelayMs: 350,
      maxMsgRetryCount: 5,
      generateHighQualityLinkPreview: false,
    });

    currentSocket = sock;

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update: any) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        try {
          waState.qrDataUrl = await QRCode.toDataURL(qr, {
            errorCorrectionLevel: 'M',
            margin: 2,
            width: 320,
            color: {
              dark: '#0f172a',
              light: '#ffffff',
            },
          });
          waState.status = 'qr_ready';
          console.log('[WhatsApp Engine] QR Code refreshed.');
        } catch (err: any) {
          console.error('[WhatsApp Engine] QR rendering error:', err);
        }
      }

      if (connection === 'close') {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const isLoggedOut = statusCode === DisconnectReason?.loggedOut || statusCode === 401;
        const isRestartRequired = statusCode === DisconnectReason?.restartRequired || statusCode === 515;

        console.log(`[WhatsApp Engine] Connection closed. StatusCode: ${statusCode}, LoggedOut: ${isLoggedOut}, RestartRequired: ${isRestartRequired}`);

        waState.qrDataUrl = null;

        if (isLoggedOut) {
          waState.status = 'disconnected';
          waState.phoneNumber = null;
          waState.pushName = null;
          waState.connectedAt = null;
          try {
            fs.rmSync(AUTH_DIR, { recursive: true, force: true });
          } catch {}
          console.log('[WhatsApp Engine] Logged out. Session files cleared.');
        } else {
          // Keep state as 'connecting' instead of flipping to disconnected so UI doesn't flicker
          waState.status = 'connecting';
          const delay = isRestartRequired ? 500 : 2500;
          console.log(`[WhatsApp Engine] Re-establishing socket in ${delay}ms...`);

          if (reconnectTimer) clearTimeout(reconnectTimer);
          reconnectTimer = setTimeout(() => {
            startBaileysSocket();
          }, delay);
        }
      } else if (connection === 'open') {
        waState.status = 'connected';
        waState.qrDataUrl = null;
        waState.lastError = null;

        const rawId = sock.user?.id || '';
        const phone = rawId.split(':')[0] || rawId.split('@')[0];
        waState.phoneNumber = phone ? `+${phone}` : 'متصل';
        waState.pushName = sock.user?.name || null;
        waState.connectedAt = new Date().toLocaleTimeString('ar-EG', {
          hour: '2-digit',
          minute: '2-digit',
        });

        console.log(`[WhatsApp Engine] ✅ Session stable and connected as ${waState.phoneNumber}`);

        // Setup application-level heartbeat ping to prevent proxy & NAT timeouts
        if (pingInterval) clearInterval(pingInterval);
        pingInterval = setInterval(async () => {
          if (currentSocket) {
            try {
              // 1. Raw WebSocket ping frame to keep transport/NAT alive
              if (currentSocket.ws?.socket?.readyState === 1) {
                currentSocket.ws.socket.ping();
              }
              // 2. Application-level presence update so WhatsApp server knows client is alive
              if (currentSocket.user?.id) {
                await currentSocket.sendPresenceUpdate('available');
              }
            } catch {
              // Ignore ping error
            }
          }
        }, 20000);
      }
    });
  } catch (err: any) {
    console.error('[WhatsApp Engine] Socket init failure:', err);
    waState.status = 'disconnected';
    waState.lastError = err?.message || 'فشل تشغيل خادم الاتصال';
  } finally {
    isStarting = false;
  }
}

// Start Baileys immediately
startBaileysSocket();

// ----------------- API Endpoints -----------------

// 1. Connection Status
app.get('/api/whatsapp/status', (_req: Request, res: Response) => {
  res.json(waState);
});

// 2. Explicit Reconnect / Refresh QR
app.post('/api/whatsapp/connect', async (_req: Request, res: Response) => {
  if (waState.status !== 'connected') {
    await startBaileysSocket();
  }
  res.json(waState);
});

// 3. Logout & Reset
app.post('/api/whatsapp/disconnect', async (_req: Request, res: Response) => {
  try {
    if (currentSocket) {
      try {
        await currentSocket.logout();
      } catch {
        currentSocket.end?.();
      }
      currentSocket = null;
    }

    try {
      fs.rmSync(AUTH_DIR, { recursive: true, force: true });
    } catch {}

    waState = {
      status: 'disconnected',
      phoneNumber: null,
      pushName: null,
      qrDataUrl: null,
      connectedAt: null,
      lastError: null,
    };

    setTimeout(() => {
      startBaileysSocket();
    }, 1500);

    res.json({ success: true, message: 'تم قطع الاتصال بنجاح.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Fetch Real WhatsApp Groups
app.get('/api/whatsapp/groups', async (_req: Request, res: Response) => {
  if (waState.status !== 'connected' || !currentSocket) {
    return res.status(400).json({ 
      error: 'واتساب غير متصل حالياً. يرجى مسح رمز الـ QR أولاً.' 
    });
  }

  try {
    const participating = await currentSocket.groupFetchAllParticipating();
    const groupList = Object.values(participating).map((g: any) => ({
      id: g.id,
      name: g.subject || 'مجموعة بدون اسم',
      memberCount: g.participants?.length || 0,
      creation: g.creation,
      owner: g.owner,
      desc: g.desc?.toString() || '',
    }));

    res.json({ success: true, groups: groupList });
  } catch (err: any) {
    console.error('[WhatsApp Engine] Error fetching groups:', err);
    res.status(500).json({ error: 'تعذر جلب المجموعات: ' + err.message });
  }
});

// 5. Send Real Message (Resolves invite links, phone numbers, and group JIDs)
app.post('/api/whatsapp/send', async (req: Request, res: Response) => {
  if (waState.status !== 'connected' || !currentSocket) {
    return res.status(400).json({ 
      success: false, 
      error: 'لا يمكن الإرسال لأن حساب واتساب غير متصل. امسح رمز الـ QR أولاً.' 
    });
  }

  const { targetJid, text } = req.body;
  if (!targetJid || !text) {
    return res.status(400).json({ 
      success: false, 
      error: 'يرجى تحديد المجموعة أو الرقم المستهدف مع نص الرسالة.' 
    });
  }

  let resolvedJid = targetJid.trim();

  try {
    // If user provided a WhatsApp Group Invite Link (e.g. https://chat.whatsapp.com/XYZ)
    if (resolvedJid.includes('chat.whatsapp.com/')) {
      const inviteCode = resolvedJid.split('chat.whatsapp.com/')[1]?.split('?')[0]?.split('/')[0];
      if (inviteCode) {
        try {
          const groupInfo = await currentSocket.groupGetInviteInfo(inviteCode);
          if (groupInfo?.id) {
            resolvedJid = groupInfo.id;
          }
        } catch (inviteErr: any) {
          console.warn('[WhatsApp Engine] Could not resolve invite code:', inviteErr.message);
        }
      }
    }

    // If pure phone number without @
    if (!resolvedJid.includes('@')) {
      const cleaned = resolvedJid.replace(/[^0-9]/g, '');
      if (cleaned.length > 5) {
        resolvedJid = `${cleaned}@s.whatsapp.net`;
      }
    }

    if (!resolvedJid.endsWith('@g.us') && !resolvedJid.endsWith('@s.whatsapp.net')) {
      return res.status(400).json({
        success: false,
        error: `معرف الواتساب غير صالح: "${targetJid}". يرجى استخدام معرف جروب (ينتهي بـ @g.us) أو رقم هاتف دولي.`
      });
    }

    const result = await currentSocket.sendMessage(resolvedJid, { text });
    const messageId = result?.key?.id;

    console.log(`[WhatsApp Engine] Message dispatched to ${resolvedJid}. ID: ${messageId}`);
    res.json({ success: true, messageId, targetJid: resolvedJid });
  } catch (err: any) {
    console.error(`[WhatsApp Engine] Send error to ${resolvedJid}:`, err);
    res.status(500).json({ 
      success: false, 
      error: err.message || 'فشل إرسال الرسالة عبر مقبس واتساب.' 
    });
  }
});

// ----------------- Vite Middleware & SPA Serving -----------------

async function setupServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 AthkarBot Engine running on port ${PORT}`);
  });
}

setupServer();
