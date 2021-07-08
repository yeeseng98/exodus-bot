module.exports = {
	name: 'help',
	description: 'Help!',
	argRequired: false,
    argSize: 0,
	usage: 'help',
	execute(cmdCtx) {
		var message = cmdCtx.message;

		var resp = '__**List of Commands**__\n';

		const commandStr = clContext.commands.map(command => pad(20, command.name, " ") + "|     " + command.description).join('\n');

		resp += commandStr;

		return message.channel.send(resp);
	},
};

function pad(width, string, padding) { 
	return (width <= string.length) ? string : pad(width, string + padding, padding)
}