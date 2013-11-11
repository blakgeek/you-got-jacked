/**
 * Created with IntelliJ IDEA.
 * User: blakgeek
 * Date: 11/10/13
 * Time: 12:20 PM
 * To change this template use File | Settings | File Templates.
 */
function ui(config) {

	var $rules = $('#rules');

	$('#discardPile').click(function() {

		var activeCard = Jax.myActiveCard;

		if(Jax.online) {

			gameSocket.emit('discard-card', activeCard.index);

		} else {

			if(activeCard && Jax.isDeadCard(activeCard.value)) {

				discardCard(0, activeCard.index);
				displayHand();
				delete Jax.myActiveCard;
			}
		}
	});

	$('button.play-online').click(function() {

		var activeGameId = localStorage.getItem('activeGameId');

		if(activeGameId) {
			connectToGame(activeGameId);
		} else {
			if(!window.sio) {
				window.sio = io.connect(Jax.gameServerHost);

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

		Jax.newLocalGame(['sequence', 'oneEyedJack', 'custom1'][Math.floor(Math.random() * 3)]);
	});

	$('#splash').find('button.rules').click(function() {

		$('#splash, #game, #rules').hide();
		$rules.find('button').hide()
		$rules.find('button.play').show()
		$rules.find('button.play-online').show()
		$rules.show();
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

	return {
		init: function(board) {

		}
	}
}