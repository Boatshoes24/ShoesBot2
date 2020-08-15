const Discord = require('discord.js');

const responses = [
    "It is certain.", "It is decidedly so.", "Without a doubt.", "Yes-definitely.", "You may rely on it.",
    "As I see it, yes.", "Most likely.", "Outlook good.", "Yes.", "Signs point to yes.",
    "Reply hazy, try again.", "Ask again later.", "Better not tell you now.", "Cannot predict now.",
    "Concentrate and ask again.", "Don't count on it.", "My reply is no.", "My sources say no.", "Outlook not so good.",
    "Very doubtful."
];

module.exports = {
    name: '8ball',
    description: 'Ask the 8ball anything',
    usage: '<question>',
    args: true,
    cooldown: 3,
    execute(msg, args) {
        try {
            let rand = Math.floor(Math.random() * responses.length);
            let response = responses[rand];

            const eightBallEmbed = new Discord.MessageEmbed()
            .setTitle('Magic 8-Ball')
            .setDescription('\u200B')
            .addField('Your question:', `${args.join(' ')}`, false)
            .addField('8-Ball response:', `${response}`, false)
            .setThumbnail('https://cdn.webshopapp.com/shops/38765/files/240458996/geeek-mystic-magic-8-ball-future-prediction-ball.jpg')
            .setColor('BLUE')
            .setTimestamp()
            .setFooter('Powered by ShoesBot', 'https://i.imgur.com/DiHfi2e.png')

            msg.channel.send(eightBallEmbed);
        } catch(err) {
            console.error(err);
            msg.reply('There was an error with your 8ball question. Please try again or use !help so I can DM you with the command usage.')
        }
    }
}