import { config } from '../config.js';
import fs from 'fs';
import path from 'path';

const dbPath = path.resolve('./config/database/economy/economy.json');

const balanceCommand = {
    name: 'balance',
    alias: ['bal', 'cartera', 'billetera', 'banco'],
    category: 'economy',
    isOwner: false,
    noPrefix: true,
    isAdmin: false,
    isGroup: false,

    run: async (conn, m, args, usedPrefix) => {
        try {
            const user = (m.quoted ? m.quoted.sender : m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.sender).split('@')[0];
            let db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

            if (!db[user]) {
                db[user] = { wallet: 0, bank: 0, daily: { lastClaim: 0, streak: 0 }, crime: { lastUsed: 0 } };
            }

            const userData = db[user];
            const total = userData.wallet + userData.bank;

            const textoBalance = `*${config.visuals.emoji3}* \`ESTADO FINANCIERO\` *${config.visuals.emoji3}*\n\n*${config.visuals.emoji} Cartera:* ¥${userData.wallet.toLocaleString()}\n*${config.visuals.emoji5 || '🏦'} Banco:* ¥${userData.bank.toLocaleString()}\n*${config.visuals.emoji4} Total:* ¥${total.toLocaleString()}\n\n> Usuario: @${user}`;

            await conn.sendMessage(m.chat, { 
                text: textoBalance,
                mentions: [`${user}@s.whatsapp.net`],
                contextInfo: {
                    externalAdReply: {
                        title: 'KAZUMA - BANKING',
                        body: 'Consulta de activos financieros',
                        thumbnailUrl: config.visuals.img1,
                        mediaType: 1,
                        showAdAttribution: false
                    }
                }
            }, { quoted: m });

        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* \`Error\` *${config.visuals.emoji2}*\nNo se pudo consultar el balance.`);
        }
    }
};

export default balanceCommand;