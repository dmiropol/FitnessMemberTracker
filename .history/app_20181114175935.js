
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
	//res.redirect('import');
}

function member(req, res){
	res.render('member');
}

async function dataRecord(req, res){
	var fileName = req.params.record + '.json';
	var jsonObj = JSON.parse(req.body.JSONbody);
	var lines = '';
	
	for (var i in jsonObj){
		lines += JSON.stringify(jsonObj[i]) + '\n';
	}
	console.log('Got ' + req.method + ' request to store ' + fileName + ' content into lines \n' +  lines);
	fs.writeFile(fileName, lines, 'utf8', function (err) {
	    if (err)  return console.log(err);
	    console.log(fileName + ' locally added.')
	}); 
	await storage.uploadFile(fileName);
	fs.unlink(fileName, function (err) {
	    if (err)  return console.log(err);
	    console.log(fileName + ' locally deleted.')
	});
	res.render('dataRecord', {gcsfile: storage.getPrivateUrl(fileName)});
}

function customer(req, res){
	res.render('customer', {title: 'Health Club'});
}

async function records(req, res){
	var files = await storage.listFiles();
	var recordsList = [];
	for (var i in files) {
		var record = {};
		record.name = files[i].metadata.name;
		record.bucket = files[i].metadata.bucket;
		record.size = files[i].metadata.size;
		recordsList.push(record);
	};
	res.render('records', {records: recordsList});
}

async function recordsDelete(req, res){
	var files = await storage.listFiles();
	var recordsList = [];
	for (var i in files) {
		var record = {};
		record.name = files[i].metadata.name;
		record.bucket = files[i].metadata.bucket;
		record.size = files[i].metadata.size;
		recordsList.push(record);
	};
	res.render('recordsdelete', {records: recordsList});
}

async function deleteFile(req, res, next){
	
	await storage.deleteFile(req.params.fileName);
	next();
}

app.get('/', index);
app.get('/member', member);
app.get('/customer', customer);
app.post('/dataRecord/:record', dataRecord);
app.get('/records/delete', recordsDelete);
app.get('/records', records);
app.get('/delete/:fileName', deleteFile, records);



http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
