module.exports = {
	name: 'ping',
	description: 'Ping!',
	argRequired: false,
    argSize: 0,
	cooldown: 10,
	usage: 'ping',
	execute(message, args) {
		message.channel.send('Pong.');
	},
};