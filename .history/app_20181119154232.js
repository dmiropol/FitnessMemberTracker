
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , path = require('path')
  , bodyParser = require('body-parser')
  , storage = require('./storage')
  , fs = require('fs');

  
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
	var fileName = req.params.record + '.json';
	var jsonObj = JSON.parse(req.body.JSONbody);
	var lines = '';
	
	for (var i in jsonObj){
		lines += JSON.stringify(jsonObj[i]) + '\n';
	}
	console.log('Got ' + req.method + ' request to store ' + fileName);
	fs.writeFileSync(fileName, lines, 'utf8', function (err) {
	    if (err)  return console.log(err);
	    console.log(fileName + ' locally added and will be uploaded to storage.')
	}); 
	// await storage.uploadFile(fileName);
	randomizeData(jsonObj);
	fs.unlink(fileName, function (err) {
	    if (err)  return console.log(err);
	    console.log(fileName + ' locally deleted.')
	});
	res.render('actionconfirm', { action: 'Upload', record: storage.getPrivateUrl(fileName)});
}

function randomizeData(jsonObj){
	
	for (var i in jsonObj){
		var singleRecord = jsonObj[i];
		console.log('original data: ' + JSON.stringify(singleRecord, null, 1));
		//var random = ;
		singleRecord.Hours_Sleep = (Math.random() * (6 - 9) + 8).toFixed(0);
		singleRecord.Calories_Consumed = (Math.random() * (1000 - 100) + 1000).toFixed(0);
		singleRecord.Exercise_Calories_Burned = (Math.random() * (500 - 100) + 400).toFixed(0);
		console.log('randomized data: ' + JSON.stringify(singleRecord, null, 1));
		//singleRecord.Date = 
		// Hours_Sleep,Calories_Consumed,Exercise_Calories_Burned,Date

	}
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

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
