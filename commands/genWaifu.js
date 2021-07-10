const waifulabs = require("waifulabs");
const Discord = require("discord.js");
const jpGen = require("japanese-name-generator");
const { configEmotes } = require("../config.json");
const { WaifuTag } = require("../consts/waifuTag");
const { Emotes } = require("../consts/emotes");

const rerollDuration = 15000;
const rerollVoteTurn = 3;
const voteDuration = 15000;
const maxWaifu = 5;

module.exports = {
    name: "gwaifu",
    description:
        "Generates a random weeb png, type rr[pose/details/color] to reroll",
    argRequired: false,
    argSize: 0,
    usage: "gwaifu",
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
        m.content.toLowerCase().startsWith("rr");

    if (attempt == rerollVoteTurn) {
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
            time: rerollDuration,
            errors: ["time"],
        })
        .then((message) => {
            if (attempt < 3) {
                uMessage = message.first();

                var rerollArg = uMessage.content
                    .toLowerCase()
                    .replace("rr", "");

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

    const timer = voteDuration;
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

            var tag;

            if (reactMap["yaragasm2"] > 0 || reactMap["yaranai"] > 0) {
                tag = WaifuTag.Ideal;
            } else if (reactMap["ohgodwhy"] > 0) {
                tag = WaifuTag.Cursed;
            }

            if (tag) {
                // save waifu if there is a valid tag
                saveWaifu(
                    uMessage,
                    color,
                    name,
                    botMessage,
                    fileName,
                    cmdCtx,
                    tag,
                    totalPoint,
                    totalReacts
                );
            }
        }
    });
}

function getEmbedUrl(botMessage) {
    const embed = botMessage.embeds[0];
    return embed.image.url;
}

function resolveTag(tag, uMessage) {
    if (tag.key) {
        try {
            switch (tag.key) {
                case "CUR":
                    uMessage.channel.send(
                        "T-take responsibility " +
                            uMessage.author.username +
                            "-kun..."
                    );
                    uMessage.channel.send(Emotes.Cute);
                    break;
            }
        } catch (error) {}
    }

    return tag.nonDeletable ? false : true;
}

async function saveWaifu(
    uMessage,
    color,
    name,
    botMessage,
    fileName,
    cmdCtx,
    tag,
    totalPoint,
    totalReacts
) {
    try {
        const waifuCount = await getWafCounter(uMessage, cmdCtx);

        console.log(uMessage.author.username + " wafCount >> " + waifuCount);
        if (waifuCount < maxWaifu) {
            const isDeletable = resolveTag(tag, uMessage);

            var db = cmdCtx.db;

            const docRef = await db.collection("savedWaf").doc(fileName);

            await docRef.set({
                name: name.toLowerCase(),
                color: color,
                url: getEmbedUrl(botMessage),
                username: uMessage.author.username,
                discriminator: uMessage.author.discriminator,
                userid: uMessage.author.id,
                tag: tag.title,
                score: totalPoint,
                value: totalPoint,
                deletable: isDeletable,
                editable: true,
            });

            incrementWafCounter(uMessage, cmdCtx);

            uMessage.channel.send(
                "**" +
                    name +
                    "** has been saved to " +
                    uMessage.author.username +
                    "'s harem!"
            );
        } else {
            uMessage.channel.send(
                "**" +
                    name +
                    "** cannot be saved due to maximum harem limit(" +
                    maxWaifu +
                    ") reached!"
            );
        }
    } catch (error) {
        throw error;
    }
}

async function incrementWafCounter(uMessage, cmdCtx) {
    var rtdb = cmdCtx.rtdb;
    const uref = rtdb.ref("Counters/WafCount/" + uMessage.author.id);
    var dbCount;

    uref.get().then(
        (snapshot) => {
            dbCount = snapshot.val();
            if (dbCount) {
                dbCount++;
                uref.set(dbCount);
            } else {
                console.log("set1");
                uref.set(1);
            }
        },
        (errorObject) => {
            console.log("The read failed: " + errorObject.name);
        }
    );
}

async function getWafCounter(uMessage, cmdCtx) {
    var rtdb = cmdCtx.rtdb;
    const uref = rtdb.ref("Counters/WafCount/" + uMessage.author.id);
    var dbCount;

    uref.get().then(
        (snapshot) => {
            dbCount = snapshot.val();
        },
        (errorObject) => {
            console.log("The read failed: " + errorObject.name);
        }
    );

    return dbCount ? dbCount : 0;
}
