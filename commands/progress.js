const Discord = require('discord.js');
const axios = require('axios');
const url = 'https://raider.io/api/v1/guilds/profile?region=us&realm=area-52&name=Stay%20Mad&fields=raid_progression';

function styleString(string) {
    let returnStr = ''
    let words = string.split('-')
    words.forEach(word => {
        returnStr += `${word[0].toUpperCase()}${word.substr(1)} `
    })
    return returnStr
}

function getRIOProgress () {
    try {
        const promise = axios.get(url)
        const promiseData = promise.then((response) => response.data)
        return promiseData
    } catch(err) {
        console.error(err)
    }
}

module.exports = {
    name: 'progress',
    description: 'api fetch of raider.io guild progress',
    aliases: ['guildio', 'guild'],
    cooldown: 10,
    args: false,
    async execute(msg, args) {        
        const data = await getRIOProgress(url);
        let embedFields = []
        for(const raid in data.raid_progression) {
            embedFields.push({name: styleString(raid), value: data.raid_progression[raid].summary, inline: false})
        }
        const apiEmbed = new Discord.MessageEmbed()
        .setColor('RED')
        .setTitle(`${data.name} Raid Progress`)
        .setDescription(`[**Guild RIO Profile**](${data.profile_url})`)
        .addFields(embedFields)
        .setThumbnail('https://i.imgur.com/DiHfi2e.png')
        .setTimestamp()
        .setFooter({ 
            text:'Powered by ShoesBot', 
            iconURL: 'https://i.imgur.com/DiHfi2e.png' 
        })

       msg.channel.send({ embeds: [apiEmbed] });
    }
}