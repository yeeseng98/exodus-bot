const waifulabs = require("waifulabs");
const Discord = require("discord.js");

module.exports = {
    name: "genwaifu",
    description: "Generates a random weeb png",
    argRequired: false,
    argSize: 0,
    usage: "genwaifu",
    cooldown: 15,
    async execute(message, args, db) {
        try {
            waifulabs
                .generateWaifus()
                .then(async ([waifu, productWaifu]) => {
                    const sfbuff = new Buffer.from(
                        waifu.image,
                        "base64"
                    );
                    const sfattach = new Discord.MessageAttachment(
                        sfbuff,
                        "output.png"
                    );

                    return message.channel.send(sfattach);
                });
        } catch (error) {
            throw error;
        }
    },
};
