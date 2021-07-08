module.exports = {
	name: 'ping',
	description: 'Ping!',
	argRequired: false,
    argSize: 0,
	cooldown: 10,
	usage: 'ping',
	execute(cmdCtx) {
		var message = cmdCtx.message;

		message.channel.send('Pong.');
	},
};