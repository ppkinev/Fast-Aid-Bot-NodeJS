console.logger('Init: Messaging Logic');

var User = require('./user');
var Scheduler = require('./user-scheduler');
var sendMessage = require('./send-messages');
var storyHelper = require('./story-helpers');
var analytics = require('./analytics');
var utils = require('./utils');
var config = require('../config');
var str = require('./string-constants');
var DBUsers = require('./db').dbUsers;
var miniGames = require('./minigames');

var getStory = function (file, lang) {
    switch (file) {
        case 'file1':
        case 0:
        case '0':
			if (/ru/gi.test(lang)) return require('../../scenarios/FirstAid_rookie.json');
            return require('../../scenarios/FirstAid_rookie_en.json');
        case 'file2':
        case 1:
        case '1':
            if (/ru/gi.test(lang)) return require('../../scenarios/FirstAid_pro.json');
            return require('../../scenarios/FirstAid_pro_en.json');
    }
};

var getPath2Media = function (type, media) {
    switch (type) {
        case 'gif':
            return media ? media : null;
            break;
        default:
            return media ? '..' + media : null;
    }
};

var checkReply = function (curUser, input) {
    input = input.trim();

    var curBlock = curUser.progress.block;
    var nextBlock;
    var story = getStory(curUser.progress.game, curUser.locale);
    var userId = curUser['_id'];
    var lang = curUser['locale'];

    function checkPatternAndGetNextBlock() {
        var index = -1;
        var type = story[curBlock]['replies']['type'];
        var choices = story[curBlock]['replies']['choices'];

        if (type === 'numpad') {
            return storyHelper.checkAllaNumberOnInput(curUser, input);
        }

        if (type === 'guess-music' || type === 'guess-music-block') {
            return miniGames.guessMusic(curUser, input);
        }

        if (type === 'guess-maniac' || type === 'guess-maniac-block') {
            return miniGames.guessManiac(curUser, input);
        }

        if (type === 'send-in-range' || type === 'send-in-range-block') {
            return miniGames.sendInRange(curUser, input);
        }


        if (input === str.needToLeave.leave) {
            return storyHelper.needToLeave.leave(curUser);
        }

        if (input === str.needToLeave.cameBack) {
            return storyHelper.needToLeave.cameBack(curUser);
        }

        story[curBlock]['replies']['choices'].forEach(function (r, i) {
            if (sendMessage.checkReplyLength(r.message).check.trim() === input.trim()) {
                index = i;
            }
        });

        if (story[curBlock]['replies']['type'] === 'system') {
            story[curBlock]['replies']['choices'].forEach(function (r, i) {
                if (r.block.trim() === input.trim()) {
                    index = i;
                }
            });
        }

        if (index !== -1) {
            console.logger(curUser['_id'], ' user has clicked: ', choices[index]['message']);
            console.logger(curUser['_id'], ' next block is ', choices[index]['block']);
            return choices[index]['block'];
        } else {
            return null;
        }
    }

    // Last seen parameter on all user inputs, if replies are allowed
    DBUsers(function (db, collection) {
        collection.updateOne({'_id': curUser['_id']}, {'$set': {'lastSeen': utils.getNow()}},
            function () {
                console.logger(curUser['_id'] + ' lastSeen parameter was updated');
                db.close()
            }
        );
    });

    nextBlock = checkPatternAndGetNextBlock();

    if (nextBlock !== null) { // Next block is found and can be used
        var comeback = null;
        if (curUser.reminders.active > 0) { // removing reminders if there were some
            comeback = utils.getRandomItem(str.comeBackMessage[curUser.progress.game], curUser.name.first);
            DBUsers(function (db, collection) {
                collection.updateOne({'_id': curUser['_id']}, {'$set': {'reminders.active': 0}},
                    function () {
                        console.logger(curUser['_id'] + ' all active reminders were reset');
                        db.close()
                    }
                );
            });
        }
        if (nextBlock === 'stop-main-dialogs') return;  // if blocks are handled separately, like numpad


        analytics.sendPageView(userId, 'messageBlock=' + curUser.progress.block, 'Block: ' + curUser.progress.block);

        // working with the next block
        curUser.progress.block = nextBlock;
        curUser.actions.replyAllowed = false;
        curUser.progress.line = 0;

        DBUsers(function (db, collection) {
            collection.updateOne({'_id': curUser['_id']},
                {
                    '$set': {
                        'progress.block': curUser.progress.block,
                        'actions.replyAllowed': curUser.actions.replyAllowed,
                        'progress.line': curUser.progress.line
                    }
                },
                function () {
                    console.logger(curUser['_id'] + ' moved to the next block -> ' + curUser.progress.block);
                    Scheduler.add({
                        delay: .1, uid: curUser['_id'], event: function () {
                            dialogQueue(curUser, null, comeback);
                        }
                    });
                    db.close();
                }
            );
        });
    } else {
        // Unsupported answer was given, show some message (logic later?)
        curUser.progress.line = curUser.progress.line > 0 ? curUser.progress.line - 1 : 0;
        dialogQueue(curUser, utils.getRandomItem(/ru/gi.test(lang) ? str.wrongInput : str.wrongInputEng, curUser.name.first));
        sendMessage.sendToChat(curUser, input);
    }
};

