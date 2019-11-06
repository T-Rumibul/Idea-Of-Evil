const config = require('../config.json')
const { RichEmbed } = require('discord.js');
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('config.json')
const db = low(adapter)
const imagesDB = db.get('images')

module.exports = {
	name: 'hug',
	description: '',
	aliases: [],
	cooldown: 5,
	guildonly: true,
	group: "Fun",
	usage: "<mention>",
	async execute(message, args) {
		let links = imagesDB.find({type: 'hugs'}).value().links
		if(links) {
			function random(max) {
				return Math.floor(Math.random() * Math.floor(max))
			}
		let link = links[random(links.length)]
		let embed = new RichEmbed();
		let mention = message.mentions.members.first()
		embed.setImage(link)
		if(mention) {
		let answers = [`**Wow! <@${message.member.id}> has hugged ${mention}, it's cute**`, `**<@${message.member.id}> has hugged ${mention}, everything will be alright**`, `**<@${message.member.id}> has hugged ${mention}, is that all? hehe**`, `**<@${message.member.id}> has hugged tight ${mention}**`]
			
		embed.setDescription(answers[random(answers.length)])
		
		
		} else {
			let answers = [`**Oh <@${message.member.id}> there your hug :3**`, `**I am glad to hug you <@${message.member.id}> <3**`]
			embed.setDescription(answers[random(answers.length)])

		}
		message.channel.send(embed)
		message.delete()
	}
	},
};