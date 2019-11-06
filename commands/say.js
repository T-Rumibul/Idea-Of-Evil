const config = require('../config.json')
module.exports = {
	name: 'say',
	description: '',
	aliases: [],
	cooldown: 5,
	guildonly: true,
	group: "Fun",
	usage: "<some text>",
	execute(message, args) {
		let message_content = message.content.slice(config.prefix.length).trim().split(/ +/g)
		message_content.shift()
		message.channel.send(message_content.join(' '))
		message.delete()
	},
};