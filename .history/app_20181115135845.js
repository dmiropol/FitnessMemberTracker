
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
app.use(bodyParser.urlencoded({ extended: true }));

function index(req, res){
	res.render('index', {title: 'Fitness Tracker for Health Club'});
}

function member(req, res){
	res.render('member', {title: 'Member area'});
}

function uploadRecord(req, res){
	res.render('uploadRecord');
}

function club(req, res){
	res.render('club', {title: 'Health Club area'});
}


async function listRecords(req, res, next){
	var files = await storage.listFiles();
	var action = req.params.action;
	var recordsList = [];
	for (var i in files) {
		var record = {};
		record.name = files[i].metadata.name;
		record.bucket = files[i].metadata.bucket;
		record.size = files[i].metadata.size;
		recordsList.push(record);
	};
	next();
}

function listRecordsAction(req, res){
	var recordsList = req.body.recordsList;
	var action = recordsList.action;
	res.render('listRecords', {records: recordsList, action: action});
}

async function uploadRecords(req, res){
	var fileName = req.params.record + '.json';
	var jsonObj = JSON.parse(req.body.JSONbody);
	var lines = '';
	
	for (var i in jsonObj){
		lines += JSON.stringify(jsonObj[i]) + '\n';
	}
	console.log('Got ' + req.method + ' request to store ' + fileName + 
				' content into ' + lines.length + ' lines');
	fs.writeFile(fileName, lines, 'utf8', function (err) {
	    if (err)  return console.log(err);
	    console.log(fileName + ' locally added and will be uploaded to storage.')
	}); 
	await storage.uploadFile(fileName);
	fs.unlink(fileName, function (err) {
	    if (err)  return console.log(err);
	    console.log(fileName + ' locally deleted.')
	});
	res.render('actionconfirm', { action: 'Upload', record: storage.getPrivateUrl(fileName)});
}

function deleteRecords(req, res){
	res.render('listrecords', { action: 'Delete'});
}

async function deleteFile(req, res, next){
	await storage.deleteFile(req.params.fileName);
	next();
}

app.get('/', index);
app.get('/member', member);
app.get('/club', club);
app.get('/list/records', listRecords);
app.get('/upload/records', uploadRecord);
app.post('/upload/record/:record', uploadRecords);
app.get('/delete/records', deleteRecords);
app.get('/delete/record/:fileName', deleteFile, listRecords);


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
