var Jax = function() {

	var allLines = [],
		linesByCell = [],
		cellCaptors = [],
		cellsByCard = {},
		autoPlayers = [],
		DECKS = [
			"ac", "2c", "3c", "4c", "5c", "6c", "7c", "8c", "9c", "tc", "jc", "qc", "kc",
			"ac", "2c", "3c", "4c", "5c", "6c", "7c", "8c", "9c", "tc", "jc", "qc", "kc",
			"ad", "2d", "3d", "4d", "5d", "6d", "7d", "8d", "9d", "td", "jd", "qd", "kd",
			"ad", "2d", "3d", "4d", "5d", "6d", "7d", "8d", "9d", "td", "jd", "qd", "kd",
			"ah", "2h", "3h", "4h", "5h", "6h", "7h", "8h", "9h", "th", "jh", "qh", "kh",
			"ah", "2h", "3h", "4h", "5h", "6h", "7h", "8h", "9h", "th", "jh", "qh", "kh",
			"as", "2s", "3s", "4s", "5s", "6s", "7s", "8s", "9s", "ts", "js", "qs", "ks",
			"as", "2s", "3s", "4s", "5s", "6s", "7s", "8s", "9s", "ts", "js", "qs", "ks",
			"J1", "J2", "J3", "J4"
		],
		templates = {
			stdCell: Handlebars.compile('<li class="{{classes}} suit {{suit}}" data-cell="{{cell}}" data-card="{{card}}"></li>'),
			jokerCell: Handlebars.compile('<li class="{{classes}} joker joker-{{type}}" data-cell="{{cell}}" data-card="{{card}}"></li>'),
			stdCard: Handlebars.compile('<li class="{{classes}} suit {{suit}}" data-pos="{{position}}" data-card="{{card}}"><span></span></li>'),
			jokerCard: Handlebars.compile('<li class="{{classes}} joker joker-{{type}}" data-pos="{{position}}" data-card="{{card}}"></li>')
		},
		BOARDS = {
			sequence: [
				'J1', '6d', '7d', '8d', '9d', 'td', 'qd', 'kd', 'ad', 'J2',
				'5d', '3h', '2h', '2s', '3s', '4s', '5s', '6s', '7s', 'ac',
				'4d', '4h', 'kd', 'ad', 'ac', 'kc', 'qc', 'tc', '8s', 'kc',
				'3d', '5h', 'qd', 'qh', 'th', '9h', '8h', '9c', '9s', 'qc',
				'2d', '6h', 'td', 'kh', '3h', '2h', '7h', '8c', 'ts', 'tc',
				'as', '7h', '9d', 'ah', '4h', '5h', '6h', '7c', 'qs', '9c',
				'ks', '8h', '8d', '2c', '3c', '4c', '5c', '6c', 'ks', '8c',
				'qs', '9h', '7d', '6d', '5d', '4d', '3d', '2d', 'as', '7c',
				'ts', 'th', 'qh', 'kh', 'ah', '2c', '3c', '4c', '5c', '6c',
				'J3', '9s', '8s', '7s', '6s', '5s', '4s', '3s', '2s', 'J4'
			],
			oneEyedJack: "J1 td 9d 8d 7d 7s 8s 9s ts J2 \
				tc kc 6d 5d 4d 4s 5s 6s kh th \
				9c 5c qc 3d 2d 2s 3s qh 6h 9h \
				8c 6c 3c qd ad as qs 3h 5h 8h \
				7c 4c 2c ac kd ks ah 2h 4h 7h \
				7h 4h 2h ah ks kd ac 2c 4c 7c \
				8h 5h 3h qs as ad qd 3c 5c 8c \
				9h 6h qh 3s 2s 2d 3d qc 6c 9c \
				th kh 6s 5s 4s 4d 5d 6d kc tc \
				J3 ts 9s 8s 7s 7d 8d 9d td J4",
			custom1: [
				'kh', 'qh', 'th', '9h', '8h', '7h', '6h', '5h', '4h', 'ks',
				'4c', '3c', '2c', '6s', '7s', '8s', '9s', 'ts', '3h', 'qs',
				'5c', 'th', 'qh', '5s', 'J1', 'as', 'ks', 'qs', '2h', 'ts',
				'6c', '9h', 'kh', '4s', '2d', '3d', '4d', '5d', '6d', '9s',
				'7c', '8h', 'ah', '3s', 'ac', 'ah', '2c', 'J2', '7d', '8s',
				'8c', '7h', 'J4', '2s', 'ad', 'as', '3c', 'ad', '8d', '7s',
				'9c', '6h', '5h', '4h', '3h', '2h', '4c', 'kd', '9d', '6s',
				'tc', '2d', 'qc', 'kc', 'ac', 'J3', '5c', 'qd', 'td', '5s',
				'qc', '3d', 'tc', '9c', '8c', '7c', '6c', '2s', '3s', '4s',
				'kc', '4d', '5d', '6d', '7d', '8d', '9d', 'td', 'qd', 'kd'
			]
		},
		OPEN = 1,
		P1 = 2,
		P2 = 4,
		P3 = 8,
		P4 = 16,
		playerFlags = [P1, P2, P3, P4],
		playerClasses = ['p1', 'p2', 'p3', 'p4'],
		selectedCard,
		cellStates = [],
		players = [],
		gameServerHost = 'http=//localhost=9000/',
		discardPile = [],
		online,
		gameDeck,
		activePlayer,
		$self = $(this),
		self = this;

	// TODO: move this so that different logic can be applied depending on type of game (online/offline)
	$('#discardPile').click(function() {

		var activeCard = selectedCard;

		if(online) {

			gameSocket.emit('discard-card', activeCard.index);

		} else {

			if(activeCard && isDeadCard(activeCard.value)) {

				self.discardAndReplaceCard(0, activeCard.index);
				displayHand();
				delete selectedCard;
			}
		}
	});

	$('button.play-online').click(function() {

		var activeGameId = localStorage.getItem('activeGameId');

		if(activeGameId) {
			connectToGame(activeGameId);
		} else {
			if(!window.sio) {
				window.sio = io.connect(gameServerHost);

				sio.on('found-game', function(gameId) {

					connectToGame(gameId);
				});
			}
			// TODO: modify to allow the selection of a board to play
			sio.emit('find-opponent');
		}
	});

	$('button.play').click(function() {

		$('#splash, #rules, #dialog').hide();
		$('#game').show();
		$('#message').hide();

		startOfflineGame({
			board: ['sequence', 'oneEyedJack', 'custom1'][Math.floor(Math.random() * 3)]
		});

		$('#splash button.rules').click(function() {

			$('#splash, #game, #rules').hide();
			$('#rules button').hide()
			$('#rules button.play').show()
			$('#rules button.play-online').show()
			$('#rules').show();
		});

		$('#game button.rules').click(function() {

			$('#splash, #game, #rules').hide();
			$('#rules button').hide()
			$('#rules button.back').show()
			$('#rules').show();
		});

		$('#game button.quit').click(function() {

			// TODO: send resign event to server
			localStorage.removeItem('activeGameId');
			localStorage.removeItem('playerIndex');
			$('#splash, #game, #rules').hide();
			$('#rules button').hide()
			$('#rules button.back').show()
			$('#splash').show();
		});

		$('#rules button.back').click(function() {

			$('#dialog, #rules').hide();
			$('#game').show();
		});
	});

	//	function newOnlineGame(boardName, cards, cellStates) {
	//
	//		// TODO: rework this method to be more consolidated in the loop
	//
	//		var board = this.BOARDS[boardName || 'sequence'];
	//		var html = [];
	//
	//		online = true;
	//
	//		for(var i = 0; i < 100; i++) {
	//
	//			var card = board[i];
	//
	//			if(card != JOKER) {
	//
	//				var cellState = cellStates[i] = cellStates ? cellStates[i] : OPEN;
	//				// This sexy lil bit o code is just finding the index of the class name by taking the cube root and subtracting one.
	//				// This only works because the player flags are 2 (2^1),4 (2^2) and 8 (2^3)
	//				var className = CAPTURED_CELL_CLASSES[Math.log(cellState) / Math.LN2 - 1];
	//				cellCards[i] = card;
	//				var suit = SUITS[Math.floor(card / 13)];
	//				html.push('<li class="' + className + '" data-cell="' + i + '" data-value="' + card + '" data-suit="' + suit + '></li>');
	//
	//			} else {
	//				var cellState = cellStates[i] = cellStates ? cellStates[i] : (P1 | P2 | P3 | OPEN);
	//				var className = CAPTURED_CELL_CLASSES[Math.log(cellState) / Math.LN2 - 1];
	//				html.push('<li class="' + className + '" data-cell="' + i + '" data-joker="' + card + '" data-suit="JOKER"></li>');
	//			}
	//		}
	//
	//		$('#board').html(html.join(''));
	//
	//		cells = $('#board li');
	//
	//		cells.click(function() {
	//
	//			gameSocket.emit('play', $(this).attr('data-cell'), selectedCard.index);
	//
	//		});
	//
	//		// TODO: fix this to use the players index
	//		players.push({
	//			cards: cards
	//		});
	//		discardPile = [];
	//		$('#player1').on('click', 'li', this.selectCard);
	//		$('#discardPile').html('')
	//		displayHand();
	//	}

	function startOfflineGame(config) {

		config = config || {

		};

		online = false;
		activePlayer = 0;

		var board = readBoard(BOARDS[config.board || 'sequence']),
			suitMapping = {d: 'diamond', c: 'club', h: 'heart', s: 'spade'},
			html = [], card,
			line,
			row, col, start;

		// vertical
		for(row = 0; row < 6; row++) {
			for(col = 0; col < 10; col++) {
				start = (row * 10) + col;
				line = [start, start + 10, start + 20, start + 30, start + 40];
				linesByCell[start] = (linesByCell[start] || []).concat([line]);
				linesByCell[start + 10] = (linesByCell[start + 10] || []).concat([line]);
				linesByCell[start + 20] = (linesByCell[start + 20] || []).concat([line]);
				linesByCell[start + 30] = (linesByCell[start + 30] || []).concat([line]);
				linesByCell[start + 40] = (linesByCell[start + 40] || []).concat([line]);
				allLines.push(line);
			}
		}

		// horizontal
		for(row = 0; row < 10; row++) {
			for(col = 0; col < 6; col++) {
				start = (row * 10) + col;
				line = [start, start + 1, start + 2, start + 3, start + 4];
				linesByCell[start] = (linesByCell[start] || []).concat([line]);
				linesByCell[start + 1] = (linesByCell[start + 1] || []).concat([line]);
				linesByCell[start + 2] = (linesByCell[start + 2] || []).concat([line]);
				linesByCell[start + 3] = (linesByCell[start + 3] || []).concat([line]);
				linesByCell[start + 4] = (linesByCell[start + 4] || []).concat([line]);
				allLines.push(line);
			}
		}

		// diagonal down
		for(row = 0; row < 6; row++) {
			for(col = 0; col < 6; col++) {
				start = (row * 10) + col;
				line = [start, start + 11, start + 22, start + 33, start + 44];
				linesByCell[start] = (linesByCell[start] || []).concat([line]);
				linesByCell[start + 11] = (linesByCell[start + 11] || []).concat([line]);
				linesByCell[start + 22] = (linesByCell[start + 22] || []).concat([line]);
				linesByCell[start + 33] = (linesByCell[start + 33] || []).concat([line]);
				linesByCell[start + 44] = (linesByCell[start + 44] || []).concat([line]);
				allLines.push(line);
			}
		}

		// diagonal up
		for(row = 4; row < 10; row++) {
			for(col = 0; col < 6; col++) {
				start = (row * 10) + col;
				line = [start, start - 9, start - 18, start - 27, start - 36];
				linesByCell[start] = (linesByCell[start] || []).concat([line]);
				linesByCell[start - 9] = (linesByCell[start - 9] || []).concat([line]);
				linesByCell[start - 18] = (linesByCell[start - 18] || []).concat([line]);
				linesByCell[start - 27] = (linesByCell[start - 27] || []).concat([line]);
				linesByCell[start - 36] = (linesByCell[start - 36] || []).concat([line]);
				allLines.push(line);
			}
		}

		cellCaptors = [];

		for(var i = 0; i < 100; i++) {

			card = board[i];

			if(card[0] == 'J') {

				html.push(templates.jokerCell({
					card: card,
					type: card[1],
					cell: i
				}));
				cellStates[i] = (P1 | P2 | P3 | P4 | OPEN);

			} else {

				html.push(templates.stdCell({
					card: card,
					suit: suitMapping[card[1]],
					cell: i
				}));
				cellStates[i] = OPEN;

			}

			cellCaptors.push([]);
		}

		$('#board').html(html.join(''));

		cells = $('#board li');
		numPlayers = config.totalPlayers || 4;
		gameDeck = shuffleDecks();
		discardPile = [];
		players = [];
		for(var i = 0; i < numPlayers; i++) {
			players.push({
				playerIndex: i,
				cards: [],
				jackableCells: []
			});
		}

		for(i = 0; i < 7; i++) {
			for(var k = 0; k < numPlayers; k++) {
				players[k].cards.push(gameDeck.pop());
			}
		}

		for(i = 1; i < numPlayers; i++) {
			autoPlayers.push(new Hal({
				totalPlayers: numPlayers,
				playerIndex: i,
				board: board,
				game: self,
				hand: players[i].cards
			}))
		}

		cells.click(function() {

			var cell = $(this),
				cellIndex = cell.attr('data-cell'),
				cellCard = cell.attr('data-card'),
				player = players[0],
				cards = player.cards,
				playAccepted = false;

			// is a card being played
			// is the cell unoccupied or is it being jacked

			if(activePlayer === 0 && selectedCard) {

				// cell must be unoccupied and the card being played must match the cell or be a freejack.
				// freejacks can't be used to capture jokers
				if(isOpen(cellIndex) && isMatch(selectedCard.value, cellCard)) {

					// consider play accepted unless the game is over.
					playAccepted = self.playCard(0, cellIndex, selectedCard.index) === false;
				} else if(isCellJacker(selectedCard.value) && isOccupied(cellIndex) && cellStates[cellIndex] != P1) {

					self.jackCell(0, cellIndex);
					playAccepted = true;

				}

				if(playAccepted) {
					cards.splice(selectedCard.index, 1);
					if(gameDeck.length > 0) {
						cards.push(gameDeck.pop());
					}

					$self.trigger('carddiscarded', {
						player: 0,
						card: selectedCard.value
					});
					addToDiscardPile(selectedCard.value, player.playerIndex);
					selectedCard = null;

					displayHand();
					self.completeTurn(0);
				}
			}
		});

		$('#player1').on('click', 'li', selectCard);
		displayHand();
	}

	function isMatch(card, cell) {

		var result = false;
		if(cell[0] == 'J') {
			result = card[0] == 'J';
		} else if(card == cell) {
			result = true;
		} else if(isFreeJack(card)) {
			result = true;
		}

		return result;
	}

	function endGame(winner) {

		$self.trigger('gameended', winner);
		$self.off();

		$('#dialog p').html(winner ? "You win!" : "You lose.");
		$('#dialog').css('z-index', 10000).show();
		$('#player1').unbind('click', selectCard);


	}

	function selectCard() {

		var $this = $(this);
		if($this.is('.active')) {
			$this.removeClass('active');
			delete selectedCard;
		} else {
			$('#player1').find('li').removeClass('active');
			$(this).addClass('active');
			selectedCard = {
				index: $(this).attr('data-pos'),
				value: $(this).attr('data-card')
			};
		}
	}

	function isSeq(index, flag) {

		var lines = linesByCell[index],
			i;

		for(i = 0; i < lines.length; i++) {
			if(lines[i].every(function(cell) {
				return (cellStates[cell] & flag);
			})) {
				return true;
			}
		}

		return false;
	}

	function readBoard(board) {

		var card;

		board = board instanceof Array ? board : board.replace(/^\s+/, '').replace(/\s+$/, '').split(/\s+/);

		for(i = 0; i < board.length; i++) {

			card = board[i];
			if(card[0] == 'J') {
				cellsByCard[card] = (cellsByCard[card] || []).concat([i]);
			} else {
				cellsByCard['j1'] = (cellsByCard['j1'] || []).concat([i]);
				cellsByCard['j2'] = (cellsByCard['j2'] || []).concat([i]);
				cellsByCard['j3'] = (cellsByCard['j3'] || []).concat([i]);
				cellsByCard['j4'] = (cellsByCard['j4'] || []).concat([i]);
			}
		}

		return board;
	}

	function shuffleDecks() {
		var a = [].concat(DECKS);
		for(var i = a.length - 1; i; i--) {
			var j = parseInt(Math.random() * i);
			var tmp = a[i];
			a[i] = a[j];
			a[j] = tmp;
		}

		return a;
	}

	function isDeadCard(card) {

		var cells = this.cardToCells[card],
			result = true;

		if(card[0] == 'j' || card[0] == 'J') {
			result = false;
		} else {

			for(var i = 0; i < cells.length; i++) {

				if(!this.isOccupied(cells[i])) {

					result = false;
					break;
				}
			}
		}

		return result;
	}

	function isOpen(index) {

		return !isOccupied(index);
	}

	function isOccupied(index) {

		return !(cellStates[index] & OPEN);
	}

	function isCellJacker(card) {

		return (card == 'jd' || card == 'jh');
	}

	function isFreeJack(card) {

		return (card == 'jc' || card == 'js');
	}

	function isCardInHand(card, playerIndex) {

		var cards = players[playerIndex].cards;

		return (cards.indexOf(card) != -1);
	}

	function addToDiscardPile(card, playerIndex) {

		discardPile.push({
			card: card,
			player: "p" + (playerIndex + 1)
		});
		if(discardPile.length > 10) {
			discardPile.shift();
		}

		var suitMapping = {d: 'diamond', c: 'club', h: 'heart', s: 'spade'},
			entry,
			html = [];

		for(var i = 0; i < discardPile.length; i++) {

			entry = discardPile[i];
			card = entry.card;

			if(card[0] != 'J') {
				html.push(templates.stdCard({
					card: card,
					suit: suitMapping[card[1]],
					classes: entry.player
				}));
			} else {
				// add support displaying joker cards correctly
				html.push(templates.jokerCard({
					classes: entry.player,
					type: card[1],
					card: card
				}));
			}

			$('#discardPile').html(html.join(''))

		}
	}

	function mark(cell, playerIndex) {
		$(cells[cell]).addClass(playerClasses[playerIndex]);
		cellStates[cell] = playerFlags[playerIndex];
	}

	function unmark(index) {
		$(cells[index]).removeClass('p1 p2 p3 p4');
		cellStates[index] = OPEN;
	}

	function displayHand() {

		var pcards = (window.localPlayer || players[0]).cards,
			suitMapping = {d: 'diamond', c: 'club', h: 'heart', s: 'spade'},
			html = [];

		for(var i = 0; i < pcards.length; i++) {

			var card = pcards[i];

			if(card[0] == 'J') {
				html.push(templates.jokerCard({
					type: card[1],
					card: card,
					position: i
				}));
			} else {
				html.push(templates.stdCard({
					card: card,
					suit: suitMapping[card[1]],
					position: i
				}));
			}
		}

		$('#player1').html(html);
	}

	// public functions

	this.playCard = function(playerIndex, cell, cardIndex) {

		var player = players[playerIndex],
			cards = player.cards,
			card = cards[cardIndex],
			flag = playerFlags[playerIndex],
			gameOver = false;

		console.log('Player ' + playerIndex + ': ' + card + '@' + cell);

		$self.trigger('cardplayed', {
			player: playerIndex,
			card: card,
			cell: cell
		});

		mark(cell, playerIndex);

		if(isSeq(cell, flag)) {
			endGame(playerIndex == 0);
			gameOver = true;
			$self.trigger('gameover', {
				winner: playerIndex
			})
		}

		return gameOver;
	}

	this.jackCell = function(playerIndex, cell) {

		//		if(isCellJacker(card)) {

		unmark(cell);
		$self.trigger('celljacked', {
			player: playerIndex,
			cell: cell
		});

		//		}
	}

	this.discardAndReplaceCard = function(playerIndex, cardIndex) {

		var cards = players[playerIndex].cards,
			card = cards[cardIndex];

		addToDiscardPile(card, playerIndex);
		cards.splice(cardIndex, 1);

		if(gameDeck.length > 0) {
			cards.push(gameDeck.pop());
		}

		$self.trigger('carddiscarded', {
			player: playerIndex,
			card: card
		});

		return cards;
	}

	this.completeTurn = function(player) {
		activePlayer = (player + 1) % numPlayers;
		$self.trigger('turnchanged', activePlayer);
	}

};

