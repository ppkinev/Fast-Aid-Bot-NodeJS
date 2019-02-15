console.logger('Init: Sending Messages');

var Utils = require('./utils');
var bot = require('../bot');
var caching = require('./file-caching');
var config = require('../config');
var DBGifs = require('./db').dbGifs;
// var miniGames = require('./minigames');

var str = require('./string-constants');

var checkReplyLength = function (text) {
    var pattern = /==\/==/gmi;
    var result;
    text = text.trim();

    if (pattern.test(text)) {
        result = text.split(pattern);
        return {
            check: result[0],
            text: result[0] + '\n' + result[1]
        }
    }

    return {
        check: text,
        text: text
    };
};


var sendMessage = function (message, callback) {
    var keyboardType, keyboardMarkup;
    var cachingName;
    var answerLines = [];

    var LINK_RGXP = /(<a href.*<\/a>)/;

    if (message.text) {
        if (message.speaker === 'terminal') {
			LINK_RGXP.lastIndex = 0;
            if (LINK_RGXP.test(message.text)) {
                var link = LINK_RGXP.exec(message.text)[0];
				message.text = message.text.replace(LINK_RGXP, '');
				message.text = '<b>' + message.text + '</b>';
				message.text += link;
            } else {
				message.text = '<b>' + message.text + '</b>';
            }
        }
    }

    if (message.lastLine) {
        if (message.answer.type === 'numpad') {
            //keyboardType = [['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9'], ['0']];
            keyboardType = [[str.system.allaCode]];
        } else if (message.answer.type === 'system') {
            keyboardMarkup = {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: message.answer.choices[0]['message'],
                                callback_data: message.answer.choices[0]['block']
                            }
                        ]
                    ]
                }
            };
        } else if (message.answer.type === 'guess-music-block') {
			answerLines.push([str.miniGames.guessMusic.startGame]);
			keyboardType = answerLines;
        } else if (message.answer.type === 'guess-maniac-block') {
			answerLines.push([str.miniGames.guessManiac.startGame]);
			keyboardType = answerLines;
        } else if (message.answer.type === 'send-in-range-block') {
			answerLines.push([str.miniGames.sendInRange.startGame]);
			keyboardType = answerLines;
		} else {
            message.answer.choices.forEach(function (choice) {
                answerLines.push([checkReplyLength(choice.message).text]);
            });

            // if (message.answer.choices.length > 0
            //     && checkReplyLength(message.answer.choices[0].message).text !== str.needToLeave.cameBack
            //     && message.answer.type !== 'guess-music'
				// && message.answer.type !== 'guess-maniac'
				// && message.answer.type !== 'send-in-range'
            // ) {
            //     answerLines.push([str.needToLeave.leave]);
            // }
            keyboardType = answerLines;
        }
    } else {
        keyboardType = [];
        if (!message.status) {
			if (message.speaker === 'terminal') {
				keyboardType.push([str.isTyping.terminal]);
			} else if (message.speaker === 'alla') {
				keyboardType.push([str.isTyping.alla]);
			} else {
				keyboardType.push([str.isTyping.eva]);
			}
		} else {
			keyboardType.push([message.status]);
        }
        // if (message.canSkip) keyboardType.push([str.skipDelay]);
    }

    keyboardMarkup = !keyboardMarkup ? {
        parse_mode: 'HTML',
        reply_markup: {
            caption: message.caption,
            force_reply: false,
            keyboard: keyboardType,
            one_time_keyboard: false,
            resize_keyboard: true
        }
    } : keyboardMarkup;

    if (!message.lastLine) {
        keyboardMarkup['disable_notification'] = true;
    }

    function sendVideoDirect() {
        bot.sendVideo(message.id, message.video, keyboardMarkup).then(
            function (value) {
                caching.cacheFile(cachingName, message.video, value['video']['file_id']);
                if (callback) callback();
                bot.sendMessage(message.id, '<b>Видео отправлено</b>', keyboardMarkup);
            },
            function (reason) {
                var err = JSON.parse(/({.*})/.exec(reason)[1]);
                // console.log(err.description)
                if (callback) callback();
                console.log(err);
                bot.sendMessage(message.id, '<b>Ошибка при отправке видео</b> - ' + message.video, keyboardMarkup);
            }
        );
    }

    function sendPhotoDirect() {
        bot.sendPhoto(message.id, message.image, keyboardMarkup).then(
            function (value) {
                if (Object.prototype.toString.call(value['photo']) === '[object Array]') {
                    caching.cacheFile(cachingName, message.image, value['photo'][value['photo'].length - 1]['file_id']);
                } else {
                    caching.cacheFile(cachingName, message.image, value['photo']['file_id']);
                }
                if (callback) callback();
                bot.sendMessage(message.id, '<b>Фото отправлено</b>', keyboardMarkup);
            },
            function () {
                callback && callback();
                bot.sendMessage(message.id, '<b>Ошибка при отправке фото</b> - ' + message.image, keyboardMarkup);
            }
        );
    }

    function sendAudioDirect() {
        bot.sendVoice(message.id, message.audio, keyboardMarkup).then(
            function (value) {
                caching.cacheFile(cachingName, message.audio, value['voice']['file_id']);
                if (callback) callback();
                bot.sendMessage(message.id, '<b>Аудио отправлено</b>', keyboardMarkup);
            },
            function (err) {
                console.log(message.audio);
                console.log(err);
                callback && callback();
                bot.sendMessage(message.id, '<b>Ошибка при отправке аудио</b> - ' + message.audio, keyboardMarkup);
            }
        );
    }

    switch (message.type) {
        case 'text':
            bot.sendMessage(message.id, message.text, keyboardMarkup).then(
                function () {
                    callback && callback()
                },
                function () {
                    callback && callback()
                }
            );
            break;
        case 'link':
            sendLink({
                id: message.id,
                text: message.text,
                url: message.link,
                keyboard: keyboardMarkup,
                lastLine: message.lastLine,
                callback: callback
            });
            break;
        case 'gif':
            DBGifs(function (db, collection) {
                collection.find({url: message.image}).toArray(function (err, docs) {
                    if (!err && docs.length > 0) {
                        message.image = config.gifService + docs[0]['name'];
                    }
                    bot.sendMessage(message.id, message.image, keyboardMarkup).then(
                        function () {
                            callback && callback()
                        },
                        function () {
                            callback && callback()
                        }
                    );
                    db.close();
                });
            });
            break;
        case 'image' || 'photo':
            cachingName = message.chapter + message.image.substring(message.image.lastIndexOf('/'), message.image.length);
            caching.getFileId(cachingName, function (cachingId) {
                if (cachingId) {
                    bot.sendPhoto(message.id, cachingId, keyboardMarkup).then(
                        function () {
                            if (callback) callback();
                            bot.sendMessage(message.id, '<b>Фото отправлено</b>', keyboardMarkup);
                        },
                        function () {
                            sendPhotoDirect()
                        }
                    )
                } else {
                    sendPhotoDirect()
                }
            });
            break;
        case 'video':
            cachingName = message.chapter + message.video.substring(message.video.lastIndexOf('/'), message.video.length);
            caching.getFileId(cachingName, function (cachingId) {
                if (cachingId) {
                    bot.sendVideo(message.id, cachingId, keyboardMarkup).then(
                        function () {
                            if (callback) callback();
                            bot.sendMessage(message.id, '<b>Видео отправлено</b>', keyboardMarkup);
                        },
                        function (reason) {
                            var err = JSON.parse(/({.*})/.exec(reason)[1]);
                            // Send an error to analytics
                            console.logger(err.description);
                            sendVideoDirect();
                        }
                    )
                } else {
                    sendVideoDirect()
                }
            });
            break;
        case 'audio':
            cachingName = message.chapter + message.audio.substring(message.audio.lastIndexOf('/'), message.audio.length);
            caching.getFileId(cachingName, function (cachingId) {
                if (cachingId) {
                    bot.sendVoice(message.id, cachingId, keyboardMarkup).then(
                        function () {
                            if (callback) callback();
                            bot.sendMessage(message.id, '<b>Аудио отправлено</b>', keyboardMarkup);
                        },
                        function () {
                            sendAudioDirect()
                        }
                    )
                } else {
                    sendAudioDirect()
                }
            });
            break;
        case 'sticker':
            bot.sendSticker(message.id, message.sticker);
            break;
    }
};

