const Discord = require("discord.js");
const fs = require("fs");
const dotenv = require("dotenv").config();
const { prefix } = require("./config.json");
const admin = require("firebase-admin");
const NodeCache = require( "node-cache" );
const cache = new NodeCache();
const regex = new RegExp('"[^"]+"|[\\S]+', "g");
const client = new Discord.Client();

admin.initializeApp({
    credential: admin.credential.cert({
        "projectId": process.env.FIREBASE_PROJECT_ID,
        "private_key": process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        "client_email": process.env.FIREBASE_CLIENT_EMAIL
    }),
});

const db = admin.firestore();

setInterval(() => { 
    reloadCache();
}, 900000);

client.once("ready", async () => {
    client.commands = new Discord.Collection();
    client.cooldowns = new Discord.Collection();

    var path = "./commands";
    if (process.env.dev != "local") {
        path = "/app/commands";
    }

    const commandFiles = fs
        .readdirSync(path)
        .filter((file) => file.endsWith(".js"));

    for (const file of commandFiles) {
        const command = require(`./commands/${file}`);

        console.log("loading module: " + command.name);
        // key as the command name and the value as the exported module
        client.commands.set(command.name, command);
    }

    reloadCache();
    console.log("All done!");
});

client.login(process.env.token);

client.on("message", async (message) => {
    if (message.author.bot) return;

    listen(message);

    if (!message.content.startsWith(prefix) || message.channel.type === "dm")
        return;

    const args = [];
    // convert single quote to double if any, then split based on regex double quotes
    message.content
        .replace(/'/g, '"')
        .match(regex)
        .forEach((element) => {
            if (!element) return;
            return args.push(element.replace(/"/g, ""));
        });
    const commandStr = args.shift().substring(1).toLowerCase();

    if (!client.commands.has(commandStr)) {
        message.channel.send("get ?help bro");
        return;
    }

    const command = client.commands.get(commandStr);

    console.log(command.name + ">>" + args);

    // check args
    if (
        command.argRequired &&
        (!args.length || args.length != command.argSize)
    ) {
        message.channel.send(
            "Requires " +
                command.argSize +
                " argument(s), e.g '" +
                command.usage +
                "'"
        );
        return;
    }

    // check role access
    if (command.roles && !hasAccess(message.member.roles.cache, command.roles)) {
        message.channel.send("Missing required role to run command!");
        return;
    }

    // check cooldown
    const { cooldowns } = client;
    if (!cooldowns.has(command)) {
        cooldowns.set(command, new Discord.Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command);
    const cooldownAmount = (command.cooldown || 3) * 1000;

    if (timestamps.has(message.author.id) && message.author.id != process.env.ownerId) {
        const expirationTime =
            timestamps.get(message.author.id) + cooldownAmount;

        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            message.reply(
                `\`${command.name}\` is on cooldown for ${timeLeft.toFixed(
                    1
                )} more second(s)`
            );
            return;
        }
    }

    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

    try {
        await command.execute(message, args, db, client);

        if (command.category && command.category == 'reply') {
            reloadCache();
        }
    } catch (error) {
        console.error(
            "error occured when running " + command.name + "\n" + error
        );
        message.reply("error occured when running " + command.name + "!");
    }
});

client.on("messageDelete", async (message) => {
    console.log("DEL " + message.content + "/" + message.author.username);
    const docRef = db.collection("snipe").doc("snap");

    await docRef.set({
        content: message.content,
        avatarUrl: message.author.avatarURL(),
        author: message.author.username,
    });
});

function listen(message) {
    try {
        const response = cache.get(message.content.toLowerCase());
        
        if (response) {
            message.channel.send(response);
        }
    } catch (e){
    }
}

function hasAccess(userRoles, requiredRole) {
    return userRoles.some((r) => r.name === requiredRole);
}

async function reloadCache() {
    console.log("cache is reloading...");
    let i=0;
    cache.flushAll();
    const replies = await db.collection('replies').get();
    replies && replies.forEach((doc) => {
        cache.set(doc.id, doc.data().rep);
        i++;
    });
    console.log("firebase detected " + i + " items");
    console.log("cache stored " + cache.getStats().keys + " items");
}