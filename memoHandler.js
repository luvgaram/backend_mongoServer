/** memoHandler.js **/   

var mongodb = require('mongodb');
var server = new mongodb.Server('localhost', 27017, {});
var db = new mongodb.Db('mydatabase', server, {
    w: 1
});

var http = require('http'),
    util = require('util'),
    path = require('path'),
    url = require('url'),
    fs = require('fs'),
    mime = require('mime'),
    querystring = require('querystring'),
    formidable = require('formidable');

var UPLOAD_FOLDER = "./upload/"

exports.create = function(req, res, form) { 

    var files = [],
        fields = [],
        resultPaths = [];

    console.log("execute !! upload folder ")
    form.uploadDir = UPLOAD_FOLDER;
    form.keepExtensions = true;
    form.multiple="multiple"; // ej
    form
        .on('field', function(field, value) {
            console.log(field, value);
            fields.push([field, value]);
        })
        .on('file', function(field, file) {
            console.log(field, file);
            files.push([field, file]);
        })
        .on('progress', function(bytesReceived, bytesExpected) {
            console.log('progress: ' + bytesReceived + '/' + bytesExpected);
        })
        .on('end', function() {
            console.log('-> upload done');
            console.log('parse - ' + JSON.stringify(files));
            var memo = {}

            for (var e in files) {
                resultPaths.push(files[e][1].path);
            }

            console.log('author - ' + JSON.stringify(fields[0][1]));

            var check;

            for (var e in fields) {
                if (fields[e][0] == "author") memo.author = fields[e][1];
                else if (fields[e][0] == "memo") memo.memo = fields[e][1];
            }

            memo.date = new Date();
            memo.file = resultPaths

            console.log('memo - ' + JSON.stringify(memo));

            //mongodb only
            db.open(function(err) {
                if (err) throw err;
                db.collection('memo').insert(memo, function(err, inserted) {
                    if (err) throw err;
                    console.dir("successfully inserted: " + JSON.stringify(inserted));
                    db.close();
                });
            });
        });

    form.parse(req, function(err, fields, files) {

        res.writeHead(200, {
            'content-type': 'application/json'
        });

        res.end(JSON.stringify(resultPaths));
    });

};  


exports.read = function(req, res, body) { 


    var query = url.parse(req.url).query;

    console.log('query : ' + query);

    var vpath = querystring.parse(query)['path'];
    console.log('vpath : ' + typeof vpath);

    if (typeof vpath !== 'undefined') {

        console.log(vpath);

        fs.readFile(UPLOAD_FOLDER + vpath, function(err, data) {

            if (err) {
                res.writeHead(404, {
                    'content-type': 'text/plain'
                });
                res.end('404');
            }

            res.writeHead(200, {
                'Content-Type': 'image/png'
            });
            res.end(data);

        });

    } else {
        _findMemo({}, function(error, results) { 
            res.writeHead(200, {
                "Content-Type": "application/json"
            }); 
            res.write(JSON.stringify(results)); 
            res.end(); 
        }); 
    }
};  

exports.update = function(req, res, body) { 
    var query = url.parse(req.url).query; 
    var where = querystring.parse(query);  

    console.log(where);
    console.log(body);

    _updateMemo(where, body, function(error, results) { 
        res.writeHead(200, {
            "Content-Type": "application/json"
        }); 
        res.write('{"type": "updatememo"}'); 
        res.end(); 
    }); 
};  

exports.remove = function(req, res, body) { 
    var query = url.parse(req.url).query; 
    var where = querystring.parse(query);  

    console.log(where);
    console.log(body);
   
    _removeMemo(where, function(error, results) { 
        res.writeHead(200, {
            "Content-Type": "application/json"
        }); 
        res.write('{"type": "removememo"}'); 
        res.end(); 
    }); 
};   

function _insertMemo(body, callback) { 
    body = typeof body === 'string' ? JSON.parse(body) : body;  
    var memo = { 
        author: body.author,
         memo: body.memo,
         date: new Date() 
    };  

    //mongodb only
    db.open(function(err) {
        if (err) throw err;
        db.collection('memo').insert(memo, function(err, inserted) {
            if (err) throw err;
            console.dir("successfully inserted: " + JSON.stringify(inserted));
            db.close();
            callback();
        });
    });
}   

function _findMemo(where, callback) { 
    where = where || {} ;
    
    db.open(function(err) {
        if (err) throw err;
        console.log("where " + where.toString());
        db.collection('memo').find(where).toArray(function(err, docs) {
            console.dir(docs);
            db.close();
            callback(null, docs);
        });
    });
    
} 

function _updateMemo(where, body, callback) { 

    body = typeof body === 'string' ? JSON.parse(body) : body;

    db.open(function(err) {
        if (err) throw err;

        db.collection('memo').update(where, {
            $set: body
        }, {
            multi: true
        }, function(err, updated) {
            if (err) throw err;
            console.dir("Successfully updated " + updated + " document!");
            db.close();
            callback();
        });
    });
}  

function _removeMemo(where, callback) { 
    db.open(function(err) {
        if (err) throw err;

        db.collection('memo').remove(where, {
            multi: true
        }, function(err, removed) {

            if (err) throw err;
            console.dir("Successfully deleted " + removed + " documents!");
            db.close();
            callback();
        });
    });
}