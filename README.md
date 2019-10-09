# Telegram Bot - FastAid

[Link to see it in work](https://t.me/FastAid_bot) - 
you'll need to have [Telegram](https://telegram.org/) installed in order to use it.
The idea behind this project was to help people do instant actions in emergency situations.
<br>*The project was untouched for a long time, so prepare to support legacy non-optimized code*

## How it works
The `telegram_bot` and `utils` were built with LookRight in mind.
Which was initially done with these tools.
Requires `mongo-db` set up. Easily launched via `npm pm2` package.

1. `telegram_bot/config.js` - change all configurations needed.
2. `audio`, `images`, `scenarios` and `videos` folders contain assets 
you can refer to from the twine nodes.
3. `telegram_bot/index.js` is a starting point for an app.
<br>3.1. In that file `lines 42 - 344` are for accepting all incoming messages, 
decomposing them and reacting back.
<br>3.2. `Lines 346 - 360` replying to button clicks
4. `telegram_bot/helpers/messaging.js` - contains main messaging logic as the name states.
And here is the place where you specify jsons generated from twines 
with `getStory -> case` stands for the `final` attribute in json. 
5. The first file is selected in user object here: `telegram_bot/helpers/user.js`
`line 40` and `line 54` for selecting first block in the file.

## Utils
*Util commands are used from within the corresponding folders*

`utils/JSON2Twinery` - converts JSON file back to twine file to be used with twinery.
```
    // Put a path to json file you want to convert
    15: const json = require('../path/Chapter 2.json');
```
```
    // Specify the name and path for twinery html file
    16: const html = `./${fileNames.name}.html`;
```
Usage: `npm build`

---
`utils/Twinery2JSON` - is kinda a separate mini-app, 
which requires it's own `npm isntall`, since it relies on `jsdom` package.
```
    // Specify twine html
     9: const twine = '../Twines/Chapter 1.html';
    
    // and the output path for jsons
    10: const filesPath = '../Twines/Jsons/';
```
Usage: `npm install` to add needed packages, then just `npm index`
### Note: try it, if all paths are sent through correctly

---
`utils/Twinery2JSON/check-block-existence.js` - that's just a simple helper.
It compares blocks English and Russian versions of JSONs, so they have the same blocks.
```
    // Provide the corresponding path names
    3: const fileRus = require(path + 'Chapter 0.json');
    4: const fileEng = require(path + 'Chapter 0 eng.json');
```
Usage: `npm check-block-existence`


