const waifulabs = require("waifulabs");
const Discord = require("discord.js");
const jpGen = require("japanese-name-generator");
const { prefix } = require("../config.json");

module.exports = {
    name: "genwaifu",
    description: "Generates a random weeb png",
    argRequired: false,
    argSize: 0,
    usage: "genwaifu",
    cooldown: 25,
    async execute(message, args, db) {
        try {
            waifulabs.generateWaifus().then(async ([waifu, productWaifu]) => {
                const sfbuff = new Buffer.from(waifu.image, "base64");
                const sfattach = new Discord.MessageAttachment(
                    sfbuff,
                    "output.png"
                );

                const embed = new Discord.MessageEmbed();
                const randomColor =
                    "#" +
                    ((Math.random() * 0xffffff) << 0)
                        .toString(16)
                        .padStart(6, "0");
                const randomName = jpGen({ gender: "female" }).name;

                embed
                    .setColor(randomColor)
                    .setTitle(randomName)
                    .setDescription(
                        "Generated by " +
                            message.author.username +
                            "#" +
                            message.author.discriminator
                    )
                    .attachFiles(sfattach)
                    .setImage("attachment://output.png");

                let filter = (m) => m.author.id === message.author.id;
                message.channel.send(embed).then(() => {
                    message.channel
                        .awaitMessages(filter, {
                            max: 5,
                            time: 10000,
                            errors: ["time"],
                        })
                        .then((message) => {
                            message = message.first();
                            if (
                                message.content
                                    .toLowerCase()
                                    .startsWith("reroll")
                            ) {
                                var rerollArg = str.replace("reroll", "");

                                const rerollOptions = [
                                    "color",
                                    "details",
                                    "pose",
                                ];

                                if (!rerollOptions.includes(rerollArg)) {
                                    rerollArg =
                                        rerollOptions[getRandomInt(0, 2)];
                                }
                                message.channel.send(
                                    "Weeby is looking to reroll " +
                                    rerollArg +
                                        "!"
                                );

                                waifulabs
                                    .generateWaifus(waifu, rerollArg)
                                    .then(async ([newWaifu, productWaifu]) => {
                                        const sfbuff2 = new Buffer.from(
                                            newWaifu.image,
                                            "base64"
                                        );
                                        const sfattach2 =
                                            new Discord.MessageAttachment(
                                                sfbuff2,
                                                "newoutput.png"
                                            );

                                        const embed2 =
                                            new Discord.MessageEmbed();

                                        embed2
                                            .setColor(randomColor)
                                            .setTitle(randomName)
                                            .setDescription(
                                                "Generated by " +
                                                    message.author.username +
                                                    "#" +
                                                    message.author
                                                        .discriminator +
                                                    "(" +
                                                    rerollArg +
                                                    " rerolled)"
                                            )
                                            .attachFiles(sfattach2)
                                            .setImage(
                                                "attachment://newoutput.png"
                                            );

                                        message.channel.send(embed2);
                                    });
                            }
                        })
                        .catch((error) => {});
                });
            });
        } catch (error) {
            throw error;
        }
    },
};

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
