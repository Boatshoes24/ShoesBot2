const fs = require('fs');
const Discord = require('discord.js');
const { prefix } = require('./config.json');
const classNeeds = require('./commands/classNeeds.json');

const client = new Discord.Client();
client.commands = new Discord.Collection();
const commandFiles = fs
  .readdirSync('./commands')
  .filter((file) => file.endsWith('.js'));

const cooldowns = new Discord.Collection();

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setActivity('!help for commands', { type: 'PLAYING' });
});

client.on('message', (msg) => {
  //just for troy
  if (msg.author.id === '192664999590625280') {
    msg.react('571089901974716416').catch((err) => console.error(err));
  }

  if (msg.author.username === 'Jeeves Recruitment') {
    let rName = msg.embeds[0].author.name;
    let splitName = rName.split(' | ');
    let ilvl = splitName[splitName.length - 1].match(/\d/g);

    classNeeds.forEach((item) => {
      if (rName.includes(item.name) && item.recruiting == true && ilvl >= item.itemLevel) {
        try {
          console.log(rName, item.recruiting, ilvl, item.itemLevel);
          let destChannel = client.channels.cache.get('818895487074828380');

          let destEmbed = new Discord.MessageEmbed()
            .setAuthor(msg.embeds[0].author.name)
            .setColor(msg.embeds[0].color)
            .setTimestamp(msg.embeds[0].timestamp)
            .addFields(msg.embeds[0].fields)
            .setThumbnail(msg.embeds[0].thumbnail.url)
            .setFooter('Powered by ShoesBot','https://i.imgur.com/DiHfi2e.png')
          destChannel.send(destEmbed);
        } catch (error) {
          console.error(error);
        }
      }
    });
  }

  if (!msg.content.startsWith(prefix) || msg.author.bot) return;

  const args = msg.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command =
    client.commands.get(commandName) ||
    client.commands.find(
      (cmd) => cmd.aliases && cmd.aliases.includes(commandName)
    );

  if (!command) return;

  if (command.guildOnly && msg.channel.type !== 'text') {
    return msg.reply("I can't execute that command inside DMs!");
  }

  if (command.args && !args.length) {
    let reply = `You didn't provide any arguments, ${msg.author}`;

    if (command.usage) {
      reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
    }
    return msg.channel.send(reply);
  }

  if (!cooldowns.has(command.name)) {
    cooldowns.set(command.name, new Discord.Collection());
  }

  const now = Date.now();
  const timestamps = cooldowns.get(command.name);
  const cooldownAmount = (command.cooldown || 3) * 1000;

  if (timestamps.has(msg.author.id)) {
    const expirationTime = timestamps.get(msg.author.id) + cooldownAmount;

    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      return msg.reply(
        `please wait ${timeLeft.toFixed(
          1
        )} more second(s) before reusing the \`${command.name}\` command.`
      );
    }
  }

  timestamps.set(msg.author.id, now);
  setTimeout(() => timestamps.delete(msg.author.id), cooldownAmount);

  try {
    command.execute(msg, args);
  } catch (error) {
    console.error(error);
    msg.reply('There was an error trying to execute that command');
  }
});

client.login(process.env.BOT_TOKEN);
