if (console.logger) console.logger('Init: Config');

var ENV = 'bottest'; // local, test, live, alpha, bottest
var PLATFORM = 'telegram';

var botToken, gaHostname, passcode;
var delayLimit;
var wrongAnswerLimit = 3;
var skipDelayThreshold = 120;

var gifService = 'https://lookright.net/g/';

gaHostname = 'http://' + PLATFORM + '.zhgut.' + ENV;

switch (ENV) {
	case 'bottest':
		botToken = 'token';
		passcode = /.*/;
		delayLimit = 0.1;
		break;
}

module.exports = {
	env: ENV,
	platform: PLATFORM,
	botToken: botToken,
	hostname: gaHostname,
	pass: passcode,
	delayLimit: delayLimit,
	wrongAnswerLimit: wrongAnswerLimit,
	skipDelayThreshold: skipDelayThreshold,
	gifService: gifService
};