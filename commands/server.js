const Discord = require('discord.js');

module.exports = {
    name: 'server',
    description: 'returns server info',
    execute(msg, args) {

        const serverEmbed = new Discord.MessageEmbed()
        
        .setTitle(`${msg.guild.name}`)
        .setThumbnail('https://i.imgur.com/DiHfi2e.png')
        .setDescription(`Users: ${msg.guild.memberCount}`)
        .setTimestamp()
        .setFooter('Powered by ShoesBot', 'https://i.imgur.com/DiHfi2e.png')

        msg.channel.send(serverEmbed)
    },
}