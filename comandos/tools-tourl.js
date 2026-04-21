import { config } from '../config.js';
import { uploadToYotsuba } from '../config/UploadFile.js';

const tourlCommand = {
    name: 'tourl',
    alias: ['url', 'imglink', 'subir'],
    category: 'tools',
    isOwner: false,
    noPrefix: true,
    isAdmin: false,
    isGroup: false,

    run: async (conn, m, args, usedPrefix) => {
        const q = m.quoted ? m.quoted : m;
        const mime = (q.msg || q).mimetype || q.mediaType || '';

        if (!mime || !/image|sticker/.test(mime)) {
            return m.reply(`*${config.visuals.emoji2}* \`Aviso\`\n\nResponde a una imagen con el comando *${usedPrefix}tourl* para generar tu enlace.`);
        }

        try {
            const media = await q.download();
            if (!media) throw new Error('No media');

            const link = await uploadToYotsuba(media, mime);
            const tipo = mime.split("/")[1].toUpperCase();

            const textoExito = `*${config.visuals.emoji3}* \`CARGA EXITOSA\` *${config.visuals.emoji3}*\n\n*🚀 Enlace:* upload.yotsuba.giize.com${link}\n*📂 Tipo:* ${tipo}\n\n> *${config.visuals.emoji}* \`Yotsuba Cloud System\``;

            await conn.sendMessage(m.chat, { text: textoExito }, { quoted: m });

        } catch (err) {
            m.reply(`*${config.visuals.emoji2}* Error en la subida.`);
        }
    }
};

export default tourlCommand;
