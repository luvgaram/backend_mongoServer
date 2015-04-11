/** memoHandler.js **/   

var mongodb = require('mongodb');

var server = new mongodb.Server('localhost', 27017, {});
var db = new mongodb.Db('mydatabase', server, {
    w: 1
});
var querystring = require('querystring'); 
var url = require('url');   


exports.create = function(req, res, body) { 
    _insertMemo(body, function(error, result) { 
        res.writeHead(200, {
            "Content-Type": "application/json"
        }); 
        res.write('{"type": "creatememo"}'); 
        res.end(); 
    }); 
};  


exports.read = function(req, res) { 
    _findMemo({}, function(error, results) { 
        res.writeHead(200, {
            "Content-Type": "application/json"
        }); 
        res.write(JSON.stringify(results)); 
        res.end(); 
    }); 
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
    where = where || {} 
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