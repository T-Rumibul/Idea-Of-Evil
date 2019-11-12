const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('./config.json')
const commmandsDescription = require('./commandsDesctiprion.js')

const fs = require('fs');
const cooldowns = new Discord.Collection();
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);

	// set a new item in the Collection
	// with the key as the command name and the value as the exported module
	client.commands.set(command.name, command);
}
delete config.default;
delete commmandsDescription.default;
client.login(config.token_dev);

// Modules
const welcomer = require('./modules/welcomer.js')
const profile = require('./modules/profile.js')
const Utility = require('./modules/Utility.js')
// End Modules
let album_id = ['eCOuQ', 'PS9uP', 'Rs6Vt', 'Wr3tS', 'e0JJC', '7R5sa', 'B84oi']
client.on('ready', async () => {
    console.log(client.user.username+' ready')
     //Utility.putAllAlbumImagesIntoConfig(album_id)
})

client.on('guildMemberAdd', async (member) => {
await welcomer.sendWelcomeMesssage(member, config.welcome_channel);
})

client.on('message', async (message) => {
if (message.author.bot) return;
//Modules
await profile.levelSys(message.member, message)
await profile.emoji_use(message.member, message)
await profile.statistics(message.guild)
//End of Modules
if (!message.guild) return message.reply('Вы не можете использовать комманды в ЛС.');

if (message.content.indexOf(config.prefix) !== 0)
    return;
  args = message.content.toLowerCase().slice(config.prefix.length).trim().split(/ +/g);
  if (args != undefined) {
    cmd = args.shift();
  }

const command = client.commands.get(cmd)
|| client.commands.find(command => command.aliases && command.aliases.includes(cmd));
// If command don't exists
if (!command) return message.reply('Нет такой команды');
// Aruments 
if (command.args && !args.length) {
        let reply = `Неправильная команда, ${message.author}!`;

		if (command.usage) {
			reply += `\nПравильное использование: \`${config.prefix}${command.name} ${command.usage}\``;
		}

		return message.channel.send(reply);
        }
// For idiots that are trying to write in DM
if (command.guildOnly && message.channel.type !== 'text') {
            return message.reply('Вы не можете использовать команды в ЛС.');
    }
//Admin commands
if(command.adminonly && !Utility.isAdmin(message.member)) return message.reply('Для использования этой команды нужно иметь права администратора.')
//Cooldown for commands
    if (!cooldowns.has(command.name)) {
        cooldowns.set(command.name, new Discord.Collection());
    }
    
    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 0) * 1000;
    
    if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
    
        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            let reply = await message.reply(`Осталось ${timeLeft.toFixed(1)} секунд до повтороного использования \`${command.name}\`.`);
            await message.delete()
            await reply.delete(timeLeft * 1000)
            return 
        }
    }
try {
    command.execute(message, args);
    timestamps.set(message.author.id, now);
setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
} catch (error) {
	console.error(error);
	message.reply('ERROR! <@231449604711907328>');
}
function isAdmin(member) {
    if(member.hasPermission("ADMINISTRATOR")) {
        return true;
    } else return false;

}
})
client.on('guildMemberRemove', async (member) =>{
    profile.statistics(member.guild)
})
client.on('guildMemberAdd', async (member) =>{
    profile.statistics(member.guild)
})
client.on('error', console.error);
