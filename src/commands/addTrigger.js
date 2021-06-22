module.exports = {
    name: "addTrigger",
    description: "Makes the bot reply X sentence that triggers upon mention of Y sentence",
    execute(message, args, dbContext) {
      if (!args.length || args.length != 2) {
          return message.channel.send('Requires 2 arguments, e.g "/addTrigger "I am dumb" "True"');
      }
      
      dbContext.push("/" + args[0],args[1]);
      return message.channel.send('Added "' + args[0] + '" to match "' + args[1] + '"!');
    },
  };
  