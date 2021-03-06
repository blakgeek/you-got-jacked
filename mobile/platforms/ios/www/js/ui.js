/**
 * Created with IntelliJ IDEA.
 * User: blakgeek
 * Date: 11/10/13
 * Time: 12:20 PM
 * To change this template use File | Settings | File Templates.
 */
function UI(config) {

	var SUIT_MAPPING = {d: 'diamond', c: 'club', h: 'heart', s: 'spade'},
		PLAYER_CLASSES = ['p1', 'p2', 'p3', 'p4'],
		ALL_PLAYER_CLASSES = 'p1 p2 p3 p4',
		templates = {
			stdProxy: Handlebars.compile('<div class="hand proxy suit {{suit}}" data-card="{{card}}"><span></span></div>'),
			jokerProxy: Handlebars.compile('<div class="hand proxy joker joker-{{type}}" data-card="{{card}}"></div>'),

			stdCell: Handlebars.compile('<li class="{{classes}} suit {{suit}}" data-cell="{{cell}}" data-card="{{card}}"></li>'),
			jokerCell: Handlebars.compile('<li class="{{classes}} joker joker-{{type}}" data-cell="{{cell}}" data-card="{{card}}"></li>'),
			stdCard: Handlebars.compile('<li class="{{classes}} suit {{suit}}" data-pos="{{position}}" data-card="{{card}}"><span></span></li>'),
			jokerCard: Handlebars.compile('<li class="{{classes}} joker joker-{{type}}" data-pos="{{position}}" data-card="{{card}}"></li>')
		},
		jax = config.game,
		$jax = $(jax),
		discardPile = [],
		allModeClasses = "home wizard game tutorial gameover",
		$body = $('body'),
		$dialog = $('#dialog'),
		$home = $('#home'),
		$wizard = $('#wizard'),
		$game = $('#game'),
		$tutorial = $('#tutorial'),
		$board = $game.find('.board ul'),
		$discardPile = $game.find('.discarded'),
		$hand = $game.find('.hand'),
		$players = $game.find('.players ul'),
		setupWizard = new SetupWizard(),
		self = this;

	$discardPile.click(function() {

		var position = $hand.find('li.active').attr('pos'),
			cards;
		if(position) {

			cards = jax.discardAndReplaceCard(0, position);

			if(cards) {
				self.displayHand(cards);
			}
		}
	}).droppable({
			addClasses: false,
			over: function(event, ui) {

				ui.helper.addClass('dead-card');
			},
			out: function(event, ui) {

				ui.helper.removeClass('dead-card');
			},
			drop: function(event, ui) {
				var $card = $(ui.draggable),
					newHand = jax.discardDeadCard(0, $card.attr('data-pos'));

				if(newHand) {
					self.displayHand(newHand);
				}
			}
		});

	$('.play-online').click(function() {

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

	$home.find('.new-game').click(function() {

		setupWizard.reset();
		$body.removeClass(allModeClasses).addClass('wizard');
	});

	$dialog.find('.replay').click(function() {

		$body.removeClass(allModeClasses);
		jax.startOfflineGame(setupWizard.values());
	});

	$dialog.find('.new-game').click(function() {

		$body.removeClass(allModeClasses).addClass('wizard');
	});

	$wizard.find('.play').click(function() {

		$body.removeClass(allModeClasses);
		jax.startOfflineGame(setupWizard.values());
	});

	$home.find('.rules').click(function() {

		$tutorial.find('.back').hide();
		$tutorial.find('.new-game').show();
		$body.removeClass(allModeClasses).addClass('tutorial');
	});

	$game.find('nav .rules').click(function() {

		$tutorial.find('.new-game').hide();
		$tutorial.find('.back').show();
		$body.removeClass(allModeClasses).addClass('tutorial');
	});

	$game.find('nav .quit').click(function() {

		$body.removeClass(allModeClasses).addClass('home');
		$hand.off();
	});

	$tutorial.find('.back').click(function() {

		$body.removeClass(allModeClasses).addClass('game');
	});

	$tutorial.find('.new-game').click(function() {

		$body.removeClass(allModeClasses).addClass('wizard');
	});

	$board.on('click', 'li',function() {

		var cell = $(this),
			cellIndex = cell.attr('data-cell'),
			activeIndex = $hand.find('li.active').attr('data-pos');

		if(activeIndex) {
			if(jax.playCard(0, cellIndex, activeIndex)) {

				self.displayHand(jax.discardAndReplaceCard(0, activeIndex));
				jax.completeTurn(0);

			}
		}
	}).droppable({
			over: function(event, ui) {

				ui.helper.removeClass('proxy').addClass('over-board p1');
			},
			out: function(event, ui) {

				ui.helper.removeClass('over-board p1').addClass('proxy');
			},
			tolerance: 'touch',
			drop: function(event, ui) {

				var x = event.pageX - $(window).scrollLeft(),
					y = event.pageY - $(window).scrollTop(),
					$cell = $(document.elementFromPoint(x, y)),
					cellIndex = $cell.attr('data-cell'),
					activeIndex = $hand.find('li.active').attr('data-pos');

				if(activeIndex) {
					if(jax.playCard(0, cellIndex, activeIndex)) {

						self.displayHand(jax.discardAndReplaceCard(0, activeIndex));
						jax.completeTurn(0);

					}
				}
				$cell.removeClass('hover');
			}
		});



	if(BG.isChrome) {
		$board.on('mouseenter', 'li', function() {
			$(this).addClass('hover');
		});
		$board.on('mouseleave', 'li', function() {
			$(this).removeClass('hover');
		});
	}

	$discardPile.on('click', function() {
		var activeIndex = $hand.find('li.active').attr('data-pos'),
			newHand;

		if(activeIndex) {
			newHand = jax.discardDeadCard(0, activeIndex);
			if(newHand) {
				self.displayHand(newHand);
			}
		}
	});

	var name, board, suit, html = [];
	for(name in Jax.BOARDS) {

		board = Jax.BOARDS[name];
		html.push('<ul data-board="' + name + '">');
		board.forEach(function(cell) {

			suit = cell[1];
			if(isNaN(suit)) {
				html.push('<li class="' + suit + '"></li>');
			} else {
				html.push('<li class="J"></li>');
			}
		});

		html.push('</ul>');
	}

	$('.board-picker .boards').html(html.join('')).on('click', 'ul', function() {

		$('.board-picker ul').removeClass('selected');
		$(this).addClass('selected');
	});

	$('.player-picker').on('click', 'li', function() {

		$('.player-picker li').removeClass('selected');
		$(this).addClass('selected');
	});

	$('.level-picker').on('click', 'li', function() {

		$('.level-picker li').removeClass('selected');
		$(this).addClass('selected');
	});

	function SetupWizard() {

		var pos = 0,
			$wizard = $('#wizard'),
			$firstSection = $wizard.find('section').first(),
			totalSections = $wizard.find('section').length,
			$nextButton = $wizard.find('.next'),
			$prevButton = $wizard.find('.prev'),
			self = this;

		$wizard.find('.next').on('click', function next() {
			pos = Math.min(pos + 1, totalSections - 1);
			$firstSection.css({
				"margin-left": ( -100 * pos) + '%'
			});
			if(pos == totalSections - 1) {
				$nextButton.addClass('disabled');
			}
			$prevButton.removeClass('disabled');
		});

		$wizard.find('.prev').on('click', function next() {
			pos = Math.max(pos - 1, 0);
			$firstSection.css({
				"margin-left": ( -100 * pos) + '%'
			});
			if(pos == 0) {
				$prevButton.addClass('disabled');
			}
			$nextButton.removeClass('disabled');
		});

		this.reset = function() {
			pos = 0;
			$firstSection.css({
				"margin-left": '0'
			});
			$prevButton.addClass('disabled');
			$nextButton.removeClass('disabled');
			$wizard.find('.selected').removeClass('selected');
		}

		this.values = function() {
			return {
				board: $wizard.find('.board-picker .selected').attr('data-board'),
				totalPlayers: $wizard.find('.player-picker .selected').attr('data-players'),
				level: $wizard.find('.level-picker .selected').attr('data-level')
			}
		}
	}

	// public functions

	this.displayHand = function(cards) {

		var html = [];

		for(var i = 0; i < cards.length; i++) {

			var card = cards[i];

			if(card[0] == 'J') {
				html.push(templates.jokerCard({
					type: card[1],
					card: card,
					position: i
				}));
			} else {
				html.push(templates.stdCard({
					card: card,
					suit: SUIT_MAPPING[card[1]],
					position: i
				}));
			}
		}

		$hand.html(html);

		$hand.find('li').draggable({

			revert: 'invalid',
			revertDuration: 250,
			start: function(event, ui) {

				var $card = $(this);
				if($card.is('.active') === false) {
					$hand.find('.active').removeClass('active');
					$card.addClass('active');
				}

				$card.addClass('dragged');
				$game.addClass('dragging');
			},
			stop: function(event, ui) {

				$game.removeClass('dragging');
				$(this).removeClass('active dragged');
			},
			cursorAt: {
				left: 0,
				top: 0
			},
			helper: function(event) {

				var $this = $(this),
					card = $this.attr('data-card'),
					proxy;

				if($this.is('.joker')) {
					proxy = $(templates.jokerProxy({
						card: card,
						type: card[1]
					}));
				} else {
					proxy = $(templates.stdProxy({
						card: card,
						suit: SUIT_MAPPING[card[1]]
					}));
				}

				return proxy;
			},
			appendTo: $game
		});
	}

	this.addToDiscardPile = function(card, playerIndex) {

		discardPile.push({
			card: card,
			player: "p" + (playerIndex + 1)
		});
		if(discardPile.length > 4) {
			discardPile.shift();
		}

		var entry,
			html = [];

		for(var i = 0; i < discardPile.length; i++) {

			entry = discardPile[i];
			card = entry.card;

			if(card[0] != 'J') {
				html.push(templates.stdCard({
					card: card,
					suit: SUIT_MAPPING[card[1]],
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

			$discardPile.html(html.join(''))

		}
	}

	this.enableGameEvents = function() {

		$jax.on({
			gameended: function(event, data) {

				var winner = data.winner,
					sequence = data.sequence;

				sequence.forEach(function(cell) {
					$board.find('li[data-cell="' + cell + '"]').addClass('sequence');
				});

				$dialog.find('p').html(winner === 0 ? "You win!" : "You lose.");
				$body.addClass('gameover');
				$hand.off();
			},
			gamestarted: function(event, data) {

				discardPile = [];

				var board = data.board,
					players = data.players,
					card, html = [], i;

				for(i = 0; i < 100; i++) {

					card = board[i];

					if(card[0] == 'J') {

						html.push(templates.jokerCell({
							card: card,
							type: card[1],
							cell: i
						}));

					} else {

						html.push(templates.stdCell({
							card: card,
							suit: SUIT_MAPPING[card[1]],
							cell: i
						}));
					}
				}
				$board.html(html.join(''));

				html = [];
				for(i = 0; i < players.length; i++) {
					html.push('<li class="p' + (i + 1) + '">' + players[i].name + '</li>');
				}
				$players.html(html.join(''));

				$discardPile.empty();

				$hand.on('click', 'li', function() {
					var $this = $(this);
					if($this.is('.active')) {
						$this.removeClass('active');
					} else {
						$hand.find('li').removeClass('active');
						$(this).addClass('active');
					}
				});

				$body.removeClass(allModeClasses).addClass('game');
				$game.removeClass('gameover').show();
			},
			cardplayed: function(event, data) {

				$board.find('li[data-cell="' + data.cell + '"]').addClass(PLAYER_CLASSES[data.player]);
			},
			celljacked: function(event, data) {

				$board.find('li[data-cell="' + data.cell + '"]').removeClass(ALL_PLAYER_CLASSES);
			},
			turnchanged: function(event, activePlayer) {
				$players.find('li').removeClass('active').filter('li:nth-of-type(' + (activePlayer + 1) + ')').addClass('active');

			}
		});
	}
}