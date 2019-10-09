'use strict';
const fs = require('fs');
const path = require('path');
const baseDir = '../_Media';

function fileExists(filePath) {
    function fileExistsWithCaseSync(filepath) {
        var dir = path.dirname(filepath);
        if (dir === '/' || dir === '.') return true;
        var filenames = fs.readdirSync(dir);
        if (filenames.indexOf(path.basename(filepath)) === -1) {
            return false;
        }
        return fileExistsWithCaseSync(dir);
    }
    filePath = baseDir + filePath;
    return fileExistsWithCaseSync(filePath)
}

function checkMedia(files, callback) {
    let chapters = files;
    let overallErrors = 0;

    chapters.forEach((chapter, index) => {
        let errors = 0;
        for (let block in chapter) {
            if (chapter.hasOwnProperty(block)) {
                if (chapter[block].messages.length > 0) {
                    chapter[block].messages.forEach((bubble) => {
                        let path = null,
                            result = null;
                        switch (bubble.type) {
                            case 'image':
                                path = bubble.image;
                                break;
                            case 'video':
                                path = bubble.video;
                                break;
                            case 'audio':
                                path = bubble.audio;
                                break;
                            case 'gif':
                                //path = bubble.text;
                                break;
                        }
                        if (path) {
                            result = fileExists(path);

                            if (result) {
                                // console.log('OK: ' + path);
                            } else {
                                errors++;
                                console.log(`=> ERROR: ${bubble.type} - ${path}`);
                            }
                        }
                    });
                }
            }
        }
        if (errors === 0) {
            console.log('OK: All files are in place');
            console.log('##########################');
        }
        overallErrors += errors;
    });

    if (overallErrors === 0) {
        console.log('Testing MEDIA is finished');
        console.log('##########################\n');
        if (callback) callback();
    }
}

module.exports = {
    start: checkMedia
};