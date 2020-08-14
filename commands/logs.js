const Discord = require('discord.js');

module.exports = {
    name: 'logs',
    aliases: ['wcl'],
    args: false,
    cooldown: 10,
    execute(msg, args) {
        
        const logsEmbed = new Discord.MessageEmbed()
        .setTitle("Guild Logs")
        .setImage("https://i.imgur.com/A7jWgJi.png")
        .setURL("https://www.warcraftlogs.com/guild/calendar/367786/")
        .setColor('RED')
        .setTimestamp()
        .setFooter('Powered by ShoesBot', 'https://i.imgur.com/DiHfi2e.png')

        msg.channel.send(logsEmbed);
    }
}