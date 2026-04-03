/* Código creado por Félix Ofc 
por favor y no quites los créditos.
https://github.com/Dev-FelixOfc 
*/

import { config } from '../config.js';
import fetch from 'node-fetch';

const ytVideoCommand = {
    name: 'ytmp4',
    alias: ['play', 'ytvideo', 'video', 'v'],
    category: 'downloads',
    isOwner: false,
    noPrefix: true,
    isAdmin: false,
    isGroup: false,

    run: async (conn, m, { text, command }) => {
        const from = m.key.remoteJid;
        const e1 = config.visuals.emoji;
        const apiKey = "api-Bb1JX"; 

        // 1. AVISO: FALTA ENLACE (Con miniatura pequeña)
        if (!text) {
            return await conn.sendMessage(from, { 
                text: `*${e1} Ingresa un enlace de Youtube.*`,
                contextInfo: {
                    externalAdReply: {
                        title: 'KAZUMA - AVISO',
                        body: 'Falta el enlace de video',
                        thumbnailUrl: config.visuals.img1, 
                        sourceUrl: 'https://panel.kurayamihost.ooguy.com',
                        mediaType: 1,
                        renderLargerThumbnail: false,
                        showAdAttribution: false
                    }
                }
            }, { quoted: m });
        }

        try {
            // 2. AVISO: BUSCANDO (Con miniatura pequeña)
            await conn.sendMessage(from, { 
                text: `*${config.visuals.emoji2} Buscando resultados...*`,
                contextInfo: {
                    externalAdReply: {
                        title: 'KAZUMA - STATUS',
                        body: 'Procesando solicitud...',
                        thumbnailUrl: config.visuals.img1,
                        mediaType: 1,
                        renderLargerThumbnail: false,
                        showAdAttribution: false
                    }
                }
            }, { quoted: m });

            // Solicitud a la API Stellarwa
            const apiUrl = `https://api.stellarwa.xyz/dl/ytmp4v2?url=${encodeURIComponent(text)}&key=${apiKey}`;
            const res = await fetch(apiUrl);
            const json = await res.json();

            if (!json.status || !json.data || !json.data.dl) {
                // AVISO: ERROR API (Con miniatura pequeña)
                return await conn.sendMessage(from, { 
                    text: `*${e1} Error:* No se pudo obtener el enlace de descarga.`,
                    contextInfo: {
                        externalAdReply: {
                            title: 'KAZUMA - ERROR',
                            body: 'API Error / Link inválido',
                            thumbnailUrl: config.visuals.img1,
                            mediaType: 1,
                            renderLargerThumbnail: false
                        }
                    }
                }, { quoted: m });
            }

            const { title, uploader, views, size, duration, dl } = json.data;

            // 3. ENVÍO DEL VIDEO (Directo, SIN miniatura de contexto)
            await conn.sendMessage(from, { 
                video: { url: dl }, 
                caption: `*${e1} TÍTULO:* ${title}\n*👤 CANAL:* ${uploader}\n*👁️ VISTAS:* ${views}\n*⌛ DURACIÓN:* ${duration}\n*📦 PESO:* ${size}\n\n> Kazuma-Bot | Félix Ofc`,
                fileName: `${title}.mp4`,
                mimetype: 'video/mp4'
            }, { quoted: m });

        } catch (error) {
            console.error('Error en descargas-ytvideo:', error);
            m.reply(`*${e1} Error:* Hubo un fallo crítico en el sistema de descargas.`);
        }
    }
};

export default ytVideoCommand;
