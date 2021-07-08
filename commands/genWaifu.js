const waifulabs = require("waifulabs");
const Discord = require("discord.js");
const jpGen = require("japanese-name-generator");
const { configEmotes } = require("../config.json");

module.exports = {
    name: "genwaifu",
    description: "Generates a random weeb png",
    argRequired: false,
    argSize: 0,
    usage: "genwaifu",
    cooldown: 25,
    async execute(cmdCtx) {
        var message = cmdCtx.message;

        try {
            waifulabs.generateWaifus().then(async ([waifu]) => {
                const fileName =
                    message.author.username + Date.now().toString();
                const sfbuff = new Buffer.from(waifu.image, "base64");
                const sfattach = new Discord.MessageAttachment(
                    sfbuff,
                    fileName + ".png"
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
                    .setImage("attachment://" + fileName + ".png");

                message.channel.send(embed).then(() => {
                    waitResponse(
                        message,
                        waifu,
                        randomColor,
                        randomName,
                        0,
                        null,
                        fileName,
                        cmdCtx
                    );
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

function waitResponse(
    uMessage,
    waifu,
    randomColor,
    randomName,
    attempt,
    botMessage,
    fileName,
    cmdCtx
) {
    let filter = (m) =>
        m.author.id === uMessage.author.id &&
        m.content.toLowerCase().startsWith("reroll");

    if (attempt == 3) {
        initEmoteCollector(
            uMessage,
            randomColor,
            randomName,
            botMessage,
            fileName,
            cmdCtx
        );
    }
    // stop after 3 attempts
    uMessage.channel
        .awaitMessages(filter, {
            max: 1,
            time: 10000,
            errors: ["time"],
        })
        .then((message) => {
            if (attempt < 3) {
                uMessage = message.first();

                var rerollArg = uMessage.content
                    .toLowerCase()
                    .replace("reroll", "");

                const rerollOptions = ["color", "details", "pose"];

                if (!rerollOptions.includes(rerollArg)) {
                    rerollArg = rerollOptions[getRandomInt(0, 2)];
                }

                attempt++;

                uMessage.channel.send(
                    "Weeby is looking to reroll " +
                        rerollArg +
                        "! (Attempt " +
                        attempt +
                        " of 3)"
                );

                waifulabs
                    .generateWaifus(waifu, rerollArg)
                    .then(async ([newWaifu]) => {
                        const fileName2 =
                            uMessage.author.username + Date.now().toString();
                        const sfbuff2 = new Buffer.from(
                            newWaifu.image,
                            "base64"
                        );
                        const sfattach2 = new Discord.MessageAttachment(
                            sfbuff2,
                            fileName2 + ".png"
                        );

                        const embed2 = new Discord.MessageEmbed();

                        embed2
                            .setColor(randomColor)
                            .setTitle(randomName)
                            .setDescription(
                                "Generated by " +
                                    uMessage.author.username +
                                    "#" +
                                    uMessage.author.discriminator +
                                    "(" +
                                    rerollArg +
                                    " rerolled)"
                            )
                            .attachFiles(sfattach2)
                            .setImage("attachment://" + fileName2 + ".png");

                        uMessage.channel.send(embed2).then((botMsg) => {
                            waitResponse(
                                uMessage,
                                newWaifu,
                                randomColor,
                                randomName,
                                attempt,
                                botMsg,
                                fileName2,
                                cmdCtx
                            );
                        });
                    });
            }
        })
        .catch((error) => {});
}

async function initEmoteCollector(
    uMessage,
    color,
    name,
    botMessage,
    fileName,
    cmdCtx
) {
    var cache = cmdCtx.cache;

    Object.entries(configEmotes).forEach(async (entry) => {
        const [key, value] = entry;
        const emoId = await cache.get("loadEmotes>" + key);
        await botMessage
            .react(emoId)
            .catch((error) => console.error("failed to react " + key, error));
    });

    const filter_emote = (reaction) => {
        return reaction.emoji.name in configEmotes;
    };

    const timer = 20000;
    const seconds = ((timer % 60000) / 1000).toFixed(0);
    const collector_emote = botMessage.createReactionCollector(filter_emote, {
        time: timer,
    });

    botMessage.channel.send("Voting closes in " + seconds + " seconds!");
    collector_emote.on("end", async (collected) => {
        var totalPoint = 0;
        var totalReacts = 0;
        var reactMap = {};
        collected.forEach((colReact) => {
            if (colReact.emoji.name in configEmotes) {
                const value = configEmotes[colReact.emoji.name];

                var actualCount = colReact.count - 1;

                totalPoint += value * actualCount;
                totalReacts += actualCount;
                reactMap[colReact.emoji.name] = actualCount;
            }
        });

        if (totalReacts > 0) {
            uMessage.channel.send(
                "Waifu score for **" +
                    name +
                    "** by " +
                    uMessage.author.username +
                    " is " +
                    totalPoint +
                    "!"
            );

            var tag = null;

            if (reactMap["yaragasm2"] > 0) {
                tag = "Weeb's Ideal";
            } else if (reactMap["disgustingslo"] > 0) {
                tag = "Hellspawn Incarnate";
            }

            if (tag) {
                var db = cmdCtx.db;

                const docRef = await db
                    .collection("savedWaf")
                    .doc(fileName);

                await docRef.set({
                    name: name.toLowerCase(),
                    color: color,
                    url: getEmbedUrl(botMessage),
                    username: uMessage.author.username,
                    discriminator: uMessage.author.discriminator,
                    userid: uMessage.author.id,
                    tag: tag,
                    score: totalPoint,
                });

                uMessage.channel.send(
                    "**" +
                        name +
                        "** by " +
                        uMessage.author.username +
                        " has been saved to the harem as **" +
                        tag +
                        "**!"
                );
            }
        }
    });
}

function getEmbedUrl(botMessage) {
    const embed = botMessage.embeds[0];
    return embed.image.url;
}
