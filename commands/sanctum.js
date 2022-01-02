const Discord = require('discord.js')
const raidJSON = require('./sanctum.json')
const NUM_BOSSES = 10;
const spaceChar = '\u200B'

function formatEmbedArgs(args) {
    let embedFields = [false]
    if (!args.length) {
        embedFields = []
        raidJSON.forEach(item => {
            if (item.category === 'info') {
                embedFields.push({ name: item.name, value: item.value, inline: true })
            }
        })
        if (embedFields.length > 3) {
            let emptyFieldNum = 3 - (embedFields.length % 3)
            for (let i = 0; i < emptyFieldNum; i++) {
                embedFields.push({ name: spaceChar, value: spaceChar, inline: true })
            }
        }
    }
    else if (parseInt(args[0]) !== NaN && parseInt(args[0]) > 0 && parseInt(args[0]) <= NUM_BOSSES) {
        embedFields = []
        raidJSON.forEach(item => {
            if (item.category === 'auras' && item.boss_num === parseInt(args[0])) {
                if (Object.keys(item.value).length === 0) {
                    embedFields.push({ name: item.name, value: 'No Auras', inline: true })
                }
                else {
                    embedFields.push({ name: item.name, value: spaceChar, inline: false})
                    for (let aura in item.value) {
                        embedFields.push({ name: aura, value: `[Wago](${item.value[aura]})`, inline: true })
                    }
                    if (embedFields.length > 3) {
                        let emptyFieldNum = 3 - ((embedFields.length - 1) % 3)
                        for (let i = 0; i < emptyFieldNum; i++) {
                            embedFields.push({ name: spaceChar, value: spaceChar, inline: true })
                        }       
                    }
                }                
            }
        })
    }
    return embedFields
}

function formatDescription(args) {
    let description = 'false'
    if (args[0] === 'all') {
        description = '**All Auras** \n\n'
        raidJSON.forEach(item => {
            if(item.category === 'auras') {
                if (Object.keys(item.value).length > 0) {
                    for (let aura in item.value) {
                        description += `${item.name}: [${aura}](${item.value[aura]})\n`
                    }
                }
            }
        })
    }
    return description
}

module.exports = {
    name: 'sod',
    aliases: ['sanctum'],
    cooldown: 1,
    execute(msg, args) {
        let title = 'Sanctum Auras'       
        
        const sanctumEmbed = new Discord.MessageEmbed()
        .setTitle(title)
        .setThumbnail('https://1401700980.rsc.cdn77.org/data/images/full/98248/world-of-warcraft-sylvanas.jpg')
        .setTimestamp()
        .setFooter({ 
            text:'Powered by ShoesBot', 
            iconURL: 'https://i.imgur.com/DiHfi2e.png' 
        })

        let addEmbeds = formatEmbedArgs(args)
        if (addEmbeds[0] !== false) {
            sanctumEmbed.addFields(addEmbeds)
        }
        let addDescription = formatDescription(args)
        if (addDescription !== 'false') {
            sanctumEmbed.setDescription(addDescription)
        }


        msg.channel.send({ embeds: [sanctumEmbed] })
    }
}