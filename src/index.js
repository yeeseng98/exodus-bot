const Discord = require("discord.js");
const fs = require("fs");
const dotenv = require("dotenv");
const { prefix, token } = require("../config.json");
const jsonDB = require("node-json-db");
const jdbConf = require("node-json-db/dist/lib/JsonDBConfig");

const regex = new RegExp('"[^"]+"|[\\S]+', "g");
const client = new Discord.Client();
const db = new jsonDB.JsonDB(new jdbConf.Config("jsonDB", true, false, "/"));
dotenv.config();

client.once("ready", () => {
    client.commands = new Discord.Collection();
    client.cooldowns = new Discord.Collection();

    const commandFiles = fs
        .readdirSync("./commands")
        .filter((file) => file.endsWith(".js"));

    for (const file of commandFiles) {
        const command = require(`./commands/${file}`);

        console.log("loading module: " + command.name);
        // key as the command name and the value as the exported module
        client.commands.set(command.name, command);
    }
    console.log("All done!");
});

client.login(token);

client.on("message", (message) => {
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
    if (command.adminOnly && !hasAccess(message.member.roles.cache)) {
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

    if (timestamps.has(message.author.id)) {
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
        command.execute(message, args, db, client);
    } catch (error) {
        console.error(
            "error occured when running " + command.name + "\n" + error
        );
        message.reply("error occured when running " + command.name + "!");
    }
});

client.on("messageDelete", async (message) => {
    console.log("DEL " + message.contet + "/" + message.author.username);
    db.push(
        "/snipe",
        {
            data: {
                content: message.content,
                avatarUrl: message.author.avatarURL(),
                author: message.author.username,
            },
        },
        false
    );
});

function listen(message) {
    try {
        const data = db.getData("/replies/" + message.content);
        if (data) {
            message.channel.send(data);
        }
    } catch {}
}

function hasAccess(roles) {
    return roles.some((r) => 
        r.name === "Circle of Trust"
    );
}
