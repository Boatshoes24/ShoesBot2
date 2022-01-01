const Discord = require('discord.js');
const roles = require('./roles.json');
const axios = require('axios');
const SERVER_NAME = 'area-52';
const GUILD_NAME = 'stay-mad';
const RIO_URL = 'https://raider.io/api/v1/characters/profile?region=us';
const ACCESS_URL = `https://us.battle.net/oauth/token?client_id=${process.env.BNET_CLIENT_ID}&client_secret=${process.env.BNET_CLIENT_SECRET}&grant_type=client_credentials`;

const officers = ["Runeshoes", "Rollow", "Krazyspriest", "Lojick", "Crunkio"];

function getBlizzAccessToken() {
    try {
        const promise = axios.post(ACCESS_URL)
        const dataPromise = promise.then((response) => response.data)
        return dataPromise

    } catch(err) {
         console.error(err);
    }
}

function getGuildMemberInfo(accessToken, name) {
    try {
        const guildInfoUrl = `https://us.api.blizzard.com/data/wow/guild/${SERVER_NAME}/${name}/roster?namespace=profile-us`;
        const promise = axios.get(guildInfoUrl, {
            headers: {
                Authorization: `Bearer ${accessToken.access_token}`
            }
        })
        const dataPromise = promise.then((response) => response.data)
        return dataPromise
    } catch(err) {
        console.error(err);
    }
}

function getMemberItemLevel(accessToken, name) {   
    try {
        const charInfoUrl = `https://us.api.blizzard.com/profile/wow/character/${SERVER_NAME}/${name}?namespace=profile-us`;
        const promise = axios.get(charInfoUrl, {
            headers: {
                Authorization: `Bearer ${accessToken.access_token}`
            }
        })
        const dataPromise = promise.then((response) => response.data)
        return dataPromise
    } catch(err) {
      console.error(err);
    }
  }

function getRIOWeeklyKeysData(name) {
    const rioURL = `${RIO_URL}&realm=${SERVER_NAME}&name=${name}&fields=mythic_plus_weekly_highest_level_runs%2Cmythic_plus_previous_weekly_highest_level_runs`;
    try {
        const promise = axios.get(rioURL);
        const dataPromise = promise.then((response) => response.data)
        return dataPromise
    } catch(err) {
        console.error(err);
    }
}

module.exports = {
    name: 'reportcard',
    description: 'guild report card',
    aliases: ['guildreport', 'report', 'reports'],
    args: false,
    cooldown: 30,
    async execute(msg, args) {
        if (!msg.member.roles.cache.some(role => roles.includes(role.name))) {
            msg.reply('You do not have permission to use that command.');
            return;
        }

        try {
            const blizzAccessToken = await getBlizzAccessToken();
            const guildJSON = await getGuildMemberInfo(blizzAccessToken, GUILD_NAME);
            const members = guildJSON.members;
            let description = '';

            let memberList = [];
            for (const member of members) {
                if(member.rank === 3 || (member.rank < 3 && officers.includes(member.character.name))){
                    let name = member.character.name.toLowerCase();
                    let ilvlJSON = await getMemberItemLevel(blizzAccessToken, name);
                    memberList.push({name: name, curr: 0, prev: 0, ilvl: ilvlJSON.equipped_item_level});
                }
            }
            
            for (const member of memberList) {
                let keyData = await getRIOWeeklyKeysData(member.name); 
                if (keyData && keyData.mythic_plus_weekly_highest_level_runs) {
                    member.curr = keyData.mythic_plus_weekly_highest_level_runs.length;
                }
                if (keyData && keyData.mythic_plus_previous_weekly_highest_level_runs){
                    member.prev = keyData.mythic_plus_previous_weekly_highest_level_runs.length;
                }         
            }

            memberList.sort(function(a, b) {
                return b.ilvl - a.ilvl;
            });

            description += `Name\t\t    Curr\tPrev\t iLvl\n`;
            description += '------------------------------------------\n';
            for (const member of memberList) {
                let nameSpacing = '';
                let numSpacing = '';
                let ilvlSpacing = '';
                for(let i = member.name.length; i <= 15; i++) {
                    nameSpacing += ' ';
                }
                if(member.curr < 10) {
                    numSpacing = '   \t';
                }
                else {
                    numSpacing = '  \t';
                }
                if(member.prev < 10) {
                    ilvlSpacing = '   \t';
                }
                else {
                    ilvlSpacing = '  \t';
                }
                description += `${member.name[0].toUpperCase() + member.name.slice(1)}:${nameSpacing}${member.curr}${numSpacing}${member.prev}${ilvlSpacing}${member.ilvl}\n`;
            }

            const reportEmbed = new Discord.MessageEmbed()
                .setColor('RED')
                .setTitle('Stay Mad Report Card')
                .setDescription(`\`\`\`${description}\`\`\``)
                .setTimestamp()
                .setFooter({ 
                    text:'Powered by ShoesBot', 
                    iconURL: 'https://i.imgur.com/DiHfi2e.png' 
                })

                msg.channel.send({ embeds: [reportEmbed] });
        } catch(err) {
            console.error(err);
        }
    }
}