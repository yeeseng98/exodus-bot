module.exports = {
    name: "listrep",
    description: "List all replies",
    argRequired: false,
    argSize: 0,
    usage: 'listrep',
    execute(message, args, dbContext) {
        var replies;
        try {
            replies = dbContext.getData("/replies/");
        } catch (error) {
            console.log(error);
        }

        if (replies) {
            var repStr = '__**List of Replies**__\n';

            for (key in replies) {
                if (replies.hasOwnProperty(key)) {
                    repStr += key + ' > "' + replies[key] + '"\n';
                }
            }
            return message.channel.send(repStr);
        } else {
            message.channel.send("Something went wrong or replies are empty!");
        }
    },
};
