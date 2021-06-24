module.exports = {
    name: "addrep",
    description: "Makes the bot reply to sentences set in listRep",
    argRequired: true,
    argSize: 2,
    usage: 'addrep "I am dumb" "True"',
    category: 'reply',
    async execute(message, args, db) {
        try {
            const docRef = await db.collection("replies").doc(args[0]);
            await docRef.set({
                rep: args[1],
            });
            return message.channel.send(
                'Added "' + args[0] + '" to match "' + args[1] + '"!'
            );
        } catch (error) {
            throw error;
        }
    },
};