var game;
$(function() {

	game = new Jax();
});

/*
 var gameSocket;

 function connectToGame(gameId, rejoin) {

 localStorage.setItem('activeGameId', gameId);

 gameSocket = io.connect(gameServerHost + gameId);
 gameSocket.on('connect', function() {
 console.log('Connected to game!');
 var playerIndex = localStorage.getItem('playerIndex');
 if(playerIndex !== null) {
 gameSocket.emit('rejoin', playerIndex);
 } else {
 gameSocket.emit('join', "Anonymous-" + new Date().getTime());
 }
 });

 gameSocket.on('waiting-for-players', function() {

 $('#message').html('Waiting for another player to join.').show();
 });

 gameSocket.on('play-accepted', function(playerIndex, cellIndex, card) {

 if(isRedJack(card)) {
 unmark(cellIndex);
 } else {
 mark(cellIndex, CAPTURED_CELL_CLASSES[playerIndex]);
 }
 addToDiscardPile(card, playerIndex);
 });

 gameSocket.on('start-game', function(boardName, cards) {

 $('#message').hide();
 $('#splash, #rules, #dialog').hide();
 $('#game').show();
 window.localPlayer = {
 cards: cards
 }
 newOnlineGame(boardName, cards);

 });

 gameSocket.on('player-joined', function(name, index) {
 console.log('Player number ' + index + '[' + name + '] joined the game.')
 });

 gameSocket.on('joined', function(name, index) {

 localStorage.setItem('playerIndex', index);
 });

 gameSocket.on('card-drawn', function(card, index) {
 localPlayer.cards.splice(index, 1, card);
 displayHand();
 });

 gameSocket.on('card-discarded', function(card) {
 addToDiscardPile(card, playerIndex);
 });

 gameSocket.on('take-turn', function() {

 $('#message').text("It's your turn.").show().delay(2000).fadeOut();
 });

 gameSocket.on('winner', function() {

 gameOver(true);
 localStorage.removeItem('activeGameId');
 localStorage.removeItem('playerIndex');
 });

 gameSocket.on('loser', function() {

 gameOver(false);
 });

 gameSocket.on('game-in-progress', function(gameState) {

 $('#message').hide();
 $('#splash, #rules, #dialog').hide();
 $('#game').show();
 window.localPlayer = {
 cards: gameState.cards
 }
 newOnlineGame(gameState.boardName, gameState.cards, gameState.cellStates);

 for(var i = 0; i < gameState.discarded.length; i++) {
 var entry = gameState.discarded[i];
 addToDiscardPile(entry.card, entry.player);
 }
 if(gameState.canPlay) {

 $('#message').text("It's your turn.").show().delay(2000).fadeOut();
 }

 });
 }
 */