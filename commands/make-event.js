const Discord = require('discord.js');
const roles = require('./roles.json');

const ROLE_REAL_MAD = '<@&450508412527312896>';
const ROLE_MAD = '<@&450216070003949568>';
const ROLE_HEALTH_JUICER = '<@&566805261663207450>';
const ROLE_TRIAL = '<@&569186360267767848>';
const ROLE_HANGRY = '<@&744052129014218752>';

const CHANNELS = ['sales-info', 'general'];

module.exports = {
    name: 'make-event',
    description: 'Creates an event with a reaction',
    aliases: ['event'],
    args: true,
    usage: '<Date> <Event Name> <all/raiders>',
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
            if (args[args.length - 1] == 'all' || args[args.length - 1].includes('raider')) {
                const sendTo = args.pop();
                if (sendTo === 'all') {
                    msg.channel.send(`${ROLE_REAL_MAD}${ROLE_MAD}${ROLE_HEALTH_JUICER}${ROLE_TRIAL}${ROLE_HANGRY}`);
                } else if (sendTo.includes('raider')) {
                    msg.channel.send(`${ROLE_REAL_MAD}${ROLE_MAD}${ROLE_HEALTH_JUICER}${ROLE_TRIAL}`);
                }
            }

            const eventDate = args.shift();
            const eventName = args.join(' ');        

            const eventEmbed = new Discord.MessageEmbed()
            .setTitle(`**Event:** ${eventName}`)
            .setColor('GREEN')
            .setDescription(`Date: ${eventDate}`)
            .setFooter('Please sign up for this event by reacting below.')
            .setTimestamp()
            .setFooter('Powered by ShoesBot', 'https://i.imgur.com/DiHfi2e.png')

            const c_emoji = String.fromCodePoint("C".codePointAt(0) - 65 + 0x1f1e6);
            const l_emoji = String.fromCodePoint("L".codePointAt(0) - 65 + 0x1f1e6);
            const m_emoji = String.fromCodePoint("M".codePointAt(0) - 65 + 0x1f1e6);
            const p_emoji = String.fromCodePoint("P".codePointAt(0) - 65 + 0x1f1e6);

             msg.channel.send(eventEmbed)
                .then(async function(msg) {
                    await msg.react(c_emoji)
                    await msg.react(l_emoji)
                    await msg.react(m_emoji)
                    await msg.react(p_emoji)
                });
        } catch(err) {
            console.error(err);
            msg.reply('There was an issue creating your event. Please try again or report this issue.');
        }
    }
}