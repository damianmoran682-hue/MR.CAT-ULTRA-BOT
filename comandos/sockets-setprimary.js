import fs from 'fs';
import path from 'path';

const jsonDir = path.resolve('./jsons');
const databasePath = path.join(jsonDir, 'preferencias.json');

const setPrimary = {
    name: 'setprimary',
    alias: ['setprimary', 'principal', 'solotu'],
    category: 'sockets',
    isOwner: false,
    noPrefix: true,
    isAdmin: true,
    isGroup: true,

    run: async (conn, m, args) => {
        const from = m.key.remoteJid;
        
        if (!fs.existsSync(jsonDir)) {
            fs.mkdirSync(jsonDir, { recursive: true });
        }

        let db = {};
        if (fs.existsSync(databasePath)) {
            try {
                db = JSON.parse(fs.readFileSync(databasePath, 'utf-8'));
            } catch (e) {
                db = {};
            }
        }

        // --- NUEVA RESTRICCIÓN ---
        if (db[from]) {
            return await conn.sendMessage(from, { 
                text: `*❁* \`Acción Denegada\` *❁*\n\nYa existe un bot primario asignado (\`${db[from]}\`) en este grupo.\n\n> Usa \`#delprimary\` para removerlo antes de asignar uno nuevo.` 
            }, { quoted: m });
        }

        let targetJid = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || 
                        m.message?.extendedTextMessage?.contextInfo?.participant;

        if (!targetJid) {
            return await conn.sendMessage(from, { 
                text: `*❁* \`Error de asignación\` *❁*\n\nDebes mencionar a un Bot o responder a su mensaje para nombrarlo primario.\n\n> ¡Elige sabiamente a tu socket!` 
            }, { quoted: m });
        }

        const targetNumber = targetJid.split('@')[0].replace(/[^0-9]/g, '');
        const myNumber = conn.user.id.split(':')[0].replace(/[^0-9]/g, '');
        const sessionsPath = path.resolve('./sesiones_subbots');
        
        const isMain = targetNumber === myNumber;
        const isSub = fs.existsSync(path.join(sessionsPath, targetNumber));

        if (!isMain && !isSub) {
            return await conn.sendMessage(from, { 
                text: `*❁* \`Bot no encontrado\` *❁*\n\nEl número \`${targetNumber}\` no es un Bot activo.\n\n> ¡Solo puedes nombrar a bots vinculados!` 
            }, { quoted: m });
        }

        db[from] = targetNumber;
        fs.writeFileSync(databasePath, JSON.stringify(db, null, 2));

        await conn.sendMessage(from, { 
            text: `*✿︎* \`Configuración Exitosa\` *✿︎*\n\nSe ha elegido al socket *${targetNumber}* como bot primario del grupo.\n\n> ¡Desde ahora, solo este bot responderá aquí!` 
        }, { quoted: m });
    }
};

export default setPrimary;