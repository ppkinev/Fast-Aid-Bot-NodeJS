console.logger('Init: Files Caching');

var DB = require('./db');

var useDB = function(callback){
    DB.client.connect(DB.url, function(err, db){
        DB.test.equal(null, err);
        var collection = db.collection('cached-files');
        if (callback) callback(db, collection);
    });
};

var cacheFile = function(name, path, id, callback){
    var file = {
        name: name,
        path: path,
        id: id
    };
    useDB(function(db, collection){
        collection.updateOne({'name': name}, file, {'upsert': true, 'w': 1},
            function(err, docs){
                DB.test.equal(null, err);
                if (docs.result.ok) {
                    console.logger(file['name'] + ' was added/updated');
                    if (callback) callback(file['id']);
                }
            }
        );
    });
};

var getFileId = function(name, callback){
    useDB(function(db, collection){
        var file;
        collection.find({'name': name}).toArray(function(err, docs){
            DB.test.equal(null, err);
            file = docs.length > 0 ? docs[0]['id'] : null;
            if (file) console.logger(name, ' cached file was found and used');
            else console.logger(name, ' cached file wasn\'t found');

            if (callback) callback(file);
            db.close();
        });
    });
};


module.exports = {
    getFileId: getFileId,
    cacheFile: cacheFile
};