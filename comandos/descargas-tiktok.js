/* KAZUMA MISTER BOT - TIKTOK LINK DOWNLOADER
   Desarrollado por Félix OFC
*/
import fetch from 'node-fetch';

const tiktokLinkCommand = {
    name: 'ttlink',
    alias: ['dltt', 'tiktokdl'],
    category: 'download',
    noPrefix: true,

    run: async (conn, m, args, usedPrefix, commandName) => {
        let text = args.join(' ');
        if (!text) return m.reply(`*❁* \`Falta el enlace\` *❁*\n\nIngresa un enlace de TikTok para descargar.\n\n> Ejemplo: *${usedPrefix}${commandName} https://vt.tiktok.com/xxxx/*`);

        const apiKey = "NEX-0868C926ADF94B19A51E18C4";
        
        try {
            await m.reply(`*✿︎* \`Descargando Video\` *✿︎*\n\nKazuma está preparando tu video, espera un momento...`);

            // --- LLAMADA A LA API DE DESCARGA VÍA LINK ---
            const apiUrl = `https://nex-magical.vercel.app/download/tiktok?url=${encodeURIComponent(text)}&apikey=${apiKey}`;
            const res = await fetch(apiUrl);
            const data = await res.json();

            if (!data.status || !data.result || !data.result.data) {
                return m.reply('*❁* \`Error\` *❁*\n\nNo pude procesar este enlace. Asegúrate de que el video sea público.');
            }

            const video = data.result.data;
            
            // Texto informativo limpio
            const infoText = `*» (❍ᴥ❍ʋ) \`TIKTOK DOWNLOAD\` «*
            
*✿︎ Usuario:* \`${video.author.nickname}\`
*✿︎ Descripción:* \`${video.title || 'Sin descripción'}\`

> Enviando archivo MP4...`;

            // 1. Enviar la portada con la info
            await conn.sendMessage(m.key.remoteJid, { 
                image: { url: video.cover }, 
                caption: infoText 
            }, { quoted: m });

            // 2. Enviar el video MP4
            const videoUrl = video.hdplay || video.play;

            await conn.sendMessage(m.key.remoteJid, { 
                video: { url: videoUrl }, 
                caption: `*✿︎* \`${video.title || 'TikTok Video'}\`\n\n> By Kazuma-Mr-Bot`,
                mimetype: 'video/mp4',
                fileName: `tiktok_${video.id}.mp4`
            }, { quoted: m });

        } catch (err) {
            console.error('Error TikTok Link:', err);
            m.reply('*❁* \`Fallo\` *❁*\n\nOcurrió un error inesperado al descargar el contenido.');
        }
    }
};

export default tiktokLinkCommand;