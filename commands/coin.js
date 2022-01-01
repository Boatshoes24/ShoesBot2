const Discord = require('discord.js');

const coinImgArr = [
    {img: "https://i.imgur.com/9eESZDw.png", value: 'Heads'},
    {img: "https://i.imgur.com/zARry5A.png", value: 'Tails'}
];

module.exports = {
    name: 'coin',
    description: 'flip a coin',
    aliases: ['coinflip'],
    cooldown: 3,
    args: false,
    execute(msg, args) {
        try {
            const coin = coinImgArr[Math.floor(Math.random() * coinImgArr.length)];

            const coinEmbed = new Discord.MessageEmbed()
            .setTitle('Coin Flip')
            .setColor('RANDOM')
            .setDescription(`You rolled ${coin.value}!`)
            .setImage(coin.img)
            .setTimestamp()
            .setFooter({ 
                text:'Powered by ShoesBot', 
                iconURL: 'https://i.imgur.com/DiHfi2e.png' 
            })
            
            msg.channel.send({ embeds: [coinEmbed] });
        } catch(err) {
            console.error(err);
            msg.reply('There was an error with the coin flip. Try again or report this error.');
        }
    }
}