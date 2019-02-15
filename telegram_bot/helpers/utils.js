var randomFixedInteger = function (length) {
	return Math.floor(Math.pow(10, length - 1) + Math.random() * (Math.pow(10, length) - Math.pow(10, length - 1) - 1));
};

var getNow = function () {
	return (new Date).getTime();
};

(function () {
	function addZero(num) {
		return num < 10 ? '0' + num : num;
	}

	Date.prototype.getStringDate = function () {
		return addZero(this.getDate()) + '.' + addZero(this.getMonth()) + '.' + addZero(this.getFullYear()) + ' ' +
			addZero(this.getHours()) + ':' + addZero(this.getMinutes()) + ':' + addZero(this.getSeconds());
	};

	console.logger = function () {
		var args = Array.prototype.slice.call(arguments);
		args.unshift('=> ' + (new Date()).getStringDate() + ' - ');
		console.log.apply(console, args);
	};
})();

var getRandomItem = function (array, name) {
	var text = array[Math.floor(Math.random() * array.length)];
	if (name) text = text.replace(/\{user_name}/gmi, name);
	return text;
};

var getUserMap = function (user, text) {
	var message = '<b>Карта пользователя:</b>\n' +
		'<b>ID:</b> ' + user['_id'] + '\n' +
		(user['username'] ? ('<b>Username:</b> @' + user['username'] + '\n') : '') +
		'<b>Name:</b> ' + user['name']['first'] + ' ' + user['name']['last'] + '\n' +
		'<b>Chapter: </b>' + user['progress']['game'] + '\n' +
		'<b>Block:</b> ' + user['progress']['block'] + '\n';
	if (text) message += (text + '\n');

	return message;
};

console.logger('Init: Utils');
module.exports = {
	randomFixedInteger: randomFixedInteger,
	getNow: getNow,
	getRandomItem: getRandomItem,
	getUserMap: getUserMap
};