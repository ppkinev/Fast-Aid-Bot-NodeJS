var Scheduler = require('./user-scheduler');
var messaging = require('./send-messages');
var DBUsers = require('./db').dbUsers;
var str = require('./string-constants');
var utils = require('./utils');

// ***********************************************************
// *** Music mini-game
// ***********************************************************
var musicBasePath = '../../_Media/audio/minigame-maniac/';
var songSets = [
	[
		{
			name: 'Giuseppe  Verdi  – La Traviata',
			path: musicBasePath + 'Classic Traviata.mp3',
			alt: {
				classic: ['Giacomo Puccini –Turandot', 'Wolfgang Mozart  – Don Giovanni'],
				rock: ['RHCP – Dani California', 'The Beatles – Yesterday', 'Radiohead – Creep'],
				pop: ['Britney Spears –  Toxic', 'Backstreet Boys – Everybody', 'Christina Aguilera – Candyman']
			}
		},
		{
			name: 'Моё сердце – Сплин',
			path: musicBasePath + 'Rock Splin.mp3',
			alt: {
				classic: ['П.И.Чайковский – Щелкунчик', 'А.П.Бородин – Князь Игорь', 'С.В.Рахманинов – Алеко'],
				rock: ['Ленинград – Лабутены', 'ДДТ – Осень'],
				pop: ['Тимати – Лада–седан', 'Потап и Настя – Непара', 'На–на — Фаина']
			}
		},
		{
			name: 'Celine Dion – My heart will go on',
			path: musicBasePath + 'Pop Dion.mp3',
			alt: {
				classic: ['Ludwig van Beethoven – Fidelio', 'Vincenzo Bellini – Norma', 'Léo Delibes – Lakmé'],
				rock: ['Led Zeppelin – Kashmir', 'Pink Floyd – Time', 'Scorpions – Wind of Change'],
				pop: ['PSY – Gangem style', 'Rhianna – Umbrella']
			}
		}
	],
	[
		{
			name: 'Giuseppe Verdi – Rigoletto',
			path: musicBasePath + 'Classic Rigoletto.mp3',
			alt: {
				classic: ['Charles Gounod – Faust', 'L’Orfeo – Claudio Monteverdi'],
				rock: ['U2 – Elevation', 'The Doors  – Light my fire', 'Chumbawamba – Tubthumping'],
				pop: ['Katy Perry – Roar', 'Miley Cyrus – Wrecking Ball', 'Justin Bieber – Sorry']
			}
		},
		{
			name: 'Nirvana – Like a teen spirit',
			path: musicBasePath + 'Rock Nirvana.mp3',
			alt: {
				classic: ['R.Wagner – Siegfried', 'R.Wagner – Das Rheingold', 'R.Wagner – Parsifal'],
				rock: ['Nirvana – In bloom', 'Nirvana – Come as you are'],
				pop: ['Michael Jackson – Thriller', 'Michael Jackson – Billie Jean', 'Michael Jackson – Black or White']
			}
		},
		{
			name: 'Last Christmas – George Michael',
			path: musicBasePath + 'Pop George Michael.mp3',
			alt: {
				classic: ['Antonín Dvořák – Rusalka', 'R. Leoncavallo – Pagliacci', 'D.Donizetti - L\'elisir d\'amore'],
				rock: ['Motörhead –  Ace of Spades', 'Aerosmith – Crazy', 'Limp Bizkit – Break stuff'],
				pop: ['Bing Crosby – White Christmas', 'Mariah Carey – Oh Santa']
			}
		}
	],
	[
		{
			name: 'Georges Bizet – Carmen',
			path: musicBasePath + 'Classic Carmen.mp3',
			alt: {
				classic: ['Richard Strauss – Salome', 'Jacopo Peri – Euridice'],
				rock: ['Black Sabbath – Iron man', 'Iron Maiden – The Trooper', 'Slipknot – Snuff'],
				pop: ['Roxette – The Look', 'ABBA – Mamma mia', 'Ace of Base – The Sign']
			}
		},
		{
			name: 'Show must go on, Queen',
			path: musicBasePath + 'Rock Queen.mp3',
			alt: {
				classic: ['G.Rossini – La Cenerentola', 'G.Rossini – Guillaume Tell', 'G.Rossini – Mosè in Egitto'],
				rock: ['Elvis  – Jailhouse rock', 'Rolling Stones – Satisfaction'],
				pop: ['Madonna – Like a virgin', 'Prince – Purple Rain', 'Sade – Smooth Operator']
			}
		},
		{
			name: 'Bad Romance, Lady Gaga',
			path: musicBasePath + 'Pop Lady Gaga.mp3',
			alt: {
				classic: ['Alban Berg – Wozzeck', 'Jules Massenet – Manon', 'Andrew Lloyd Webber – Cats'],
				rock: ['AC/DC – TNT', 'System of a down – Toxicity', 'Metallica – Master of puppets'],
				pop: ['Tailor Swift – Shake it off', 'Spice Girls – Wannabe']
			}
		}
	]
];


