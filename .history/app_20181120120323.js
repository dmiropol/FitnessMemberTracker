
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , path = require('path')
  , bodyParser = require('body-parser')
  , storage = require('./storage')
  , fs = require('fs')
  , jsonTools = require('./jsonTools');

  
var app = express();

// all environments
app.set('port', process.env.PORT || 8080);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));


function index(req, res){
	res.render('index', {title: 'Fitness Tracker for Health Club'});
}

function member(req, res){
	res.render('member', {title: 'Member area'});
}

function uploadRecord(req, res){
	res.render('uploadRecord');
}

function staff(req, res){
	res.render('staff', {title: 'Health Club staff area'});
}

function reportsAction(req, res){
	var action = req.params.action;
	res.render('reportsaction', {action: action});
}


async function getRecordsList(req, res, next){
	var files = await storage.listFiles();
	var recordsList = [];
	for (var i in files) {
		var record = {};
		record.name = files[i].metadata.name;
		record.bucket = files[i].metadata.bucket;
		record.size = files[i].metadata.size;
		recordsList.push(record);
	};
	req.body = {recordsList};
	next();
}

function listRecords(req, res){
	var recordsList = req.body.recordsList;
	res.render('listRecords', {records: recordsList, action: 'show'});
}

async function uploadRecords(req, res){
	
	var req_body = req.body.req_body;
	
	if (req.params.record.endsWith('.csv')){
		jsonObj = jsonTools.validateJson(JSON.parse(jsonTools.csvJSON(req_body)));
	} else {
		jsonObj = jsonTools.validateJson(req_body);
	}
	
	var fileName = req.params.record + '.json';
	var lines = jsonTools.formatForDataflow(jsonObj, "\n");
	console.log('Formatted for Dataflow ' + fileName);
	fs.writeFileSync(fileName, lines, 'utf8', function (err) {
	    if (err)  return console.log(err);
	    console.log(fileName + ' Formatted for Dataflow and stored locally... uploading to storage.')
	}); 
	await storage.uploadFile(fileName);
	fs.unlink(fileName, function (err) {
	    if (err)  return console.log(err);
	    console.log(fileName + ' locally deleted.')
	});
	res.render('actionconfirm', { action: 'Upload', record: storage.getPrivateUrl(fileName)});
}

function randomData(req, res){
	var iterator = req.params.iterator;
	var req_body = req.body.req_body;
	
	if (req.params.record.endsWith('.csv')){
		jsonObj = jsonTools.validateJson(JSON.parse(jsonTools.csvJSON(req_body)));
	} else {
		jsonObj = jsonTools.validateJson(req_body);
	}
	jsonTools.randomizeData(jsonObj, iterator);
	res.render('actionconfirm', { action: 'Randomize' });
}

function dataRandomizer(req, res){
	res.render('dataRandomizer');
}



function deleteRecords(req, res){
	var recordsList = req.body.recordsList;
	res.render('listrecords', { records: recordsList, action: 'delete'});
}

async function deleteFile(req, res, next){
	await storage.deleteFile(req.params.fileName);
	res.render('actionconfirm', { action: 'Delete', record: req.params.fileName});
}

async function showFile(req, res, next){
	var destFile = './temp.txt';
	var srcFile = req.params.fileName;
	await storage.downloadFile(srcFile, destFile);
	
	var content = fs.readFileSync(destFile, 'utf-8');
	fs.unlink(destFile, function (err) {
	    if (err)  return console.log(err);
	    console.log(destFile + ' locally deleted.')
	});
	res.render('actionconfirm', { action: 'Show', record: srcFile, content: content});
}




app.get('/', index);
app.get('/member', member);
app.get('/staff', staff);
app.get('/list/records', getRecordsList, listRecords);
app.get('/show/records/:fileName', showFile);
app.get('/upload/records', uploadRecord);
app.post('/upload/records/:record', uploadRecords);
app.get('/delete/records', getRecordsList, deleteRecords);
app.get('/delete/records/:fileName', deleteFile);

app.get('/reports/:action', reportsAction);
app.get('/extras/randomData/:iterator', randomData);
app.get('/extras/dataRandomizer', dataRandomizer);


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
