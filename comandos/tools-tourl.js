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
        const from = m.key.remoteJid;

        const quoted = m.quoted ? m.quoted : m;
        const mime = (quoted.msg || quoted).mimetype || '';

        if (!/image/.test(mime)) {
            return m.reply(`*❁* \`Error de Uso\` *❁*\n\nResponde a una imagen o envía una con el comando *${usedPrefix}tourl* para convertirla en enlace.`);
        }

        try {
            await m.reply('*✿︎* \`Procesando...\` *✿︎*\n\n> Subiendo imagen a Yotsuba Cloud.');

            const media = await quoted.download();

            const link = await uploadToYotsuba(media);

            const textoExito = `*✿︎* \`Carga Exitosa\` *✿︎*\n\n*🚀 Enlace:* ${link}\n\n> Tu imagen ahora es pública y permanente en Yotsuba.`;

            await conn.sendMessage(from, { 
                text: textoExito,
                contextInfo: {
                    externalAdReply: {
                        title: 'YOTSUBA - CLOUD STORAGE',
                        body: 'Enlace generado con éxito',
                        thumbnailUrl: 'https://files.catbox.moe/9ssbf9.jpg', 
                        sourceUrl: 'https://upload.yotsuba.giize.com',
                        mediaType: 1,
                        renderLargerThumbnail: false,
                        showAdAttribution: false
                    }
                }
            }, { quoted: m });

        } catch (err) {
            console.error('Error en comando tourl:', err);
            m.reply('*❁* \`Error Crítico\` *❁*\n\nHubo un fallo al intentar conectar con el servidor de Yotsuba.');
        }
    }
};

export default tourlCommand;