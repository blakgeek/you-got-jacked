function Tutorial() {

	var $hand,
		$discarded,
		$board,
		$players,
		$player1,
		$player2,
		$player3;

	function step1() {

	}

	function setHand() {
		for(i = 0; i < arguments.length; i++) {
			$($('.hand li').get(i))
				.attr('data-card', arguments[i])
				.removeClass('diamond heart spade club')
				.addClass({d: 'diamond', h: 'heart', c: 'club', s: 'spade'}[arguments[i][1]])
		}
	}

	function capture() {
		for(i = 0; i < arguments.length;
		    i++) { $('[data-cell="' + arguments[i] + '"]').addClass('p1')
		}
	}

	function free() {
		for(i = 0; i < arguments.length;
		    i++) { $('[data-cell="' + arguments[i] + '"]').removeClass('p1')
		}
	}

	function next(){
		$('.basics').css({
			"margin-left": ( -100 * ( inc++ % 7)) + '%'
		});
	}
}
