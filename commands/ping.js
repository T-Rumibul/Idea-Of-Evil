module.exports = {
	name: 'ping',
	description: 'Ping!',
	aliases: ['icon', 'pfp'],
	cooldown: 5,
	guildonly: true,
	group: "Utility",
	usage: "",
	execute(message, args) {
		message.channel.send('Pong.');
	},
};