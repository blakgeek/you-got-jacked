var Jax = {

    OPEN: 1,
    P1: 2,
    P2: 4,
    P3: 8,
    LOCKED_H: 16,
    LOCKED_V: 32,
    LOCKED_DL: 64,
    LOCKED_DR: 128,
    PLAYERS: [2, 4, 8],
    DIAMOND: 0,
    HEART: 13,
    CLUB: 26,
    SPADE: 39,
    JOKER: 52,
    JACK_DIAMOND: 10,
    JACK_HEART: 23,
    JACK_CLUB: 36,
    JACK_SPADE: 49,
    CAPTURE_FACTOR: 4,
    SEQUENCE_BOARD: [],
    CLASSIC_BOARD: [],
    SUITS: ['DIAMOND', 'HEART', 'CLUB', 'SPADE'],
    DECKS: [
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
        10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
        20, 21, 22, 23, 24, 25, 26, 27, 28, 29,
        30, 31, 32, 33, 34, 35, 36, 37, 38, 39,
        40, 41, 42, 43, 44, 45, 46, 47, 48, 49,
        50, 51, 52, 52,
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
        10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
        20, 21, 22, 23, 24, 25, 26, 27, 28, 29,
        30, 31, 32, 33, 34, 35, 36, 37, 38, 39,
        40, 41, 42, 43, 44, 45, 46, 47, 48, 49,
        50, 51, 52, 52
    ],
    cardToCells: [],
    cellScores: [],
    cellVals: [],
    cellStates: [],
    cellCards: [],
    players: [],
    discardPile: [],

    shuffleDecks: function () {
        var a = [].concat(Jax.DECKS);
        for (var i = a.length - 1; i; i--) {
            var j = parseInt(Math.random() * i);
            var tmp = a[i];
            a[i] = a[j];
            a[j] = tmp;
        }

        return a;
    },

    cellify: function (index) {

        var row = Math.floor(index / 10),
            col = index % 10,
            top = Math.min(row, 4),
            bottom = Math.min(9 - row, 4),
            left = Math.min(col, 4),
            right = Math.min(9 - col, 4);

        return {
            tc: index - (top * 10),
            bc: index + (bottom * 10),
            cl: index - left,
            cr: index + right,
            tl: ((row - Math.min(top, left)) * 10) + (col - Math.min(top, left)),
            tr: ((row - Math.min(top, right)) * 10) + (col + Math.min(top, right)),
            br: ((row + Math.min(bottom, right)) * 10) + (col + Math.min(bottom, right)),
            bl: ((row + Math.min(bottom, left)) * 10) + (col - Math.min(bottom, left))
        };
    },

    isOpen: function (index) {

        return !Jax.isOccupied(index);
    },

    isOccupied: function (index) {

        return !(Jax.cellStates[index] & Jax.OPEN);
    },

    isLockedH: function (index) {
        return !!(Jax.cellStates[index] & Jax.LOCKED_H);
    },

    isLockedV: function (index) {
        return !!(Jax.cellStates[index] & Jax.LOCKED_V);
    },

    isLockedDL: function (index) {
        return !!(Jax.cellStates[index] & Jax.LOCKED_DL);
    },

    isLockedDR: function (index) {
        return !!(Jax.cellStates[index] & Jax.LOCKED_DR);
    },

    isOccupiedBy: function (index, player) {

        return !!(Jax.cellStates[index] & player);
    },

    isRedJack: function (card) {

        return (Jax.isJack(card) && card < 26);
    },

    isBlackJack: function (card) {

        return (Jax.isJack(card) && card > 26);
    },

    isJack: function (card) {
        return (card % 13 == 10);
    },

    score: function (index, player, scoreCaptured) {

        if (!scoreCaptured && Jax.isOccupied(index)) {
            return 0;
        }

        var cell = Jax.cellify(index),
            multiplier = Jax.multiplier(index, player),
            h = cell.cr - cell.cl,
            v = (cell.bc - cell.tc) / 10,
            dl = (cell.br - cell.tl) / 11,
            dr = (cell.bl - cell.tr) / 9,
            baseScore = h + v + dl + dr;

        return  baseScore * multiplier;
    },

    multiplier: function (index, player) {
        return (Jax.calcHMultiplier(index, player) + Jax.calcVMultiplier(index, player) + Jax.calcDRMultiplier(index, player) + Jax.calcDLMultiplier(index, player)) || 1;
    },

    isSeq: function (index, player) {

        return Jax.isHSeq(index, player) || Jax.isVSeq(index, player) || Jax.isDLSeq(index, player) || Jax.isDRSeq(index, player);
    },

    isHSeq: function (index, player) {

        var cell = Jax.cellify(index),
            start = cell.cl,
            end = cell.cr,
            isSeq = false;

        // just 4
        if (end - start >= 4) {

            for (var i = start; i <= end - 4; i++) {

                var matchCnt = 0;
                var lockCnt = 0;

                for (var k = i; k <= end; k++) {
                    if (Jax.isOccupiedBy(k, player)) {
                        matchCnt++;
                        if (Jax.isLockedH(k)) {
                            lockCnt++;
                        }
                    } else {
                        break;
                    }
                }

                if ((lockCnt == 0 && matchCnt >= 5) || matchCnt == 10) {
                    isSeq = true;
                    break;
                }
            }
        }
        return isSeq;
    },

    isVSeq: function (index, player) {

        var cell = Jax.cellify(index),
            start = cell.tc,
            end = cell.bc,
            isSeq = false;

        // 4 * 10
        if (end - start >= 40) {

            for (var i = start; i <= end - 40; i += 10) {

                var matchCnt = 0;
                var lockCnt = 0;

                for (var k = i; k <= end; k += 10) {
                    if (Jax.isOccupiedBy(k, player)) {
                        matchCnt++;
                        if (Jax.isLockedH(k)) {
                            lockCnt++;
                        }
                    } else {
                        break;
                    }
                }

                if ((lockCnt == 0 && matchCnt >= 5) || matchCnt == 10) {
                    isSeq = true;
                    break;
                }
            }
        }
        return isSeq;
    },

    isDLSeq: function (index, player) {

        var cell = Jax.cellify(index),
            start = cell.tl,
            end = cell.br,
            isSeq = false;

        // 4 * 10 + 4
        if (end - start >= 44) {

            for (var i = start; i <= end - 44; i += 11) {

                var matchCnt = 0;
                var lockCnt = 0;

                for (var k = i; k <= end; k += 11) {
                    if (Jax.isOccupiedBy(k, player)) {
                        matchCnt++;
                        if (Jax.isLockedH(k)) {
                            lockCnt++;
                        }
                    } else {
                        break;
                    }
                }

                if ((lockCnt == 0 && matchCnt >= 5) || matchCnt == 10) {
                    isSeq = true;
                    break;
                }
            }
        }
        return isSeq;
    },

    isDRSeq: function (index, player) {
        var cell = Jax.cellify(index),
            start = cell.tr,
            end = cell.bl,
            isSeq = false;

        // 4 * 10 - 4
        if (end - start >= 36) {

            for (var i = start; i <= end - 36; i += 9) {

                var matchCnt = 0;
                var lockCnt = 0;

                for (var k = i; k <= end; k += 9) {
                    if (Jax.isOccupiedBy(k, player)) {
                        matchCnt++;
                        if (Jax.isLockedH(k)) {
                            lockCnt++;
                        }
                    } else {
                        break;
                    }
                }

                if ((lockCnt == 0 && matchCnt >= 5) || matchCnt == 10) {
                    isSeq = true;
                    break;
                }
            }
        }
        return isSeq;
    },

    calcHMultiplier: function (index, player) {

        var cell = Jax.cellify(index),
            start = cell.cl,
            end = cell.cr,
            multiplier = 0;

        // just 4
        if (end - start >= 4) {

            for (var i = start; i <= end - 4; i++) {

                var matches = 0;
                var blockers = 0;
                // test 5 contiguous cells for matches
                for (var k = i; k <= i + 4; k++) {

                    if (Jax.isOccupiedBy(k, player)) {
                        matches++;
                    } else if (Jax.isOccupied(k)) {
                        matches--;
                    }
                }
                if (matches > 0) {
                    multiplier += Math.pow(Jax.CAPTURE_FACTOR, matches);
                }
            }
        }
        return multiplier;
    },

    calcVMultiplier: function (index, player) {

        var cell = Jax.cellify(index),
            start = cell.tc,
            end = cell.bc,
            multiplier = 0;

        // 4 * 10
        if (end - start >= 40) {

            for (var i = start; i <= end - 40; i += 10) {

                var matches = 0;
                var blockers = 0;
                // test 5 contiguous cells for matches
                for (var k = i; k <= i + 40; k += 10) {

                    if (Jax.isOccupiedBy(k, player)) {
                        matches++;
                    } else if (Jax.isOccupied(k)) {
                        matches--;
                    }
                }
                if (matches > 0) {
                    multiplier += Math.pow(Jax.CAPTURE_FACTOR, matches);
                }
            }
        }
        return multiplier;

    },

    calcDLMultiplier: function (index, player) {

        var cell = Jax.cellify(index),
            start = cell.tl,
            end = cell.br,
            multiplier = 0;

        // 4 * 10 + 4
        if (end - start >= 44) {

            for (var i = start; i <= end - 44; i += 11) {

                var matches = 0;
                var blockers = 0;
                // test 5 contiguous cells for matches
                for (var k = i; k <= i + 44; k += 11) {

                    if (Jax.isOccupiedBy(k, player)) {
                        matches++;
                    } else if (Jax.isOccupied(k)) {
                        matches--;
                    }
                }
                if (matches > 0) {
                    multiplier += Math.pow(Jax.CAPTURE_FACTOR, matches);
                }
            }
        }
        return multiplier;

    },

    calcDRMultiplier: function (index, player) {

        var cell = Jax.cellify(index),
            start = cell.tr,
            end = cell.bl,
            multiplier = 0;

        // 4 * 10 - 4
        if (end - start >= 36) {

            var multiplier = 0;
            var blockers = 0;
            for (var i = start; i <= end - 36; i += 9) {

                var matches = 0;
                // test 5 contiguous cells for matches
                for (var k = i; k <= i + 36; k += 9) {

                    if (Jax.isOccupiedBy(k, player)) {
                        matches++;
                    } else if (Jax.isOccupied(k)) {
                        matches--;
                    }
                }
                if (matches > 0) {
                    multiplier += Math.pow(Jax.CAPTURE_FACTOR, matches);
                }
            }
        }
        return multiplier;

    }
};


