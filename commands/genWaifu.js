const waifulabs = require("waifulabs");
const Discord = require("discord.js");
const jpGen = require('japanese-name-generator')

module.exports = {
    name: "genwaifu",
    description: "Generates a random weeb png",
    argRequired: false,
    argSize: 0,
    usage: "genwaifu",
    cooldown: 25,
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

                    const embed = new Discord.MessageEmbed();
                    const randomColor = '#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0');
                    const randomName = jpGen({gender: 'female'}).name;

                    embed
                    .setColor(randomColor)
                    .setTitle(
                        randomName
                    ).setDescription("Generated by " + message.author.username + "#" + message.author.discriminator)
                    .attachFiles(sfattach)
                    .setImage('attachment://output.png');

                    return message.channel.send(embed);
                });
        } catch (error) {
            throw error;
        }
    },
};
