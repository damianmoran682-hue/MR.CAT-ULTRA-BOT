/* KAZUMA MISTER BOT - CONFIGURACIÓN DE GRUPO */
import fs from 'fs';
import path from 'path';

const databasePath = path.resolve('./jsons/grupos.json');

const configOnOff = {
    name: 'config',
    alias: ['on', 'off', 'detect', 'antilink'],
    category: 'grupo',
    isAdmin: true,
    isGroup: true,
    noPrefix: true,

    run: async (conn, m, args, usedPrefix, commandName) => {
        const from = m.key.remoteJid;
        let feature, action;

        // Lógica de detección: ¿Se usó el comando base o un alias?
        if (commandName === 'config') {
            feature = args[0]?.toLowerCase();
            action = args[1]?.toLowerCase();
        } else {
            // Si usó #detect on o #antilink off
            feature = commandName; 
            action = args[0]?.toLowerCase();
        }

        const validFeatures = ['detect', 'antilink'];

        if (!validFeatures.includes(feature)) {
            return m.reply(`*❁* \`Opción Inválida\` *❁*\n\nUsa: *${usedPrefix}${commandName} [detect / antilink] [on / off]*`);
        }

        if (!action || !['on', 'off', 'enable', 'disable'].includes(action)) {
            return m.reply(`*❁* \`Estado Faltante\` *❁*\n\n¿Quieres activar o desactivar *${feature}*?\n\n> Ejemplo: *${usedPrefix}${feature} on*`);
        }

        const enabled = ['on', 'enable'].includes(action);

        // Asegurar que la carpeta y el archivo existan
        if (!fs.existsSync(path.resolve('./jsons'))) fs.mkdirSync(path.resolve('./jsons'));
        let db = {};
        if (fs.existsSync(databasePath)) {
            try {
                db = JSON.parse(fs.readFileSync(databasePath, 'utf-8'));
            } catch (e) { db = {}; }
        }
        
        if (!db[from]) db[from] = {};
        db[from][feature] = enabled;
        
        fs.writeFileSync(databasePath, JSON.stringify(db, null, 2));

        await conn.sendMessage(from, { 
            text: `*✿︎* \`Ajuste Actualizado\` *✿︎*\n\nLa función *${feature.toUpperCase()}* ahora está: **${enabled ? 'ACTIVADA' : 'DESACTIVADA'}**.\n\n> Kazuma Mister Bot` 
        }, { quoted: m });
    }
};

export default configOnOff;