module.exports = {
    name = 'boneless',
    args = false,
    aliases = ['bonelesswingsarebetter'],
    execute(msg, args) {
        try {
            msg.reply('That is incorrect');
        } catch(err) {
            console.error(err);
        }
    }
}