import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

export default {
    name: 'sockets',
    alias: ['sockets', 'bots'],
    category: 'sockets',
    noPrefix: true,

    run: async (conn, m) => {
        try {
            const sessionsPath = path.resolve('./sesiones_subbots');
            const mainSessionPath = path.resolve('./sesion_bot');
            
            let mainBotNumber = '';

            if (fs.existsSync(mainSessionPath)) {
                const files = fs.readdirSync(mainSessionPath);
                const credsFile = files.find(f => f === 'creds.json');
                if (credsFile) {
                    const creds = JSON.parse(fs.readFileSync(path.join(mainSessionPath, 'creds.json'), 'utf-8'));
                    mainBotNumber = creds.me.id.split(':')[0];
                }
            }

            if (!mainBotNumber) {
                mainBotNumber = conn.user.id.split(':')[0];
            }

            let totalSubs = 0;
            let subBotsList = '';

            if (fs.existsSync(sessionsPath)) {
                const folders = fs.readdirSync(sessionsPath).filter(f => {
                    const fullPath = path.join(sessionsPath, f);
                    return fs.statSync(fullPath).isDirectory() && !f.startsWith('.');
                });

                folders.forEach(folder => {
                    const num = folder.replace(/\D/g, '');
                    if (num && num !== mainBotNumber) {
                        subBotsList += `  ➪ *[wa.me/${num}]* » *Sub-Bot*\n`;
                        totalSubs++;
                    }
                });
            }

            let listaFinal = `  ➪ *[wa.me/${mainBotNumber}]* » *Principal*\n${subBotsList}`;

            const texto = `*${config.visuals.emoji3}* \`LISTA DE SOCKETS ACTIVOS\` *${config.visuals.emoji3}*\n\n*❁ Principal » 1*\n*❀ Subs Totales » ${totalSubs}*\n\n*❀ DETALLE:*\n${listaFinal}`;

            await conn.sendMessage(m.chat, { text: texto.trim() }, { quoted: m });

        } catch (e) {
            console.error(e);
        }
    }
};
