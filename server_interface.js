let http = require("http");


module.exports = {
	GetRecords:GetRecords,
	SetDataPage:SetDataPage,
	GetDataPage:GetDataPage,
	SetRecordServer:SetRecordServer,
	GetRecordServer:GetRecordServer,
};

async function HttpRequest(options,postData)
{
	return new Promise((resolve,reject)=>{
		let result_str = "";
		let req =http.request(options,(res)=>{ 
			console.log(res.statusCode);
			res.setEncoding('utf8');
			res.on('data', (chunk) => {
			result_str += chunk;
			});
			res.on("error",reject);		
			//Schedule a callback for when we have received all the data in result_str
			res.on('end', () => {
				console.log("Received Data: "+result_str);
				let result = {};
				try{
					result = JSON.parse(result_str);
				}catch(error)
				{
					reject(error);
					return;
				}
				resolve(result);
			});
		});
		req.on("error",reject);

		if(postData)
			req.write(postData);
		
		req.end();
	});
}

async function PostHttpRequest(options,postData)
{
	return new Promise((resolve,reject)=>{
		let result_str = "";
		let req =http.request(options,(res)=>{ 
			console.log(res.statusCode);
			res.on('data', (chunk) => {
			result_str += chunk;
			});
			res.on("error",reject);		
			//Schedule a callback for when we have received all the data in result_str
			res.on('end', () => {
				console.log("Received Data: "+result_str);
				let result = {};
				try{
					result = JSON.parse(result_str);
				}catch(error)
				{
					reject(error);
					return;
				}
				resolve(result);
			});
		});
		req.on("error",reject);

		if(postData)
			req.write(postData);
		
		req.end();
	});
}
let recordHost = {
	hostname:"localhost",port:3000
};

async function GetRecords()
{
	let options ={hostname:recordHost.hostname,port:recordHost.port,path: "/records",method:"GET"};
	return HttpRequest(options);
}
async function SetDataPage(url)
{
	let data =JSON.stringify({url:url});
	let options ={hostname:recordHost.hostname,port:recordHost.port,path: "/data_url",method:"POST",headers:{
		'Content-Type':'application/json',
		'Content-Length':data.length
	}};
	return HttpRequest(options,data);
}
async function GetDataPage()
{
	let options ={hostname:recordHost.hostname,port:recordHost.port,path: "/data_url",method:"GET"};
	return HttpRequest(options);
}
function SetRecordServer(newRecordHost)
{
	recordHost = newRecordHost;
}
function GetRecordServer()
{
	return recordHost;
}