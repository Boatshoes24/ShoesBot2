const Discord = require('discord.js');
const roles = require('./roles.json');
const fetch = require('node-fetch');
const SERVER_NAME = 'area-52';
const GUILD_NAME = 'stay-mad';
const RIO_URL = 'https://raider.io/api/v1/characters/profile?region=us';
const ACCESS_URL = `https://us.battle.net/oauth/token?client_id=${process.env.BNET_CLIENT_ID}&client_secret=${process.env.BNET_CLIENT_SECRET}&grant_type=client_credentials`;

const officers = ["Felshoes", "Rollow", "Kepi", "Krazyspriest", "Lojick"];

async function getBlizzAccessToken() {
    try {
        const res = await fetch(ACCESS_URL, {
            method: 'POST',
        }).then(res => res.json()).catch(err => console.error(err));
        return res;
    } catch(err) {
         console.error(err);
    }
}

async function getGuildMemberInfo(accessToken, name) {
    try {
        const guildInfoUrl = `https://us.api.blizzard.com/data/wow/guild/${SERVER_NAME}/${name}/roster?namespace=profile-us`;
        const res = await fetch(guildInfoUrl, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken.access_token}`
            }
        }).then(res => res.json()).catch(err => console.error(err));
        return res;
    } catch(err) {
        console.log(err);
    }
}

async function getMemberItemLevel(accessToken, name) {   
    try {
        const charInfoUrl = `https://us.api.blizzard.com/profile/wow/character/${SERVER_NAME}/${name}?namespace=profile-us`;
        const res = await fetch(charInfoUrl, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken.access_token}`
            }
        }).then(res => res.json()).catch(err => console.error(err));
        return res;
    } catch(err) {
      console.log(err);
    }
  }

async function getRIOCurrent(name) {
    const rioURL = `${RIO_URL}&realm=${SERVER_NAME}&name=${name}&fields=mythic_plus_weekly_highest_level_runs`;
    try {
        const res = await fetch(rioURL)
            .then(res => res.json()).catch(err => console.error(err));
        return res;
    } catch(err) {
        console.error(err);
    }
}

async function getRIOPrevious(name) {
    const rioURL = `${RIO_URL}&realm=${SERVER_NAME}&name=${name}&fields=mythic_plus_previous_weekly_highest_level_runs`;
    try {
        const res = await fetch(rioURL)
            .then(res => res.json()).catch(err => console.error(err));
        return res;
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
                if(member.rank === 3 || officers.includes(member.character.name)){
                    let name = member.character.name.toLowerCase();
                    let ilvlJSON = await getMemberItemLevel(blizzAccessToken, name);
                    memberList.push({name: name, curr: 0, prev: 0, ilvl: ilvlJSON.equipped_item_level});
                }
            }
            
            for (const member of memberList) {
                let current = await getRIOCurrent(member.name);
                member.curr = current.mythic_plus_weekly_highest_level_runs.length;
                let previous = await getRIOPrevious(member.name);
                member.prev = previous.mythic_plus_previous_weekly_highest_level_runs.length;
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
                .setFooter('Powered by ShoesBot', 'https://i.imgur.com/DiHfi2e.png')

                msg.channel.send(reportEmbed);
        } catch(err) {
            console.log(err);
        }
    }
}