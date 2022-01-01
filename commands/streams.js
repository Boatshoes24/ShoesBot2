const Discord = require('discord.js');
const axios = require('axios');
const streamsJSON = require('./streams.json');

const offlineEmoji = '<:offline_power:546953080927813646>';
const onlineEmoji = '<:online_power:546953081125076993>';

const ACCESS_URL = `https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&grant_type=client_credentials`;

function getAccessToken() {
    try {
        const promise = axios.post(ACCESS_URL)
        const promiseData = promise.then((response) => response.data)
        return promiseData
    } catch(err) {
        console.error(err);
    }
}

function checkStreamerStatus(accessToken, name) {
    try {

        const url = `https://api.twitch.tv/helix/streams?user_login=${name}`;
        const promise = axios.get(url, {
            headers: {
                'Client-ID': process.env.TWITCH_CLIENT_ID,
                Authorization: `Bearer ${accessToken}`
            }
        })
        const promiseData = promise.then((response) => response.data)
        return promiseData
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
                    liveStatus = offlineEmoji;
                else
                    liveStatus = onlineEmoji;
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
                .setFooter({ 
                    text:'Powered by ShoesBot', 
                    iconURL: 'https://i.imgur.com/DiHfi2e.png' 
                })

            msg.channel.send({ embeds: [streamEmbed] });
        } catch(err) {
            console.error(err);
            msg.reply('There was an issue getting the stream list. Please wait a few moments and try again or report this issue.');
        }
    }
}