$(function () {

    var cards = ['A', 2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K'];
    Jax.SEQUENCE_BOARD = [
        Jax.JOKER, 5 + Jax.DIAMOND, 6 + Jax.DIAMOND, 7 + Jax.DIAMOND, 8 + Jax.DIAMOND, 9 + Jax.DIAMOND, 11 + Jax.DIAMOND, 12 + Jax.DIAMOND, 0 + Jax.DIAMOND, Jax.JOKER,
        4 + Jax.DIAMOND, 2 + Jax.HEART, 1 + Jax.HEART, 1 + Jax.SPADE, 2 + Jax.SPADE, 3 + Jax.SPADE, 4 + Jax.SPADE, 5 + Jax.SPADE, 6 + Jax.SPADE, 0 + Jax.CLUB,
        3 + Jax.DIAMOND, 3 + Jax.HEART, 12 + Jax.DIAMOND, 0 + Jax.DIAMOND, 0 + Jax.CLUB, 12 + Jax.CLUB, 11 + Jax.CLUB, 9 + Jax.CLUB, 7 + Jax.SPADE, 12 + Jax.CLUB,
        2 + Jax.DIAMOND, 4 + Jax.HEART, 11 + Jax.DIAMOND, 11 + Jax.HEART, 9 + Jax.HEART, 8 + Jax.HEART, 7 + Jax.HEART, 8 + Jax.CLUB, 8 + Jax.SPADE, 11 + Jax.CLUB,
        1 + Jax.DIAMOND, 5 + Jax.HEART, 9 + Jax.DIAMOND, 12 + Jax.HEART, 2 + Jax.HEART, 1 + Jax.HEART, 6 + Jax.HEART, 7 + Jax.CLUB, 9 + Jax.SPADE, 9 + Jax.CLUB,
        0 + Jax.SPADE, 6 + Jax.HEART, 8 + Jax.DIAMOND, 0 + Jax.HEART, 3 + Jax.HEART, 4 + Jax.HEART, 5 + Jax.HEART, 6 + Jax.CLUB, 11 + Jax.SPADE, 8 + Jax.CLUB,
        12 + Jax.SPADE, 7 + Jax.HEART, 7 + Jax.DIAMOND, 1 + Jax.CLUB, 2 + Jax.CLUB, 3 + Jax.CLUB, 4 + Jax.CLUB, 5 + Jax.CLUB, 12 + Jax.SPADE, 7 + Jax.CLUB,
        11 + Jax.SPADE, 8 + Jax.HEART, 6 + Jax.DIAMOND, 5 + Jax.DIAMOND, 4 + Jax.DIAMOND, 3 + Jax.DIAMOND, 2 + Jax.DIAMOND, 1 + Jax.DIAMOND, 0 + Jax.SPADE, 6 + Jax.CLUB,
        9 + Jax.SPADE, 9 + Jax.HEART, 11 + Jax.HEART, 12 + Jax.HEART, 0 + Jax.HEART, 1 + Jax.CLUB, 2 + Jax.CLUB, 3 + Jax.CLUB, 4 + Jax.CLUB, 5 + Jax.CLUB,
        Jax.JOKER, 8 + Jax.SPADE, 7 + Jax.SPADE, 6 + Jax.SPADE, 5 + Jax.SPADE, 4 + Jax.SPADE, 3 + Jax.SPADE, 2 + Jax.SPADE, 1 + Jax.SPADE, Jax.JOKER
    ];

    var html = [];
    for (var i = 0; i < 100; i++) {

        var card = Jax.SEQUENCE_BOARD[i];

        if (card != Jax.JOKER) {
            Jax.cellStates[i] = Jax.OPEN;
            Jax.cellCards[i] = card;
            var suit = Jax.SUITS[Math.floor(card / 13)];
            var val = cards[card % 13];
            html.push('<li data-cell="' + i + '" data-value="' + card + '" data-suit="' + suit + '"><div class="tl">' + val + '</div><div class="br">' + val + '</div></li>');
        } else {
            html.push('<li data-cell="' + i + '" data-value="' + card + '" data-suit="JOKER"><div>&nbsp;</div><div>&nbsp;</div></li>');
            Jax.cellStates[i] = Jax.P1 | Jax.P2 | Jax.P3 | Jax.OPEN;
        }

        // initialize cell entry to array
        Jax.cardToCells[card] = Jax.cardToCells[card] || [];
        Jax.cardToCells[card].push(i);
    }

    $('#board').html(html.join(''));

    Jax.cardToCells[Jax.JACK_SPADE] = Jax.cardToCells[Jax.JACK_CLUB] = [
        1, 2, 3, 4, 5, 6, 7, 8,
        10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
        20, 21, 22, 23, 24, 25, 26, 27, 28, 29,
        30, 31, 32, 33, 34, 35, 36, 37, 38, 39,
        40, 41, 42, 43, 44, 45, 46, 47, 48, 49,
        50, 51, 52, 53, 54, 55, 56, 57, 58, 59,
        60, 61, 62, 63, 64, 65, 66, 67, 68, 69,
        70, 71, 72, 73, 74, 75, 76, 77, 78, 79,
        80, 81, 82, 83, 84, 85, 86, 87, 88, 89,
        91, 92, 93, 94, 95, 96, 97, 98
    ];

    Jax.cardToCells[Jax.JACK_HEART] = Jax.cardToCells[Jax.JACK_SPADE] = [];

    Jax.cells = $('#board li');

    Jax.gameDeck = Jax.shuffleDecks();

    Jax.numPlayers = 2;
    for (var i = 0; i < Jax.numPlayers; i++) {
        Jax.players.push({
            cards: [],
            jackableCells: []
        });
    }

    for (var i = 0; i < 7; i++) {
        for (var k = 0; k < Jax.numPlayers; k++) {
            Jax.players[k].cards.push(Jax.gameDeck.pop());
        }
    }

    Jax.cells.click(function () {

        var cell = $(this),
            cellIndex = cell.attr('data-cell'),
            card = cell.attr('data-value'),
            activeCard = Jax.myActiveCard;

        if (activeCard) {

            if ((Jax.isOpen(cellIndex) && (card == activeCard.value || Jax.isBlackJack(activeCard.value))) ||
                (Jax.isRedJack(activeCard.value) && Jax.isOccupied(cellIndex) && !Jax.isOccupiedBy(cellIndex, Jax.P1))) {

                if(playCard(0, cellIndex, activeCard.index) == false) {
                    autoPlay(1);
                    delete Jax.myActiveCard;
                }
            }
        }
    });

    $('#player1').on('click', 'li', function () {

        $('#player1 li').removeClass('active');
        $(this).addClass('active');
        Jax.myActiveCard = {
            index: $(this).attr('data-pos'),
            value: $(this).attr('data-value')
        };
    });
    displayHand();

});

function playCard(playerIndex, cellIndex, cardIndex) {

    var player = Jax.players[playerIndex];
    var cards = player.cards;
    var card = cards[cardIndex];
    var classes = ['p1', 'p2', 'p3'];
    var players = [Jax.P1, Jax.P2, Jax.P3];
    var gameOver = false;

    if (Jax.isRedJack(card)) {
        unmark(cellIndex);
        Jax.cellStates[cellIndex] = Jax.OPEN;
    } else {
        mark(cellIndex, classes[playerIndex]);
        Jax.cellStates[cellIndex] = players[playerIndex];
    }
    cards.splice(cardIndex, 1);

    if (Jax.isSeq(cellIndex, players[playerIndex])) {
        alert(playerIndex == 0 ? "You win!" : "You just got whooped by a computer.");
        gameOver = true;
    } else {
        cards.push(Jax.gameDeck.pop());
        for (var k = 0; k < Jax.numPlayers; k++) {
            if (k != playerIndex && Jax.cellCards[cellIndex] != Jax.JOKER) {
                Jax.players[k].jackableCells.push(cellIndex);
            }
        }
    }

    addToDiscardPile(card);
    displayHand();

    return gameOver;
}

function addToDiscardPile(card) {

    Jax.discardPile.unshift(card);
    if(Jax.discardPile.length > 4) {
        Jax.discardPile.pop();
    }


    var cards = ['A', 2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K'];
    var html = [];
    for(var i=0; i<Jax.discardPile.length; i++) {

        card = Jax.discardPile[i];
        if (card != Jax.JOKER) {
            var suit = Jax.SUITS[Math.floor(card / 13)];
            var val = cards[card % 13];
            html.push('<li data-pos="' + i + '" data-value="' + card + '" data-suit="' + suit + '"><div class="tl">' + val + '</div><div class="br">' + val + '</div></li>');
        } else {
            html.push('<li data-pos="' + i + '" data-value="' + card + '" data-suit="JOKER"><div>&nbsp;</div><div>&nbsp;</div></li>');
        }
    }

    $('#discardPile').html(html.join(''))

}

function autoPlay(playerIndex) {

    var players = [Jax.P1, Jax.P2, Jax.P3];
    var player = Jax.players[playerIndex];
    var c = player.cards;
    var maxCell;
    var card;
    var cells;
    var maxCard;
    var maxScore = -1;

    Jax.cells.attr('data-score', null);
    for (var i = 0; i < c.length; i++) {

        card = c[i];

        if (Jax.isRedJack(card)) {
            cells = player.jackableCells;
            for (var k = 0; k < cells.length; k++) {

                var score = Jax.score(cells[k], players[playerIndex], true) / 9;
                $(Jax.cells[cells[k]]).attr('data-jack-score', score);

                if (score > maxScore) {
                    maxScore = score;
                    maxCell = cells[k];
                    maxCard = i;
                }
            }
        } else {
            cells = Jax.cardToCells[card];

            for (var k = 0; k < cells.length; k++) {

                var score = Jax.score(cells[k], players[playerIndex]);
                $(Jax.cells[cells[k]]).attr('data-score', score);

                if (score > maxScore) {
                    maxScore = score;
                    maxCell = cells[k];
                    maxCard = i;
                }
            }
        }
    }

    playCard(playerIndex, maxCell, maxCard);
}

function mark(index, player) {
    $(Jax.cells[index]).addClass(player);
}

function unmark(index) {
    $(Jax.cells[index]).removeClass('p1 p2 p3');
}

function displayHand() {
    var cards = ['A', 2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K'];
    var pcards = Jax.players[0].cards;
    var html = []
    for (var i = 0; i < pcards.length; i++) {

        var card = pcards[i];
        if (card != Jax.JOKER) {
            var suit = Jax.SUITS[Math.floor(card / 13)];
            var val = cards[card % 13];
            html.push('<li data-pos="' + i + '" data-value="' + card + '" data-suit="' + suit + '"><div class="tl">' + val + '</div><div class="br">' + val + '</div></li>');
        } else {
            html.push('<li data-pos="' + i + '" data-value="' + card + '" data-suit="JOKER"><div>&nbsp;</div><div>&nbsp;</div></li>');
        }
    }

    $('#player1').html(html);
}

function readBoard(board) {

    var suitMultipliers = {
        'd': 1,
        'h': 2,
        'c': 3,
        's': 4,
        'j': 1
    }

    var cardVals = {
        '2': 0,
        '3': 1,
        '4': 2,
        '5': 3,
        '6': 4,
        '7': 5,
        '8': 6,
        '9': 7,
        '10': 8,
        'q': 10,
        'k': 11,
        'a': 12,
        'j': 52
    }

    return board.map(function(cell) {

        return cardVals[cell.slice(0, -1)] * suitMultipliers[cell.substr(-1)];
    })
}

var board = [
    'jj','8d','9d','10d','kd','qd','ad','ac','kc','jj',
    '2h','2h','2h','2h','2h','2h','2h','2h','2h','2h',
    '2h','2h','2h','2h','2h','2h','2h','2h','2h','2h',
    '2h','2h','2h','2h','2h','2h','2h','2h','2h','2h',
    '2h','2h','2h','2h','2h','2h','2h','2h','2h','2h',
    '2h','2h','2h','2h','2h','2h','2h','2h','2h','2h',
    '2h','2h','2h','2h','2h','2h','2h','2h','2h','2h',
    '2h','2h','2h','2h','2h','2h','2h','2h','2h','2h',
    '2h','2h','2h','2h','2h','2h','2h','2h','2h','2h',
    'jj','8d','9d','10d','kd','qd','ad','ac','kc','jj'
]