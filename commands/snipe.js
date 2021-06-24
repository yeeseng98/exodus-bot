const Discord = require("discord.js");

module.exports = {
    name: "snipe",
    description: "Snitch the last deleted message",
    argRequired: false,
    argSize: 0,
    usage: "snipe",
    async execute(message, args, db) {
        try {
            const doc = await db.collection('snipe').doc('snap').get();
            if (doc.data()) {
                const sniped = doc.data();
                const embed = new Discord.MessageEmbed()
                    .setColor("#0099ff")
                    .setTitle("")
                    .setAuthor(sniped.author,sniped.avatarUrl)
                    .setDescription(sniped.content)

                const imgLink = getURL(sniped.content);
                if (imgLink) {
                    embed.setImage(imgLink);
                }
                message.channel.send(embed);
            }
        } catch (error) {
            console.log(error);
            throw error;
        }
    },
};


function getURL(url) {
    const img = url.match(/(https?:\/\/.*\.(?:png|jpg|jpeg|webp|gif))/);
    return img ? img[0] : null;
}