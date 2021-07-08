module.exports = {
    name: "addrep",
    description: "Makes the bot reply to sentences set in listRep",
    argRequired: true,
    argSize: 2,
    usage: 'addrep "I am dumb" "True"',
    category: "reply",
    async execute(cmdCtx) {
        var message = cmdCtx.message;
        var args = cmdCtx.args;
        var db = cmdCtx.db;

        try {
            if (typeof args[0] === "string") {
                const docRef = await db.collection("replies").doc(args[0].toLowerCase());
                await docRef.set({
                    rep: args[1],
                });
                return message.channel.send(
                    'Added "' + args[0].toLowerCase() + '" to match "' + args[1] + '"!'
                );
            }
        } catch (error) {
            throw error;
        }
    },
};
