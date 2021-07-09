const paginationEmbed = require("discord.js-pagination");
const Discord = require("discord.js");
const { avatarUrl } = require("../config.json");

module.exports = {
    name: "listrep",
    description: "List all replies",
    argRequired: false,
    argSize: 0,
    usage: "listrep",
    async execute(cmdCtx) {
        var message = cmdCtx.message;
        var db = cmdCtx.db;

        var replies;
        try {
            replies = await db.collection("replies").get();
        } catch (error) {
            console.log(error);
            throw error;
        }

        if (replies) {
            var repStr = "";

            const pages = [];
            let i = 1;
            const maxPageCount =
                replies._size % 10 == 0
                    ? Math.floor(replies._size / 10)
                    : Math.floor(replies._size / 10) + 1;
            var curPage = 1;
            replies &&
                replies.forEach((doc) => {
                    repStr += doc.id + "\n";
                    i++;

                    if (curPage == maxPageCount && i == replies._size + 1) {
                        const embed = new Discord.MessageEmbed()
                            .setColor("#0099ff")
                            .setTitle("")
                            .setAuthor("Weeby's Replies\n", avatarUrl)
                            .setDescription(repStr);
                        pages.push(embed);
                    } else if (i % 10 == 0) {
                        const embed = new Discord.MessageEmbed()
                            .setColor("#0099ff")
                            .setTitle("")
                            .setAuthor("Weeby's Replies\n", avatarUrl)
                            .setDescription(repStr);

                        pages.push(embed);
                        curPage++;
                        repStr = "";
                    }
                });

            paginationEmbed(message, pages);
        } else {
            message.channel.send("Something went wrong or replies are empty!");
        }
    },
};
