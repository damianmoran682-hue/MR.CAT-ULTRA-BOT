import { config } from './config.js';
import chalk from 'chalk';

export const pixelHandler = async (conn, m, conf) => {
    try {
        const type = Object.keys(m.message)[0];
        const body = (type === 'conversation') ? m.message.conversation : 
                     (type === 'extendedTextMessage') ? m.message.extendedTextMessage.text : 
                     (type === 'imageMessage' || type === 'videoMessage') ? m.message.imageMessage.caption : '';

        if (!body || !body.trim()) return;

        const from = m.key.remoteJid;
        const isGroup = from.endsWith('@g.us');
        
        // --- SOLUCIÓN ANTI-LID ---
        // Intentamos obtener el número real. m.key.participant es donde suele venir el LID en grupos.
        const sender = isGroup ? m.key.participant : from;
        
        // Limpiamos el sender: quitamos @s.whatsapp.net o @lid para tener solo los números
        const senderNumber = sender.replace(/[^0-9]/g, '');

        // Comparamos con los números en config.owner
        const isOwner = config.owner.some(num => num.replace(/[^0-9]/g, '') === senderNumber);

        // Filtro: En privado solo responde al Owner
        if (!isGroup && !isOwner) return; 

        const prefix = config.prefix;
        const text = body.trim();
        const isCmd = text.startsWith(prefix);
        
        const commandText = isCmd 
            ? text.slice(prefix.length).trim().split(/ +/)[0].toLowerCase() 
            : text.split(/ +/)[0].toLowerCase();
        
        const args = text.trim().split(/ +/).slice(1);

        const cmd = global.commands.get(commandText) || 
                    Array.from(global.commands.values()).find(c => c.alias && c.alias.includes(commandText));
        
        if (!cmd) return;

        let groupMetadata, participants, isAdmin = false;
        if (isGroup) {
            groupMetadata = await conn.groupMetadata(from);
            participants = groupMetadata.participants;
            // Aquí también limpiamos los IDs de los admins para comparar con el LID del sender
            isAdmin = participants.filter(v => v.admin !== null).map(v => v.id.replace(/[^0-9]/g, '')).includes(senderNumber);
        }

        // VALIDACIÓN DE OWNER
        if (cmd.isOwner && !isOwner) {
            console.log(chalk.red(`[INTENTO NO AUTORIZADO]: El número ${senderNumber} intentó usar ${commandText}`));
            return await conn.sendMessage(from, { text: '⚠️ *Acceso Denegado:* Este comando es exclusivo de mi desarrollador.' }, { quoted: m });
        }
        
        if (cmd.isGroup && !isGroup) return;
        
        if (cmd.isAdmin && !isAdmin && isGroup) {
            return await conn.sendMessage(from, { text: '❌ *Solo Admins.*' }, { quoted: m });
        }

        await cmd.run(conn, m, {
            args,
            prefix,
            command: commandText,
            isOwner,
            isAdmin,
            isGroup,
            senderNumber, // Enviamos el número limpio por si el comando lo necesita
            participants,
            groupMetadata
        });

    } catch (err) {
        console.error(chalk.red('[ERROR PIXEL-HANDLER]:'), err);
    }
};