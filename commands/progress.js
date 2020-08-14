const fetch = require('node-fetch');
const url = 'https://raider.io/api/v1/guilds/profile?region=us&realm=area-52&name=Stay%20Mad&fields=raid_progression';
const Discord = require('discord.js');

module.exports = {
    name: 'progress',
    description: 'api fetch of raider.io guild progress',
    aliases: ['guildio', 'guild'],
    cooldown: 10,
    args: false,
    async execute(msg, args) {
       const getData = async url => {
           try {
               const response = await fetch(url);
               const json = await response.json();
               return json;
           } catch (error) {
               console.log(error);
           }
       }
       const data = await getData(url);
       const rp = data.raid_progression;
       const apiEmbed = new Discord.MessageEmbed()
       .setColor('RED')
       .setTitle(`${data.name} Raid Progress`)
       .setDescription(`[**Guild RIO Profile**](${data.profile_url})`)
       .addFields(
           { name: 'Uldir', value: rp.uldir.summary, inline: false },
           { name: 'Battle of Dazaralor', value: rp['battle-of-dazaralor'].summary, inline: false },
           { name: 'Eternal Palace', value: rp['the-eternal-palace'].summary, inline: false },
           { name: 'Nyalotha', value: rp['nyalotha-the-waking-city'].summary, inline: false }
       )
       .setThumbnail('https://i.imgur.com/DiHfi2e.png')
       .setTimestamp()
       .setFooter('Powered by ShoesBot', 'https://i.imgur.com/DiHfi2e.png')

       msg.channel.send(apiEmbed);
    }
}