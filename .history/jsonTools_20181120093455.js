

function validateJson(jsonObj){
	for (var i in jsonObj){
		var date = jsonObj[i]['Date'];
		if (date.includes('/') != -1){
			jsonObj[i]['Date'] = formatDate(new Date(date));
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
  console.log('current result = ' + JSON.stringify(result));
  return JSON.stringify(result); 
}

function formatForDataflow(jsonObj, delim){
	for (var i in jsonObj){
		lines += JSON.stringify(jsonObj[i]) + delim;
	}
	return lines;
}

module.exports = {
    csvJSON,
    formatDate,
	validateJson,
	formatForDataflow,
}