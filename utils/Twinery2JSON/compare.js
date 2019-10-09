'use strict';
const fs = require('fs');

function grabEditedText(origFile, editedFile, callback) {
    let source = require(origFile),
        edited = require(editedFile);

    let counter = 0;

    for (let line in source) {
        if (source.hasOwnProperty(line)) {
            if (edited[line]) {
                let rLength = source[line]['replies']['choices'].length;
                for (var i = 0; i < rLength; i++) {
                    let orig = source[line]['replies']['choices'][i],
                        edit = edited[line]['replies']['choices'][i];
                    if (!orig || !edit) continue;

                    let sourceChoice = orig['message'],
                        editedChoice = edit['message'];

                    if (sourceChoice !== editedChoice) {
                        counter++;
                        orig['message'] = editedChoice;
                    }
                }
            }
        }
    }

    fs.writeFile(origFile, JSON.stringify(source), 'utf8', () => {
        console.log(`File ${origFile}`);
        console.log(`Done - ${counter} lines were changed`);
        console.log('##########################');
        if (callback) callback();
    });
}

module.exports = {
    start: grabEditedText
};