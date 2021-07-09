const { avatarUrl } = require("../config.json");
const paginationEmbed = require("discord.js-pagination");
const Discord = require("discord.js");

module.exports = {
    name: "help",
    description: "Help!",
    argRequired: false,
    argSize: 0,
    usage: "help",
    execute(cmdCtx) {
        var message = cmdCtx.message;
        var client = cmdCtx.client;

        var commandStr = "";
        var commands = client.commands;
        var commandLength = client.commands.size;

        const pages = [];
        let i = 1;
        const maxPageCount =
            commandLength % 10 == 0
                ? Math.floor(commandLength / 10)
                : Math.floor(commandLength / 10) + 1;
        var curPage = 1;

        commands &&
            commands.forEach((command) => {
                commandStr +=
                    command.name +
                    "\n ```" +
                    command.description +
                    "``` \n";
                i++;

                if (curPage == maxPageCount && i == commandLength + 1) {
                    const embed = new Discord.MessageEmbed()
                        .setColor("#0099ff")
                        .setTitle("")
                        .setAuthor("Weeby's Commands\n", avatarUrl)
                        .setDescription(commandStr);
                    pages.push(embed);
                } else if (i % 10 == 0) {
                    const embed = new Discord.MessageEmbed()
                        .setColor("#0099ff")
                        .setTitle("")
                        .setAuthor("Weeby's Commands\n", avatarUrl)
                        .setDescription(commandStr);

                    pages.push(embed);
                    curPage++;
                    commandStr = "";
                }
            });

        paginationEmbed(message, pages);
    },
};

function pad(width, string, padding) {
    return width <= string.length
        ? string
        : pad(width, string + padding, padding);
}
