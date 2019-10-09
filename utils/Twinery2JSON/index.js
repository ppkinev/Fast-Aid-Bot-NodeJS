'use strict';
let fs = require('fs'),
    parser = require('./parser'),
    testMedia = require('./check-media'),
    editsGrabber = require('./compare');

// Он обиделся на город?

const twine = '../Twines/Chapter 1.html';
const filesPath = '../Twines/Jsons/';

const jsonName = twine.substring(twine.lastIndexOf('/') + 1, twine.length - 5) + '.json';

let chapters = [];

parser.start(twine, filesPath, () => {
    chapters.push(require(filesPath + jsonName));
    if (chapters.length > 0) {
        testMedia.start(chapters, () => {
        });
    }
});