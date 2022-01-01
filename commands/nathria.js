const Discord = require('discord.js');
const nathriaLinks = require('./nathriaWA.json');
const nathriaGuides = require('./nathriaGuides.json');

const packHeader = '**__WA - Packs__**';
const soloHeader = '**__WA - Individual__**';
const guideHeader = '**__Guides__**\nGuides will be updated as available. Let me know if you find better links.';
let packDescription = ' ';
let soloDescription = ' ';

nathriaLinks.forEach(item => {
    if (item.category === 'pack')
        packDescription += `${item.name} - [${item.urlMask}](${item.url})\n`;
    if (item.category === 'solo')
        soloDescription += `${item.name} - [${item.urlMask}](${item.url})\n`;
})

let description = `${packHeader}\n${packDescription}\n${soloHeader}\n${soloDescription}\n${guideHeader}\n`;

const guideFields = [];
nathriaGuides.forEach(item => {
    guideFields.push({ name: item.name, value: `[Text](${item.textGuide}) \u2022 [Heroic](${item.heroicVideo}) \u2022 [Mythic](${item.mythicVideo})`, inline: false})
})

module.exports = {
    name: 'nathria',
    args: false,
    cooldown: 10,
    execute(msg, args) {

        const nathriaEmbed = new Discord.MessageEmbed()
        .setTitle("Castle Nathria Info")
        .setThumbnail('https://gamepedia.cursecdn.com/wowpedia/3/30/Denathrius.jpg')
        .setDescription(description)
        .addFields(guideFields)
        .setColor('RED')
        .setTimestamp()
        .setFooter({ 
            text:'Powered by ShoesBot', 
            iconURL: 'https://i.imgur.com/DiHfi2e.png' 
        })

        msg.channel.send({ embeds: [nathriaEmbed] })
    }
}

