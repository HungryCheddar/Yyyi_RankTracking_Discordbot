let server = require("./server_interface.js");

const tierMap = {
	tier1: "  1~10",
	tier2: " 10~50",
	tier3: " 50~100",
	tier4: "100~500",
	tier5: "500~1000",
};
const tierList = (()=>{
	let result =[];
	for(let k  in tierMap)
	{
		result.push( k);
	}
	return result;
})();

function TierToIndex(tier)
{
	let result = undefined;
	tierList.forEach((str,idx)=>{if(str===tier) result = idx;});
	return result;
}

//Returns a promise
function GetLatestTierScore(recordsTable,tier)
{
	let tierRecords = recordsTable[TierToIndex(tier)];
	return tierRecords[tierRecords.length-1].points;		
	
}
function GetTierScoreHistory(recordsTable,tier)
{
	let tierRecords = recordsTable[TierToIndex(tier)];
	return tierRecords;		
}
function GetTierScoreHistoryString(recordsTable,tier)
{
	let history = GetTierScoreHistory(recordsTable,tier);
	let result = "";
	history.forEach((elem)=>{
		result += `${elem.points} [${elem.time}]\n`;
	});
	return result;
}

//END
async function GetCurrentScore(tier,recordsTable)
{
	if(!recordsTable)
		recordsTable = (await server.GetRecords()).table;
	if(tier ===undefined)
	{
		let result = "Scores:";
		for(let i=0;i<tierList.length;++i)
			 result = `${result}\n${await GetCurrentScore(tierList[i],recordsTable)}`;
		return result;
	}
	if(!tierMap[tier])
		throw `invalid tier.`;
	return `Rank Tier[${tier}] (${tierMap[tier]}): ${GetLatestTierScore(recordsTable,tier)}`;
}
async function GetScoreHistory(tier,recordsTable)
{
	if(!recordsTable)
	 	recordsTable = (await server.GetRecords()).table;
	if(tier ===undefined)
	{
		let result = "Score History:";
		for(let i=0;i<tierList.length;++i)
			 result = `${result}\n${await GetScoreHistory(tierList[i],recordsTable)}`;
		return result;
	}
	if(!tierMap[tier])
		throw `invalid tier.`;
	let tierScoreHistory = GetTierScoreHistoryString(recordsTable,tier);
	return `Rank Tier[${tier}] (${tierMap[tier]}): \`\`\`${tierScoreHistory}\`\`\``;
}

module.exports = {
	tierMap:tierMap,
	tierList:tierList,
	GetLatestTierScore:GetLatestTierScore,
	GetCurrentScore,GetCurrentScore,
	GetScoreHistory,GetScoreHistory,
}
