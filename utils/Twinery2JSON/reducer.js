'use strict';
const fs = require('fs');
const fileName = 'Chapter 1 eng.json';

const path = '../Twines/Jsons/';

const file = require(path + fileName);

function replacer(key, value) {
	if (value === null) return undefined;
	return value;
}

fs.writeFile(path + fileName, JSON.stringify(file, replacer, '\t'), 'utf-8', () => {
	console.log('Done');
});