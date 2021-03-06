const Discord = require('discord.js');
const fetch = require('node-fetch');
const streamsJSON = require('./streams.json');

const offline = '<:offline_power:546953080927813646>';
const online = '<:online_power:546953081125076993>';

const access_url = `https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&grant_type=client_credentials`;

async function getAccessToken() {
    try {
        const res = await fetch(access_url, {
            method: 'POST'
        }).then(res => res.json()).catch(err => console.error(err));
        return res;
    } catch(err) {
        console.error(err);
    }
}

async function checkStreamerStatus(accessToken, name) {
    try {
        const url = `https://api.twitch.tv/helix/streams?user_login=${name}`;
        const data = await fetch(url, {
            method: 'GET',
            headers: {
                'Client-ID': process.env.TWITCH_CLIENT_ID,
                'Authorization': 'Bearer ' + accessToken
            }
        }).then(data => data.json()).catch(err => console.error(err));
        return data;
    } catch(err) {
        console.error(err);
    }
}

module.exports = {
    name: 'streams',
    description: 'Returns a list of Stay Mad streams.',
    aliases: ['stream', 'twitch'],
    cooldown: 10,
    args: false,
    async execute(msg, args) {
        try {
            let liveStatus = '';
            const streamers = [];
            const accessToken = await getAccessToken();
            for (let i = 0; i < streamsJSON.length; i++) {
                let person = streamsJSON[i];
                const status = await checkStreamerStatus(accessToken.access_token, person.twitchName);
                if (status.data.length === 0)
                    liveStatus = offline;
                else
                    liveStatus = online;
                streamers.push({ name: `${liveStatus}${person.displayName}: ${person.role}`, value: person.twitchLink, inline: person.inline });
            }
            
            let spaces = streamers.length % 3;
            if (spaces === 2) {
                streamers.push({ name: '\u200B', value: '\u200B', inline: true });
            }
            if (spaces === 1) {
                streamers.push({ name: '\u200B', value: '\u200B', inline: true });
                streamers.push({ name: '\u200B', value: '\u200B', inline: true });
            }

            const streamEmbed = new Discord.MessageEmbed()
                .setColor('PURPLE')
                .setTitle('**<Stay Mad> Streams**')
                .setThumbnail('https://assets.help.twitch.tv/Glitch_Purple_RGB.png')
                .setDescription('Streams can take a few minutes to update when going on/off line.')
                .addFields(streamers)
                .setImage('https://i.imgur.com/wSRFkRM.png')
                .setTimestamp()
                .setFooter('Powered by ShoesBot', 'https://i.imgur.com/DiHfi2e.png')

            msg.channel.send(streamEmbed);
        } catch(err) {
            console.error(err);
            msg.reply('There was an issue getting the stream list. Please wait a few moments and try again or report this issue.');
        }
    }
}