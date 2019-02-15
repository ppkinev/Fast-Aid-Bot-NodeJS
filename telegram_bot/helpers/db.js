console.logger('Init: MongoDB');

var config = require('../config');

var MongoClient = require('mongodb').MongoClient,
	assert = require('assert');
var url = 'mongodb://localhost:27017/' + config.platform + '-' + config.env;

var dbUsers = function (callback) {
	MongoClient.connect(url, function (err, db) {
		assert.equal(null, err);

		var collection = db.collection('users');
		if (callback) callback(db, collection);
	});
};

var dbGifs = function (callback) {
	MongoClient.connect('mongodb://localhost:27017/gif-links', function (err, db) {
		assert.equal(null, err);

		var collection = db.collection('gifs');
		if (callback) callback(db, collection);
	});
};

MongoClient.connect(url, function (err, db) {
	assert.equal(null, err);
	console.logger('Connected successfully to server');
	db.close();
});

module.exports = {
	client: MongoClient,
	test: assert,
	url: url,
	dbUsers: dbUsers,
	dbGifs: dbGifs
};