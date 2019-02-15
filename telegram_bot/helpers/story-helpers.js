console.logger('Init: Story Helpers');

var utils = require('./utils');
var messaging = require('./send-messages');
var DBUsers = require('./db').dbUsers;
var Scheduler = require('./user-scheduler');
var str = require('./string-constants');

var numpadStickers = {
	terminal: 'BQADAgADaQADtO0FAAGtOPu70XoenwI',
	0: 'BQADAgADSAADtO0FAAGjKAUaJHMqBwI',
	1: 'BQADAgADSgADtO0FAAF6zTkUWk08sQI',
	2: 'BQADAgADTAADtO0FAAFEblVhwp4EOgI',
	3: 'BQADAgADTgADtO0FAAGhokCpq6ng3gI',
	4: 'BQADAgADUAADtO0FAAFc4-qcWWzOlgI',
	5: 'BQADAgADUgADtO0FAAFSCL1bfIsiawI',
	6: 'BQADAgADVAADtO0FAAFXQBXCVknS3gI',
	7: 'BQADAgADWAADtO0FAAG1PmFxpxWUzQI',
	8: 'BQADAgADWgADtO0FAAEko2sKaHCj5AI',
	9: 'BQADAgADXAADtO0FAAHxM-FlD0bgAgI',
	first: 'BQADAgADYQADtO0FAAE8T5seWsHduQI',
	second: 'BQADAgADYwADtO0FAAHqzUcfpkrOaAI',
	third: 'BQADAgADZQADtO0FAAEVhtitHJ0ElgI',
	fourthFail: 'BQADAgADZwADtO0FAAGlPJ_nb-ym6AI',
	fourthSuccess: 'BQADAgADawADtO0FAAEIFgnHDjJHAQI'
};

function checkAllaNumberOnInput(curUser, input) {
	if (isNaN(Number(input))) {
		sendMessageWrongInput(utils.getRandomItem(str.numpadInputs.notIntegerInput, curUser.name.first), curUser);
		return 'stop-main-dialogs';
	}

	curUser.progress.guideNumberTry += input;
	var codeTry = curUser.progress.guideNumberTry;

	if (codeTry.length < 4) {
		DBUsers(function (db, collection) {
			collection.updateOne({'_id': curUser['_id']},
				{'$set': {'progress.guideNumberTry': codeTry}},
				function (res) {
					console.logger(curUser['_id'] + ' alla code update "' + codeTry + '"');
				}
			);
		});
		allaCodes(curUser);
		return 'stop-main-dialogs';
	} else {
		// Cleaning number in user profile
		DBUsers(function (db, collection) {
			collection.updateOne({'_id': curUser['_id']},
				{'$set': {'progress.guideNumberTry': ''}},
				function (res) {
					console.logger(curUser['_id'] + ' alla code reset');
				}
			);
		});
		if (codeTry.length > 4) {
			sendMessageWrongInput(utils.getRandomItem(str.numpadInputs.longInput, curUser.name.first), curUser);
			return 'stop-main-dialogs';
		} else {
			if (allaCodesCheck(curUser)) {
				messaging.send({
					id: curUser['_id'],
					answer: {
						type: 'numpad',
						choices: null
					},
					sticker: numpadStickers.fourthSuccess,
					speaker: 'alla',
					type: 'sticker',
					lastLine: true
				});
				return 'Алла код - правильный ответ';
			} else {
				return 'Алла код - неправильный ответ';
			}
		}
	}
}

var allaCodes = function (user) {
	var text;
	switch (user.progress.guideNumberTry.length) {
		case 1:
			text = '<b>Код: ' + user.progress.guideNumberTry + ' _ _ _ </b>\nПервая есть, давай дальше';
			break;
		case 2:
			text = '<b>Код: ' + user.progress.guideNumberTry + ' _ _ </b>\nХорошо, вторая на месте, что дальше?';
			break;
		case 3:
			text = '<b>Код: ' + user.progress.guideNumberTry + ' _ </b>\nХехе, мы почти у цели, последняя?';
			break;
	}

	sendMessageWrongInput(text, user);
};

var allaCodesCheck = function (user) {
	return user.progress.guideNumberTry == user.progress.guideNumber;
};

var sendMessageWrongInput = function (text, user) {
	Scheduler.add({
		delay: 2, uid: user['_id'], event: function () {
			messaging.send({
				id: user['_id'],
				answer: {
					type: 'numpad',
					choices: null
				},
				text: text,
				speaker: 'alla',
				type: 'text',
				lastLine: true
			});
		}
	});
};

var needToLeave = {
	leave: function (user) {
		Scheduler.add({
			delay: 2, uid: user['_id'], event: function () {
				messaging.send({
					id: user['_id'],
					answer: {
						type: 'default',
						choices: [
							{
								message: str.needToLeave.cameBack
							}
						]
					},
					text: utils.getRandomItem(str.needToLeave.leaveReplies),
					speaker: 'eva',
					type: 'text',
					lastLine: true
				});
			}
		});
		return 'stop-main-dialogs';
	},
	cameBack: function (user) {
		Scheduler.add({
			delay: 2, uid: user['_id'], event: function () {
				messaging.send({
					id: user['_id'],
					answer: user['progress']['answer'],
					text: utils.getRandomItem(str.needToLeave.cameBackReplies),
					speaker: 'eva',
					type: 'text',
					lastLine: true
				});
			}
		});
		return 'stop-main-dialogs';
	}
};



module.exports = {
	allaCodes: allaCodes,
	allaCodesCheck: allaCodesCheck,
	checkAllaNumberOnInput: checkAllaNumberOnInput,
	needToLeave: needToLeave
};