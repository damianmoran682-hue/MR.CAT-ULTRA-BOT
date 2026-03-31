/* KURAYAMI TEAM - PREFIX MANAGER 
   Categoría: OWNER | Archivo: owner-prefix.js
   Sistema: Identidad Dual (JID/LID)
*/

import fs from 'fs';
import path from 'path';

export default {
    name: 'setprefix',
    alias: ['prefix', 'setprefijo'],
    category: 'owner',
    isOwner: true, // Ahora validado por el nuevo pixel.js (JID/LID)
    noPrefix: true, // Para que puedas cambiarlo incluso si olvidas el prefijo actual

    run: async (conn, m, { args, config }) => {
        const newPrefix = args[0];
        // Prefijos permitidos para mantener la estabilidad del bot
        const allowed = ['#', '!', '.'];

        if (!newPrefix) {
            return m.reply(`💡 *USO CORRECTO*\nEscribe el comando seguido del nuevo prefijo.\nEjemplo: *setprefix !*\n\nDisponibles: ${allowed.join(' ')}`);
        }

        if (!allowed.includes(newPrefix)) {
            return m.reply(`❌ *PREFIJO NO VÁLIDO*\nSolo puedes usar uno de estos tres: ${allowed.join(' ')}\n\n_Esto es para evitar conflictos con el sistema de comandos._`);
        }

        try {
            const configPath = path.resolve('./config.js');
            let content = fs.readFileSync(configPath, 'utf8');

            // Buscamos la línea del prefijo en el archivo físico y la reemplazamos
            const updatedContent = content.replace(
                /prefix:\s*['"].+['"]/, 
                `prefix: '${newPrefix}'`
            );

            // Guardamos los cambios de forma permanente
            fs.writeFileSync(configPath, updatedContent);

            // Actualizamos la configuración en la memoria actual del bot
            config.prefix = newPrefix;

            const texto = `
✅ *CONFIGURACIÓN ACTUALIZADA*

El prefijo visual de **${config.botName}** ha sido cambiado a: *${newPrefix}*

> Los comandos con *noPrefix: true* seguirán respondiendo normalmente.
`.trim();

            await conn.sendMessage(m.chat, { 
                text: texto,
                contextInfo: {
                    externalAdReply: {
                        title: 'SISTEMA KAZUMA',
                        body: 'Configuración de Prefijos',
                        thumbnailUrl: 'https://files.catbox.moe/9ssbf9.jpg',
                        mediaType: 1
                    }
                }
            }, { quoted: m });

            console.log(`[⚙️] PREFIJO ACTUALIZADO A: ${newPrefix} POR: ${m.sender}`);

        } catch (e) {
            console.error('Error al actualizar prefix:', e);
            m.reply('❌ *ERROR CRÍTICO*\nNo se pudo escribir en el archivo config.js. Revisa los permisos en tu panel de control.');
        }
    }
};