var dialogQueue = function (curUser, wrongAnswerText, comeback) {
    var story = getStory(curUser.progress.game, curUser.locale);
    var currentBlock = story[curUser.progress.block];
    if (!currentBlock['messages']) throw 'no messages in ' + currentBlock;
    var currentLineNum = curUser.progress.line || 0,
        blockLength = currentBlock['messages'].length,
        currentLine = currentBlock['messages'][currentLineNum],
        answer = currentBlock['replies'];

    var lastLine = currentLineNum >= blockLength - 1;
    var delay = 0;
    var canSkip = false;


    var parseTextVars = function (text) {
        var varReg = /\{([^}]*)}/g;
        var result = varReg.exec(text);
        if (result) {
            if (result[1] === 'guideNumber') {
                text = text.replace(/\{([^}]*)}/g, curUser.progress.guideNumber);
            }
        }
        return text;
    };

    var text;

    if (config.env === 'local') {
        delay = config.delayLimit ? Math.min(currentLine.delay, config.delayLimit) : currentLine.delay;
        var pauseText = '\n(' + currentLine.delay.toFixed(2) + ' | ' + delay.toFixed(2) + ' сек)';
        text = 'Block: "' + curUser.progress.block + '"\n' + parseTextVars(currentLine.text) + ((!lastLine) ? pauseText : '');
    } else {
        if (!lastLine || (currentBlock['final'] && lastLine)) {
            delay = config.delayLimit ? Math.min(currentLine.delay, config.delayLimit) : currentLine.delay;
        }
        text = parseTextVars(currentLine.text);
    }


    if (!lastLine && delay >= config.skipDelayThreshold) {
        canSkip = true;
        DBUsers(function (db, collection) {
            collection.updateOne({'_id': curUser['_id']},
                {
                    '$set': {
                        'actions.canSkip': canSkip,
                        'progress.line': currentLineNum
                    }
                },
                function () {
                    console.logger(curUser['_id'] + ' can skip block "' + currentBlock + '" on line - ' + currentLineNum);
                    db.close();
                }
            );
        });
    }

    if (!wrongAnswerText) {
        var nextDelay = 0;
        if (comeback) {
            sendMessage.send({
                id: curUser['_id'],
                chapter: curUser.progress.game,
                answer: answer,
                text: comeback,
                link: currentLine.link,
                speaker: currentLine.speaker,
                type: 'text'
            });
            nextDelay = 4;
        }
        Scheduler.add({
            delay: nextDelay, uid: curUser['_id'], event: function () {
                sendMessage.send({
                    id: curUser['_id'],
                    chapter: curUser.progress.game,
                    answer: answer,
                    text: text,
                    link: currentLine.link,
                    status: currentLine.status,
                    speaker: currentLine.speaker,
                    image: (config.platform === 'telegram') ? getPath2Media(currentLine.type, currentLine.image) : currentLine.image,
                    video: (config.platform === 'telegram') ? getPath2Media(currentLine.type, currentLine.video) : currentLine.video,
                    audio: (config.platform === 'telegram') ? getPath2Media(currentLine.type, currentLine.audio) : currentLine.audio,
                    caption: currentLine.caption || text,
                    type: currentLine.type,
                    lastLine: lastLine,
                    canSkip: canSkip
                }, callback);
            }
        });

    } else {
        sendMessage.send({
            id: curUser['_id'],
            chapter: curUser.progress.game,
            answer: answer,
            text: wrongAnswerText,
            link: currentLine.link,
            speaker: currentLine.speaker,
            image: null,
            video: null,
            caption: null,
            type: 'text',
            lastLine: true
        });
    }

    function callback() {
        curUser.progress.line = currentLineNum + 1;
        if (!lastLine) {
            Scheduler.add({
                delay: delay, uid: curUser['_id'], event: function () {
                    dialogQueue(curUser);
                }
            });
        } else {
            if (!currentBlock['final']) {
                if (currentBlock['messages'].some(function (m) {
                        return m.type === 'image' || m.type === 'video' || m.type === 'audio'
                    })) {
                    // looking for media block
                    if (!curUser.progress.media[curUser.progress.game]) {
                        curUser.progress.media[curUser.progress.game] = [];
                    }
                    curUser.progress.media[curUser.progress.game].push(Number(currentBlock['serial']));
                }
                DBUsers(function (db, collection) {
                    collection.updateOne({'_id': curUser['_id']},
                        {
                            '$set': {
                                'actions.replyAllowed': true,
                                'actions.systemAllowed': answer['type'] === 'system',
                                'progress.answer': answer,
                                'progress.speaker': currentLine.speaker,
                                'progress.media': curUser.progress.media
                            }
                        },
                        function () {
                            console.logger(curUser['_id'] + ' waiting for an answer');
                            db.close();
                        }
                    );
                });
            } else {
                // if (!isNaN(Number(currentBlock['final']))) {
                // 	curUser.progress.game = Number(currentBlock['final']);
                // }

                curUser.progress.game = currentBlock['final'];

                if (currentBlock['final'] == '3') {
                    curUser.progress.game = '0';
                }

                curUser.progress.line = 0;
                curUser.progress.block = 'Start';
                curUser.actions.systemAllowed = true;
                sendMessage.sendToChat(curUser, '<b>Started the chapter - </b>' + curUser.progress.game);

                if (curUser.progress.game == 0) {
                    curUser.actions.systemAllowed = true;
                }

                DBUsers(function (db, collection) {
                    collection.updateOne({'_id': curUser['_id']},
                        {
                            '$set': {
                                'progress.game': curUser.progress.game,
                                'progress.line': curUser.progress.line,
                                'progress.block': curUser.progress.block,
                                'actions.systemAllowed': curUser.actions.systemAllowed
                            }
                        },
                        function () {
                            console.logger(curUser['_id'] + ' final block');
                            Scheduler.add({
                                delay: delay, uid: curUser['_id'], event: function () {
                                    dialogQueue(curUser);
                                }
                            });
                            db.close();
                        }
                    );
                });
            }
        }
    }
};


module.exports = {
    checkReply: checkReply,
    dialogQueue: dialogQueue
};