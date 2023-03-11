const jimp = require('jimp');
const Discord = require('discord.js');


module.exports.sendWelcomeMesssage = async (member, welcome_channel) => {
    let background = await jimp.read('./resourses/background.png')
    let avatar_mask = await jimp.read('./resourses/avatar-mask.png')
    let nickname_font = await jimp.loadFont('./resourses/nickname.fnt')
    let count_font = await jimp.loadFont('./resourses/font.fnt')
    let avatar;
    if (member.user.avatarURL)  {
        avatar = await jimp.read(member.user.avatarURL) 
    } else { // Если дауничь без авы
        avatar = await jimp.read(member.user.defaultAvatarURL)
       
    }
    let username = member.user.username
    username = username.charAt(0).toUpperCase() + username.slice(1, 11).toLowerCase()
    if (username.length == 11) {
        username = username + '...'
    }

    background.print(nickname_font, 201, 120, username);
    background.print(count_font, 74, 220, member.guild.memberCount);
    avatar.resize(137, 137)
    avatar.mask(avatar_mask, 0, 0)
    background.composite(avatar, 30, 60); 
    let image = new Discord.Attachment(await background.getBufferAsync(jimp.MIME_PNG), 'final.png')
    channel = member.guild.channels.get(welcome_channel)
    const embed = new Discord.RichEmbed()
                        .setColor(12387078)
                        .attachFile(image)
                        .setImage('attachment://final.png')

      await channel.send('<@'+ member.id+'>', {embed}).then(message => console.log(`Sent message: ${message.content}`))
      .catch(console.error);
}
