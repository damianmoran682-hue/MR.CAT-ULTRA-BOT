import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

const prefixPath = path.resolve('./jsons/prefix.json');

const resetPrefix = {
    name: 'resetprefix',
    alias: ['delprefix', 'rprefix'],
    category: 'owner',
    isOwner: true,
    noPrefix: true,

    run: async (conn, m) => {
        try {
            if (fs.existsSync(prefixPath)) {
                fs.unlinkSync(prefixPath);
                await m.reply(`*${config.visuals.emoji3}* \`CONFIGURACIÓN RESETEADA\`\n\nSe han restaurado todos los prefijos de fábrica correctamente.`);
            } else {
                await m.reply(`*${config.visuals.emoji2}* No hay ningún prefijo personalizado para eliminar.`);
            }
        } catch (e) {
            m.reply(`*${config.visuals.emoji2}* Error al resetear el prefijo.`);
        }
    }
};

export default resetPrefix;