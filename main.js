const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('./config.json')
const commands = require('./commands.js');
const commmandsDescription = require('./commandsDesctiprion.js')
delete config.default;
delete commmandsDescription.default;
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
if(!commands.hasOwnProperty(cmd) && (!cmd === 'help' || cmd === 'h')) {
return
}
if(cmd === 'help' || cmd === 'h') {
    switch(args[0]) {
        case undefined:
            commmandsDescription.errorResponse(message)
            break;
        case 'stats':
            commmandsDescription.stats(message)
            break;
        case "cc":
        case "changecolor": 
            commmandsDescription.changecolor(message)
            break;
        default:
            commmandsDescription.errorResponse(message)
            break;
    }


  
    
}
if (cmd === 'changecolor' || cmd === 'cc') {
    if (args.length < 1) {
       await message.channel.send("WRONG!")
        return 0;
    }
    profile.addcolor(message, args[0]);
}

if (cmd === 'stats') {
    commands.stats(args[0], message)
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
