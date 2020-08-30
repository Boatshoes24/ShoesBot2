module.exports = {
    name: 'afterhours',
    description: 'What happens in Stay Mad after hours',
    cooldown: 5,
    args: false,
    execute(msg, args) {
        try {
            msg.channel.send('https://cdn.discordapp.com/attachments/218179845530583041/538242445134004225/Cuv6M1aXYAI5g76.png');
        } catch(err) {
            console.error(err);
            msg.reply('I\'m not sure why this didn\'t work tbh');
        }
    }
}