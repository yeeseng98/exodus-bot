const Discord = require("discord.js");

module.exports = {
    name: "avatar",
    description: "Displays avatar",
    argRequired: false,
    argSize: 0,
    usage: "avatar @who",
    execute(message, args) {
        const embed = new Discord.MessageEmbed();

        if (!message.mentions.users.size) {
            const avatarUrl = message.author.avatarURL()
                ? message.author.avatarURL({ size: 2048, dynamic: true })
                : message.author.defaultAvatarURL

            embed
                .setColor("#0099ff")
                .setTitle(message.author.username + "#" + message.author.discriminator)
                .setImage(avatarUrl);

            if (avatarUrl) {
                return message.channel.send(embed);
            } else {
                return message.channel.send("No profile picture found");
            }
        }

        const avatarList = message.mentions.users.map((user) => {
            const avatarUrl = user.avatarURL()
                ? user.avatarURL({ size: 2048, dynamic: true })
                : user.defaultAvatarURL

            return avatarUrl;
        });

        if (avatarList) {
            message.channel.send(avatarList);
        } else {
            message.channel.send("No profile picture found");
        }
    },
};
