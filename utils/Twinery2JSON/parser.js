var fs = require('fs');
var jsdom = require('jsdom');
// https://www.npmjs.com/package/node-jsdom

const selectors = {
    passage: 'tw-passage',
    story: 'tw-story',
    script: '[role=script]',
    stylesheet: '[role=stylesheet]',
    storyData: 'tw-storydata',
    passageData: 'tw-passagedata'
};

function replacer(key, value) {
	if (value === null) return undefined;
	return value;
}

var toArray = function (collection) {
    return Array.prototype.slice.call(collection);
};
var textNorm = function (text) {
    // if (/\s*\{\{\s*line-speaker:/gmi.test(text)) console.log(text);
    text = text.replace(/(.*)\s*(\{\{delay)/gmi, '$1 $2');
    text = text.replace(/(.*)\s*(\{\{link)/gmi, '$1 $2');
    text = text.replace(/(.*)\s*(\{\{line-speaker)/gmi, '$1 $2');
    text = text.replace(/(.*)\s*(\{\{status)/gmi, '$1 $2');
    //if (/\s*\{\{\s*delay:/gmi.test(text)) console.log(text);
    text = text.replace(/^\s*\{\{(image|video|gif|audio)/gmi, '--{{$1');
    text = text.replace(/^\s*-+\s*/gm, '__');
    text = text.replace(/&gt;/gm, '>').replace(/&lt;/gm, '<');
    return text;
};

var noSpaces = function (text) {
    text = text.replace(/\s\s+/gm, ' ').replace(/\n/g, '');
	text = text.replace(/&nbsp;/gm, ' ');
	text = text.replace(/&amp;/gm, '&');
    text = text.replace(/-\t/gm, '');
    text = text.replace(/^-\s*/gm, '');
    text = text.replace(/^\s*__\s*/gm, '');
    //text = text.replace(/\w*[^;:](\)+)/gm, ' :)');
    //text = text.replace(/\w*[^;:](\(+)/gm, ' :(');

    return text;
};

var cleanReplies = function (text) {
    return text.replace(/\[\[</gm, '[[').replace(/^</gm, '').replace(/-></gm, '->');
};

var fixQuotes = function(text){
    return text.replace(/"/gm, '&quot;');
};

var messageType = function (type, text, speaker) {
    var object = {
        type: null,
        text: null,
        image: null,
        video: null,
        audio: null,
        link: null,
        delay: 0,
        status: null,
        speaker: speaker || null
    };
    var delayReg = /\{\{\s*delay\s*:/gmi;
    var linkReg = /\{\{\s*link\s*:/gmi;
    var lineSpeaker = /\{\{\s*line-speaker\s*:/gmi;
    var tempDelay;

    var videoTrim = /\s*\{\{\s*video\s*:"*([^"}{[]*)"*/gmi,
        imageTrim = /\s*\{\{\s*image\s*:"*([^"}{[]*)"*/gmi,
        gifTrim = /\s*\{\{\s*gif\s*:"*([^"}{[]*)"*/gmi,
        audioTrim = /\s*\{\{\s*audio\s*:"*([^"}{[]*)"*/gmi;
    var lineSpeakerTrim = /\{\{line-speaker:"?([^{}"]+)"?}}/gmi;
	var statusTrim = /\s*\{\{\s*status\s*:"*([^"}{[]*)"*/gmi;
	var linkTrim = /\s*\{\{\s*link\s*:"*([^"}{[]*)"*/gmi;

	var gifTemp;

    switch (type) {
        case 'image':
            object.type = 'image';
            object.image = imageTrim.exec(text)[1].trim();
            object.delay = 15;
            break;
        case 'video':
            object.type = 'video';
            object.video = videoTrim.exec(text)[1].trim();
            object.delay = 40;
            break;
        case 'gif':
            object.type = 'gif';
            gifTemp = gifTrim.exec(text)[1].trim().split('|');
            object.image = gifTemp[0];
            if (gifTemp[1]) object.link = gifTemp[1];
            object.delay = 5;
            break;
        case 'audio':
            object.type = 'audio';
            object.audio = audioTrim.exec(text)[1].trim();
            object.delay = 5;
            break;
        default:
            object.type = 'text';
            object.text = text.trim();
            tempDelay = text.length * 25 / 1000;
            tempDelay = Number(tempDelay.toFixed(2));
            object.delay = tempDelay < 2 ? tempDelay + 2 : tempDelay;
            // if (speaker === 'terminal') object.delay = 1;
            if (linkReg.test(text)) {
                object.type = 'link';
				object.link = linkTrim.exec(text)[1].trim();
                object.text = text.replace(/\{\{link:.*}}/gmi, '');
            }
    }

    if (lineSpeaker.test(text)) {
        object.speaker = lineSpeakerTrim.exec(text)[1];
		if (object.text) {
			object.text = object.text.replace(lineSpeakerTrim, '').trim();
		}
    }

    if (delayReg.test(text)) {
        object.delay += parseDelay(text).delay;
        if (object.text) {
            object.text = object.text.replace(/\{\{delay:[^{]+}}/gmi, '').trim();
		}
    }

	if (statusTrim.test(text)) {
		statusTrim.lastIndex = 0;
		object.status = statusTrim.exec(text)[1].trim();
		if (object.text) {
		    object.text = object.text.replace(/\{\{status:[^{]+}}/gmi, '').trim();
		}
	}


    return object;
};

var parseDelay = function (text) {
    var secsR = /\s*s/gmi,
        minsR = /\s*m/gmi,
        hoursR = /\s*h/gmi;
    var temp = /\{\{delay:(.*[^{])}}/gmi.exec(text)[1];
    text = text.replace(/\{\{delay.*}}/g, '');
    var time = /(-*\d+)/.exec(temp);
    var delay = 1;
    if (hoursR.test(temp)) {
        time = time[1] * 60 * 60;
    } else if (minsR.test(temp)) {
        time = time[1] * 60;
    } else if (secsR.test(temp)) {
        time = time[1];
    }

    delay = Number(time) > 0 ? Number(time) : delay;

    return {
        text: text.trim(),
        delay: delay
    };
};

var checkMessageContent = function (text, speaker) {
    var imageReg = /{{\s*image\s*:/gmi,
        videoReg = /{{\s*video\s*:/gmi,
        audioReg = /{{\s*audio\s*:/gmi,
        gifReg = /{{\s*gif\s*:/gmi,
        delayReg = /{{\s*delay\s*:/gmi,
        linkReg = /\{\{\s*link\s*:/gmi;
    var message, temp;

    if (imageReg.test(text)) {
        message = messageType('image', text, speaker);
    } else if (videoReg.test(text)) {
        message = messageType('video', text, speaker);
    } else if (gifReg.test(text)) {
        message = messageType('gif', text, speaker);
    } else if (audioReg.test(text)) {
        message = messageType('audio', text, speaker);
    } else {
		message = messageType('text', text, speaker);
    }

    return message;
};

var checkReplyContent = function (text) {
    var anchors = text.split('->');
    return {
        message: anchors[0].trim(),
        block: fixQuotes((anchors.length > 1 ? anchors[1] : anchors[0]).trim())
    }
};


// ([^__]+)
//var smsReg = /__([^_\[]*)/igm;
var smsReg = /__(?!.*?__).*/igm;
var replyReg = /\[\[([^\]]*)]]/igm;

function parsing(savePath, callback) {
    var stories = toArray(document.querySelectorAll(selectors.storyData));
    var files = 0;
    stories.forEach(function (story) {
        var final = {};
        var blocks = toArray(story.querySelectorAll(selectors.passageData));
        var storyName = story.getAttribute('name');

        blocks.sort(function (a, b) {
            var aY = Number(a.getAttribute('position').split(',')[1]);
            var bY = Number(b.getAttribute('position').split(',')[1]);
            var aX = Number(a.getAttribute('position').split(',')[0]);
            var bX = Number(b.getAttribute('position').split(',')[0]);

            if (aY === bY) {
                aY = (aX < bX) ? ++aY : --aY;
            }
            return aY - bY;
        });

        for (var i = 0; i < blocks.length; i++) {
            if (/^!!/gmi.test(blocks[i].getAttribute('name'))) continue;

            var name = fixQuotes(noSpaces(cleanReplies(textNorm(blocks[i].getAttribute('name')))).trim());
            var speaker;
            if (storyName.toLowerCase().indexOf('chapter 0') !== -1) {
                speaker = 'alla';
            } else {
                speaker = 'eva';
            }

            if (/{speaker:terminal/g.test(textNorm(blocks[i].innerHTML))) {
                speaker = 'terminal';
            }

            final[name] = {
                serial: i,
                messages: [],
                replies: {},
                final: null
            };

            var linesExec;
            while ((linesExec = smsReg.exec(textNorm(blocks[i].innerHTML))) !== null) {
                var message = noSpaces(linesExec[0]);

                var mesCont = checkMessageContent(message, speaker);
                if (typeof mesCont === 'number') {
                    final[name]['messages'][final[name]['messages'].length - 1]['delay'] += mesCont;
                } else {
                    message = mesCont;
                    final[name]['messages'].push(message);
                }
            }


            var repliesExec, answers = [];
            while ((repliesExec = replyReg.exec(textNorm(blocks[i].innerHTML))) !== null) {
                var reply = noSpaces(cleanReplies(repliesExec[1]));
                answers.push(checkReplyContent(reply));
            }
            final[name]['replies'] = {
                type: 'default',
                choices: answers
            };

            if (/{numpad:/g.test(textNorm(blocks[i].innerHTML))) {
                // /{\{numpad}}/g.exec(textNorm(blocks[i].innerHTML))
                //console.log(textNorm(blocks[i].innerHTML));
                final[name]['replies'] = {
                    type: 'numpad',
                    choices: []
                };
            }

            if (/{input:/g.test(textNorm(blocks[i].innerHTML))) {
                final[name]['replies'] = {
                    type: 'input',
                    choices: []
                };
            }

			if (/{minigame:/g.test(textNorm(blocks[i].innerHTML))) {
				final[name]['replies'] = {
					type: /\{\{minigame:(.*)}}/gmi.exec(textNorm(blocks[i].innerHTML))[1],
					choices: []
				};
			}

            if (/{answer:/g.test(textNorm(blocks[i].innerHTML))) {
                var mes = /{{answer:(.*)}}/g.exec(textNorm(blocks[i].innerHTML));
                final[name]['replies']['type'] = mes[1];
            }

            if (/{event:/g.test(textNorm(blocks[i].innerHTML))) {
                var event = /{{event:(.*)}}/g.exec(textNorm(blocks[i].innerHTML));
                final[name]['event'] = event[1];
            }

            if (blocks[i].innerHTML.indexOf('{{end') > 0) {
                final[name]['final'] = /{{end:"*([^"]*)"*}}/g.exec(textNorm(blocks[i].innerHTML))[1];
            }

            final[name]['twine-coords'] = blocks[i].getAttribute('position');
        }

        (function(){
            // fixing long endings in float numbers, no only 2 decimals
            for (var name in final) {
                if (final.hasOwnProperty(name)) {
                    if (final[name].messages.length) {
						final[name].messages.forEach(function(mes){
						    mes.delay = Number(mes.delay.toFixed(2));
                        });
                    }
                }
            }
        })();

        var path = savePath + story.getAttribute('name') + '.json';
        fs.writeFile(path, JSON.stringify(final, replacer, '\t'), 'utf8', function () {
            console.log(path + ' - done');
            console.log('##########################');
            files++;
            if (files >= stories.length) {
                console.log('Parsing is done!');
                console.log('##########################\n');
                if (callback) callback();
            }
        });

    });
}

var fixHtmlEncoding = function (path, callback) {
    fs.readFile(path || files.source, 'utf-8', function (err, data) {
        if (!err) {
            if (!data.indexOf('<meta charset="utf-8"/>')) {
                data = '<meta charset="utf-8"/>\n' + data;
            }
            if (callback) callback(data);
        }
    });
};

var startParsing = function (twinePath, savePath, callback) {
    fixHtmlEncoding(twinePath,
        function (html) {
            jsdom.env({
                html: html,
                done: function (err, window) {
                    global.window = window;
                    global.document = window.document;

                    parsing(savePath, callback);
                }
            });
        }
    );
};

// using it directly from CLI
if (require.main === module) {
    startParsing();
}

module.exports = {
    start: startParsing
};