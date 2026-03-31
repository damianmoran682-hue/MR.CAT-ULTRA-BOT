/* KURAYAMI TEAM - SOCKET MONITOR ENGINE 
   Desarrollado por Félix OFC para Kamuza Mister Bot
*/

import fs from 'fs';
import path from 'path';

const listSocketsCommand = {
    name: 'bots',
    alias: ['sockets', 'subbots', 'nodos'],
    category: 'sockets',
    isOwner: false,
    isAdmin: false,
    isGroup: true, 

    run: async (conn, m) => {
        const from = m.chat;

        try {
            // 1. Obtener metadatos frescos para asegurar compatibilidad LID
            const groupMetadata = await conn.groupMetadata(from).catch(() => null);
            if (!groupMetadata) return m.reply('❌ No pude obtener la información del grupo.');

            // 2. Ruta de sesiones (Ajusta './sesiones_subbots' si tu carpeta se llama distinto)
            const sessionsPath = path.resolve('./sesiones_subbots');
            let totalSubBots = 0;
            if (fs.existsSync(sessionsPath)) {
                // Filtramos para contar solo carpetas reales de sesión
                totalSubBots = fs.readdirSync(sessionsPath).filter(f => {
                    return fs.statSync(path.join(sessionsPath, f)).isDirectory() && !f.startsWith('.');
                }).length;
            }

            // 3. Identificar Sockets (Principal + Subbots activos en memoria)
            const mainBotJid = conn.user.id.split(':')[0] + '@s.whatsapp.net';
            
            // Verificamos si existe el objeto global de subbots
            const activeSubBotsJids = global.subBots ? Array.from(global.subBots.keys()) : []; 

            // Filtramos participantes que sean parte de la red Kurayami
            const botsInGroup = groupMetadata.participants.filter(p => {
                const jid = p.id;
                const lid = p.lid || null;
                return jid === mainBotJid || activeSubBotsJids.includes(jid) || (lid && activeSubBotsJids.includes(lid));
            });

            // 4. Construir menciones
            let mentionsJid = [];
            let listaMenciones = "";

            botsInGroup.forEach((bot) => {
                const jid = bot.id; 
                mentionsJid.push(jid);
                listaMenciones += `   ➪ @${jid.split('@')[0]}\n`;
            });

            // 5. Mensaje Final
            const texto = `
✿︎ \`LISTA DE SOCKETS ACTIVOS\` ✿︎

*❁ Principal » 1*
*❀ Sub-Bots » ${totalSubBots}*

*⌨︎ Nodos en este grupo » ${botsInGroup.length}*

${listaMenciones || "_No hay más nodos en este grupo._"}
`.trim();

            await conn.sendMessage(from, { 
                text: texto,
                mentions: mentionsJid,
                contextInfo: {
                    externalAdReply: {
                        title: 'KAZUMA - NETWORK STATUS',
                        body: 'Supervisión de Nodos Kurayami',
                        thumbnailUrl: 'https://files.catbox.moe/9ssbf9.jpg',
                        mediaType: 1,
                        renderLargerThumbnail: false
                    }
                }
            }, { quoted: m });

        } catch (err) {
            console.error('Error en socket monitor:', err);
            // Si hay un error, el bot al menos avisa
            await conn.sendMessage(from, { text: '❌ Error interno en el motor de sockets.' }, { quoted: m });
        }
    }
};

export default listSocketsCommand;