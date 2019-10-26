const { prefix } = require('../config.json');
const { RichEmbed } = require('discord.js');
module.exports = {
	name: 'help',
	description: 'Вывод',
    aliases: ['h'],
    group: 'Utility',
	cooldown: 1,
    guildOnly: true,

	execute(message, args) {
        const { commands } = message.client;
        let Embed = new RichEmbed();
        Embed.setAuthor(message.client.user.username, message.client.user.avatarURL)
        if (!args.length) {
        Embed.addField('Список всех команд:', '\n\u200b', false)
        let skip = true;
        commands.map(command => { 
            Embed.fields.forEach(field => {       
                if(field.name == `**${command.group}**`) {
                    field.value +=  `, \`${command.name}\``
                    skip = true
                    console.log(skip)
                    return;
                }
                skip=false
            })
               
            if(!skip) {
                Embed.addField(`**${command.group}**`, `\`${command.name}\``, false)
            }
            })
       
        Embed.addField(`**Пример:**`, `\nИспользуйте ${prefix}help [команда], чтобы получить больше информации об определённой команде`, false)
        
            return message.channel.send(Embed)
                .then(() => {
                })
                .catch(error => {
                    console.error(`Could not send help to ${message.author.tag}.\n`, error);
                    message.reply('ERROR');
                });
        }
            const name = args[0].toLowerCase();
            const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

            if (!command) {
	                return message.reply('Такой команды нет!');
                }

              
            Embed.addField(`**Название:** \`${command.name}\``, '\n\u200b')
            if (command.aliases) Embed.addField(`**Сокращения:** \`${command.aliases.join(', ')}\``, '\n\u200b');
            if (command.description) Embed.addField(`**Описание:** \`${command.description}\``, '\n\u200b');
            if (command.usage) Embed.addField(`**Использование:** \`${prefix}${command.name} ${command.usage}\``, '\n\u200b');
            if (command.cooldown) Embed.addField(`**КД:** \`${command.cooldown} сек\``, '\n\u200b');

            message.channel.send(Embed);   
	},
};
