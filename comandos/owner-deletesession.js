import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

const sessionsPath = path.resolve('./sesiones_subbots');

const deleteSession = {
    name: 'deletesession',
    alias: ['dsession', 'purger'],
    category: 'owner',
    isOwner: true,
    noPrefix: true,

    run: async (conn, m, args) => {
        try {
            if (!args[0]) {
                return m.reply(`*${config.visuals.emoji2}* \`Uso Incorrecto\`\n\n> #deletesession (número)\n> #deletesession all`);
            }

            if (args[0].toLowerCase() === 'all') {
                // Purga total
                const sessions = fs.readdirSync(sessionsPath);
                
                // Cerrar todas las conexiones en memoria primero
                for (const [jid, sock] of global.subBots.entries()) {
                    await sock.logout();
                    global.subBots.delete(jid);
                }

                // Borrar todo el contenido de la carpeta
                sessions.forEach(file => {
                    const fullPath = path.join(sessionsPath, file);
                    fs.rmSync(fullPath, { recursive: true, force: true });
                });

                return m.reply(`*${config.visuals.emoji3}* \`PURGA TOTAL COMPLETADA\`\n\nSe han eliminado todos los sub-bots y sus sesiones.`);
            }

            // Borrar un número específico
            const target = args[0].replace(/[^0-9]/g, '');
            const targetJid = `${target}@s.whatsapp.net`;
            const userSessionPath = path.join(sessionsPath, target);

            if (!fs.existsSync(userSessionPath)) {
                return m.reply(`*${config.visuals.emoji2}* No se encontró ninguna sesión para el número: ${target}`);
            }

            // Si el bot está activo en memoria, lo cerramos
            if (global.subBots.has(targetJid)) {
                const sock = global.subBots.get(targetJid);
                await sock.logout();
                global.subBots.delete(targetJid);
            }

            // Borrar carpeta
            fs.rmSync(userSessionPath, { recursive: true, force: true });

            await m.reply(`*${config.visuals.emoji3}* Sesión del número \`${target}\` eliminada correctamente.`);

        } catch (e) {
            console.error(e);
            m.reply(`*${config.visuals.emoji2}* Error al ejecutar la purga.`);
        }
    }
};

export default deleteSession;