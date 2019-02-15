if (console.logger) console.logger('Init: Telegram Bot');

var config = require('./config');

var TelegramBot = require('node-telegram-bot-api');
var token = config.botToken;
var bot = new TelegramBot(token, {polling: {interval: 2000, timeout: 65}});

module.exports = bot;