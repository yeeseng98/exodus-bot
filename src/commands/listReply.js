const paginationEmbed = require('discord.js-pagination');
const Discord = require("discord.js");

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
            var repStr = '';

            const pages = [];
            let i = 1;
            for (key in replies) {
                if (replies.hasOwnProperty(key)) {
                    repStr += i + ". " + key + '\n';
                    i++;
                    if (i%10 == 0) {
                        const embed =new Discord.MessageEmbed()
                        .setColor("#0099ff")
                        .setTitle("")
                        .setAuthor("Weeby's List of Replies\n", "https://cdn.discordapp.com/emojis/803558160744448060.png?v=1")
                        .setDescription(repStr);

                        pages.push(embed);
                        repStr = '';
                    }
                }
            }
            console.log(pages);
            paginationEmbed(message, pages);
        } else {
            message.channel.send("Something went wrong or replies are empty!");
        }
    },
};
