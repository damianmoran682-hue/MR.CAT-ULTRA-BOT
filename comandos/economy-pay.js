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
            // Limpieza del emisor (tú)
            const sender = m.sender.split('@')[0].split(':')[0];

            // 1. DETECCIÓN POR RESPUESTA
            let quotedJid = m.quoted ? m.quoted.key.participant || m.quoted.key.remoteJid : null;

            if (!quotedJid) {
                return m.reply(`*${config.visuals.emoji2}* \`Error de Uso\`\n\nDebes responder al mensaje de alguien.\n\n> Ejemplo: #pay 5000`);
            }

            // LIMPIEZA ABSOLUTA DEL JID (Elimina el :0, :1, etc.)
            const receiver = quotedJid.split('@')[0].split(':')[0];
            const cleanTargetJid = receiver + '@s.whatsapp.net';

            // 2. BLOQUEO DE AUTO-ENVÍO
            if (sender === receiver) {
                return m.reply(`*${config.visuals.emoji2}* No puedes enviarte dinero a ti mismo.`);
            }

            // 3. EXTRACCIÓN DE CANTIDAD
            let amount = parseInt(args[0]?.replace(/[^0-9]/g, ''));
            if (isNaN(amount) || amount <= 0) {
                return m.reply(`*${config.visuals.emoji2}* Indica una cifra válida.`);
            }

            if (amount < 1000) {
                return m.reply(`*${config.visuals.emoji2}* El mínimo es ¥1,000.`);
            }

            // 4. PROCESO DE BASE DE DATOS
            if (!fs.existsSync(dbPath)) return m.reply('Error: DB no encontrada.');
            let db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

            // Asegurar que el emisor existe (usando el ID limpio)
            if (!db[sender]) db[sender] = { wallet: 0, bank: 0 };
            let senderBank = Number(db[sender].bank || 0);

            if (senderBank < amount) {
                return m.reply(`*${config.visuals.emoji2}* \`Fondos Insuficientes\`\n\nTienes ¥${senderBank.toLocaleString()} en tu banco.`);
            }

            // ASEGURAR QUE EL RECEPTOR EXISTE (Sin duplicar)
            // Si ya existe el usuario sin el :0, se usará ese.
            if (!db[receiver]) {
                db[receiver] = { 
                    wallet: 0, 
                    bank: 0, 
                    daily: { lastClaim: 0, streak: 0 },
                    crime: { lastUsed: 0 }
                };
            }

            // --- TRANSFERENCIA ---
            db[sender].bank = senderBank - amount;
            db[receiver].bank = Number(db[receiver].bank || 0) + amount;

            // GUARDADO
            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');

            // 5. RESPUESTA LIMPIA
            await conn.sendMessage(m.chat, { 
                text: `*${config.visuals.emoji3}* \`TRANSFERENCIA EXITOSA\`\n\n*De:* @${sender}\n*Para:* @${receiver}\n*Monto:* ¥${amount.toLocaleString()}\n\n> ¡Dinero enviado correctamente!`,
                mentions: [m.sender, cleanTargetJid]
            }, { quoted: m });

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error en el sistema.`);
        }
    }
};

export default payCommand;
