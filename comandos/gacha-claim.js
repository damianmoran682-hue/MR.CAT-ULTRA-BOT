import { config } from '../config.js';
import fs from 'fs';
import path from 'path';

const gachaPath = path.resolve('./config/database/gacha/gacha_list.json');
const ecoPath = path.resolve('./config/database/gacha/economy.json');
const claimCooldowns = new Map();

const claimCommand = {
    name: 'claim',
    alias: ['reclamar'],
    category: 'gacha',
    noPrefix: true,

    run: async (conn, m, args) => {
        try {
            const user = m.sender.split('@')[0];
            const ahora = Date.now();
            if (claimCooldowns.has(user) && (ahora - claimCooldowns.get(user) < 9 * 60 * 1000)) {
                return m.reply(`*${config.visuals.emoji2}* Debes esperar 9 min para reclamar de nuevo.`);
            }

            let gachaDB = JSON.parse(fs.readFileSync(gachaPath, 'utf-8'));
            let ecoDB = JSON.parse(fs.readFileSync(ecoPath, 'utf-8'));
            let pjId = null;

            if (args[0]) {
                pjId = args[0];
            } else if (m.quoted && m.quoted.text) {
                const match = Object.keys(gachaDB).find(id => m.quoted.text.includes(gachaDB[id].name));
                pjId = match;
            }

            if (!pjId || !gachaDB[pjId]) return m.reply(`*${config.visuals.emoji2}* ¿Qué intentas reclamar?`);
            
            const pj = gachaDB[pjId];
            if (pj.status !== 'libre') return m.reply(`*${config.visuals.emoji2}* Este ya tiene dueño.`);

            const saldo = ecoDB[user]?.wallet || 0;
            if (saldo < pj.value) return m.reply(`*${config.visuals.emoji2}* No tienes ¥${pj.value.toLocaleString()}. ¡A chambear!`);

            ecoDB[user].wallet -= pj.value;
            gachaDB[pjId].status = 'domado';
            gachaDB[pjId].owner = user;

            fs.writeFileSync(gachaPath, JSON.stringify(gachaDB, null, 2));
            fs.writeFileSync(ecoPath, JSON.stringify(ecoDB, null, 2));
            claimCooldowns.set(user, ahora);

            m.reply(`*${config.visuals.emoji3}* ¡Adquiriste a *${pj.name}*! Se han descontado ¥${pj.value.toLocaleString()} de tu cuenta.`);

        } catch (e) {
            m.reply('Error al procesar el reclamo.');
        }
    }
};

export default claimCommand;