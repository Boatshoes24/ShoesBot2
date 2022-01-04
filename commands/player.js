const Discord = require('discord.js');
const axios = require('axios');
const RIO_URL = 'https://raider.io/api/v1/characters/profile?region=us';

const ACCESS_URL = `https://us.battle.net/oauth/token?client_id=${process.env.BNET_CLIENT_ID}&client_secret=${process.env.BNET_CLIENT_SECRET}&grant_type=client_credentials`;


function formatServer(serverName) {
    serverName = serverName.replace(/\s+/g, '-').replace(/'/g, "").toLowerCase();
    return serverName;
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

function getRIO(name, server) {
    const rioURL = `${RIO_URL}&realm=${server}&name=${name}&fields=mythic_plus_scores_by_season:current`;
    try {
        const promise = axios.get(rioURL)
        const promiseData = promise.then((response) => response.data)
        return promiseData
    } catch(err) {
        console.error(err);
    }
}

function getBlizzAccessToken() {
    try {
        const promise = axios.post(ACCESS_URL)
        const promiseData = promise.then((response) => response.data)
        return promiseData
    } catch(err) {
         console.error(err);
    }
}

function getBlizzCharacterInfo(accessToken, name, server) {
    try {
        const charInfoURL = `https://us.api.blizzard.com/profile/wow/character/${server}/${name}?namespace=profile-us`;
        const promise = axios.get(charInfoURL, {
            headers: {
                Authorization: `Bearer ${accessToken.access_token}`
            }
        })
        const promiseData = promise.then((response) => response.data)
        return promiseData
    } catch(err) {
        console.error(err);
    }
}

function getBlizz2v2Info(accessToken, name, server) {
    try {
        const pvpInfoURL = `https://us.api.blizzard.com/profile/wow/character/${server}/${name}/pvp-bracket/2v2?namespace=profile-us`;
        const promise = axios.get(pvpInfoURL, {
            headers: {
                Authorization: `Bearer ${accessToken.access_token}`
            },
            validateStatus: function(status) {
                return status < 400
            }
        }).then(res => res.data.rating).catch(err => console.error(err.message))
        return promise
    } catch(err) {
        console.error(err);
    }
}

function getBlizz3v3Info(accessToken, name, server) {
    try {
        const pvpInfoURL = `https://us.api.blizzard.com/profile/wow/character/${server}/${name}/pvp-bracket/3v3?namespace=profile-us`;
        const promise = axios.get(pvpInfoURL, {
            headers: {
                Authorization: `Bearer ${accessToken.access_token}`
            },
            validateStatus: function(status) {
                return status < 400
            }
        }).then(res => res.data.rating).catch(err => console.error(err.message))
        return promise
    } catch(err) {
        console.error(err);
    }
}

function getBlizzRBGInfo(accessToken, name, server) {
    try {
        const pvpInfoURL = `https://us.api.blizzard.com/profile/wow/character/${server}/${name}/pvp-bracket/rbg?namespace=profile-us`;
        const promise = axios.get(pvpInfoURL, {
            headers: {
                Authorization: `Bearer ${accessToken.access_token}`
            },
            validateStatus: function(status) {
                return status < 400
            }
        }).then(res => res.data.rating).catch(err => console.err(err.message))
        return promise
    } catch(err) {
        console.error(err);
    }
}


module.exports = {
    name: 'armory',
    description: 'api fetch of raider.io and blizz player stats',
    aliases: ['raiderio', 'rio', 'player', 'info'],
    args: true,
    cooldown: 5,
    usage: '<player name> <server (if not on Area 52)>',
    async execute(msg, args) {
        try {
            let description = '';
            const playerNameUpper = capitalizeFirstLetter(args[0]);
            const playerName = args.shift().toLowerCase();
            let server = 'area-52';
            if (args.length === 1)
                    server = formatServer(args[0]);
            if (args.length > 1)
                    server = formatServer(args.join(' '));
                
                //format server name for check-pvp site
                let checkPvPServer = 'Area%2052';
                if (args.length === 1)
                    checkPvPServer = capitalizeFirstLetter(args[0]);
                if (args.length > 1)
                    checkPvPServer = capitalizeFirstLetter(args.join('%20'));

                const blizzArmoryLink = `https://worldofwarcraft.com/en-us/character/us/${server}/${playerName}`;
                const rioLink = `https://raider.io/characters/us/${server}/${playerName}`;
                const wclLink = `https://www.warcraftlogs.com/character/us/${server}/${playerName}`
                const checkPvPLink = `https://check-pvp.fr/us/${checkPvPServer}/${playerNameUpper}`;

                let linksDescription = '\n**__Character Links__**\n';
                linksDescription += `[Blizzard Armory](${blizzArmoryLink})\n`;
                linksDescription += `[Raider IO Link](${rioLink})\n`;
                linksDescription += `[Warcraft Logs Link](${wclLink})\n`;
                linksDescription += `[Check-PvP Link](${checkPvPLink})\n`;
                description += linksDescription;
                

                // retrieve blizzard api character data
                const blizzAccessToken = await getBlizzAccessToken();
                const blizzCharInfo = await getBlizzCharacterInfo(blizzAccessToken, playerName, server);
                let guildName = (!blizzCharInfo.guild) ? 'N/A' : blizzCharInfo.guild.name;

                let blizzCharDescription = '\n**__Character Info__**\n';
                blizzCharDescription += `Class: ${blizzCharInfo.character_class.name.en_US}\n`;
                blizzCharDescription += `Spec: ${blizzCharInfo.active_spec.name.en_US}\n`;
                blizzCharDescription += `Guild: ${guildName}\n`;
                blizzCharDescription += `iLvl: ${blizzCharInfo.equipped_item_level} / ${blizzCharInfo.average_item_level}\n`;
                description += blizzCharDescription; 

                // retrieve blizzard api pvp data
                const blizzRating2v2 = await getBlizz2v2Info(blizzAccessToken, playerName, server);
                const blizzRating3v3 = await getBlizz3v3Info(blizzAccessToken, playerName, server);
                const blizzRatingRBG = await getBlizzRBGInfo(blizzAccessToken, playerName, server);
                let twoRating = !blizzRating2v2 ? 'N/A' : blizzRating2v2;
                let threeRating = !blizzRating3v3 ? 'N/A' : blizzRating3v3;
                let rbgRating = !blizzRatingRBG ? 'N/A' : blizzRatingRBG;
                
                let blizzPvPDescription = '\n**__Arena Info__**\n';
                blizzPvPDescription += `2v2: ${twoRating}\n`;
                blizzPvPDescription += `3v3: ${threeRating}\n`;
                blizzPvPDescription += `RBG: ${rbgRating}\n`;
                description += blizzPvPDescription;

                // retrieve raider io api data
                const rioData = await getRIO(playerName, server);
                const currentIOScores = rioData.mythic_plus_scores_by_season[0].scores;
                let rioDescription = '\n**__Raider IO Info__**\n';
                rioDescription += `Overall: ${currentIOScores.all}\n`;
                rioDescription += `Dps: ${currentIOScores.dps}\n`;
                rioDescription += `Tank: ${currentIOScores.tank}\n`;
                rioDescription += `Healer: ${currentIOScores.healer}\n`;
                description += rioDescription;
            
            

                const playerEmbed = new Discord.MessageEmbed()
                .setColor('RED')
                .setTitle(`**${blizzCharInfo.name}**\n`)
                .setDescription(description)
                .setThumbnail(rioData.thumbnail_url)
                .setTimestamp()
                .setFooter({ 
                    text:'Powered by ShoesBot', 
                    iconURL: 'https://i.imgur.com/DiHfi2e.png' 
                })

                msg.channel.send({ embeds: [playerEmbed] });
        } catch(err) {
            console.error(err);
            msg.reply('There seems to be an error with your player query. Please check the name and/or server. It\'s also possible this character has not been logged in for too long.')
        }
    }
}