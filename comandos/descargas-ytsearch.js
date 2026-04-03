const axios = require('axios');
const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'ytsearch',
    description: 'Search for a YouTube video and download it as MP3.',
    async execute(message, args) {
        const text = args.join(' ');
        if (!text) {
            return message.reply('Please provide a search term.');
        }

        try {
            // Search for the YouTube video using the Stellar API
            const response = await axios.get(`https://api.stellarwa.xyz/search/yt?query=${encodeURIComponent(text)}&key=api-Bb1JX`);
            const results = response.data.results;
            
            if (results.length === 0) {
                return message.reply('No results found.');
            }

            // Format the results and show them
            const embed = new MessageEmbed()
                .setColor('#FF0000')
                .setTitle('YouTube Search Results')
                .setDescription('Here are the results:');

            results.forEach(video => {
                embed.addField(video.title, `[Watch Here](${video.url})`, false);
                embed.setThumbnail(video.thumbnail);
            });

            message.channel.send({ embeds: [embed] });
            
            // Now you can implement the MP3 download link according to your requirement
            // This is a placeholder for the actual download command
            // Example: `message.channel.send('Click [here](YOUR_MP3_DOWNLOAD_URL) to download the MP3');`

        } catch (error) {
            console.error(error);
            return message.reply('An error occurred while searching. Please try again later.');
        }
    }
};