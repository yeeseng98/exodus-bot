module.exports = {
    name: "addrep",
    description: "Makes the bot reply to sentences set in listRep",
    argRequired: true,
    argSize: 2,
    usage: 'addrep "I am dumb" "True"',
    execute(message, args, dbContext) {
      dbContext.push("/replies/" + args[0],args[1]);
      return message.channel.send('Added "' + args[0] + '" to match "' + args[1] + '"!');
    },
  };
  