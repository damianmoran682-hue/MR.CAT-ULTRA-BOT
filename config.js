import fs from 'fs';
import path from 'path';

export const config = {
    botName: 'CAT ULTRA',
    owner: [
        '542644156919@s.whatsapp.net', 
        '125860308893859@lid'
    ], 
    prefix: '.',
    allPrefixes: ['#', '!', '.'],

    getBotType: (conn) => {
        const userNumber = conn.user.id.split(':')[0];
        const subBotPath = path.resolve(`./sesiones_subbots/${userNumber}`);
        return fs.existsSync(subBotPath) ? '*Sub-Bot*' : '*Mood*';
    },

    visuals: {
        line: '━',
        color: 'magenta',
        emoji: '🧸',
        emoji2: '🥪',
        emoji3: '🌐',
        emoji4: '⭐',
        img1: 'https://upload.yotsuba.giize.com/u/_2GqN3eD.jpeg'
    },

    apiNex: 'NEX-0868C926ADF94B19A51E18C4'
};
