const fs = require('fs');
const Discord = require('discord.js');
const { prefix } = require('./config.json');
const classNeeds = require('./commands/classNeeds.json');
const fetch = require('node-fetch');
const RIO_URL = 'https://raider.io/api/v1/characters/profile?';

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

async function getRIO(name, server, region) {
    const rioURL = `${RIO_URL}region=${region}&realm=${server}&name=${name}&fields=guild`;
    try {
        const res = await fetch(rioURL)
            .then(res => res.json()).catch(err => console.error(err));
        return res;
    } catch(err) {
        console.error(err);
    }
}

client.on('message', (msg) => {

  if (msg.author.username === 'Jeeves Recruitment') {
    let rName = msg.embeds[0].author.name;
    let splitName = rName.split(' | ');
    let ilvl = splitName[splitName.length - 1].match(/\d/g);
    ilvl = parseInt(ilvl.join(""));

    let spacedName = rName.split(" ");
    let charName = spacedName[0].toLowerCase();
    let realm = '';
    let region = '';
    if(spacedName[3].includes('(')){
      realm = spacedName[2].toLowerCase();
      region = spacedName[3].match(/[a-z]/gi).join('').toLowerCase();
    } else {
      realm = `${spacedName[2].toLowerCase()} ${spacedName[3].toLowerCase()}`;
      region = spacedName[4].match(/[a-z]/gi).join('').toLowerCase();
    }

    if (region === 'us' && realm === 'area 52') {
      try {
        getRIO(charName, realm, region)
        .then(function(result) {
          if (result.guild !== null) {
            let guild = result.guild.name;
            if (guild.toLowerCase() === 'stay mad') {

              let destChannel = client.channels.cache.get('841639042588213259');

              let destEmbed = new Discord.MessageEmbed()
              .setAuthor(msg.embeds[0].author.name)
              .setColor(msg.embeds[0].color)
              .setTimestamp(msg.embeds[0].timestamp)
              .addFields(msg.embeds[0].fields)
              .setThumbnail(msg.embeds[0].thumbnail.url)
              .setFooter('Powered by ShoesBot','https://i.imgur.com/DiHfi2e.png')
              destChannel.send(destEmbed);   
            }
          }          
        });
      } catch(error) {
        console.error(error);
      }       
    }

    classNeeds.forEach((item) => {
      if (rName.includes(item.name) && item.recruiting == true && ilvl >= item.itemLevel) {
        try {
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
