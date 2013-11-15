var Hal = function(config) {

	var allLines = [],
		linesByCell = [],
		offensiveCardCounts = {"J": 4, "2c": 2, "2d": 2, "2h": 2, "2s": 2, "3c": 2, "3d": 2, "3h": 2, "3s": 2, "4c": 2, "4d": 2, "4h": 2, "4s": 2, "5c": 2, "5d": 2, "5h": 2, "5s": 2, "6c": 2, "6d": 2, "6h": 2, "6s": 2, "7c": 2, "7d": 2, "7h": 2, "7s": 2, "8c": 2, "8d": 2, "8h": 2, "8s": 2, "9c": 2, "9d": 2, "9h": 2, "9s": 2, "ac": 2, "ad": 2, "ah": 2, "as": 2, "kc": 2, "kd": 2, "kh": 2, "ks": 2, "qc": 2, "qd": 2, "qh": 2, "qs": 2, "tc": 2, "td": 2, "th": 2, "ts": 2},
		defensiveCardCounts = {"J": 4, "2c": 2, "2d": 2, "2h": 2, "2s": 2, "3c": 2, "3d": 2, "3h": 2, "3s": 2, "4c": 2, "4d": 2, "4h": 2, "4s": 2, "5c": 2, "5d": 2, "5h": 2, "5s": 2, "6c": 2, "6d": 2, "6h": 2, "6s": 2, "7c": 2, "7d": 2, "7h": 2, "7s": 2, "8c": 2, "8d": 2, "8h": 2, "8s": 2, "9c": 2, "9d": 2, "9h": 2, "9s": 2, "ac": 2, "ad": 2, "ah": 2, "as": 2, "kc": 2, "kd": 2, "kh": 2, "ks": 2, "qc": 2, "qd": 2, "qh": 2, "qs": 2, "tc": 2, "td": 2, "th": 2, "ts": 2},
		captorByCell = [],
		cellsByCard = {},
		board = config.board,
		$game = $(config.game),
		game = config.game,
		hand = config.hand,
		unrevealedCardCount = 104 - hand.length,
		totalPlayers = config.totalPlayers,
		playerIndex = config.playerIndex,
		playDelay = config.playDelay || 0;

	init();

	// attach event listeners
	$game.on({
		cardplayed: function(event, data) {
			captorByCell[data.cell] = data.player;
			if(data.player != playerIndex && data.card[0] != 'J' && data.card[0] != 'j') {
				cellsByCard['jd'].push(data.cell);
			}
		},
		carddiscarded: function(event, data) {
			if(data.card[0] == 'J') {
				offensiveCardCounts['J']--;
				defensiveCardCounts['J']--;
			} else {
				offensiveCardCounts[data.card]--;
				defensiveCardCounts[data.card]--;
			}

			unrevealedCardCount--;
		},
		turnchanged: function(event, player) {
			if(player == playerIndex) {

				setTimeout(play, playDelay);
			}
		},
		celljacked: function(event, data) {
			captorByCell[data.cell] = false;
		},
		gameended: function() {

		}
	});

	function discardADeadCard() {

		console.debug('Player ' + playerIndex + ': checking for dead cards');

		var newHand, i, k, cells, card, isDead, deadCardIndex = false;

		// find the first dead card in hand
		// TODO: add logic for discarding the least useful dead card
		for(i = 0; i < hand.length; i++) {

			card = hand[i];
			// jacks and jokers can never be dead
			if(card[0] != 'J' && card[0] != 'j') {

				// assume the card is dead until proven otherwise
				isDead = true;

				cells = cellsByCard[card];
				for(k = 0; k < cells.length; k++) {

					if(captorByCell[cells[k]] === false) {
						isDead = false;
						break;
					}
				}

				if(isDead) {
					console.debug('Player ' + playerIndex + ': found dead card ' + card);
					deadCardIndex = i;
					break;
				}
			}
		}

		if(deadCardIndex !== false) {
			newHand = game.discardDeadCard(playerIndex, deadCardIndex);

			defensiveCardCounts[hand[hand.length - 1]]--;
		}

		// we should never have a case that this would return false but just in case we'll check so we don't screw up
		// our hand array
		if(newHand) {
			hand = newHand;
		}
	}

	function play() {

		var bestOffensivePlay = calcBestOffensivePlay()[0],
			bestDefensivePlay = calcBestDefensivePlay()[0];

		// todo add support for dead card detection
		discardADeadCard();

		if(bestDefensivePlay.cell != -1 || bestOffensivePlay.cell != -1) {
			// if we can block a play better play for an opponent then do it
			if(bestDefensivePlay.odds[0] > bestOffensivePlay.odds[0]) {
				if(bestDefensivePlay.card == 'jd' || bestDefensivePlay.card == 'jh') {
					console.log('jacking cell ' + bestDefensivePlay.cell)
					game.jackCell(playerIndex, bestDefensivePlay.cell);
				} else {
					console.log('defensive play ' + bestDefensivePlay.card + '@' + bestDefensivePlay.cell);
					game.playCard(playerIndex, bestDefensivePlay.cell, bestDefensivePlay.cardIndex);
				}
				hand = game.discardAndReplaceCard(playerIndex, bestDefensivePlay.cardIndex);
			} else {
				console.log('offensive play ' + bestOffensivePlay.card + '@' + bestOffensivePlay.cell);
				game.playCard(playerIndex, bestOffensivePlay.cell, bestOffensivePlay.cardIndex);
				hand = game.discardAndReplaceCard(playerIndex, bestOffensivePlay.cardIndex);
			}

			defensiveCardCounts[hand[hand.length - 1]]--;

		} else {

			// TODO: add logic card swapping
			console.log('Player ' + playerIndex + " passes");
		}
		game.completeTurn(playerIndex);
	}

	// offensive play
	function calcBestOffensivePlay() {

		var max = 0, bestCells, cell, playableCells = [], cardIndex,
			i, k, odds, highestOdds, bestOdds, equality, cells, card, bestCard;

		for(i = 0; i < hand.length; i++) {

			card = hand[i];
			cells = cellsByCard[card];

			for(k = 0; k < cells.length; k++) {
				playableCells.push({
					cardIndex: i,
					card: hand[i],
					cell: cells[k]
				})
			}
		}

		for(i = 0; i < playableCells.length; i++) {

			card = playableCells[i].card;
			cell = playableCells[i].cell;
			cardIndex = playableCells[i].cardIndex;
			odds = calcOffensiveCellOdds(cell, playerIndex);
			highestOdds = odds[0];

			if(highestOdds > max) {

				bestCells = [
					{
						cardIndex: cardIndex,
						card: card,
						cell: cell,
						odds: odds
					}
				];

				max = highestOdds;

			} else if(highestOdds == max && max != 0) {

				bestCard = bestCells[0].card;
				bestOdds = bestCells[0].odds;
				equality = 0;

				for(var j = 1; j < Math.max(odds.length, bestOdds.length); j++) {
					equality = (odds[j] || 0) - (bestOdds[j] || 0);
					if(equality !== 0) {
						break;
					}
				}

				if(equality === 0 && bestCard[0] != 'j') {
					bestCells.push({
						cardIndex: cardIndex,
						card: card,
						cell: cell,
						odds: odds
					});

					// don't waste a free jack when there's a suited alternative
				} else if(equality >= 0) {
					bestCells = [
						{
							cardIndex: cardIndex,
							card: card,
							cell: cell,
							odds: odds
						}
					];
				}

			}
		}

		return bestCells || [
			{
				cell: -1,
				odds: [-1]
			}
		];
	}

	function calcOffensiveCellOdds(cell, player) {

		var lines = linesByCell[cell],
		// by initializing allOdds with a zero entry it guarantees there will that lost comparison to a longer
		// set of odds that very similar will work as expected
			allOdds = [0],
			i;

		// don't waste time on occupied cells
		if(captorByCell[cell] === false) {

			for(i = 0; i < lines.length; i++) {
				allOdds.push(calcOffensiveLineOdds(lines[i], player));
			}
		}
		return allOdds.sort(function(a, b) {return +b - +a});
	}

	function calcOffensiveLineOdds(line, player) {

		var odds = 1,
			cell, card, captor, i;

		for(i = 0; i < 5; i++) {

			cell = line[i];
			card = board[cell];
			captor = captorByCell[cell];

			// no chance if someone else has captured the square
			// this may need to be updated later to take into cell jacking
			if(captor !== false && captor !== player) {
				odds = 0;
				break;

			} else if(captor !== player && hand.indexOf(card) == -1 && card[0] != 'J') {
				// there's not need to calculate the probably if player has already captured the cell
				// for now we treat having the required card in hand the same as having captured the cell.
				// in the future we'll need to a logic to improve on that assumption
				odds *= (offensiveCardCounts[card] / unrevealedCardCount);
			}
		}

		// return odds sorted from highest to lowest
		return odds;
	}

	// defensive play
	function calcBestDefensivePlay() {
		var max = 0, bestCells, cell, playableCells = [], cardIndex,
			i, j, k, odds, highestOdds, bestOdds, equality, cells, card, bestCard;

		for(i = 0; i < hand.length; i++) {

			card = hand[i];
			cells = cellsByCard[card];

			for(k = 0; k < cells.length; k++) {
				playableCells.push({
					cardIndex: i,
					card: hand[i],
					cell: cells[k]
				})
			}
		}

		for(i = 0; i < playableCells.length; i++) {
			k = 0;
			//			for(k = 0; k < totalPlayers; k++) {
			//
			//				if(k != playerIndex) {
			card = playableCells[i].card;
			cell = playableCells[i].cell;
			cardIndex = playableCells[i].cardIndex;
			odds = calcDefensiveCellOdds(cell, k, card);
			highestOdds = odds[0];

			if(highestOdds > max) {

				bestCells = [
					{
						player: k,
						cardIndex: cardIndex,
						card: card,
						cell: cell,
						odds: odds
					}
				];

				max = highestOdds;

			} else if(highestOdds == max && max != 0) {

				bestCard = bestCells[0].card;
				bestOdds = bestCells[0].odds;
				equality = 0;

				for(j = 1; j < Math.max(odds.length, bestOdds.length); j++) {
					equality = (odds[j] || 0) - (bestOdds[j] || 0);
					if(equality !== 0) {
						break;
					}
				}

				if(equality === 0 && bestCard[0] != 'j') {
					bestCells.push({
						player: k,
						cardIndex: cardIndex,
						card: card,
						cell: cell,
						odds: odds
					});

					// don't waste a free jack when there's a suited alternative
				} else if(equality >= 0) {
					bestCells = [
						{
							player: k,
							cardIndex: cardIndex,
							card: card,
							cell: cell,
							odds: odds
						}
					];
				}
				//					}
				//				}
			}

		}
		return bestCells || [
			{
				cell: -1,
				odds: [-1]
			}
		];
	}

	function calcDefensiveCellOdds(cell, player, card) {

		var lines = linesByCell[cell],
			allOdds = [0], i;

		if(captorByCell[cell] === false || card == 'jd' || card == 'jh') {
			for(i = 0; i < lines.length; i++) {
				allOdds.push(calcDefensiveLineOdds(lines[i], player));
			}
		}

		return allOdds.sort(function(a, b) {return +b - +a});
	}

	function calcDefensiveLineOdds(line, player) {

		var odds = 1,
			cell, card, captor, i;

		for(i = 0; i < 5; i++) {

			cell = line[i];
			card = board[cell];
			captor = captorByCell[cell];

			// no chance if someone else owns the cell
			if(captor !== false && captor !== player) {
				odds = 0;
				break;

			} else if(captor !== player && card[0] != 'J') {
				// there's not need to calculate the probably if player has already captured the cell
				// for now we treat having the required card in hand the same as having captured the cell.
				// in the future we'll need to a logic to improve on that assumption
				odds *= (offensiveCardCounts[card] / unrevealedCardCount);
			}
		}

		// return odds sorted from highest to lowest
		return odds;
	}

	function init() {

		var line, card, row, col, start, i;

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

		// determine card cells
		for(i = 0; i < board.length; i++) {

			card = board[i];
			if(card[0] == 'J') {

				cellsByCard['J1'] = (cellsByCard['J1'] || []).concat([i]);
				cellsByCard['J2'] = (cellsByCard['J2'] || []).concat([i]);
				cellsByCard['J3'] = (cellsByCard['J3'] || []).concat([i]);
				cellsByCard['J4'] = (cellsByCard['J4'] || []).concat([i]);

			} else {
				cellsByCard[card] = (cellsByCard[card] || []).concat([i]);
				// assigning the arrays this way only causes them to point to the same element and only requires one to be updated
				cellsByCard['jc'] = cellsByCard['js'] = (cellsByCard['jc'] || []).concat([i]);
			}

			captorByCell[i] = false;
		}

		cellsByCard['jd'] = cellsByCard['jh'] = [];

		for(i = 0; i < hand.length; i++) {

			if(hand[i][0] == 'J') {
				defensiveCardCounts['J']--;
			} else {
				defensiveCardCounts[hand[i]]--;
			}
		}
	}
}
