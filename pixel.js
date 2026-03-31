/* KURAYAMI TEAM - PIXEL HANDLER ENGINE 
   Lógica: Identidad Dual (JID/LID) + Triple Prefix + No-Prefix
*/

import chalk from 'chalk';
import { logger } from './config/print.js';

export const pixelHandler = async (conn, m, config) => {
    try {
        if (!m || !m.message) return;
        const chat = m.key.remoteJid;
        if (chat === 'status@broadcast') return;

        // 1. --- IDENTIDAD EN CONTEXTO (JID O LID) ---
        // Capturamos el remitente tal cual lo entrega Baileys en este evento
        const sender = m.sender || m.key.participant || m.key.remoteJid;

        // 2. --- EXTRACCIÓN DE BODY (TODOS LOS TIPOS) ---
        const type = Object.keys(m.message)[0];
        const body = (type === 'conversation') ? m.message.conversation : 
                     (type === 'extendedTextMessage') ? m.message.extendedTextMessage.text : 
                     (m.message[type] && m.message[type].caption) ? m.message[type].caption : 
                     (type === 'buttonsResponseMessage') ? m.message.buttonsResponseMessage.selectedButtonId : 
                     (type === 'listResponseMessage') ? m.message.listResponseMessage.singleSelectReply.selectedRowId : '';

        if (!body) return;

        // 3. --- LÓGICA DE PREFIJOS (ALL-PREFIX + NO-PREFIX) ---
        const allPrefixes = config.allPrefixes || ['#', '!', '.'];
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

        // 4. --- VALIDACIÓN DE DUEÑO (SÍ O SÍ) ---
        const owners = Array.isArray(config.owner) ? config.owner : [config.owner];
        // Comparamos el sender directo con la lista de identidades del config
        const isOwner = owners.includes(sender);
        const isGroup = chat ? chat.endsWith('@g.us') : false;

        // 5. --- LOGGER ---
        logger(m, conn);

        // 6. --- EJECUCIÓN ---
        const cmd = global.commands.get(commandName) || 
                    Array.from(global.commands.values()).find(c => c.alias && c.alias.includes(commandName));

        if (cmd) {
            // Regla No-Prefix: Si no hay prefijo, solo pasa si el comando lo permite
            if (!isCmd && !cmd.noPrefix) return; 

            // Validación de Poder
            if (cmd.isOwner && !isOwner) {
                console.log(chalk.red(`[🚫] Acceso Owner Denegado para: ${sender}`));
                return m.reply('❌ Comando exclusivo del Desarrollador.');
            }

            if (cmd.isGroup && !isGroup) return m.reply('❌ Este comando solo funciona en grupos.');

            await cmd.run(conn, m, { 
                body, 
                prefix: visualPrefix, // El prefijo que saldrá en los textos (${prefix})
                command: commandName, 
                args, 
                text, 
                isOwner, 
                isGroup, 
                config 
            });
        }

    } catch (err) {
        console.error(chalk.red.bold('[ERROR EN HANDLER]'), err);
    }
};