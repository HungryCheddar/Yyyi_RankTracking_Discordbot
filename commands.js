const { Routes } = require('discord-api-types/v9');
const backend = require('./back.js');
const server = require('./server_interface.js');
const admins = (()=>{
	try{
	return require("./admin.json") ;
	}catch(err)
	{
		console.error(`Error requiring admin.json: ${err}`);
		return {admins_ids:[]};
	}
})();
const { InteractionReplyOptions, CommandInteraction } = require('discord.js');

const STRING = 3;
const INTEGER = 4;
const SUBCOMMAND_GROUP = 2;
const SUBCOMMAND = 1;

const CHANNEL_MESSAGE_WITH_SOURCE=4;

async function CurrentScoreResponse(tierName) {
	return backend.GetCurrentScore(tierName);
}
async function ScoreHistoryResponse(tierName) {
	return backend.GetScoreHistory(tierName);
}

async function SetDataSource(interaction)
{
	let url = interaction.options.getString("url");
	try{
		let test = new URL(url);
	}catch(error)
	{
		return "Invalid URL";
	}
	await server.SetDataPage(url);
	return "set";
}
async function SetRecordsSource(interaction)
{
	let host = interaction.options.getString("host");
	let port = interaction.options.getInteger("port");
	server.SetRecordServer({hostname:host,port:port});
	return "Server set";
}

async function ResultString(result)
{
	if(result.done ===undefined)
		console.error(`ResultString used in the wrong place, received: ${result}`);
	return result.done?"success":"failed";
}

async function GetDataSource(interaction)
{
	return  server.GetDataPage().then(obj=>obj.url);
}
async function SetRecordsSource(interaction)
{
	let host = interaction.options.getString("host");
	let port = interaction.options.getInteger("port");
	server.SetRecordServer({hostname:host,port:port});
	return "Server set";
}
async function SaveRecords(interaction)
{
	let path = interaction.options.getString("rel_save_path");
	return server.SendPostRequest("/save_records",{save_path:path}).then(ResultString);
}
async function ClearRecords(interaction)
{
	return server.SendPostRequest("/clear_records").then(ResultString);
}
async function GetRecords(interaction)
{
	return server.SendGetRequest("/get_records").then(obj=>`\`\`\`json\n${JSON.stringify(obj)}\`\`\``);
}
async function SetRecords(interaction)
{
	let data = JSON.parse(interaction.options.getString("json"));
	if(!data)
		return "Failed. Json field is empty";
	return server.SendPostRequest("/set_records",{data:data}).then(ResultString);
}
async function LoadRecords(interaction)
{
	let path = interaction.options.getString("rel_save_path");
	return server.SendGetRequest("/load_records",{save_path:path}).then(ResultString);
}

function AdminOnly(callback)
{
	return async (interaction)=>
	{
		let isAdmin = false;
		admins.admins_ids.forEach(admin=> isAdmin = admin===interaction.user.id);
		if(isAdmin)
			return callback(interaction);
		else
			return "Not authorized";
	};
}

let commandMap = {
	current_score: {
		description: "Gets current scores",
		options: GetTiers((tierName) => {
			return {
				name: tierName,
				description: `Current score of ${tierName}`,
				type: SUBCOMMAND,
				response: (interaction) => CurrentScoreResponse(tierName)
			};
		})
	},
	score_history: {
		description: "Gets the history of scores",
		options: GetTiers((tierName) => {
			return {
				name: tierName,
				description: `History of ${tierName}'s scores`,
				type: SUBCOMMAND,
				response: async (interaction) => { return ScoreHistoryResponse(tierName); }
			};
		})
	},
	test_cmd: { description: "Test Command", response: async (interaction) => "Test response" },
	current_scores: Template(CurrentScoreResponse, "current scores"),
	score_histories: Template(ScoreHistoryResponse, "score history"),
	set_data_source: {description: "Tells records server to change the target page to pulldata from",response:AdminOnly(SetDataSource),options:[
		{ 
			name : "url",
			description: "url of the page to pull the data from",
			type: STRING
		}
	]},
	get_data_source: {description: "Get the target page the records server uses to pull the data from",response:AdminOnly(GetDataSource)},
	set_records_source: {description : "Sets the records server to interface with", response:AdminOnly(SetRecordsSource), options:[
		{ 
			name : "host",
			description: "records source host",
			type: STRING,
			required:true
		},
		{ 
			name : "port",
			description: "records source host",
			type: INTEGER,
			required:true
		}
	]},
	save_records: {description: "Saves the data as a file on the server",response:AdminOnly(SaveRecords),options:[
		{ 
			name : "rel_save_path",
			description: "Filename",
			type: STRING
		}
	]},
	load_records: {description: "Loads the data from a file on the server",response:AdminOnly(LoadRecords),options:[
		{ 
			name : "rel_save_path",
			description: "Filename",
			type: STRING
		}
	]},
	clear_records: {description: "Clears the records data on the server",response:AdminOnly(ClearRecords)},
	get_records: {description: "Gets the records data on the server",response:AdminOnly(GetRecords)},
	set_records: {description: "Sets the records data on the server",response:AdminOnly(SetRecords),options:[
		{
			name: "json",
			description: "the data",
			type: STRING,
			required:true
		}
	]},
};

function Template(ResponseFunc, info_string) {
	return {
		description: `Get ${info_string} for all tiers`,
		response: async (interaction) => {
			return ResponseFunc();
		}
	}
}

//PUBLIC
module.exports =
{
	GetTiers: GetTiers,
	GetCommandList: GetCommandList,
	HandleInteractions: HandleInteractions,
	RegisterCommands: RegisterCommands,
	Init: Init
};

function GetTiers(func) {
	let result = [];
	backend.tierList.forEach(tierName => { result.push(func(tierName)) });
	return result;
}

function GetCommandList() {
	let commandList = [];
	for (let cmdKey in commandMap) {
		let cmd = { name: cmdKey };
		let cmdTemp = commandMap[cmdKey];
		for (let k in cmdTemp) {
			cmd[k] = cmdTemp[k];
		}
		commandList.push(cmd);
	}
	return JSON.parse(JSON.stringify(commandList));
}


async function RegisterCommands(rest, commands, guild_id, client_id) {
	try {
		console.log('Started refreshing application (/) commands.');

		await rest.put(
			Routes.applicationGuildCommands(client_id, guild_id),
			{ body: commands },
		);
		console.log('Successfully reloaded application (/) commands.');
	} catch (error) {
		console.error(error);
	}
}

function findOption(cmd, iOptions) {
	if (cmd.response)
		return cmd;
	let subcommandName = iOptions.getSubcommand();
	let options = cmd.options;
	let result = null;
	options.forEach(option => {
		if (subcommandName === option.name)
			result = option;
	});
	return result;
}


async function HandleInteractions(interaction) {
	if (!interaction.isCommand()) return;

	// Our bot needs to know if it will execute a command
	// It will listen for messages that will start with `!`
	try {
		let option = findOption(commandMap[interaction.commandName], interaction.options);
		if (option)
			option.response(interaction).then(async (response) => {
				return interaction.reply({type: 4, content:response,ephemeral:true});
			}).catch((err)=>console.error(err));
		else
			interaction.reply("Invalid command").catch((err)=>console.error(err));
			
	} catch (err) {
		console.error(err);
	}

}

function Init(client) {
}