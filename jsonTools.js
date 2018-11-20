
var fs = require('fs');

function validateJson(jsonObj){
	for (var i in jsonObj){
		var date = (jsonObj[i].hasOwnProperty('Date')) ? jsonObj[i]['Date'] : jsonObj[i]['Date\r'];			
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
  // console.log('csvJSON convert result: \n' + JSON.stringify(result));
  return JSON.stringify(result); 
}

function formatForDataflow(jsonObj, delim){
	var lines = '';
	for (var i in jsonObj){
		lines += JSON.stringify(jsonObj[i]) + delim;
	}
	return lines;
}

function getRandomIntInclusive(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive 
}

function randomizeData(jsonObj, srcFile, iter, fileSelector){
	var allRecords = [];
	var fileName = '';
	var fileContent = '';
	for (var record in jsonObj){
		var singleRecord = jsonObj[record];
		var changedRecords = [];
		for (var i = 0; i < iter; i++){
			singleRecord.Hours_Sleep = getRandomIntInclusive(6,9).toFixed(0);
			singleRecord.Calories_Consumed = getRandomIntInclusive(1000, 2000).toFixed(0);
			singleRecord.Exercise_Calories_Burned = getRandomIntInclusive(400, 1000).toFixed(0);
			var year = singleRecord.Date.substr(0,4);
			var month = (Math.random() * (12 - 1) + 1).toFixed(0);
			var month_str = (month.length == 2) ? month : "0" + month;
			var date = (Math.random() * (28 - 1) + 1).toFixed(0);
			var date_str = (date.length == 2) ? date : "0" + date;
			singleRecord.Date = year + "-" + month_str + "-" + date_str;
			if (fileSelector == 'individual'){
				changedRecords.push(JSON.parse(JSON.stringify(singleRecord)));
			}
			allRecords.push(JSON.parse(JSON.stringify(singleRecord)));			
		}
		if (fileSelector == 'individual'){
			fileName = 'Mock_' + srcFile + "_" + iter + "_" + singleRecord.First_Name + singleRecord.Last_Name + '.json';
			fileContent = JSON.stringify(changedRecords, null, 1);
			fs.writeFile(fileName, fileContent, 'utf8', function (err) {
				if (err)  return console.log(err);  
				console.log('individual data saved to: ' + fileName);
			});
		}
	}
	if (fileSelector == 'aggregate'){
		fileName = 'Mock_' + srcFile + '_aggregate_' + iter + '.json';
		fileContent =  JSON.stringify(allRecords, null, 1);
		fs.writeFile(fileName, fileContent, 'utf8', function (err) {
			if (err)  return console.log(err);  
			console.log('aggregate data saved to: ' + fileName);
		});
	} 
	return allRecords;
}

module.exports = {
    csvJSON,
    formatDate,
	validateJson,
	formatForDataflow,
	randomizeData,
}