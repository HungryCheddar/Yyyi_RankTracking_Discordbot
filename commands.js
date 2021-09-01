const { Routes } = require('discord-api-types/v9');
const backend = require('./back.js');

const SUBCOMMAND_GROUP = 2;
const SUBCOMMAND = 1;


async function CurrentScoreResponse(tierName)
{
	return backend.GetCurrentScore(tierName); 
}
async function ScoreHistoryResponse(tierName)
{
	return backend.GetScoreHistory(tierName);
}

let commandMap = {
	current_score:{
		description: "Gets current scores",
		options: GetTiers( (tierName)=>{ 
			return {
					name : tierName,
					description : `Current score of ${tierName}`,
					type : SUBCOMMAND,
					response: (interaction)=>CurrentScoreResponse(tierName)
				};
		})
	},
	score_history:{
		description: "Gets the history of scores",
		options: GetTiers( (tierName)=>{ 
			return {
					name : tierName,
					description : `History of ${tierName}'s scores`,
					type : SUBCOMMAND,
					response: async (interaction)=>{ return ScoreHistoryResponse(tierName); }
				};
		})
	},
	test_cmd: {description:"Test Command",response:async(interaction)=> "Test response"},
	current_scores: Template(CurrentScoreResponse,"current scores"),
	score_histories: Template(ScoreHistoryResponse,"score history"),
};

function Template(ResponseFunc, info_string)
{
	return {
		description:`Get ${info_string} for all tiers`,
		response: async (interaction)=>{
			let promises = [];
			promises = GetTiers(ResponseFunc);
			let result = `All results[${promises.length}]:`;
			return Promise.all(promises).then(results=>{
				results.forEach(r => {
					result+=`\n ${r}`;
				});
				return result;
			});
		}
	}
}

//PUBLIC
module.exports=
{
	GetTiers:GetTiers,
	GetCommandList:GetCommandList,
	HandleInteractions:HandleInteractions,
	RegisterCommands:RegisterCommands,
	Init:Init
};

 function GetTiers(func)
{
	let result = [];
	backend.tierList.forEach(tierName=>{result.push(func(tierName))});
	return result;
}

 function GetCommandList()
{
	let commandList = [];
	for(let cmdKey in commandMap)
	{
		let cmd = {name : cmdKey};
		let cmdTemp =commandMap[cmdKey];
		for(let k in cmdTemp)
		{
			cmd[k] = cmdTemp[k];
		}
		commandList.push(cmd);
	}
	return JSON.parse(JSON.stringify(commandList));
}


async function RegisterCommands(rest,commands, guild_id, client_id)
{
	try {
	  console.log('Started refreshing application (/) commands.');
  
	  await rest.put(
		Routes.applicationGuildCommands(client_id,guild_id),
		{ body: commands },
	  );
	  console.log('Successfully reloaded application (/) commands.');
	} catch (error) {
	  console.error(error);
	}
}

function findOption(cmd,iOptions)
{
	if(cmd.response)
		return cmd;
	let subcommandName = iOptions.getSubcommand();
	let options = cmd.options;
	let result = null;
	options.forEach( option => { 
		if(subcommandName===option.name)
		result = option;
	});
	return result;
}


async function HandleInteractions(interaction)
{
	if (!interaction.isCommand()) return;

	// Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`
    
		let option = findOption(commandMap[interaction.commandName],interaction.options);
		if(option)
			option.response(interaction).then(async (response)=>{ 
				await interaction.reply(response);
			});
		else
			interaction.reply("Invalid command");
  
}

function Init(client)
{
}