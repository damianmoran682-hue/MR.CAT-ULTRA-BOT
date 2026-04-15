/* KAZUMA MISTER BOT - ANTI-LINK SYSTEM */
import fs from 'fs';
import path from 'path';

const databasePath = path.resolve('./jsons/grupos.json');

export default async (conn, m) => {
    if (!m.key.remoteJid.endsWith('@g.us') || m.key.fromMe) return;

    const from = m.key.remoteJid;
    const sender = m.sender || m.key.participant;

    // 1. Verificar si AntiLink está activo en este grupo
    if (!fs.existsSync(databasePath)) return;
    const db = JSON.parse(fs.readFileSync(databasePath, 'utf-8'));
    if (!db[from]?.antilink) return;

    // 2. Extraer texto del mensaje
    const body = m.message?.conversation || m.message?.extendedTextMessage?.text || m.message?.imageMessage?.caption || "";
    
    // Regex que busca protocolos (http) o dominios comunes (.com, .net, etc)
    const linkRegex = /((https?:\/\/|www\.)?[\w-]+\.[\w-]+(?:\.[\w-]+)*(\/[\w\.\-\?\=\&\%\#]*)?)/gi;
    
    if (linkRegex.test(body)) {
        // --- LOGICA DE EXCEPCIONES ---
        
        // A. GitHub Oficial
        if (body.includes('github.com/Dev-FelixOfc/Kazuma-Mr-Bot')) return;
        
        // B. Canal Oficial
        if (body.includes('whatsapp.com/channel/0029Vb6sgWdJkK73qeLU0J0N')) return;

        // C. Link del propio grupo
        const code = await conn.groupInviteCode(from).catch(() => null);
        if (code && body.includes(`chat.whatsapp.com/${code}`)) return;

        // --- ACCIÓN CONTRA INFRACTORES ---
        
        // Ignorar si es Admin
        const groupMetadata = await conn.groupMetadata(from);
        const isAdmin = groupMetadata.participants.find(p => p.id === sender)?.admin;
        if (isAdmin) return;

        // Borrar mensaje
        await conn.sendMessage(from, { delete: m.key });

        // Avisar y Eliminar
        await conn.sendMessage(from, { 
            text: `*❁* \`Anti-Link Detectado\` *❁*\n\nEl usuario *@${sender.split('@')[0]}* ha sido eliminado por enviar enlaces no permitidos.\n\n> ¡Aquí solo se permiten links oficiales!`,
            mentions: [sender]
        });

        await conn.groupParticipantsUpdate(from, [sender], 'remove');
    }
};