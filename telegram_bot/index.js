var Utils = require('./helpers/utils.js');
console.logger('Init: Starting Telegram Bot');

var bot = require('./bot');
var User = require('./helpers/user');
var Scheduler = require('./helpers/user-scheduler');
var Message = require('./helpers/messaging');
var analytics = require('./helpers/analytics');
var config = require('./config');
var DB = require('./helpers/db');

var storyHelpers = require('./helpers/story-helpers');
var str = require('./helpers/string-constants');
var send = require('./helpers/send-messages');

require('./helpers/reminders');

var regs = {
    all: /.*/,
    start: /\/start/,
    restart: /\/restart/,
    skip: /\/skip/,
    back: /\/back/,
    stats: /\/stats/,
    chapter: /\/chapter/,
    numbers: /\d+/g,
    removeMe: /\/delete-me/,

    sendBot: '/botsend',
    getUser: '/getuser'
};

var firstChapterPass = 'azurba',
    secondChapterPass = 'project12dr';

var uverturaEngPass = 'basement0';

var uverturaSecretPass = 'agent0';

var engVersion = 'lookrighten';

bot.onText(regs.all, function(mes, match) {
    var input = match[0],
        chat = mes.chat,
        id = chat.id;
    var languageCode = mes.from['language_code'] || 'en';

    if (Number(id) < 0) {
        if (input.indexOf(regs.sendBot) !== -1) {
            var userId, text = '';
            input = input.substring(input.indexOf(' ') + 1, input.length);
            userId = input.substring(0, input.indexOf(' '));
            if (/"(.*)"/gmi.test(input))
                text = /"(.*)"/gmi.exec(input)[1];

            if (userId && text) {
                bot.sendMessage(userId, text, {
                    parse_mode: 'HTML'
                }).then(function(response) {
                    var text = '<b>Сообщение пользователю</b> ' +
                        '<i>' + response['chat']['id'] + '</i>' +
                        ' ' + response['chat']['first_name'] + ' ' + response['chat']['last_name'] +
                        (response['chat']['username'] ? (' (@' + response['chat']['username'] + ') ') : '') +
                        ' <b>было отправлено.</b>';
                    bot.sendMessage(id, text, {
                        parse_mode: 'HTML'
                    });

                }).catch(function(err) {
                    bot.sendMessage(id, '<b>Сообщение не было доставлено</b>\nПричина: ' + err, {
                        parse_mode: 'HTML'
                    });
                });
            }
            console.logger('Operator message: ', input);
            return;
        } else if (input.indexOf(regs.getUser) !== -1) {
            input = input.substring(input.indexOf(' ') + 1, input.length);
            User.get(Number(input), function(user) {
                if (user) {
                    send.sendToChat(user);
                } else {
                    bot.sendMessage(id, '<b>Пользователь не найден, проверьте ID</b>', {
                        parse_mode: 'HTML'
                    });
                }
            });
        }

        return;
    }

    User.get(id, function(user) {
        if (user) {
            if (regs.start.test(input)) {
                user.progress.block = 'Start';
                user.progress.game = 0;
                user.progress.line = 0;
                user.progress.answer = null;
                user.actions.replyAllowed = false;
                Scheduler.removeById(id);
                User.update(user, () => {
                    Message.dialogQueue(user);
                });
            } else if (regs.restart.test(input)) {
                user.progress.line = 0;
                Scheduler.removeById(id);
                Message.dialogQueue(user);
            } else if (regs.chapter.test(input)) {
                var ch = /\/chapter\s*(\d)/g.exec(input);

                if (ch) {
                    Scheduler.removeById(id);
                    user.progress.line = 0;
                    switch(Number(ch[1])) {
                        case 1:
                            user.progress.game = 1;
                            user.progress.block = 'Start';
                            console.logger(user['_id'], '- jumped to chapter 1');
                            break;
                        default:
                            user.progress.game = 0;
                            user.progress.block = 'Start';
                            console.logger(user['_id'], '- jumped to chapter 0');
                    }
                    User.update(user, function() {
                        Message.dialogQueue(user);
                    });
                }

            } else if (input.toLowerCase().indexOf(firstChapterPass) !== -1) {
                Scheduler.removeById(id);
                console.logger(user['_id'], '- entered pass "' + input + '" and started Chapter 1');
                user.progress.line = 0;
                user.progress.game = 1;
                user.progress.block = 'Start';
                send.sendToChat(user, '<b>Entered 1st chapter pass (' + input + ')</b>');

                bot.sendMessage(user['_id'], 'Спасибо, что вы с нами, добро пожаловать в первую главу!');
                User.update(user, function() {
                    Scheduler.add({
                        delay: 3, uid: user['_id'], event: function() {
                            Message.dialogQueue(user);
                        }
                    });
                });

            } else if (input.toLowerCase().indexOf(secondChapterPass) !== -1) {
                Scheduler.removeById(id);
                console.logger(user['_id'], '- entered pass "' + input + '" and started Chapter 2');
                user.progress.line = 0;
                user.progress.game = 2;
                user.progress.block = 'Start';
                send.sendToChat(user, '<b>Entered 2st chapter pass (' + input + ')</b>');

                bot.sendMessage(user['_id'], 'Спасибо, что вы с нами, добро пожаловать во вторую главу!');
                User.update(user, function() {
                    Scheduler.add({
                        delay: 3, uid: user['_id'], event: function() {
                            Message.dialogQueue(user);
                        }
                    });
                });

            } else if (input.toLowerCase().indexOf(uverturaEngPass) !== -1) {
                Scheduler.removeById(id);
                console.logger(user['_id'], '- entered pass "' + input + '" and started Chapter 0 eng');
                user.progress.line = 0;
                user.progress.game = 'eng0';
                user.progress.block = 'Start';
                send.sendToChat(user, '<b>Entered 0 eng chapter pass (' + input + ')</b>');

                bot.sendMessage(user['_id'], 'Thanks for staying with us, welcome to the story!');
                User.update(user, function() {
                    Scheduler.add({
                        delay: 3, uid: user['_id'], event: function() {
                            Message.dialogQueue(user);
                        }
                    });
                });

            } else if (input.toLowerCase().indexOf(engVersion) !== -1) {
                Scheduler.removeById(id);
                console.logger(user['_id'], '- entered pass "' + input + '" and started Chapter 0 eng');
                user.progress.line = 0;
                user.progress.game = 0;
                user.engVersion = true;
                user.progress.block = 'Start';
                send.sendToChat(user, '<b>Entered 0 eng chapter pass (' + input + ')</b>');

                bot.sendMessage(user['_id'], 'Thanks for staying with us, welcome to the story!');
                User.update(user, function() {
                    Scheduler.add({
                        delay: 3, uid: user['_id'], event: function() {
                            Message.dialogQueue(user);
                        }
                    });
                });

            } else if (input.toLowerCase().indexOf(uverturaSecretPass) !== -1) {
                Scheduler.removeById(id);
                console.logger(user['_id'], '- entered pass "' + input + '" and started Chapter 0 eng');
                user.progress.line = 0;
                user.progress.game = 's0';
                user.progress.block = 'Start';
                send.sendToChat(user, '<b>Entered 0 chapter (Special Forces) pass (' + input + ')</b>');
                bot.sendMessage(user['_id'], 'Thanks for staying with us, welcome to the story!');
                User.update(user, function() {
                    Scheduler.add({
                        delay: 3, uid: user['_id'], event: function() {
                            Message.dialogQueue(user);
                        }
                    });
                });
            } else if (regs.stats.test(input)) {
                //console.logger(user['_id'], ' show stats of the user\n', user);
                //bot.sendMessage(id, JSON.stringify(user));
                send.stats(id);
            } else if (user.actions.canSkip && input === str.skipDelay) {
                Scheduler.removeById(id);
                user.progress.line++;
                Message.dialogQueue(user);
            } else if (input === str.system.allaCode) {
                bot.sendMessage(id, 'Может все-таки введем код?');
            } else if (regs.removeMe.test(input)) {
                User.removeUser(id, function() {
                    send.sendToChat(user, '<b>User is removed, starting from the next message</b>');
                });
            } else if (/\/lang_/gi.test(input)) {
                var language = /\/lang_(..)/gi.exec(input);
                language = language && language[1];
                if (language) user.locale = language;
                User.update(user, function() {
                    Scheduler.add({
                        delay: .1, uid: user['_id'], event: function() {
                            Message.dialogQueue(user);
                        }
                    });
                });
            } else {
                if (user.actions.replyAllowed) {
                    Message.checkReply(user, input);
                } else {
                    bot.sendChatAction(id, 'typing');
                    // if (input.indexOf(str.))
                    var sending = true;
                    for (var line in str.isTyping) {
                        if (str.isTyping.hasOwnProperty(line)) {
                            if (str.isTyping[line].indexOf(input) !== -1) {
                                sending = false;
                            }
                        }
                    }
                    if (sending) {
                        send.sendToChat(user, input + '\n<b>Entered while bot was bot typing</b>');
                    }
                }
            }
        } else {
            if (
                config.pass.test(input)
                || input.toLowerCase().indexOf(firstChapterPass) !== -1
                || input.toLowerCase().indexOf(secondChapterPass) !== -1
                || input.toLowerCase().indexOf(uverturaEngPass) !== -1
                || input.toLowerCase().indexOf(uverturaSecretPass) !== -1
                || input.toLowerCase().indexOf(engVersion) !== -1
            ) {
                user = {
                    _id: id,
                    first_name: chat['first_name'],
                    last_name: chat['last_name'],
                    username: chat['username'],
                    locale: languageCode
                };
                User.set(user, function(setUser) {
                    /* *** REMOVE AFTER ALPHA TESTS *** */
                    if (input.toLowerCase().indexOf(firstChapterPass) !== -1) {
                        console.logger(user['_id'], '- entered pass "' + input + '" and started Chapter 1');
                        setUser.progress.line = 0;
                        setUser.progress.game = 1;
                        setUser.progress.block = 'Start';
                    }
                    if (input.toLowerCase().indexOf(secondChapterPass) !== -1) {
                        console.logger(user['_id'], '- entered pass "' + input + '" and started Chapter 2');
                        setUser.progress.line = 0;
                        setUser.progress.game = 2;
                        setUser.progress.block = 'Start';
                    }
                    if (input.toLowerCase().indexOf(uverturaEngPass) !== -1) {
                        console.logger(user['_id'], '- entered pass "' + input + '" and started Chapter 0 Eng');
                        setUser.progress.line = 0;
                        setUser.progress.game = 'eng0';
                        setUser.progress.block = 'Start';
                    }
                    if (input.toLowerCase().indexOf(uverturaSecretPass) !== -1) {
                        console.logger(user['_id'], '- entered pass "' + input + '" and started Chapter 0 Special Forces');
                        setUser.progress.line = 0;
                        setUser.progress.game = 's0';
                        setUser.progress.block = 'Start';
                    }
                    if (input.toLowerCase().indexOf(engVersion) !== -1) {
                        console.logger(user['_id'], '- entered pass "' + input + '" and started Chapter 0 eng');
                        setUser.progress.line = 0;
                        setUser.progress.game = 0;
                        setUser.engVersion = true;
                        setUser.progress.block = 'Start';
                    }
                    User.update(setUser);
                    // also remove condition from the IF above
                    /* *** END OF REMOVING AREA *** */
                    Message.dialogQueue(setUser);
                    analytics.sendPageView(id, 'signup', 'New user has started the game');
                    send.sendToChat(setUser, '<b>NEW USER</b>');

                    bot.getUserProfilePhotos(id).then(function(response) {
                        var photoSize = 0, photoId = null;
                        if (response.photos) {
                            response.photos.forEach(function(p, i) {
                                p.forEach(function(photo) {
                                    if (photo['file_size'] > photoSize) {
                                        photoSize = photo['file_size'];
                                        photoId = photo['file_id'];
                                    }
                                });
                            });

                            if (photoId) {
                                DB.dbUsers(function(db, collection) {
                                    collection.updateOne({'_id': id},
                                        {'$set': {'profile_pic': photoId}},
                                        function() {
                                            db.close()
                                        });
                                });
                            }
                        }
                    });
                });
            } else {
                bot.sendMessage(id, 'Введите пароль для начала истории (enter the password)');
            }
        }
    });
});

bot.on('callback_query', function(callbackQuery) {
    console.logger(callbackQuery['from']['id'], '- inline click for: ', callbackQuery.data);
    User.get(callbackQuery['from']['id'], function(user) {
        if (user) {
            user.progress.line = 0;

            if (user.actions.replyAllowed && user.progress.speaker === 'terminal') {
                Message.checkReply(user, callbackQuery.data);
            } else {
                bot.answerCallbackQuery(callbackQuery.id, 'Вы уже совершали это действие', false);
            }

        }
    });
});

var inlineHelpers = require('./inline_specific/first_aid_responses');

bot.on('inline_query', function(inlineQuery) {
    var queryId = inlineQuery['id'];
    var userId = inlineQuery['from']['id'];
    var lang = inlineQuery['from']['language_code'];
    var query = inlineQuery['query'];
    var response = '';

    User.get(userId, function(user) {
        if (user) {
            response = inlineHelpers.getInjureResponses(user['locale'], query);
        } else {
            response = inlineHelpers.getInjureResponses(lang, query);
        }

        bot.answerInlineQuery(queryId, response,
            {
                cache_time: 5
            }
        ).then(function() {

        }).catch(function(error) {
            console.log(error);
        });
    });
});