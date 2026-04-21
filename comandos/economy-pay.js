import { config } from '../config.js';
import fs from 'fs';
import path from 'path';

const dbPath = path.resolve('./config/database/economy/economy.json');

const payCommand = {
    name: 'pay',
    alias: ['pagar', 'transferir', 'dar'],
    category: 'economy',
    noPrefix: true,

    run: async (conn, m, args) => {
        try {
            const sender = m.sender.split('@')[0];

            // 1. DETECCIÓN DE OBJETIVO (LÓGICA ROB)
            let targetJid = m.quoted ? m.quoted.key.participant || m.quoted.key.remoteJid : m.mentionedJid?.[0];

            if (!targetJid && args[0]) {
                let rawNumber = args[0].replace(/[^0-9]/g, '');
                if (rawNumber.length >= 10) targetJid = rawNumber + '@s.whatsapp.net';
            }

            if (!targetJid) return m.reply(`*${config.visuals.emoji2}* \`Error de objetivo\`\n\nDebes mencionar o responder a alguien.`);

            const receiver = targetJid.split('@')[0];
            if (sender === receiver) return m.reply(`*${config.visuals.emoji2}* No puedes enviarte dinero a ti mismo.`);

            // 2. EXTRACCIÓN DE CANTIDAD (EL PRIMER NÚMERO QUE NO SEA EL JID)
            // Simplemente buscamos en los argumentos algo que sea un número y no sea excesivamente largo como un JID
            let amount = args.map(a => a.replace(/[^0-9]/g, '')).find(a => a.length > 0 && a.length < 10);
            amount = parseInt(amount);

            if (isNaN(amount) || amount <= 0) {
                return m.reply(`*${config.visuals.emoji2}* \`Cantidad Inválida\`\n\nUso: #pay 5000 @mención`);
            }

            if (amount < 1000) return m.reply(`*${config.visuals.emoji2}* El monto mínimo es ¥1,000.`);

            // 3. CARGA DE DATOS Y VALIDACIÓN
            if (!fs.existsSync(dbPath)) return m.reply('Error: Archivo de economía no encontrado.');
            let db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
            
            let senderBank = Number(db[sender]?.bank || 0);

            if (senderBank < amount) {
                return m.reply(`*${config.visuals.emoji2}* \`Fondos Insuficientes\`\n\nTienes ¥${senderBank.toLocaleString()} en tu banco.`);
            }

            // 4. TRANSACCIÓN
            if (!db[receiver]) db[receiver] = { wallet: 0, bank: 0, daily: { lastClaim: 0, streak: 0 } };

            db[sender].bank = senderBank - amount;
            db[receiver].bank = Number(db[receiver].bank || 0) + amount;

            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

            await conn.sendMessage(m.chat, { 
                text: `*${config.visuals.emoji3}* \`TRANSFERENCIA EXITOSA\`\n\n*De:* @${sender}\n*Para:* @${receiver}\n*Monto:* ¥${amount.toLocaleString()}\n\n> ¡Dinero enviado de banco a banco!`,
                mentions: [m.sender, targetJid]
            }, { quoted: m });

        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* Error en la transacción.`);
        }
    }
};

export default payCommand;