var MAX_TRIES = songSets[0].length;
var songsPlain = [[], [], []];
var songsPlainAll = [];

songSets.forEach(function (set) {
	set.forEach(function (song, index) {
		songsPlain[index].push(song.name);
		for (var alt in song.alt) {
			if (song.alt.hasOwnProperty(alt)) {
				songsPlain[index] = songsPlain[index].concat(song.alt[alt]);
			}
		}
	});
});

songsPlainAll = songsPlainAll.concat(songsPlain[0]).concat(songsPlain[1]).concat(songsPlain[2]);

var genres = str.miniGames.guessMusic.genres;
var backToGenres = str.miniGames.guessMusic.backToGenres;
var startGame = str.miniGames.guessMusic.startGame;

var shuffle = function (a) {
	var j, x, i;
	for (i = a.length; i; i--) {
		j = Math.floor(Math.random() * i);
		x = a[i - 1];
		a[i - 1] = a[j];
		a[j] = x;
	}
};

var getSong = function (set, index) {
	return songSets[set][index];
};

var getSongsChoices = function (set, index, genre) {
	switch (genre) {
		case genres[0]:
			genre = 'classic';
			break;
		case genres[1]:
			genre = 'rock';
			break;
		case genres[2]:
			genre = 'pop';
			break;
	}
	var list = songSets[set][index].alt[genre].slice(0);
	if (list.length < 3) list.push(songSets[set][index].name);
	shuffle(list);

	return list;
};

var checkGuesses = function (musicGuessSongs, musicGuessSet) {
	var guessed = 0;
	songSets[musicGuessSet].forEach(function (song) {
		musicGuessSongs.forEach(function (name) {
			if (name === song.name) guessed++;
		});
	});

	return guessed >= MAX_TRIES - 0;
};

var musicGuessFn = function (user, input) {
	var wrongInput = !genres.some(function (g) {
			return g === input
		})
		&& !songsPlainAll.some(function (s) {
			return s === input
		})
		&& input !== backToGenres
		&& input !== startGame;
	if (wrongInput) return null;

	var musicGuessSet = user['progress']['miniGames']['musicGuess']['set'];
	var musicGuessSongs = user['progress']['miniGames']['musicGuess']['songs'];
	var songEntered = songsPlainAll.some(function (s) {
		return s === input
	});
	var categoryEntered = genres.some(function (g) {
		return g === input
	});

	var sendCategories = function(){
		messaging.send({
			id: user['_id'],
			answer: {
				type: 'guess-music',
				choices: [
					{message: genres[0]},
					{message: genres[1]},
					{message: genres[2]}
				]
			},
			text: 'Выбери жанр:',
			speaker: 'eva',
			type: 'text',
			lastLine: true
		});
	};

	if (input === startGame) {
		// Resetting game parameters, when the game starts
		musicGuessSet = null;
		musicGuessSongs = [];
		DBUsers(function (db, collection) {
			collection.updateOne({'_id': user['_id']},
				{'$set': {
                    'progress.miniGames.musicGuess.songs': [],
                    'progress.miniGames.musicGuess.set': null
                }}
			);
		});
	}

	if (input === backToGenres) sendCategories();

	if (songEntered) {
		// ...
		// Send intermediate message here
		// ...

		musicGuessSongs.push(input);
		DBUsers(function (db, collection) {
			collection.updateOne({'_id': user['_id']},
				{'$set': {'progress.miniGames.musicGuess.songs': musicGuessSongs}}
			);
		});
	}

	if (!musicGuessSet) {
		musicGuessSet = Math.floor(Math.random() * songSets.length);
		DBUsers(function (db, collection) {
			collection.updateOne({'_id': user['_id']},
				{'$set': {'progress.miniGames.musicGuess.set': musicGuessSet}}
			);
		});
	}

	if (musicGuessSongs.length >= MAX_TRIES) {
		return checkGuesses(musicGuessSongs, musicGuessSet)
			? 'guess-music-block-win'
			: 'guess-music-block-fail';
	}

	if (input === startGame || songEntered) {
		// TODO: send next audio here
		var song = getSong(musicGuessSet, musicGuessSongs.length);
		messaging.send({
			id: user['_id'],
			answer: null,
			speaker: 'eva',
			type: 'audio',
			audio: song.path
		}, function(){
			Scheduler.add({
				delay: 3, uid: user['_id'], event: function () {
					sendCategories();
				}
			});
		});
	}

	if (categoryEntered) {
		var songsList = getSongsChoices(musicGuessSet, musicGuessSongs.length, input);
		messaging.send({
			id: user['_id'],
			answer: {
				type: 'guess-music',
				choices: [
					{message: songsList[0]},
					{message: songsList[1]},
					{message: songsList[2]},
					{message: backToGenres}
				]
			},
			text: 'Выбери песню:',
			speaker: 'eva',
			type: 'text',
			lastLine: true
		});
	}

	return 'stop-main-dialogs';
};

