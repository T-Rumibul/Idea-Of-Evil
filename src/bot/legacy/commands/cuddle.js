const config = require('../config.json')
const { RichEmbed } = require('discord.js');
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('config.json')
const db = low(adapter)
const imagesDB = db.get('images')
module.exports = {
	name: 'cuddle',
	description: '',
	aliases: [],
	cooldown: 5,
	guildonly: true,
	group: "Fun",
	usage: "<mention>",
	async execute(message, args) {
		let links = imagesDB.find({type: 'cuddle'}).value().links
		if(links) {
			function random(max) {
				return Math.floor(Math.random() * Math.floor(max))
			}
		let link = links[random(links.length)]
		let embed = new RichEmbed();
		let mention = message.mentions.members.first()
		embed.setImage(link)
		
		if(mention) {
		let answers = [`** *Ow* <@${message.member.id}> cuddles ${message.mentions.members.first()}**`, `**<@${message.member.id}> cuddles ${message.mentions.members.first()}, wow interesting**`, `**<@${message.member.id}> cuddling ${message.mentions.members.first()} don't be upset :3**`]	
		embed.setDescription(answers[random(answers.length)])
		
		
		} else {
			let answers = [`**<@${message.member.id}> cuddle special for you (´ω｀)**`, `**Don't worry <@${message.member.id}> ( ◜‿◝ ) **`]
			embed.setDescription(answers[random(answers.length)])

		}
		message.channel.send(embed)

	}
	},
};