const Discord = require("discord.js");
const paginationEmbed = require("discord.js-pagination");

module.exports = {
    name: "lwaifu",
    description: "List waifus",
    argRequired: false,
    argSize: 0,
    usage: "lwaifu",
    async execute(cmdCtx) {
        var message = cmdCtx.message;
        var db = cmdCtx.db;
        var args = cmdCtx.args;

        var waifuList = [];
        var queryName = args[0];

        if (args[0]) {
            queryName += " " + args[1];
        } else {
            try {
                var index = 0;
                await db
                    .collection("savedWaf")
                    .where("userid", "==", message.author.id)
                    .get()
                    .then(function (querySnapshot) {
                        querySnapshot.forEach(function (doc) {
                            waifuList.push(doc.data());
                        });
                    });
            } catch (error) {
                console.log(error);
                throw error;
            }

            if (waifuList.length > 0) {
                var wafStr = "";

                const pages = [];
                var i = 1;
                const listSize = waifuList.length;
                const maxPageCount =
                    listSize % 10 == 0
                        ? Math.floor(listSize / 10)
                        : Math.floor(listSize / 10) + 1;

                var curPage = 1;

                waifuList.sort(function(a, b) {
                    return b.score - a.score;
                });

                waifuList.forEach((waifu) => {
                    wafStr += "[" + waifu.score + "] " + capitalizeFirstLetter(waifu.name) + "\n";
                    i++;

                    if (curPage == maxPageCount && i == listSize + 1) {
                        const embed = new Discord.MessageEmbed()
                            .setColor("#0099ff")
                            .setTitle("")
                            .setAuthor(
                                message.author.username + "'s Harem",
                                message.author.avatarURL()
                            )
                            .setDescription(wafStr);

                        pages.push(embed);
                    } else if (i % 10 == 0) {
                        const embed = new Discord.MessageEmbed()
                            .setColor("#0099ff")
                            .setTitle("")
                            .setAuthor(
                                message.author.username + "'s Harem",
                                message.author.avatarURL()
                            )
                            .setDescription(wafStr);

                        pages.push(embed);
                        curPage++;
                        wafStr = "";
                    }
                });

                paginationEmbed(message, pages);
            } else {
                message.channel.send("Something went wrong or harem is empty!");
            }
        }
    },
};

function capitalizeFirstLetter(string) {
    return string
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}
