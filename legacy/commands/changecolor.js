const {addcolor } = require('../modules/profile.js');
module.exports = {
	name: 'changecolor',
	description: '',
	aliases: ['cc'],
	cooldown: 60,
    guildonly: true,
    args: true,
    group: "Customization",
    usage: "<color in hex format>",
	execute(message, args) {
		addcolor(message, args[0])
	},
};