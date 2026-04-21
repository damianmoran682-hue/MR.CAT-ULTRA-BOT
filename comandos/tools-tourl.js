import { config } from '../config.js';
import { uploadToYotsuba } from '../config/UploadFile.js';

function formatBytes(bytes) {
    if (bytes === 0) return "0 B";
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / 1024 ** i).toFixed(2)} ${sizes[i]}`;
}

const tourlCommand = {
    name: 'tourl',
    alias: ['url', 'imglink', 'subir'],
    category: 'tools',
    isOwner: false,
    noPrefix: true,
    isAdmin: false,
    isGroup: false,

    run: async (conn, m, args, usedPrefix) => {
        const from = m.key.remoteJid;
        
        const q = m.quoted ? m.quoted : m;
        const mime = (q.msg || q).mimetype || q.mediaType || '';

        if (!mime || !/image|video|sticker|audio/.test(mime)) {
            return m.reply(`*❁* \`Sin Multimedia\` *❁*\n\nNo detecto ninguna imagen o archivo.\n\n*✿︎* Responde a una imagen, sticker o video.\n*✿︎* O envía uno con el comando *${usedPrefix}tourl*`);
        }

        try {
            await m.reply('*✿︎* \`Procesando Multimedia...\` *✿︎*\n\n> Generando enlace en Yotsuba Cloud.');

            const media = await q.download();
            if (!media) throw new Error('No se pudo descargar el medio.');

            const link = await uploadToYotsuba(media, mime);
            const peso = formatBytes(media.length);
            const tipo = mime.split("/")[1].toUpperCase();

            const textoExito = `*✿︎* \`Carga Exitosa\` *✿︎*\n\n*🚀 Enlace:* ${link}\n*⚖️ Peso:* ${peso}\n*📂 Tipo:* ${tipo}\n\n> Enlace generado para tu archivo multimedia.`;

            await conn.sendMessage(from, { 
                text: textoExito,
                contextInfo: {
                    externalAdReply: {
                        title: 'KAZUMA - TOURURL SERVICE',
                        body: `Archivo ${tipo} subido con éxito`,
                        thumbnailUrl: 'https://files.catbox.moe/9ssbf9.jpg', 
                        sourceUrl: link,
                        mediaType: 1,
                        renderLargerThumbnail: false,
                        showAdAttribution: false
                    }
                }
            }, { quoted: m });

        } catch (err) {
            m.reply('*❁* \`Error en Servidor\` *❁*\n\nNo se pudo procesar la subida.');
        }
    }
};

export default tourlCommand;