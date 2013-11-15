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
		OPEN = 1,
		P1 = 2,
		P2 = 4,
		P3 = 8,
		P4 = 16,
		playerFlags = [P1, P2, P3, P4],
		cellStates = [],
		players = [],
		numPlayers,
		board,
		online,
		gameDeck,
		activePlayer,
		cardDiscarded,
		$self = $(this),
		self = this,
		ui = new UI({
			game: this
		});

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

	function findCompletedSequence(index, flag) {

		var lines = linesByCell[index],
			i;

		for(i = 0; i < lines.length; i++) {
			if(lines[i].every(function(cell) {
				return (cellStates[cell] & flag);
			})) {
				return lines[i];
			}
		}

		return false;
	}

	function readBoard(board) {

		var card, i;

		cellsByCard = {};
		board = board instanceof Array ? board : board.replace(/^\s+/, '').replace(/\s+$/, '').split(/\s+/);

		for(i = 0; i < board.length; i++) {

			card = board[i];
			if(card[0] != 'J') {
				cellsByCard[card] = (cellsByCard[card] || []).concat([i]);
			} else {
				cellsByCard['J1'] = (cellsByCard['J1'] || []).concat([i]);
				cellsByCard['J2'] = (cellsByCard['J2'] || []).concat([i]);
				cellsByCard['J3'] = (cellsByCard['J3'] || []).concat([i]);
				cellsByCard['J4'] = (cellsByCard['J4'] || []).concat([i]);
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

		var cells = cellsByCard[card],
			result = true;

		if(card[0] == 'j' || card[0] == 'J') {
			result = false;
		} else {

			for(var i = 0; i < cells.length; i++) {

				if(!isOccupied(cells[i])) {

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

	// public functions

	this.playCard = function(playerIndex, cell, cardIndex) {

		var player = players[playerIndex],
			cards = player.cards,
			card = cards[cardIndex],
			flag = playerFlags[playerIndex],
			playAccepted = false,
			cellCard = board[cell],
			completedSequence;

		// cell must be unoccupied and the card being played must match the cell or be a freejack.
		// freejacks can't be used to capture jokers
		if(isOpen(cell) && isMatch(card, cellCard)) {

			// consider play accepted unless the game is over.
			playAccepted = true;
			cellStates[cell] = playerFlags[playerIndex];

			console.log('Player ' + playerIndex + ': ' + card + '@' + cell);

			$self.trigger('cardplayed', {
				player: playerIndex,
				card: card,
				cell: cell
			});

			completedSequence = findCompletedSequence(cell, flag);

			if(completedSequence) {

				$self.trigger('gameended', {
					winner: playerIndex,
					sequence: completedSequence
				});
				$self.off();
			}

		} else if(isCellJacker(card) && isOccupied(cell) && cellStates[cell] != playerFlags[playerIndex]  &&  cellCard[0] != 'J') {

			self.jackCell(0, cell);
			playAccepted = true;

		}

		return playAccepted;
	}

	this.jackCell = function(playerIndex, cell) {

		//		if(isCellJacker(card)) {

		cellStates[cell] = OPEN;
		$self.trigger('celljacked', {
			player: playerIndex,
			cell: cell
		});

		//		}
	}

	this.discardAndReplaceCard = function(playerIndex, cardIndex) {

		var cards = players[playerIndex].cards,
			card = cards[cardIndex];

		ui.addToDiscardPile(card, playerIndex);
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

	this.discardDeadCard = function(playerIndex, cardIndex) {

		var result = false,
			cards = players[playerIndex].cards,
			card = cards[cardIndex];

		if(isDeadCard(card) && !cardDiscarded) {

			cardDiscarded = true;
			ui.addToDiscardPile(card, playerIndex);
			cards.splice(cardIndex, 1);

			if(gameDeck.length > 0) {
				cards.push(gameDeck.pop());
			}

			$self.trigger('carddiscarded', {
				player: playerIndex,
				card: card
			});
			result = cards;
		}
		return result;
	}

	this.completeTurn = function(player) {
		cardDiscarded = false;
		activePlayer = (player + 1) % numPlayers;
		$self.trigger('turnchanged', activePlayer);
	};

	this.startOfflineGame = function(config) {

		config = config || {

		}
		online = false;
		activePlayer = 0;
		cellCaptors = [];
		cardDiscarded = false;
		numPlayers = config.totalPlayers || 4;

		board = readBoard(Jax.BOARDS[[
			'checkerBoard', 'sequence', 'oneEyedJack', 'custom1'
		][Math.floor(Math.random() * 4)]]);

		ui.enableEvents();

		for(var i = 0; i < 100; i++) {

			card = board[i];

			if(card[0] == 'J') {
				cellStates[i] = (P1 | P2 | P3 | P4 | OPEN);

			} else {

				cellStates[i] = OPEN;

			}

			cellCaptors[i] = false;
		}

		$self.trigger('gamestarted', {
			board: board
		});

		gameDeck = shuffleDecks();

		players = [];
		for(var i = 0; i < numPlayers; i++) {
			players.push({
				playerIndex: i,
				cards: []
			});
		}

		// if there are more than two player only give out 6 cards
		var handSize = numPlayers > 2 ? 6 : 7;

		for(i = 0; i < handSize; i++) {
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
				hand: players[i].cards,
				playDelay: 500
			}))
		}

		ui.displayHand(players[0].cards);
	}

	// line calculations

	var line, row, col, start, card;

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
};

var game;
$(function() {

	game = new Jax();
});

/*

 gameServerHost = 'http=//localhost=9000/',

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
 //		$('.game .hand').on('click', 'li', this.selectCard);
 //		$('#discardPile').html('')
 //		displayHand();
 //	}

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