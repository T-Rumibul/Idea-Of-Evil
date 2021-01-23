const config = require('../config.json')
const Utility = require('../modules/Utility.js')
module.exports = {
	name: 'rules',
	description: '',
	aliases: [],
	cooldown: 5,
    guildonly: true,
    adminonly: true,
    args: true,
	group: "Administration",
	usage: "<some text>",
	async execute(message, args) {
        if(args[0] == 'set') {
            if(args[1] == 'channel') {
                let channel = message.mentions.channels.first()
                if (channel) true 
                else if(message.member.guild.channels.get(args[2])) channel = message.member.guild.channels.get(args[2]) 
                else if(message.member.guild.channels.find('name', args[2])) channel = message.member.guild.channels.find('name', args[2])
                else return await message.reply('Укажите текстовый канал')
                let msg = await message.reply(`Вы уверены в своем выборе? <#${channel.id}>`)
                await Utility.reactConfirm(msg, message.author)
                
                
            }
        }
	},
};