const profile = require('./modules/profile.js')
module.exports = {
	stats: async (args, message) => {
if(args === undefined) {
	profile.stats(message.member, message)
} else {
	profile.stats(message.mentions.members.first(), message)
	}
}
		
	}
