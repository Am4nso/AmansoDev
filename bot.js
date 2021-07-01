const DJS = require("discord.js");
const fs = require("fs");
const {MongoClient} = require("mongodb");
const {token, guild_id, mongodb} = require("./config.json");

const client = new DJS.Client({
    partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
    presence: {
        activities: [{
            type: "PLAYING",
            name: "Made by Amanso#9143"
        }]
    },
    intents: new DJS.Intents(DJS.Intents.ALL)
});

const mongo = new MongoClient(mongodb.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

client.mongo = mongo;
client.mongodb = mongodb;
client.commands = new DJS.Collection();
client.orders = new DJS.Collection();
client.guild_id = guild_id;

const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(client, ...args));
    } else {
        client.on(event.name, (...args) => event.execute(client, ...args));
    }
}

const commandFolders = fs.readdirSync('./commands');

for (const folder of commandFolders) {
    const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(`./commands/${folder}/${file}`);
        client.commands.set(command.name, command);
    }
}

client.login(token);

exports.client = client;