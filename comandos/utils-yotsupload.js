/* KAZUMA MISTER BOT - YOTSUBA UPLOAD (FULL STYLE) 
   Desarrollado por Félix OFC
*/
import fetch from 'node-fetch';
import FormData from 'form-data';

const yotsubaUploadCommand = {
    name: 'upload',
    alias: ['tourl', 'yupload', 'toimg'],
    category: 'utils',
    noPrefix: true,

    run: async (conn, m, args, usedPrefix, commandName) => {
        // 1. DETECCIÓN ULTRA-AGRESIVA (Para que no falle el 'Falta Archivo')
        const quoted = m.quoted ? m.quoted : m;
        
        // Buscamos en todas las propiedades posibles donde Baileys guarda el tipo de archivo
        const mime = (quoted.msg || quoted).mimetype || 
                     (quoted.msg || quoted).mediaType || 
                     (m.msg || m).mimetype || 
                     m.mediaType || '';

        // Si después de buscar en todo eso no hay mime, entonces sí falta
        if (!/image|video|webp|audio/.test(mime)) {
            return m.reply(`*❁* \`Falta Archivo\` *❁*\n\nResponde a una imagen o video corto para convertirlo en enlace.\n\n> Ejemplo: Envía una imagen y pon *${usedPrefix}${commandName}*`);
        }

        try {
            // 2. PRIMER AVISO
            await m.reply(`*✿︎* \`Subiendo Archivo\` *✿︎*\n\nKazuma está enviando el archivo a Yotsuba Cloud. Por favor, espera...\n\n> ⏳ Conectando con tu API privada...`);

            // 3. DESCARGA (Usando el método de Kazuma)
            const media = await quoted.download();
            if (!media) return m.reply('*❁* `Error de Medios` *❁*\n\nNo se pudo descargar el archivo. Intenta de nuevo.');

            // 4. ENVÍO A TU SERVIDOR
            const formData = new FormData();
            formData.append('file', media, { 
                filename: `kazuma_${Date.now()}.${mime.split('/')[1] || 'bin'}`,
                contentType: mime 
            });

            const res = await fetch('https://upload.yotsuba.giize.com/upload', {
                method: 'POST',
                body: formData,
                headers: formData.getHeaders()
            });

            const data = await res.json();
            const finalUrl = data.fileUrl || data.url;

            if (!finalUrl) {
                return m.reply('*❁* `Error de API` *❁*\n\nTu servidor no devolvió un enlace válido.');
            }

            // 5. MENSAJE FINAL (Estilo Félix OFC)
            const successText = `*» (❍ᴥ❍ʋ) \`YOTSUBA CLOUD\` «*
> ꕥ Archivo convertido con éxito.

*✿︎ Enlace:* \`${finalUrl}\`
*✿︎ Tipo:* \`${mime}\`

> ¡Recuerda que este enlace es público, compártelo con cuidado!`;

            await conn.sendMessage(m.chat, { text: successText }, { quoted: m });

        } catch (err) {
            console.error('Error en Yotsuba Upload:', err);
            m.reply(`*❁* \`Error Crítico\` *❁*\n\nOcurrió un error al conectar con tu API.`);
        }
    }
};

export default yotsubaUploadCommand;