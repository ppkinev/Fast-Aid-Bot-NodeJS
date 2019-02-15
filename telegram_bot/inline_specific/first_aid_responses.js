var ambulance = {
    ru: [
        'Позовите окружающих людей на помощь.',
        'Вызовите скорую или попросите кого-то это сделать.',
        'Сообщите скорой: Что случилось. Где случилось. Примерный возраст пострадавшего. Пол пострадавшего. Ответьте на вопросы диспетчера. Диспетчер должен повесить трубку первым.',
        'Позаботьтесь, чтобы скорую было кому встретить.'
    ],
    en: [
        'Shout out for others to help.',
        'Call the ambulance number or ask somebody to do it.',
        'Tell the ambulance: what happened, where, rough age of injured person, gender. Answer to all operator’s questions. Operator should hang up first.',
        'Make sure there is somebody to meet an ambulance crew.'
    ]
};
var injuries = {
    ru: [
        {
            title: 'Сильное кровотечение',
            response: [
                'Попросите пострадавшего плотно прижать рану рукой. Это должно замедлить кровотечение',
            ]
        },
        {
            title: 'Сбила машина',
            response: [
                'Оградите место ДТП любым удобным вам способом: аварийный треугольник из багажника, аварийные сигнализации других машин, конусами, жилетами и т.д.',
                'Выясните нужна ли участникам ДТП медицинская помощь обратившись к ним. Если они получили травмы или просят вызывать скорую. ВЫЗОВИТЕ СКОРУЮ.',
                'Постарайтесь определить человека, который получил наиболее серьезные травмы. Например, пешеход, которого сбила машина.',
                'Обратитесь к пострадавшему с просьбой не двигаться. Движения могут причинить вред.'
            ]
        },
        {
            title: 'Получил ожог',
            response: [
                'Сначала, убедись, что одежда не горит и не тлеет, что причина ожога устранена',
                'Охладите место ожога холодной водой из под крана',
                'Пока ему не станет холодно',
                'Но не дольше 20 минут',
                'Когда станет холодно, прекратите поливать ожог водой.',
                'Скорую вызывайте по своему усмотрению, обязательно вызывать если: ожог большой площади (больше 5 его ладоней), обожжены стопы, кисти, лицо или пах. Так же, если ожоги глубокие.'
            ]
        },
        {
            title: 'Упал с высоты',
            response: [
                'Обратитесь к пострадавшему с просьбой не двигаться. Движения могут причинить вред.',
                'Выясните нужна ли пострадавшему медицинская помощь обратившись к нему. Если он получил травмы или просит вызывать скорую – вызовите скорую.',
            ]
        },
        {
            title: 'Сломал конечность',
            response: [
                'Попросите пострадавшего не двигаться. Это очень важно.',
                'Подложите мягкую ткань под сломанную конечность, обеспечив этим комфорт пострадавшего.',
                'Если пострадавший сломал руку и он в состоянии поддерживать ее здоровой рукой – не мешайте этому.',
                'Не пытайтесь вправить перелом или наложить шину. Это может навредить.',
                'Убедитесь, что скорая едет и ее есть кому встретить.'
            ]
        },
        {
            title: 'Человек без сознания',
            response: [
                'Обратитесь к нему. Громко спросите: "Вы меня слышите? С вами все в порядке?".',
            ]
        },
        {
            title: 'Подавился',
            response: [
                'Громко спросите "Вы подавились?"',
                'Если <b>ответил голосом и кашляет</b> - не вмешивайтесь!',
                'Не давайте воды и не стучите по спине.',
                'Скажите, что бы продолжал кашлять и успокаивайте. Слега наклоните пострадавшего вперед.',
                'Если <b>не может говорить и кашлять</b>',
                'Счет может идти на минуты.',
                'Пусть кто-то вызовет скорую и спросите, умеет ли кто-то делать прием Геймлиха.',
                'Если нет, срочно действуйте сами: наклоните вперед, 5 скользящих ударов по спине, 5 раз сильно сдавите живот. Повторять, пока не откашляется.'
            ]
        },
        {
            title: 'Болит сердце',
            response: [
                'Проверьте, есть ли следующие симптомы:',
                'Затрудненное дыхание',
                'Боль в груди, которая отражается в шею, руку, живот.',
                'Холодный пот, чувство страха.',
                'Если таких симптомов <b>нет</b>, то скорее всего это не сердечный приступ.',
                'В противном случае или для страховки вызывайте скорую.',
            ]
        },
        {
            title: 'Подозрение на инсульт',
            response: [
                '1. Есть ли критичные изменения в поведении пострадавшего? Например: внезапная слепота, дезориентация в пространстве, внезапное сильное головокружение, и тд.',
                '2. Попросите пострадавшего улыбнуться. Улыбка симметрична? (должна быть симметричной)',
                '3. Попросите пострадавшего одновременно поднять обе руки перед собой. Симметрично ли он поднял руки?',
                'Если что-то из этого есть, вызывайте скорую помощь',
                'ВАЖНО! Не давайте пострадавшему есть и пить до прибытия скорой.',
                'Обеспечьте ему покой, разговаривайте с ним и дайте доступ воздуха, например, открыв окно.',
            ]
        },
        {
            title: 'Судорожный припадок',
            response: [
                'Быстро положите его голову на свою ногу или подложите что-то мягкое (например, куртку или свитер).',
                'Чтобы человек не повредил голову',
                'ВАЖНО! Не пытайтесь открыть рот пострадавшего или вставить что-то ему в зубы - это неправильно и опасно. Не допускайте, чтобы это сделал кто-то другой.',
                'Выполните следующие действия:',
                'Если можете, поверните пострадавшего на бок.',
                'Придерживайте его, чтобы он не травмировал себя.',
                'Особенно голову.',
                'Но не пытайтесь обездвижить человека и не давите сильно. Это может навредить.'
            ]
        }
    ],
    en: [
        {
            title: 'Heavy bleeding',
            response: [
                'Ask injured to press and hold his wound tightly.',
                'It should slow down the bleeding.',
            ]
        },
        {
            title: 'Hit by a car',
            response: [
                'Protect an accident area using any available method: an emergency sign, other cars alarms, cones, bright vests, etc.',
                'Ask accident participants if they need any medical aid. If any of them are injured or they ask for a help - CALL AN AMBULANCE.',
                'Try to define who\'s got the most heavy injures. For ex., a pedestrian who was hit by a car.',
                'Ask injured not to move, as movement can harm even more.'
            ]
        },
        {
            title: 'Burn',
            response: [
                'Make sure the clothes aren\'t on fire and do not smolder, the burn reason is eliminated.',
                'Cool the burn with cold tap water, until he starts feeling cold.',
                'Then stop watering a burn.',
                'When he\'ll start feeling the burning cool it again.',
                'Call an ambulance at your discretion.',
                'In next cases calling an ambulance is essential: burn takes big area (more than 5 palms); feet, hands, face or groin are burned, burns are deep.'
            ]
        },
        {
            title: 'Fell from a height',
            response: [
                'Ask injured not to move, as movement can harm even more.',
                'Ask injured if he needs any medical aid. If he got injured or asks to call an ambulance - call it.',
            ]
        },
        {
            title: 'Broke a limb',
            response: [
                'Ask injured not to move, this is very important.',
                'Put some soft fabric under the broken limb, ensuring injured\'s comfort.',
                'If injured broke his arm but is able to hold it with a healthy one - do not prevent it.',
                'Don\'t try to repair a fracture or splint it. That might make things worse.',
                'Make sure an ambulance is coming and there is somebody to meet it.'
            ]
        },
        {
            title: 'Person is unconscious',
            response: [
                'Talk to him, ask loudly: \"Can you hear me? Are you okay?\"',
            ]
        },
        {
            title: 'Choked',
            response: [
                'Ask loudly: "Have you choked?"',
                'If <b>voiced a reply, coughing</b> - do not interfere!',
                'Do not give him water and don\'t hit his back.',
                'Tell to keep coughing and calm him down, slightly lean him forward.',
                'If <b>cannot speak and cough</b>',
                'Injured might have only couple of minutes left.',
                'Ask somebody to call an ambulance and if anyone can do the Heimlich maneuver.',
                'If no, you should do it yourself: lean injured forward, make 5 back slaps, then 5 quick and strong abdomen presses. Repeat until expectorates.'
            ]
        },
        {
            title: 'Heart attack',
            response: [
                'Check for the next symptoms:',
                'Labored breathing',
                'A chest pain which is referred to the neck, arm or stomach.',
                'Cold sweat, fear.',
                'If there are <b>no</b>such symptoms, most likely it is not a heart attack.',
                'Nevertheless, if you have some doubts, better call an ambulance to be safe.',
            ]
        },
        {
            title: 'Suspected stroke',
            response: [
                'Do next steps:',
                '1. Are there any critical changes in injured’s behavior? Like sudden blindness, disorientation, heavy dizziness, etc.',
                '2. Ask an injured to smile. Does his smile look asymmetrical? (should be symmetrical)',
                '3. Ask injured to raise both hands in front of him. Does he keep them asymmetrically? (should be symmetrically)',
                'If an answer on any of these questions is YES, call an ambulance.',
                'IMPORTANT! Do not let injured drink or eat until an ambulance comes.',
                'Provide him comfort, talk to him and make sure he has fresh fresh air (open a window, for ex.)',
            ]
        },
        {
            title: 'Convulsive seizures',
            response: [
                'Quickly move his head onto your leg or put something soft under it (like jacket or pullover).',
                'To prevent injured from hurting his head.',
                'IMPORTANT! Do not try to open an injured’s mouth and put something between his teeth. This is very dangerous, prevent others from doing it.',
                'Follow next steps:',
                'If you can roll injured to his side.',
                'Hold him, so he couldn\'t hurt himself. Especially his head.',
                'But don\'t try to immobilize him or push him too hard, that might harm.'
            ]
        }
    ]
};

function getInjureResponses(lang, query) {
    if (query.length) lang = /[а-яА-Я]/g.test(query) ? 'ru' : 'en';
    // lang = lang.indexOf('ru') !== -1 ? 'ru' : 'en';

    // lang = 'ru';

    var injuriesFiltered = injuries[lang].filter(function (elem) {
        return elem.title.toLowerCase().indexOf(query.toLowerCase()) !== -1;
    });

    var injuriesToShow = injuriesFiltered.length ? injuriesFiltered : injuries[lang];

    var ambulanceText = ambulance[lang].map(function(a, i) {
        return String(i + 1) + '. ' + a;
    });

    return injuriesToShow.map(function (elem, ind) {
        var responses = elem.response.map(function(r, i){
            return String(i + 1) + '. ' + r;
        });
        responses.unshift('<i>' + elem.title + '</i>\n');
        responses.push('_______________________');

        return {
            type: 'article',
            id: String(ind),
            title: elem.title,
            // thumb_url: elem.image,
            // thumb_width: 20,
            // thumb_height: 20,
            input_message_content: {
                message_text: responses.concat(ambulanceText).join('\n'),
                parse_mode: 'HTML'
            }
        }
    });
}

module.exports = {
    getInjureResponses: getInjureResponses
};