const Discord = require('discord.js');
const axios = require('axios');
const RIO_URL = 'https://raider.io/api/v1/characters/profile?region=us';

function formatServer(serverName) {
    serverName = serverName.replace(/\s+/g, '-').replace(/'/g, "").toLowerCase();
    return serverName;
}

function ConvertTime(timeMS) {
    try {
        const total_seconds = parseInt(Math.floor(timeMS / 1000));
        const total_minutes = parseInt(Math.floor(total_seconds / 60));
        const total_hours = parseInt(Math.floor(total_minutes / 60));

        const seconds = parseInt(total_seconds % 60);
        const minutes = parseInt(total_minutes % 60);
        const hours = parseInt(total_hours % 24);

        if (hours > 0) {
            return `${hours}h ${minutes}m ${seconds}s`;
        }
        else
            return `${minutes}m ${seconds}s`
    } catch(err) {
        console.error(err);
    }   
}

function getRIO(name, server) {
    const rioURL = `${RIO_URL}&realm=${server}&name=${name}&fields=mythic_plus_weekly_highest_level_runs`;
    try {
        const promise = axios.get(rioURL)
        .then(res => res.data).catch(err => console.error(`Error getting RIO data: ${err.message}`))
        return promise
    } catch(err) {
        console.error(err);
    }
}

function getRIOAffixes() {
    const rioURL = `https://raider.io/api/v1/mythic-plus/affixes?region=us&locale=en`;
    try {
        const promise = axios.get(rioURL)
        .then(res => res.data).catch(err => console.error(`Error getting RIO affixes: ${err.message}`))
        return promise
    } catch(err) {
        console.error(err);
    }
}

module.exports = {
    name: 'keys',
    description: 'api fetch of m+ weekly information',
    aliases: ['key'],
    args: false,
    cooldown: 5,
    usage: '(optional) <player name> <server (if not on Area 52)>',
    async execute(msg, args) {
        try {
            let description = '';
            let thumbnail = '';
            let title = '';
            let naughtyImg = '';
            if (args.length === 0) {
                title = 'Weekly Affixes';
                const affixes = await getRIOAffixes();
                affixes.affix_details.forEach(item => {
                    description += `**__${item.name}__**: ${item.description}\n`;
                })
            }
            else {
                const playerName = args.shift().toLowerCase();
                let server = 'area-52';
                if (args.length === 1)
                        server = formatServer(args[0]);
                if (args.length > 1)
                        server = formatServer(args.join(' '));
                    
                    // retrieve raider io api data
                    const rioData = await getRIO(playerName, server);
                    title = `${rioData.name} - Current Week M+ Info`;
                    thumbnail = rioData.thumbnail_url;
                    if (rioData.mythic_plus_weekly_highest_level_runs.length === 0) {
                        description += `Uh oh, someone's been naughty this week!`;
                        naughtyImg = `https://i.ytimg.com/vi/ZlsR6kD8EsA/maxresdefault.jpg`;
                    }
                    else {
                        description += '**__Best Runs this week (limited to top 10)__**\n\n';
                        rioData.mythic_plus_weekly_highest_level_runs.forEach(item => {
                            description += `**${item.short_name}** (+${item.mythic_level})\nBonus: +${item.num_keystone_upgrades} - Time: ${ConvertTime(item.clear_time_ms)}\n\n`;
                        })
                    }
            }

            const keysEmbed = new Discord.MessageEmbed()
            .setColor('RED')
            .setTitle(title)
            .setDescription(description)
            .setImage(naughtyImg)
            .setThumbnail(thumbnail)
            .setTimestamp()
            .setFooter({ 
                text:'Powered by ShoesBot', 
                iconURL: 'https://i.imgur.com/DiHfi2e.png' 
            })

            msg.channel.send({ embeds: [keysEmbed] });

        } catch(err) {
            console.log(err);
            msg.reply('There seems to be an error with your player query. Please check the name and/or server.')
        }
    }
}