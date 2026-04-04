/* KURAYAMI TEAM - ECONOMY SYSTEM (DAILY)
   Adaptado para Kazuma-Mr-Bot */

import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

const dbPath = './comandos/database/economy/';

const toMs = (h = 0, m = 0, s = 0) => ((h * 3600) + (m * 60) + s) * 1000;

const formatDelta = (ms) => {
    if (!ms || ms <= 0) return '00:00:00';
    const total = Math.floor(ms / 1000);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
};

const dailyCommand = {
    name: 'daily',
    alias: ['diario'],
    category: 'economy',
    desc: 'Reclama tu recompensa diaria',
    noPrefix: false,        // Cambia a true si quieres que funcione sin prefijo (#)

    run: async (conn, m) => {
        let sender = m.sender || m.key?.participant || m.key?.remoteJid;
        if (!sender) {
            console.error('[ERROR] No se pudo obtener sender en daily');
            return;
        }

        const userNumber = sender.split('@')[0];
        const from = m.key.remoteJid;

        const e1 = config.visuals?.emoji || '🌟';
        const e2 = config.visuals?.emoji2 || '✨';
        const eCoins = config.visuals?.emoji5 || '🪙';
        const img = config.visuals?.img1 || '';

        const userDir = path.join(dbPath, userNumber);
        const dailyFile = path.join(userDir, 'daily.json');

        if (!fs.existsSync(userDir)) fs.mkdirSync(userDir, { recursive: true });

        let data = { lastDaily: 0, nextReward: 1000, totalCoins: 0 };

        if (fs.existsSync(dailyFile)) {
            try {
                data = JSON.parse(fs.readFileSync(dailyFile, 'utf-8'));
            } catch (e) {
                console.error(`[ERROR] JSON corrupto en daily de ${userNumber}`);
            }
        }

        const now = Date.now();
        const cooldown = toMs(24, 0, 0);

        if (now - (data.lastDaily || 0) < cooldown) {
            const remaining = (data.lastDaily || 0) + cooldown - now;
            return conn.sendMessage(from, {
                text: `*${e1} ESPERA UN MOMENTO ${e1}*\n\n` +
                      `⏳ Tiempo restante: *${formatDelta(remaining)}*\n\n` +
                      `> Vuelve más tarde para reclamar tu daily.`,
            }, { quoted: m });
        }

        // Recompensa
        const coinsGained = data.nextReward || 1000;
        data.totalCoins = (data.totalCoins || 0) + coinsGained;
        data.lastDaily = now;
        data.nextReward = Math.floor(coinsGained * 2);

        fs.writeFileSync(dailyFile, JSON.stringify(data, null, 2));

        const pushName = m.pushName || 'Usuario';

        const txt = `*${e1} RECOMPENSA DIARIA RECIBIDA ${e1}*\n\n` +
                    `👤 *Usuario:* ${pushName}\n` +
                    `\( {eCoins} *Coins ganados:* + \){coinsGained.toLocaleString()}\n` +
                    `${e2} *Próxima recompensa:* ${data.nextReward.toLocaleString()} coins\n\n` +
                    `> ¡Regresa mañana para duplicar tus ganancias! 🔥`;

        await conn.sendMessage(from, {
            image: img ? { url: img } : undefined,
            caption: txt
        }, { quoted: m });
    }
};

export default dailyCommand;