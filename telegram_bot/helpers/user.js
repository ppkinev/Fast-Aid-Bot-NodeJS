console.logger('Init: Users');

var DB = require('./db');
var utils = require('./utils');
var users = [];

var useDB = function(callback){
    DB.client.connect(DB.url, function(err, db){
        DB.test.equal(null, err);

        var collection = db.collection('users');
        if (callback) callback(db, collection);
    });
};


module.exports = {
    blueprint: function(user){
        return {
            _id: user['_id'],
            name: {
                first: user['first_name'] || '',
                last: user['last_name'] || ''
            },
            username: user['username'] || null,
            sex: user['sex'] || null,
            age: user['age'] || null,
            email: user['email'] || null,
            profile_pic: user['profile_pic'] || null,
            locale: user['locale'] || null,
            timezone: user['timezone'] || null,
            lastSeen: utils.getNow(),
            createdOn: utils.getNow(),
            reminders: {
                active: 0,
                overall: 0
            },
            progress: {
                media: {},
                game: 'file1',
                line: 0,
                guideNumber: String(utils.randomFixedInteger(4)),
                guideNumberTry: '',
                speaker: null,
                answer: null,
                miniGames: {
                    musicGuess: {
                        set: null,
                        songs: []
                    },
                    maniacGuess: [],
                    sendInRange: null
                },
                block: 'Start'
                // block: 'Вот им и подсвети себе'
            },
            actions: {
                replyAllowed: false,
                systemAllowed: false,
                canSkip: false
            }
        }
    },
    set: function(user, callback){
        user = this.blueprint(user);
        users.push(user);
        console.logger(user['_id'] + ' set user');
        console.logger(user['_id'] + ' set allaCode: ' + user['progress']['guideNumber']);
        useDB(function(db, collection){
            collection.insertOne(user, function(err, response){
                DB.test.equal(null, err);
                DB.test.equal(1, response.insertedCount);
                console.logger(user['_id'] + ' user was set successfully');

                if (callback && response) callback(response.ops[0]);
                db.close();
            });
        });
    },
    get: function(id, callback){
        var user;
        useDB(function(db, collection){
            collection.find({'_id': id}).toArray(function(err, docs){
                DB.test.equal(null, err);
                user = docs.length > 0 ? docs[0] : null;
                if (callback) callback(user);
                console.logger(user ? user['_id'] : null, ' get user result successfully');
                db.close();
            });
        });
    },
    update: function(user, callback){
        user.lastSeen = utils.getNow();
        useDB(function(db, collection){
            collection.updateOne({'_id': user['_id']}, user, {'upsert': true, 'w': 1}, function(err, docs){
                DB.test.equal(null, err);
                if (docs.result.ok) {
                    console.logger(user['_id'], ' user updated ', user.progress.block);
                    if (callback) callback(user);
                }
            });
        });
    },
    removeUser: function(id, callback) {
        useDB(function(db, collection) {
            collection.remove({'_id': id},
                function() {
                    if (callback) callback();
                    db.close();
                });
        });
    }
};