const Discord = require("discord.js");

module.exports = {
    name: "avatar",
    description: "Displays avatar",
    argRequired: false,
    argSize: 0,
    usage: "avatar @who",
    execute(cmdCtx) {

        var message = cmdCtx.message;

        const embed = new Discord.MessageEmbed();

        if (!message.mentions.users.size) {
            const avatarUrl = message.author.avatarURL()
                ? message.author.avatarURL({ size: 2048, dynamic: true })
                : message.author.defaultAvatarURL;

            embed
                .setColor("#0099ff")
                .setTitle(
                    message.author.username + "#" + message.author.discriminator
                )
                .setImage(avatarUrl);

            try {
                if (avatarUrl) {
                    return message.channel.send(embed);
                } else {
                    return message.channel.send("No profile picture found");
                }
            } catch (e) {
                throw e;
            }
        }

        const avatarList = message.mentions.users.map((user) => {
            const avatarUrl = user.avatarURL()
                ? user.avatarURL({ size: 2048, dynamic: true })
                : user.defaultAvatarURL;

            return avatarUrl;
        });

        if (avatarList) {
            try {
                message.channel.send(avatarList);
            } catch (e) {
                throw e;
            }
        }
    },
};
