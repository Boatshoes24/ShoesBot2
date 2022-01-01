const Discord = require('discord.js');
const roles = require('./roles.json');
const client = require('../index');

const ROLE_REAL_MAD = '<@&450508412527312896>';
const ROLE_MAD = '<@&450216070003949568>';
const ROLE_HEALTH_JUICER = '<@&566805261663207450>';
const ROLE_TRIAL = '<@&569186360267767848>';
const ROLE_HANGRY = '<@&744052129014218752>';
const ROLE_SALES = '<@&898733735476871188>';

const CHANNELS = ['sales-info', 'general'];

module.exports = {
    name: 'make-event',
    description: 'Creates an event with a reaction',
    aliases: ['event'],
    args: true,
    usage: '<Date> <Event Name> <all/raiders/sale/sales>',
    cooldown: 30,
    execute(msg, args) {
        if (!msg.member.roles.cache.some(role => roles.includes(role.name))) {
            msg.reply('You do not have permission to use that command.');
            return;
        }

        // if (!CHANNELS.includes(msg.channel.name)) {
        //     msg.reply('Your event cannot be created in this channel');
        //     return;
        // }

        try {
            if (args[args.length - 1] == 'all' || args[args.length - 1].includes('raider') || args[args.length - 1].includes('sale')) {
                const sendTo = args.pop();
                if (sendTo === 'all') {
                    msg.channel.send(`${ROLE_REAL_MAD}${ROLE_MAD}${ROLE_HEALTH_JUICER}${ROLE_TRIAL}${ROLE_HANGRY}`);
                } else if (sendTo.includes('raider')) {
                    msg.channel.send(`${ROLE_REAL_MAD}${ROLE_MAD}${ROLE_HEALTH_JUICER}${ROLE_TRIAL}`);
                } else if (sendTo.includes('sale')) {
                    msg.channel.send(`${ROLE_SALES}`);
                }
            }

            const eventDate = args.shift();
            const eventName = args.join(' '); 
            const reactionUpdateChannel = client.channels.cache.get('926256864033906729');      

            const eventEmbed = new Discord.MessageEmbed()
            .setTitle(`**Event:** ${eventName}`)
            .setColor('GREEN')
            .setDescription(`Date: ${eventDate}\n\nIf you can funnel, sign up using 'C', 'L', 'M', or 'P' for your armor proficiency. \n\nIf you cannot attend, react with 'X' to let us know you cannot make it this week.`)
            .setTimestamp()
            .setFooter({ 
                text:'Powered by ShoesBot', 
                iconURL: 'https://i.imgur.com/DiHfi2e.png' 
            })

            const c_emoji = String.fromCodePoint("C".codePointAt(0) - 65 + 0x1f1e6);
            const l_emoji = String.fromCodePoint("L".codePointAt(0) - 65 + 0x1f1e6);
            const m_emoji = String.fromCodePoint("M".codePointAt(0) - 65 + 0x1f1e6);
            const p_emoji = String.fromCodePoint("P".codePointAt(0) - 65 + 0x1f1e6);
            const x_emoji = String.fromCodePoint("X".codePointAt(0) - 65 + 0x1f1e6);

             msg.channel.send({ embeds: [eventEmbed] })
                .then(async function(msg) {
                    await msg.react(c_emoji)
                    await msg.react(l_emoji)
                    await msg.react(m_emoji)
                    await msg.react(p_emoji)
                    await msg.react('❌');

                    const filter = (reaction, user) => {
                        return ['🇱', '🇲', '🇵', '🇨', '❌'].includes(reaction.emoji.name) && !user.bot;
                    };

                    const collector = msg.createReactionCollector({
                        filter,
                        time: 60000,
                        dispose: true,
                    })

                    collector.on('collect', (reaction, user) => { 
                        try {
                        const reactAddEmbed = new Discord.MessageEmbed()                        
                            .setAuthor({
                                name: `${user.username}: Reaction Added`,
                                iconURL: user.displayAvatarURL()
                            }) 
                            .setTitle(`${eventName} (${eventDate})`)
                            .setDescription(`${user.username} added reaction ${reaction.emoji.name}`)
                            .setTimestamp()
                            .setFooter({ 
                                text:'Powered by ShoesBot', 
                                iconURL: 'https://i.imgur.com/DiHfi2e.png' 
                            })                          
                        
                        reactionUpdateChannel.send({ embeds: [reactAddEmbed] })
                        } catch(err) {
                            console.error(err);
                        }                        
                    })

                    collector.on('remove', (reaction, user) => {
                       try {
                        const reactRemoveEmbed = new Discord.MessageEmbed()                        
                            .setAuthor({
                                name: `${user.username}: Reaction Removed`, 
                                iconURL: user.displayAvatarURL()
                            }) 
                            .setTitle(`${eventName} (${eventDate})`)
                            .setDescription(`${user.username} removed reaction ${reaction.emoji.name}`)
                            .setTimestamp()
                            .setFooter({ 
                                text:'Powered by ShoesBot', 
                                iconURL: 'https://i.imgur.com/DiHfi2e.png' 
                            })                          
                        
                        reactionUpdateChannel.send({ embeds: [reactRemoveEmbed] })
                        } catch(err) {
                            console.error(err);
                        }
                    })

                    collector.on('end', () => {
                        try {                            
                            reactionUpdateChannel.send(`Reaction updates for ${eventName} (${eventDate}) have ended.`)
                        } catch(err) {
                            console.error(err);
                        }
                    })
                });

        } catch(err) {
            console.error(err);
            msg.reply('There was an issue creating your event. Please try again or report this issue.');
        }
    }
}