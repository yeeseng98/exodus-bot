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

        console.log("loading " + command.name);
        // set a new item in the Collection
        // with the key as the command name and the value as the exported module
        client.commands.set(command.name, command);
    }
    console.log("Ready!");
});

client.login(token);

client.on("message", (message) => {
    if (message.author.bot) return;

    listen(message);

    if (!message.content.startsWith(prefix)) return;

    const args = [];
    // convert single quote to double if any, then split based on regex double quotes
    message.content.replace(/'/g, '"').match(regex).forEach((element) => {
        if (!element) return;
        return args.push(element.replace(/"/g, ""));
    });
    const commandStr = args.shift().substring(1);

    console.log(commandStr);
    if (!client.commands.has(commandStr)) return;

    const command = client.commands.get(commandStr);

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
            return message.reply(
                `\`${command.name}\` is on cooldown for ${timeLeft.toFixed(
                    1
                )} more second(s)`
            );
        }
    }

    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
    try {
        command.execute(message, args, db);
    } catch (error) {
        console.error(error);
        message.reply("there was an error trying to execute that command!");
    }
});

function listen(message) {
    console.log(message.content);

    try {
        const data = db.getData("/" + message.content);
        console.log(data);
        if (data) {
            console.log("response >> " + data);
            message.channel.send(data);
        }
    } catch {}
}
