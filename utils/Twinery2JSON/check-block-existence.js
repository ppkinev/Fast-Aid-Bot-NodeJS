const path = '../Twines/Jsons/';

const fileRus = require(path + 'Chapter 0.json');
const fileEng = require(path + 'Chapter 0 eng.json');

console.log('****** Looping through russian ******');
for (let blockName in fileRus) {
	if (fileRus.hasOwnProperty(blockName)) {
		if (!fileEng[blockName]) {
			console.log(blockName);
		}
	}
}

console.log('****** Looping through english ******');
for (let blockName in fileEng) {
	if (fileEng.hasOwnProperty(blockName)) {
		if (!fileRus[blockName]) {
			console.log(blockName);
		}
	}
}