// ***********************************************************
// *** End of music mini-game
// ***********************************************************

// ***********************************************************
// *** Maniac photos mini-game
// ***********************************************************
var maniacOptions = ['Виновен', 'Не виновен'];
var maniacBasePath = '../../_Media/images/chapter2/minigame-judgement/';
var maniacPhotos = [
	{path: maniacBasePath + 'alonso_lopes.jpg', isManiac: true},
	{path: maniacBasePath + 'einstain.jpg', isManiac: false},
	{path: maniacBasePath + 'geibl.jpg', isManiac: false},
	{path: maniacBasePath + 'edvard_gein.jpg', isManiac: true},
	{path: maniacBasePath + 'ledygaga.jpg', isManiac: false},
	{path: maniacBasePath + 'lenon.jpg', isManiac: false},
	{path: maniacBasePath + 'chekatilo.jpg', isManiac: true},
	{path: maniacBasePath + 'mark_twain.jpg', isManiac: false},
	{path: maniacBasePath + 'theodor_bandi.jpg', isManiac: true},
	{path: maniacBasePath + 'paul_koshka.jpg', isManiac: false}
];

var checkManiacGuesses = function (maniacGuess) {
	var amountToWin = 6;
	var guessed = 0;
	for (var i = 0; i < maniacPhotos.length; i++) {
		if (maniacPhotos[i].isManiac == maniacGuess[i]) guessed++;
	}

	return guessed >= amountToWin;
};

var maniacGusssFn = function (user, input) {
	var startEntered = input === str.miniGames.guessManiac.startGame;
	var choiceEntered = maniacOptions.some(function (c) {
		return input === c
	});
	if (!startEntered && !choiceEntered) return null; // Wrong input

	var maniacGuess = user['progress']['miniGames']['maniacGuess'];

	if (startEntered) {
		DBUsers(function (db, collection) {
			collection.updateOne({'_id': user['_id']},
				{'$set': {'progress.miniGames.maniacGuess': []}}
			);
		});
		maniacGuess = [];
	}


	if (choiceEntered) {
		input = input === maniacOptions[0] ? 1 : 0;
		maniacGuess.push(input);
		DBUsers(function (db, collection) {
			collection.updateOne({'_id': user['_id']},
				{'$set': {'progress.miniGames.maniacGuess': maniacGuess}}
			);
		});
	}

	if (maniacGuess.length >= maniacPhotos.length) {
		return checkManiacGuesses(maniacGuess)
			? 'guess-maniac-block-win'
			: 'guess-maniac-block-fail';
	}

	messaging.send({
		id: user['_id'],
		speaker: 'eva',
		type: 'image',
		text: 'Photo sent',
		image: maniacPhotos[maniacGuess.length].path,
		lastLine: false
	}, function () {
		Scheduler.add({
			delay: 3, uid: user['_id'], event: function () {
				messaging.send({
					id: user['_id'],
					answer: {
						type: 'guess-maniac',
						choices: [
							{message: maniacOptions[0]},
							{message: maniacOptions[1]},
						]
					},
					text: 'Виновен или нет?',
					speaker: 'eva',
					type: 'text',
					lastLine: true
				});
			}
		});
	});

	return 'stop-main-dialogs';
};

// ***********************************************************
// *** End of maniac photos mini-game
// ***********************************************************

// ***********************************************************
// *** Send message in 30-40 seconds range time
// ***********************************************************
var sendMessagesInRange = ['Ева, ты там как?', '30 секунд прошло', 'Привет от Евы!'];
var sendMessageInRangeFn = function (user, input) {
	var startEntered = input === str.miniGames.sendInRange.startGame;
	var time = user['progress']['miniGames']['sendInRange'];

	if (!startEntered) {
		var diff = (utils.getNow() - time) / 1000;
		if (diff < 25 || diff > 40) {
			return 'try-again';
		} else {
			return 'success-block';
		}
	}

	messaging.send({
		id: user['_id'],
		answer: {
			type: 'send-in-range',
			choices: [
				{message: sendMessagesInRange[0]},
				{message: sendMessagesInRange[1]},
				{message: sendMessagesInRange[2]}
			]
		},
		text: 'Через 30 секунд напиши, не затягивай!!',
		speaker: 'eva',
		type: 'text',
		lastLine: true
	}, function () {
		DBUsers(function (db, collection) {
			collection.updateOne({'_id': user['_id']},
				{'$set': {'progress.miniGames.sendInRange': utils.getNow()}}
			);
		});
	});

	return 'stop-main-dialogs';
};

// ***********************************************************
// *** End of send message in 30-40 seconds range time
// ***********************************************************


module.exports = {
	guessMusic: musicGuessFn,
	guessManiac: maniacGusssFn,
	sendInRange: sendMessageInRangeFn
};