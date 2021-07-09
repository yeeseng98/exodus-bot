const Discord = require("discord.js");
const { Emotes } = require("../consts/emotes");

module.exports = {
    name: "dewaifu",
    description: "Delete waifu of specific name",
    argRequired: true,
    argSize: 1,
    usage: "dewaifu Chiaki Nanami",
    async execute(cmdCtx) {
        var message = cmdCtx.message;
        var db = cmdCtx.db;
        var args = cmdCtx.args;

        var queryName = args[0];

        if (args[1]) {
            queryName += " " + args[1];
        }

        try {
            var query = db
                .collection("savedWaf")
                .where("name", "==", queryName.trim().toLowerCase())
                .where("userid", "==", message.author.id);

            query.get().then(async function (querySnapshot) {
                if (!querySnapshot.empty) {
                    await querySnapshot.forEach(function (doc) {
                        const waifu = doc.data();

                        if (waifu.deletable) {
                            doc.ref.delete();

                            message.channel.send(
                                "**" +
                                    queryName +
                                    "** has been divorced from " +
                                    message.author.username +
                                    "'s harem!"
                            );
                            message.channel.send(Emotes.CryHug);
                        } else {
                            message.channel.send(
                                "Too bad! This waifu cannot be divorced!"
                            );
                        }
                    });
                } else {
                    message.channel.send(
                        "No result found for **" + queryName + "**!"
                    );
                }
            });
        } catch (error) {
            console.log(error);
            throw error;
        }
    },
};
