import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

const gachaPath = path.resolve('./config/database/gacha/gacha_list.json');
const ecoPath = path.resolve('./config/database/economy/economy.json');
const claimCooldowns = new Map();

const claimCommand = {
    name: 'claim',
    alias: ['reclamar', 'c'],
    category: 'gacha',
    noPrefix: true,

    run: async (conn, m, args) => {
        try {
            const user = m.sender.split('@')[0].split(':')[0];
            const ahora = Date.now();
            
            if (claimCooldowns.has(user) && (ahora - claimCooldowns.get(user) < 9 * 60 * 1000)) {
                return m.reply(`*${config.visuals.emoji2}* Espera para reclamar de nuevo.`);
            }

            let gachaDB = JSON.parse(fs.readFileSync(gachaPath, 'utf-8'));
            let ecoDB = JSON.parse(fs.readFileSync(ecoPath, 'utf-8'));
            let pjId = null;

            // --- LA JUGADA MAESTRA ---
            // Primero: ¿Puso el ID manual? (#claim 16)
            if (args[0] && !isNaN(args[0])) {
                pjId = args[0];
            } 
            // Segundo: ¿Está respondiendo a un mensaje?
            else if (m.quoted) {
                // Buscamos el ID en el texto o en el pie de foto (caption) de la cita
                const textoCita = m.quoted.text || m.quoted.caption || m.quoted.description || '';
                
                // Usamos una búsqueda más agresiva para encontrar el número después de "ID »"
                const match = textoCita.match(/ID\s*»\s*(\d+)/i);
                
                if (match && match[1]) {
                    pjId = match[1]; // Aquí el bot ya tiene el ID como si lo hubieras escrito
                }
            }

            // Si después de buscar no hay ID, abortamos
            if (!pjId || !gachaDB[pjId]) {
                return m.reply(`*${config.visuals.emoji2}* ¿Qué intentas reclamar? Responde bien al mensaje o usa #claim (ID).`);
            }
            
            const pj = gachaDB[pjId];
            if (pj.status !== 'libre') return m.reply(`*${config.visuals.emoji2}* ¡Llegaste tarde! Este ya tiene dueño.`);

            if (!ecoDB[user]) ecoDB[user] = { wallet: 0, bank: 0 };
            const saldo = ecoDB[user].wallet || 0;

            if (saldo < pj.value) {
                return m.reply(`*${config.visuals.emoji2}* No tienes suficiente dinero en cartera. Cuesta ¥${pj.value.toLocaleString()}`);
            }

            // Ejecutar la compra
            ecoDB[user].wallet -= pj.value;
            gachaDB[pjId].status = 'domado';
            gachaDB[pjId].owner = user;

            fs.writeFileSync(gachaPath, JSON.stringify(gachaDB, null, 2));
            fs.writeFileSync(ecoPath, JSON.stringify(ecoDB, null, 2));
            claimCooldowns.set(user, ahora);

            m.reply(`*${config.visuals.emoji3}* ¡Adquiriste a *${pj.name}* con éxito! Pagaste ¥${pj.value.toLocaleString()}.`);

        } catch (e) {
            console.error("Error en Claim:", e);
            m.reply(`*${config.visuals.emoji2}* Error técnico en el reclamo.`);
        }
    }
};

export default claimCommand;
