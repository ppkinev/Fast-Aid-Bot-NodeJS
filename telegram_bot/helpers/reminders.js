console.logger('Init: Reminders');
var DB = require('./db');
var Message = require('./messaging');
var sendMessage = require('./send-messages');
var str = require('./string-constants');
var utils = require('./utils');

(function () {
	DB.client.connect(DB.url, function (err, db) {
		DB.test.equal(null, err);

		db.collection('users').find({'actions.replyAllowed': false}).toArray(function (err, docs) {
			DB.test.equal(null, err);
			if (docs.length > 0) {
				docs.forEach(function (user) {
					Message.dialogQueue(user);
				});
			}
			console.logger('Bot was relaunched, users renewed dialogs - ' + docs.length);
			db.close();
		});
	});
})();

var remindersInterval = 30 * 60 * 1000;
var reminderGaps = [
	2 * 60 * 1000,
	6 * 60 * 1000,
	18 * 60 * 60 * 1000
];

var sendReminder = function (user, type) {
	if (!user.reminders.active) user.reminders.active = 0;
	if (!user.reminders.overall) user.reminders.overall = 0;
	DB.dbUsers(function (db, collection) {
		collection.updateOne({'_id': user['_id']},
			{'$inc': {'reminders.overall': 1, 'reminders.active': 1}},
			function () {
				console.logger(user['_id'] + ' - reminder was sent ' + type + ' (' + (user.reminders.active + 1) + ')');
				db.close();
			}
		);
	});
	if (user.progress.answer) {
		sendMessage.send({
			id: user['_id'],
			chapter: user.progress.game,
			answer: user.progress.answer,
			text: utils.getRandomItem(str.reminders[user.progress.game], user.name.first),
			speaker: user.speaker,
			type: 'text',
			lastLine: true
		});
	}
};

//
// setInterval(function () {
//
// 	DB.dbUsers(function (db, collection) {
// 		collection.find({
// 			'actions.replyAllowed': true,
// 			'lastSeen': {'$lt': utils.getNow() - reminderGaps[0]}
// 		}).toArray(function (err, docs) {
// 			DB.test.equal(null, err);
// 			if (docs.length > 0) {
// 				docs.forEach(function (user) {
// 					if (user.lastSeen < utils.getNow() - reminderGaps[2]) {
// 						if (user.lastSeen < utils.getNow() - (reminderGaps[2] * (user.reminders.active - 1))) {
// 							sendReminder(user, 'longest');
// 						}
// 					} else if (user.lastSeen < utils.getNow() - reminderGaps[1]) {
// 						if (user.reminders.active === 1) {
// 							sendReminder(user, 'middle');
// 						}
// 					} else {
// 						if (user.reminders.active === 0) {
// 							sendReminder(user, 'first');
// 						}
// 					}
// 				});
// 				console.logger(docs.length + ' users can potentially get the reminder depending on the absence time');
// 			} else {
// 				console.logger('All users are active no need for reminders');
// 			}
// 			db.close();
// 		});
// 	});
//
// }, remindersInterval);


module.exports = {
	send: sendReminder
};