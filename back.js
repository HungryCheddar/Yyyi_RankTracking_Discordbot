

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
function GetLatestTierScore(tier)
{
	return 0;
}

//END
function GetCurrentScore(tier)
{
	if(tier ===undefined)
	{
		let result = "Scores:";
		for(let i=0;i<tierList.length;++i)
			 result = `${result}\n${GetCurrentScore(i)}`;
		return result;
	}
	if(!tierMap[tier])
		throw `invalid tier.`;
	return `Rank Tier[${tier}] (${tierMap[tier]}): ${GetLatestTierScore(tier)}`;
}
function GetScoreHistory(tier)
{
	if(tier ===undefined)
	{
		let result = "Scores:";
		for(let i=0;i<tierList.length;++i)
			 result = `${result}\n${GetScoreHistory(i)}`;
		return result;
	}
	if(!tierMap[tier])
		throw `invalid tier.`;
	return `Rank Tier[${tier}] (${tierMap[tier]}): not-implemented`;
}

module.exports = {
	tierMap:tierMap,
	tierList:tierList,
	GetLatestTierScore:GetLatestTierScore,
	GetCurrentScore,GetCurrentScore,
	GetScoreHistory,GetScoreHistory,
}
