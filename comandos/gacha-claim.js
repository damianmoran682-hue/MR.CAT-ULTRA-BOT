import { config } from '../config.js';
import fs from 'fs';
import path from 'path';

const gachaPath = path.resolve('./config/database/gacha/gacha_list.json');
const ecoPath = path.resolve('./config/database/economy/economy.json');
const claimCooldowns = new Map();

const claimCommand = {
    name: 'claim',
    alias: ['reclamar'],
    category: 'gacha',
    noPrefix: true,

    run: async (conn, m, args) => {
        try {
            const user = m.sender.split('@')[0].split(':')[0];
            const ahora = Date.now();
            if (claimCooldowns.has(user) && (ahora - claimCooldowns.get(user) < 9 * 60 * 1000)) {
                const rem = 9 * 60 * 1000 - (ahora - claimCooldowns.get(user));
                return m.reply(`*${config.visuals.emoji2}* Espera ${Math.ceil(rem / 60000)} min.`);
            }

            let gachaDB = JSON.parse(fs.readFileSync(gachaPath, 'utf-8'));
            let ecoDB = JSON.parse(fs.readFileSync(ecoPath, 'utf-8'));
            let pjId = null;

            // TRUCO: ID directo o por respuesta
            if (args[0]) {
                pjId = args[0];
            } else if (m.quoted && m.quoted.text) {
                pjId = Object.keys(gachaDB).find(id => m.quoted.text.includes(gachaDB[id].name));
            }

            if (!pjId || !gachaDB[pjId]) return m.reply(`*${config.visuals.emoji2}* ¿Qué intentas reclamar?`);
            
            const pj = gachaDB[pjId];
            if (pj.status !== 'libre') return m.reply(`*${config.visuals.emoji2}* Ya tiene dueño.`);

            if (!ecoDB[user]) ecoDB[user] = { wallet: 0, bank: 0 };
            if (ecoDB[user].wallet < pj.value) return m.reply(`*${config.visuals.emoji2}* Te faltan ¥${(pj.value - ecoDB[user].wallet).toLocaleString()}. ¡A chambear!`);

            // Transacción limpia
            ecoDB[user].wallet -= pj.value;
            gachaDB[pjId].status = 'domado';
            gachaDB[pjId].owner = user;

            fs.writeFileSync(gachaPath, JSON.stringify(gachaDB, null, 2));
            fs.writeFileSync(ecoPath, JSON.stringify(ecoDB, null, 2));
            claimCooldowns.set(user, ahora);

            m.reply(`*${config.visuals.emoji3}* ¡Adquiriste a *${pj.name}*! Pagaste ¥${pj.value.toLocaleString()}.`);

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error al procesar el reclamo.`);
        }
    }
};

export default claimCommand;
