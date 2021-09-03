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

function formatNumber(num)
{
	return num.toLocaleString();
}

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
	let max_len =0;
	let prev =undefined;
	history.forEach((elem)=>{
		if(prev)
			max_len = Math.max(max_len,`${formatNumber(elem.points-prev.points)}`.length);
		prev = elem;
	});
	prev =undefined;
	history.forEach((elem)=>{
		let diff = "";
		if(prev)
			diff = `${formatNumber(elem.points-prev.points)}`;
		while(diff.length<max_len)
		{
			diff = ' '+diff;
		}
		result= `${formatNumber(elem.points)} (+${diff}) [${elem.time}]\n${result}`;
		prev = elem;
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
	return `Rank Tier[${tier}] (${tierMap[tier]}): ${formatNumber(GetLatestTierScore(recordsTable,tier))}`;
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
