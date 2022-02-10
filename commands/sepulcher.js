const Discord = require('discord.js')
const { bosses, num_bosses } = require("./sepulcher.json")
const spaceChar = '\u200B'

function formatEmbedArgs(args) {
    let embedFields = [false]
    let index = 0
    if (args.length) {
        index = parseInt(args[0])
    }
    if (!args.length) {
        embedFields = []
        
        let auraTotalCount = 0
        for(let bossIdx in bosses) {
            let boss = bosses[bossIdx]
            if (Object.keys(boss.value).length > 0) {
                auraTotalCount += Object.keys(boss.value).length
            }
        }
        embedFields.push({ name: 'All Auras', value: `!sofo all\nAuras: ${auraTotalCount}`, inline: false})

        let auraCount = 0
        for (let bossIdx in bosses) {
            let boss = bosses[bossIdx]
            auraCount = Object.keys(boss.value).length
            embedFields.push({ name: boss.name, value: `${boss.command}\nAuras: ${auraCount}`, inline: true })
        }
        if (embedFields.length > 3) {
            let emptyFieldNum = 3 - (embedFields.length % 3)
            for (let i = 0; i < emptyFieldNum; i++) {
                embedFields.push({ name: spaceChar, value: spaceChar, inline: true })
            }
        }
    }
    else if (index !== NaN && index >= 0 && index <= num_bosses) {
        embedFields = []
        for (let bossIdx in bosses) {
            let boss = bosses[bossIdx]
            if (boss.boss_num === index) {
                if (Object.keys(boss.value).length === 0) {
                    embedFields.push({ name: boss.name, value: 'No Auras', inline: false })
                }
                else {
                    embedFields.push({ name: boss.name, value: spaceChar, inline: false })
                    for (let aura in boss.value) {
                        embedFields.push({ name: aura, value: `[Link](${boss.value[aura]})`, inline: true })
                    }
                    if (embedFields.length > 3) {
                        let emptyFieldNum = 3 - ((embedFields.length - 1) % 3)
                        for (let i = 0; i < emptyFieldNum; i++) {
                            embedFields.push({ name: spaceChar, value: spaceChar, inline: true })
                        }       
                    }
                }
            }
        }
    }
    return embedFields
}

function formatDescription(args) {
    let description = 'false'
    if (args[0] === 'all') {
        description = '**All Auras** \n\n'
        for (let bossIdx in bosses) {
            let boss = bosses[bossIdx]
            if (Object.keys(boss.value).length > 0) {
                for (let aura in boss.value) {
                    description += `${boss.name}: [${aura}](${boss.value[aura]}) \n`
                }
            }
        }
    }
    return description
}

module.exports = {
    name: 'sofo',
    aliases: ['sepulcher'],
    cooldown: 1,
    execute(msg, args) {
        let title = 'Sepulcher Auras'       
        
        const sepulcherEmbed = new Discord.MessageEmbed()
        .setTitle(title)
        .setThumbnail('https://www.gamespot.com/a/uploads/original/1647/16470614/3906257-worldofwarcraft_shadowlandsfinalpatchwillputanendtothejailer%27splans.jpg')
        .setTimestamp()
        .setFooter({ 
            text:'Powered by ShoesBot', 
            iconURL: 'https://i.imgur.com/DiHfi2e.png'
        })

        let addEmbeds = formatEmbedArgs(args)
        if (addEmbeds[0] !== false) {
            sepulcherEmbed.addFields(addEmbeds)
        }
        let addDescription = formatDescription(args)
        if (addDescription !== 'false') {
            sepulcherEmbed.setDescription(addDescription)
        }


        msg.channel.send({ embeds: [sepulcherEmbed] })
    }
}