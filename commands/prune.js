const roles = require('./roles.json');

module.exports = {
    name: 'prune',
    description: 'prunes past messages',
    execute(msg, args) {
        if (!msg.member.roles.cache.some(role => roles.includes(role.name))) {
            msg.reply('You do not have permission to use that command.');
            return;
        }

        const amount = parseInt(args[0]) + 1;

        if (isNaN(amount)) {
            return msg.reply('That doesn\'t seem to be a valid number.');
        } else if (amount <= 1 || amount > 100) {
            return msg.reply('You need to input a number between 1 and 99');
        }

        msg.channel.bulkDelete(amount, true).catch(err => {
            console.error(err);
            msg.channel.send('There was an error trying to prune messages in this channel!');
        });
    },
}