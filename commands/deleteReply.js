module.exports = {
    name: "delrep",
    description: "Delete matching reply",
    argRequired: true,
    argSize: 1,
    usage: 'delrep "I am dumb"',
    roles: 'Circle of Trust',
    category: 'reply',
    async execute(cmdCtx) {

      var message = cmdCtx.message;
      var args = cmdCtx.args;
      var db = cmdCtx.db;
      var docRef;

      try {
        docRef = await db.collection("replies").doc(args[0]).delete();
        return message.channel.send('"' + args[0] + '" ceased to exist!');
      } catch (error) {
        throw error;
      }
    },
  };
  