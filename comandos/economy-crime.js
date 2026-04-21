import { config } from '../config.js';
import { crimeFrases, failFrases } from './frases/crimen.js';
import fs from 'fs';
import path from 'path';

const dbPath = path.resolve('./config/database/economy/economy.json');

const crimeCommand = {
    name: 'crime',
    alias: ['crimen', 'asaltar'],
    category: 'economy',
    isOwner: false,
    noPrefix: true,
    isAdmin: false,
    isGroup: false,

    run: async (conn, m) => {
        try {
            const user = m.sender.split('@')[0];
            const now = Date.now();
            let db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

            if (!db[user]) {
                db[user] = { wallet: 0, bank: 0, daily: { lastClaim: 0, streak: 0 }, crime: { lastUsed: 0 } };
            }

            const userData = db[user];
            const cooldown = 20 * 60 * 1000;
            const timePassed = now - (userData.crime?.lastUsed || 0);

            if (timePassed < cooldown) {
                const remaining = cooldown - timePassed;
                return m.reply(`*${config.visuals.emoji2}* \`BAJO VIGILANCIA\`\n\nEspera ${Math.floor(remaining/60000)}m para volver a intentarlo.`);
            }

            const isSuccess = Math.random() > 0.3;
            userData.crime = { lastUsed: now };

            if (isSuccess) {
                const fr = crimeFrases[Math.floor(Math.random() * crimeFrases.length)];
                const reward = Math.floor(Math.random() * (fr.max - fr.min + 1)) + fr.min;
                userData.wallet += reward;

                await conn.sendMessage(m.chat, { 
                    text: `*${config.visuals.emoji3}* \`CRIMEN EXITOSO\` *${config.visuals.emoji3}*\n\n${fr.text}\n*${config.visuals.emoji} Ganaste:* ¥${reward.toLocaleString()}\n\n> *Cartera:* ¥${userData.wallet.toLocaleString()}`
                }, { quoted: m });
            } else {
                const fail = failFrases[Math.floor(Math.random() * failFrases.length)];
                m.reply(`*${config.visuals.emoji2}* \`OPERACIÓN FALLIDA\`\n\n${fail}`);
            }

            db[user] = userData;
            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* Error en la misión.`);
        }
    }
};

export default crimeCommand;
