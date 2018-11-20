
var fs = require('fs');

function validateJson(jsonObj){
	for (var i in jsonObj){
		var date = jsonObj[i]['Date\r'];
		if (date.includes('/') != -1){
			jsonObj[i]['Date'] = formatDate(new Date(date));
			delete jsonObj[i]['Date\r'];
		}
	}
	console.log('validated json object, contains ' + jsonObj.length + ' items');
	return jsonObj;
}

function formatDate(date) {
	var d = new Date(date),
		month = '' + (d.getMonth() + 1),
		day = '' + d.getDate(),
		year = d.getFullYear();

	if (month.length < 2) month = '0' + month;
	if (day.length < 2) day = '0' + day;

	return [year, month, day].join('-');
}

function csvJSON(csv){
  var lines=csv.split("\n");
  var result = [];
  var headers=lines[0].split(",");
  for(var i=1;i<lines.length;i++){
	  var obj = {};
	  
	  var currentline=lines[i].split(",");
	  for(var j=0;j<headers.length;j++){
		  obj[headers[j]] = currentline[j];
	  }
	  result.push(obj);
  }
  console.log('csvJSON convert result: \n' + JSON.stringify(result));
  return JSON.stringify(result); 
}

function formatForDataflow(jsonObj, delim){
	var lines = '';
	for (var i in jsonObj){
		lines += JSON.stringify(jsonObj[i]) + delim;
	}
	return lines;
}

async function randomizeData(jsonObj){
	
	for (var record in jsonObj){
		var singleRecord = jsonObj[record];
		var changedRecords = [];
		console.log('original data: ' + JSON.stringify(singleRecord, null, 1));
		for (var i = 1; i <=24; i++){
			singleRecord.Hours_Sleep = (Math.random() * (6 - 9) + 8).toFixed(0);
			singleRecord.Calories_Consumed = (Math.random() * (1200 - 100) + 1000).toFixed(0);
			singleRecord.Exercise_Calories_Burned = (Math.random() * (700 - 100) + 400).toFixed(0);
			var year = singleRecord.Date.substr(0,4);
			var month = (Math.random() * (12 - 1) + 1).toFixed(0);
			var month_str = (month.length == 2) ? month : "0" + month;
			var date = (Math.random() * (28 - 1) + 1).toFixed(0);
			var date_str = (date.length == 2) ? date : "0" + date;
			singleRecord.Date = year + "-" + month_str + "-" + date_str;
			console.log(i + ': pushing ' + JSON.stringify(singleRecord, null, 1));
			changedRecords.push(singleRecord);
		}
		await fs.writeFileSync('Mock_' + i + singleRecord.First_Name + singleRecord.Last_Name + '.json', JSON.stringify(changedRecords, null, 1), 'utf8', function (err) {
			if (err)  return console.log(err);
			console.log('randomized data: ' + JSON.stringify(changedRecords, null, 1));
		});
	}
}

module.exports = {
    csvJSON,
    formatDate,
	validateJson,
	formatForDataflow,
	randomizeData,
}