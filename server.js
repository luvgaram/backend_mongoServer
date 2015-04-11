var http = require('http'); 
var route = require('./route.js');   
var util = require('util'),
    path = require('path'),
    url = require('url'),
    fs = require('fs'),
    mime = require('mime'),
    querystring = require('querystring');
var formidable = require('formidable');
var UPLOAD_FOLDER = "./upload/"

function onRequest(req, res) { 

    var body = '';   
    var form;

	req.on('data', function(chunk) {
        body += chunk;
    });

	if (req.url == '/memo' && req.method.toUpperCase() == 'POST') {
		form = new formidable.IncomingForm();
		route.route(req, res, form);
	}

	else {
		req.on('end', function() {
			route.route(req, res, body);
		});
	}

}   
var server = http.createServer(onRequest); 
server.listen(8080); 