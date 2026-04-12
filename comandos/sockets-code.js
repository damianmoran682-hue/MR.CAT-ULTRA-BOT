import { startSubBot } from '../sockets/index.js';
import { config } from '../config.js';

const cooldowns = new Map();

const codeCommand = {
    name: 'code',
    alias: ['subbot', 'serbot'],
    category: 'sockets',
    isOwner: false,
    noPrefix: true,
    isAdmin: false,
    isGroup: false,

    run: async (conn, m, { prefix, args }) => {
        const from = m.key.remoteJid;

        // Esto evita el error "reading '0'" de tu captura
        if (!args || !args[0]) {
            return await conn.sendMessage(from, { 
                text: `⚠️ *Número faltante*\n\nUso: *${prefix}code 1849XXXXXXX*` 
            }, { quoted: m });
        }

        let targetNumber = args[0].replace(/[^0-9]/g, '');

        const now = Date.now();
        if (cooldowns.has(from) && (now < cooldowns.get(from) + 60000)) return;

        try {
            const msgEspera = await conn.sendMessage(from, { 
                text: `⏳ *Iniciando vinculación para:* \`${targetNumber}\`...\n\n> Esperando respuesta del servidor de WhatsApp...`,
            }, { quoted: m });

            const jidReal = `${targetNumber}@s.whatsapp.net`;
            const sock = await startSubBot(jidReal, conn);

            // MENSAJE DE ÉXITO AL VINCULAR
            sock.ev.on('connection.update', async (update) => {
                const { connection } = update;
                if (connection === 'open') {
                    await conn.sendMessage(from, { 
                        text: `*[❁]* Vinculaste un socket con éxito.\n*@${targetNumber}*\n> ¡Disfruta de la conexión con el bot!` 
                    });
                }
            });

            await new Promise(resolve => setTimeout(resolve, 3000));

            let code = await sock.requestPairingCode(targetNumber);
            if (!code) throw new Error("No se pudo generar el código");

            code = code?.match(/.{1,4}/g)?.join('-') || code;

            const msgInstrucciones = await conn.sendMessage(from, { 
                text: `✿︎ \`Vinculación del socket\` ✿︎\n\n*❁* \`Pasos a seguir:\` \nDispositivos vinculados > vincular nuevo dispositivo > Vincular con número de teléfono > ingresa el código.`,
                contextInfo: {
                    externalAdReply: {
                        title: 'KAZUMA - CÓDIGO GENERADO',
                        body: `Número: ${targetNumber}`,
                        thumbnailUrl: 'https://files.catbox.moe/9ssbf9.jpg',
                        mediaType: 1,
                        renderLargerThumbnail: false
                    }
                }
            });

            const msgCodigo = await conn.sendMessage(from, { text: code }, { quoted: msgInstrucciones });
            await conn.sendMessage(from, { delete: msgEspera.key });

            cooldowns.set(from, now);

            setTimeout(async () => {
                try {
                    await conn.sendMessage(from, { delete: msgInstrucciones.key });
                    await conn.sendMessage(from, { delete: msgCodigo.key });
                } catch (e) {}
            }, 60000);

        } catch (err) {
            console.error('Error al generar sub-bot:', err);
            await conn.sendMessage(from, { 
                text: `❌ *Error de Vinculación*\n\nWhatsApp rechazó la solicitud para el número *${targetNumber}*.` 
            });
        }
    }
};

export default codeCommand;