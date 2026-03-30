import { exec } from 'child_process';
import { promisify } from 'util';
import { config } from '../config.js';
import chalk from 'chalk';

const execPromise = promisify(exec);

const updateCommand = {
    name: 'update',
    alias: ['actualizar', 'gitpull'],
    category: 'owner',
    isOwner: true, 
    isGroup: false,

    run: async (conn, m, { prefix, senderNumber }) => {
        const from = m.key.remoteJid;

        // DOBLE VALIDACIÓN DE SEGURIDAD (Forzada para tu número)
        const myNumber = '573508941325';
        const isFélix = senderNumber === myNumber || config.owner.includes(myNumber);

        if (!isFélix) {
            return await conn.sendMessage(from, { text: '⚠️ No tienes permiso para realizar actualizaciones críticas.' }, { quoted: m });
        }

        try {
            await conn.sendMessage(from, { react: { text: '⌚', key: m.key } });

            const { stdout, stderr } = await execPromise('git pull');

            if (stdout.includes('Already up to date')) {
                await conn.sendMessage(from, { react: { text: '✅', key: m.key } });
                return await conn.sendMessage(from, { text: '✅ *El bot ya está actualizado.*' }, { quoted: m });
            }

            // Recarga los comandos en memoria
            if (global.loadCommands) {
                await global.loadCommands(); 
            }

            await conn.sendMessage(from, { react: { text: '☑️', key: m.key } });

            let updateMsg = `✅ *Actualización realizada exitosamente*\n\n`;
            updateMsg += `*Update:* \n`;
            updateMsg += `\`\`\`${stdout}\`\`\``;

            await conn.sendMessage(from, { text: updateMsg }, { quoted: m });

        } catch (error) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            let errorMsg = `❌ *FALLO EN LA ACTUALIZACIÓN*\n\n\`\`\`${error.message}\`\`\``;
            await conn.sendMessage(from, { text: errorMsg }, { quoted: m });
        }
    }
};

export default updateCommand;