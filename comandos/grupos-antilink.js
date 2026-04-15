/* KAZUMA MISTER BOT - ANTI-LINK (SOCIAL UPDATED) */
import fs from 'fs';
import path from 'path';

const databasePath = path.resolve('./jsons/grupos.json');

const antiLinkHandler = async (conn, m) => {
    if (!m.key.remoteJid.endsWith('@g.us') || m.key.fromMe) return;

    const from = m.key.remoteJid;
    const sender = m.sender || m.key.participant;

    if (!fs.existsSync(databasePath)) return;
    const db = JSON.parse(fs.readFileSync(databasePath, 'utf-8'));
    if (!db[from]?.antilink) return;

    const body = m.message?.conversation || 
                 m.message?.extendedTextMessage?.text || 
                 m.message?.imageMessage?.caption || 
                 m.message?.videoMessage?.caption || "";
    
    const linkRegex = /((https?:\/\/|www\.)?[\w-]+\.[\w-]+(?:\.[\w-]+)*(\/[\w\.\-\?\=\&\%\#]*)?)/gi;
    
    if (linkRegex.test(body)) {
        // --- LISTA BLANCA DE REDES SOCIALES ---
        const socialWhites = [
            'youtube.com', 'youtu.be', 'tiktok.com', 'facebook.com', 'fb.watch', 
            'instagram.com', 'ig.me', 'twitter.com', 'x.com', 'threads.net'
        ];
        
        // Si el link contiene alguna de estas redes, NO HACER NADA
        const isSocialLink = socialWhites.some(site => body.toLowerCase().includes(site));
        if (isSocialLink) return;

        // Excepciones de Kazuma
        if (body.includes('github.com/Dev-FelixOfc/Kazuma-Mr-Bot')) return;
        if (body.includes('whatsapp.com/channel/0029Vb6sgWdJkK73qeLU0J0N')) return;
        const code = await conn.groupInviteCode(from).catch(() => null);
        if (code && body.includes(`chat.whatsapp.com/${code}`)) return;

        // Verificar Admin
        const groupMetadata = await conn.groupMetadata(from);
        const isAdmin = groupMetadata.participants.find(p => p.id === sender)?.admin;
        if (isAdmin) return;

        // ACCIÓN: Borrar y Expulsar
        await conn.sendMessage(from, { delete: m.key });
        await conn.sendMessage(from, { 
            text: `*❁* \`Anti-Link Detectado\` *❁*\n\nEl usuario *@${sender.split('@')[0]}* ha sido eliminado por enviar enlaces prohibidos.\n\n> Se permiten links de: *YT, TikTok, IG, FB.*`,
            mentions: [sender]
        });
        await conn.groupParticipantsUpdate(from, [sender], 'remove');
    }
};

export default antiLinkHandler;