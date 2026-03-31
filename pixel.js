/* KURAYAMI TEAM - PIXEL HANDLER ENGINE 
   Identidad Blindada + Multi-Prefix + No-Prefix
*/

import chalk from 'chalk';
import { logger } from './config/print.js';

export const pixelHandler = async (conn, m, config) => {
    try {
        if (!m || !m.message) return;
        const chat = m.key.remoteJid;
        if (chat === 'status@broadcast') return;

        // 1. --- IDENTIFICACIÓN DEL REMITENTE (SENDER) ---
        // Sacamos el número limpio sin importar si es LID o JID
        const sender = m.key.participant || m.key.remoteJid;
        const senderNumber = sender.split('@')[0].split(':')[0]; // Extrae solo los números

        // 2. --- EXTRACCIÓN DE TEXTO ---
        const type = Object.keys(m.message)[0];
        const body = (type === 'conversation') ? m.message.conversation : 
                     (type === 'extendedTextMessage') ? m.message.extendedTextMessage.text : 
                     (m.message[type] && m.message[type].caption) ? m.message[type].caption : 
                     (type === 'buttonsResponseMessage') ? m.message.buttonsResponseMessage.selectedButtonId : 
                     (type === 'listResponseMessage') ? m.message.listResponseMessage.singleSelectReply.selectedRowId : '';

        if (!body) return;

        // 3. --- LÓGICA DE PREFIJOS ---
        const allPrefixes = ['#', '!', '.'];
        const usedPrefix = allPrefixes.find(p => body.startsWith(p));
        const visualPrefix = config.prefix || '#';

        let commandName = '';
        let isCmd = false;

        if (usedPrefix) {
            isCmd = true;
            commandName = body.slice(usedPrefix.length).trim().split(/ +/).shift().toLowerCase();
        } else {
            isCmd = false;
            commandName = body.trim().split(/ +/).shift().toLowerCase();
        }

        const args = body.trim().split(/ +/).slice(1);
        const text = args.join(' ');

        // 4. --- VALIDACIÓN DE DUEÑO (ELIMINADO EL LID PROBLEMÁTICO) ---
        const owners = Array.isArray(config.owner) ? config.owner : [config.owner];
        // Comparamos el número limpio del que envía con la lista de dueños
        const isOwner = owners.some(num => senderNumber === num.replace(/\D/g, '')) || sender.includes(conn.user.id.split(':')[0]);

        // 5. --- LOGS ---
        logger(m, conn);

        // 6. --- EJECUCIÓN DEL COMANDO ---
        const cmd = global.commands.get(commandName) || 
                    Array.from(global.commands.values()).find(c => c.alias && c.alias.includes(commandName));

        if (cmd) {
            // Solo ignoramos si NO usó prefijo Y el comando NO es 'noPrefix'
            if (!isCmd && !cmd.noPrefix) return; 

            // Validación de Owner
            if (cmd.isOwner && !isOwner) {
                console.log(chalk.red(`[🚫] Bloqueado isOwner para: ${senderNumber}`));
                return m.reply('❌ Comando reservado para el Desarrollador.');
            }

            if (cmd.isGroup && !chat.endsWith('@g.us')) return m.reply('❌ Solo en grupos.');

            await cmd.run(conn, m, { 
                body, 
                prefix: visualPrefix, 
                command: commandName, 
                args, 
                text, 
                isOwner, 
                config 
            });
        }

    } catch (err) {
        console.error(chalk.red('[ERROR]'), err);
    }
};