import { config } from '../config.js';
import fs from 'fs';
import path from 'path';
import { winFrases, loseFrases } from './frases/slut.js';

const dbPath = path.resolve('./config/database/economy/economy.json');
const slutCooldowns = new Map();

const slutCommand = {
    name: 'slut',
    alias: ['prostituirse', 'escenario'],
    category: 'economy',
    noPrefix: true,

    run: async (conn, m) => {
        try {
            const user = m.sender.split('@')[0];
            const now = Date.now();
            const cooldown = 10 * 60 * 1000;

            if (slutCooldowns.has(user) && (now < slutCooldowns.get(user) + cooldown)) {
                const rem = slutCooldowns.get(user) + cooldown - now;
                return m.reply(`*${config.visuals.emoji2}* Espera ${Math.floor(rem / 60000)}m.`);
            }

            let db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
            if (!db[user]) db[user] = { wallet: 0, bank: 0, daily: { lastClaim: 0, streak: 0 }, crime: { lastUsed: 0 } };

            const isLoss = Math.random() < 0.03;
            const amount = Math.floor(Math.random() * (8000 - 3000 + 1)) + 3000;

            if (isLoss) {
                const frase = loseFrases[Math.floor(Math.random() * loseFrases.length)];
                db[user].wallet = Math.max(0, (db[user].wallet || 0) - amount);
                await m.reply(`*${config.visuals.emoji2}* \`MALA NOCHE\`\n\n${frase}\n*Perdiste:* ¥${amount.toLocaleString()}\n\n> ¡A veces se gana y a veces se aprende!`);
            } else {
                const frase = winFrases[Math.floor(Math.random() * winFrases.length)];
                db[user].wallet = (db[user].wallet || 0) + amount;
                await m.reply(`*${config.visuals.emoji3}* \`NOCHE DE ÉXITO\`\n\n${frase}\n*Ganaste:* ¥${amount.toLocaleString()}\n\n> ¡Eres el centro de atención esta noche!`);
            }

            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
            slutCooldowns.set(user, now);

        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* Error en la discoteca.`);
        }
    }
};

export default slutCommand;
