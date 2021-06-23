module.exports = {
    name: "delrep",
    description: "Delete matching reply",
    argRequired: true,
    argSize: 1,
    usage: 'delrep "I am dumb"',
    execute(message, args, dbContext) {
      try {
        dbContext.getData("/replies/" + args[0]);
      } catch (error) {
        return message.channel.send(args[0] + " not found!");
      }

      try {
        dbContext.delete("/replies/" + args[0]);
        return message.channel.send('"' + args[0] + '"was deleted!');
      } catch (error) {
        console.log(error);
        return message.channel.send("Something went wrong!");
      }
    },
  };
  