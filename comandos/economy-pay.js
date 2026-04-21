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
            
            // Detección de objetivo igual a Rob
            let targetJid = m.quoted ? m.quoted.key.participant || m.quoted.key.remoteJid : m.mentionedJid?.[0];

            if (!targetJid && args[0] && args[0].includes('@')) {
                targetJid = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
            }

            if (!targetJid) return m.reply(`*${config.visuals.emoji2}* \`Error de objetivo\`\n\nDebes mencionar o responder a alguien.\n\n> ¡Indica a quién quieres enviarle dinero!`);

            const receiver = targetJid.split('@')[0];

            // BLOQUEO DE AUTO-ENVÍO
            if (sender === receiver) {
                return m.reply(`*${config.visuals.emoji2}* \`Operación Inválida\`\n\nNo puedes enviarte dinero a ti mismo.`);
            }

            // Extraer cantidad ignorando el ID del receptor
            let amountStr = args.find(a => {
                let clean = a.replace(/[^0-9]/g, '');
                return clean.length > 0 && clean !== receiver && clean.length < 12;
            });
            
            const amount = parseInt(amountStr?.replace(/[^0-9]/g, ''));

            if (isNaN(amount) || amount <= 0) {
                return m.reply(`*${config.visuals.emoji2}* \`Cantidad Inválida\`\n\nUso: #pay 5000 @mención`);
            }

            // LÍMITE MÍNIMO DE 1,000 COINS
            if (amount < 1000) {
                return m.reply(`*${config.visuals.emoji2}* \`Transferencia Mínima\`\n\nEl monto mínimo para enviar es de ¥1,000 coins.\n\n> ¡Se generoso con tus amigos!`);
            }

            let db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
            
            // Aseguramos que los valores sean tratados como Números (Number)
            const senderBank = Number(db[sender]?.bank || 0);

            // Verificación de saldo corregida
            if (senderBank < amount) {
                return m.reply(`*${config.visuals.emoji2}* \`Fondos Insuficientes\`\n\nTienes ¥${senderBank.toLocaleString()} en tu banco.\n\n> ¡Necesitas más capital para enviar ¥${amount.toLocaleString()}!`);
            }

            if (!db[receiver]) {
                db[receiver] = { wallet: 0, bank: 0, daily: { lastClaim: 0, streak: 0 }, crime: { lastUsed: 0 } };
            }

            // Ejecución de la transferencia de banco a banco
            db[sender].bank = Number(db[sender].bank) - amount;
            db[receiver].bank = Number(db[receiver].bank || 0) + amount;

            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

            await conn.sendMessage(m.chat, { 
                text: `*${config.visuals.emoji3}* \`TRANSFERENCIA EXITOSA\`\n\n*De:* @${sender}\n*Para:* @${receiver}\n*Monto:* ¥${amount.toLocaleString()}\n\n> ¡Transferencia de banco a banco completada con éxito!`,
                mentions: [m.sender, targetJid]
            }, { quoted: m });

        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* Error en el banco.`);
        }
    }
};

export default payCommand;
