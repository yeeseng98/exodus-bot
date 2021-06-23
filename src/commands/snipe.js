const Discord = require("discord.js");

module.exports = {
    name: "snipe",
    description: "Snitch the last deleted message",
    argRequired: false,
    argSize: 0,
    usage: "snipe",
    execute(message, args, dbContext) {
        try {
            const data = dbContext.getData("/snipe/data");
            if (data) {
                const embed = new Discord.MessageEmbed()
                    .setColor("#0099ff")
                    .setTitle("")
                    .setAuthor(data.author,data.avatarUrl)
                    .setDescription(data.content)

                const imgLink = getURL(data.content);
                if (imgLink) {
                    embed.setImage(imgLink);
                }
                message.channel.send(embed);
            }
        } catch (error) {
            console.log(error);
            message.channel.send("Something went wrong!");
        }
    },
};


function getURL(url) {
    const img = url.match(/(https?:\/\/.*\.(?:png|jpg|jpeg|webp|gif))/);
    return img ? img[0] : null;
}