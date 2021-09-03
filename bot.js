const { Client, Intents } = require('discord.js');
const { REST } = require('@discordjs/rest');
const commandsJs = require('./commands.js');
const auth = require('./auth.json');

const commands = commandsJs.GetCommandList();
const TOKEN = auth.token;
const CLIENT_ID = auth.client_id;

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });


//Re-register commands on joined servers when the bot starts up
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.guilds.cache.forEach( guild=>commandsJs.RegisterCommands(rest,commands,guild.id,CLIENT_ID));
});

client.on('guildDelete', (guild)=>{
	console.log("guildDeleted: "+guild.id);
});
client.on('guildUpdate', (guild)=>{
	console.log("guildUpdated: "+guild.id);
});
//Register commands when the bot joins the server
client.on('guildCreate',(guild)=>{
	console.log("guildCreated: "+guild.id);
	commandsJs.RegisterCommands(rest,commandsJs.GetCommandList(),guild.id,CLIENT_ID);
});

client.on('interactionCreate', commandsJs.HandleInteractions);
client.on('error',(err)=>console.error(err));

const rest = new REST({ version: '9' }).setToken(TOKEN);
client.login(TOKEN);
