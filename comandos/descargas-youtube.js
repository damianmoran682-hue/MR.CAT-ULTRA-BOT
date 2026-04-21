import fetch from 'node-fetch';

const youtubeCommand = {
    name: 'play',
    alias: ['playvideo', 'playaudio', 'ytv', 'yta', 'ytsearch', 'yts'],
    category: 'download',
    noPrefix: true,

    run: async (conn, m, args, usedPrefix, commandName) => {
        let text = args.join(' ');
        if (!text) return m.reply(`*❁* \`Falta Texto o Enlace\` *❁*\n\nIngresa un nombre o un enlace de YouTube.\n\n> Ejemplo: *${usedPrefix}${commandName} RDJavi*`);

        const apiKey = "NEX-0868C926ADF94B19A51E18C4";
        const isUrl = text.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_-]{11}/);

        if (!isUrl || commandName === 'ytsearch' || commandName === 'yts') {
            try {
                await m.reply(`*✿︎* \`Buscando en YouTube\` *✿︎*\n\nKazuma está localizando el mejor resultado para: *${text}*...\n\n> ⏳ Consultando API de búsqueda...`);

                const searchUrl = `https://nex-magical.vercel.app/search/youtube?q=${encodeURIComponent(text)}&apikey=${apiKey}`;
                const resSearch = await fetch(searchUrl);
                const dataSearch = await resSearch.json();

                if (!dataSearch.status || !dataSearch.result || dataSearch.result.length === 0) {
                    return m.reply('*❁* `Sin Resultados` *❁*\n\nNo se encontró nada para esa búsqueda.');
                }

                if (commandName === 'ytsearch' || commandName === 'yts') {
                    let searchMsg = `*» (❍ᴥ❍ʋ) \`Youtube\` «*\n\n`;
                    dataSearch.result.slice(0, 10).forEach((vid, i) => {
                        searchMsg += `*${i + 1}.* \`${vid.title}\`\n*✿︎ Link:* ${vid.link}\n\n`;
                    });
                    return await conn.sendMessage(m.key.remoteJid, { image: { url: dataSearch.result[0].imageUrl }, caption: searchMsg }, { quoted: m });
                }

                text = dataSearch.result[0].link;

            } catch (err) {
                console.error('Error en Búsqueda:', err);
                return m.reply('*❁* `Error de Búsqueda` *❁*');
            }
        }

        const isVideo = ['playvideo', 'ytv'].includes(commandName);
        const type = isVideo ? 'Video' : 'Audio';
        const apiUrl = `https://nex-magical.vercel.app/download/${type.toLowerCase()}?url=${encodeURIComponent(text)}&apikey=${apiKey}`;

        try {
            await m.reply(`*✿︎* \`Procesando ${type}\` *✿︎*\n\nExtrayendo contenido del enlace encontrado...\n\n> ⏳ Preparando archivo final...`);

            const res = await fetch(apiUrl);
            const data = await res.json();

            if (!data.status || !data.result.url) {
                return m.reply('*❁* `Error de Descarga` *❁*\n\nNo se pudo obtener el archivo de este enlace.');
            }

            const downloadUrl = data.result.url;
            const thumb = data.result.info.thumbnail;

            const infoText = `*» (❍ᴥ❍ʋ) \`YOUTUBE ${type.toUpperCase()}\` «*\n> ꕥ Contenido obtenido con éxito.\n\n*✿︎ Título:* \`${data.result.info.title || 'YouTube Content'}\`\n*✿︎ Calidad:* \`${data.result.quality}\`\n\n> Enviando archivo, espera un momento...`;

            await conn.sendMessage(m.key.remoteJid, { image: { url: thumb }, caption: infoText }, { quoted: m });

            if (isVideo) {
                await conn.sendMessage(m.key.remoteJid, { 
                    video: { url: downloadUrl }, 
                    caption: `*✿︎ Video:* \`${data.result.videoId}\`\n> Descargado por Kazuma Mister Bot`,
                    mimetype: 'video/mp4',
                    fileName: `${data.result.videoId}.mp4`
                }, { quoted: m });
            } else {
                await conn.sendMessage(m.key.remoteJid, { 
                    audio: { url: downloadUrl }, 
                    mimetype: 'audio/mpeg',
                    fileName: `${data.result.videoId}.mp3`
                }, { quoted: m });
            }

        } catch (err) {
            console.error('Error en Descarga Final:', err);
            m.reply('*❁* `Error Crítico` *❁*');
        }
    }
};

export default youtubeCommand;