var openStats = function (id) {
    sendLink({id: id, text: 'Хотите узнать, чего уже достигли?', url: 'https://lookright.net/user/telegram/' + id});
};

var sendLink = function (params) {
    var id = params.id,
        text = params.text,
        url = params.url,
        keyboardMarkup = params.keyboard,
        lastline = params.lastLine,
        callback = params.callback;

    if (url.indexOf('http') === -1) {
        keyboardMarkup = lastline ? keyboardMarkup : {parse_mode: 'HTML'};
        bot.sendMessage(id, '<b>Внутренняя ошибка Look Right: ссылка не может быть отправлена</b>', keyboardMarkup);
        if (callback) callback();
    } else {
        console.log(url);
        var keyboard = {
            parse_mode: 'HTML',
            disable_notification: true,
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: 'Открыть страницу',
                            url: url
                        }
                    ]
                ]
            }
        };
        bot.sendMessage(id, text, keyboard).then(function (res) {
            if (lastline) bot.sendMessage(id, '<b>Ссылка отправлена</b>', keyboardMarkup);
            if (callback) callback();
        }).catch(function (err) {
            console.logger(err);
            if (lastline) bot.sendMessage(id, '<b>Ссылка не может быть отправлена</b>', keyboardMarkup);
            if (callback) callback();
        });
    }
};

var sendToChat = function(user, input){
	// var CHAT_ID = '-196933883';
	// var message = Utils.getUserMap(user, input ? ('<b>Message:</b> ' + input) : null);
	//
	// if (config.env !== 'local' && config.env !== 'test') {
	// 	bot.sendMessage(CHAT_ID, message, {
	// 		parse_mode: 'HTML'
	// 	}).then(function () {
	// 		bot.sendMessage(CHAT_ID, '/botsend ' + user['_id'] + ' "<b>YOUR_MESSAGE_HERE</b>"\n');
	// 	});
	// }
};

module.exports = {
    send: sendMessage,
    checkReplyLength: checkReplyLength,
    stats: openStats,
	sendToChat: sendToChat
};