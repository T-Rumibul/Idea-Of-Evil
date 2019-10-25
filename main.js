const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('./config.json')
delete config.default;
client.login(config.token);
// Modules
const welcomer = require('./modules/welcomer.js')
const profile = require('./modules/profile.js')
// End Modules
client.on('ready', async () => {
    console.log(client.user.username+' ready')
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
if (!message.guild) return;

if (message.content.indexOf(config.prefix) !== 0)
    return;
  args = message.content.toLowerCase().slice(config.prefix.length).trim().split(/ +/g);
  if (args != undefined) {
    cmd = args.shift();
  }



if (cmd === 'stats') {
    if(args.length == 0) {
    await profile.stats(message.member, message)
    } else if (message.mentions.members.first()) {
      await profile.stats(message.mentions.members.first(), message)
    }
}


if (cmd === 'serverinfo') {
    profile.serverinfo(message.member, message)
}


if (cmd === 'top') {
    if (args[0] === 'emoji') {
        profile.topEmoji(message.member, message)
    } else if (args[0] === 'exp' || args.length == 0) {
        profile.topExp(message.member, message)
    }
}
if (cmd === 'changecolor' || 'cc') {
    if (args.length < 1) {
        message.channel.send("WRONG!")
        return 0;
    }
    profile.addcolor(message, args[0]);
}
if (cmd === 'clearoldemojis') {
    profile.clearOldEmoji(message)
}
})
client.on('guildMemberRemove', async (member) =>{
    profile.statistics(member.guild)
})
client.on('guildMemberAdd', async (member) =>{
    profile.statistics(member.guild)
})
client.on('error', console.error);