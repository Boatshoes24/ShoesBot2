module.exports = {
    name: 'boneless',
    description: 'the real answer',
    args: false,
    aliases: ['bonelesswingsarebetter'],
    execute(msg, args) {
        try {
            msg.reply('That is incorrect');
        } catch(err) {
            console.error(err);
        }
    }
}