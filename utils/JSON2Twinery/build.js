const fs = require('fs');

const fileNames = {
    name: 'Chapter 2', // FirstAid_rookie
	// json: 'Chapter 0 eng_fix_eng+rus.json',
	// html: 'Chapter_0_eng.html'
};

// const json = require(`./${fileNames.json}`);
// const html = `./${fileNames.html}`;

// const json = require('../Twines/Jsons/Chapter 0 eng.json');
// const html = `../Twines/${fileNames.name}.html`;

const json = require('../_Stories/Chapter 2.json');
const html = `./${fileNames.name}.html`;

// if (!json) throw `No "${fileNames.json}" file found`;

let fileBeginning = `<tw-storydata name="${fileNames.name}" startnode="0" creator="Twine" creator-version="2.0.11" 
    ifid="C2B3D8ED-D590-4119-B1D9-A11F20BDB1FA" format="Harlowe" options="" hidden>
    <style role="stylesheet" id="twine-user-stylesheet" type="text/twine-css"></style>
    <script role="script" id="twine-user-script" type="text/twine-javascript"></script>\n\n\n`;
let fileEnding = `\n\n</tw-storydata>`;

let passages = [];
let result = fileBeginning;

let getTimeFormat = function (delay) {
    let textDelay;
    if (delay > 3600) {
        textDelay = Math.floor(delay / 60 / 60) + 'h';
    } else if (delay > 60 && delay < 3600) {
        textDelay = Math.floor(delay / 60) + 'min';
    } else {
        textDelay = Math.floor(delay) + 'sec';
    }
    return textDelay;
};

let checkDelay = function (delay, type, status) {
    status = status ? `{{status:"${status}"}}` : '';
    if (type === 'text' && delay > 30) {
        return ` {{delay:${getTimeFormat(delay)}}}${status}`;
    } else if (type === 'gif' && delay > 300) {
        return ` {{delay:${getTimeFormat(delay)}}}${status}`;
    } else if (delay > 3600) {
        return ` {{delay:${getTimeFormat(delay)}}}${status}`;
    } else {
        return '';
    }
};

let quotesFix = function(text){
    return text.replace(/"/gmi, '&quot;');
};

for (let block in json) {
    if (json.hasOwnProperty(block)) {
        let b = json[block];
        let passage = `<tw-passagedata pid="${b.serial}" name="${ quotesFix(block) }" tags="" position="${b['twine-coords']}">\n`;
        let terminalInline = false;
        let final = b.final;

        // Global block commands
        if (b.messages.every((mes) => mes.speaker === 'terminal')) {
            passage += '{{speaker:terminal}}\n\n';
        } else if (b.messages.some((mes) => mes.speaker === 'terminal')) {
            terminalInline = true;
        }

        if (b.replies.type === 'system') {
            passage += '{{answer:system}}\n\n';
        }

        if (b.event) {
            passage += `{{event:${b.event}}}\n\n`;
        }
        // End of globals

        b.messages.forEach((mes) => {

            switch (mes.type) {
                case 'text':
                    passage += `-- ${mes.text}`;
                    break;
                case 'image':
                    passage += `-- {{image:"${mes.image}"}}`;
                    break;
                case 'gif':
                    if (mes.link) passage += `-- {{gif:"${mes.image}|${mes.link}"}}`;
                    else passage += `-- {{gif:"${mes.image}"}}`;
                    break;
                case 'video':
                    passage += `-- {{video:"${mes.video}"}}`;
                    break;
                case 'audio':
                    passage += `-- {{audio:"${mes.audio}"}}`;
                    break;
                case 'link':
                    passage += `-- ${mes.text} {{link:${mes.link}}}`;
                    break;
            }

            if (terminalInline && mes.speaker === 'terminal') {
                passage += ` {{line-speaker:${mes.speaker}}}`;
            }

            passage += checkDelay(mes.delay, mes.type, mes.status);
            passage += '\n';
        });


        passage += '\n';

        switch (b.replies.type) {
            case 'input':
                passage += '\n\n{{input:name}}\n';
                break;
            case 'numpad':
				passage += '\n\n{{numpad:alla}}\n';
                break;
            case 'guess-maniac-block':
				passage += '\n\n{{minigame:guess-maniac-block}}\n';
                break;
            case 'guess-music-block':
				passage += '\n\n{{minigame:guess-music-block}}\n';
				break;
            default:
                if (!final) {
					b.replies.choices.forEach((reply) => {
						passage += `[[${reply.message}-&gt;${quotesFix(reply.block)}]]\n`;
					});
				}
        }

        if (final) {
            passage += `\n\n{{end:${final}}}\n`;
        }

        passage += `</tw-passagedata>`;

        passages.push({id: b.serial, passage});
    }
}

passages.sort((a, b) => {
    return a.id - b.id;
});

passages = passages.map((p) => p.passage);
result += passages.join('\n');
result += fileEnding;

fs.writeFile(html, result, 'utf-8', () => {
    console.log('Build is done!');
});