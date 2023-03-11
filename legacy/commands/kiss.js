const config = require('../config.json')
const { RichEmbed } = require('discord.js');
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('config.json')
const db = low(adapter)
const imagesDB = db.get('images')
module.exports = {
	name: 'kiss',
	description: '',
	aliases: [],
	cooldown: 5,
	guildonly: true,
	group: "Fun",
	usage: "<mention>",
	async execute(message, args) {
		let links = imagesDB.find({type: 'kiss'}).value().links
		if(links) {
			function random(max) {
				return Math.floor(Math.random() * Math.floor(max))
			}
		let link = links[random(links.length)]
		let embed = new RichEmbed();
		let mention = message.mentions.members.first()
		embed.setImage(link)
		
		if(mention) {
		let answers = [`** *blush* <@${message.member.id}> is kissing ${message.mentions.members.first()} too cute**`, `**<@${message.member.id}> is kissing ${message.mentions.members.first()} what is happening?**`, `**Oh <@${message.member.id}> kissed ${message.mentions.members.first()} (°ｏ°)**`]	
		embed.setDescription(answers[random(answers.length)])
		
		
		} else {
			let answers = [`**I hope you like my kiss <@${message.member.id}>**`, `**Don't be upset <@${message.member.id}> *kiss* **`]
			embed.setDescription(answers[random(answers.length)])

		}
		message.channel.send(embed)
	}
	},
};