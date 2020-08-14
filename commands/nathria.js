const Discord = require('discord.js');
const nathriaLinks = require('./nathriaWA.json');
const nathriaGuides = require('./nathriaGuides.json');

const packHeader = '**__WA - Packs__**';
const soloHeader = '**__WA - Individual__**';
const guideHeader = '**__Guides__**';
let packDescription = ' ';
let soloDescription = ' ';
let guideDescription = ' ';

nathriaLinks.forEach(item => {
    if (item.category === 'pack')
        packDescription += `${item.name} - [${item.urlMask}](${item.url})\n`;
    if (item.category === 'solo')
        soloDescription += `${item.name} - [${item.urlMask}](${item.url})\n`;
})

nathriaGuides.forEach(item => {
    guideDescription += `${item.name} - [Text](${item.textGuide}) \u2022 [Video Soon](${item.videoGuide})\n`
})

let description = `${packHeader}\n${packDescription}\n${soloHeader}\n${soloDescription}\n${guideHeader}\n${guideDescription}`;

module.exports = {
    name: 'nathria',
    args: false,
    cooldown: 10,
    execute(msg, args) {

        const nathriaEmbed = new Discord.MessageEmbed()
        .setTitle("Castle Nathria Info")
        .setThumbnail('https://gamepedia.cursecdn.com/wowpedia/3/30/Denathrius.jpg')
        .setDescription(description)
        .setColor('RED')
        .setTimestamp()
        .setFooter('Powered by ShoesBot', 'https://i.imgur.com/DiHfi2e.png')

        msg.channel.send(nathriaEmbed)
    }
}

