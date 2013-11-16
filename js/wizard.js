$(function() {

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

	var pos = 0,
		$wizard = $('#wizard'),
		$firstSection = $wizard.find('section').first(),
		totalSections = $wizard.find('section').length,
		$nextButton = $wizard.find('.next'),
		$prevButton = $wizard.find('.prev');

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
		$firstSection.first().css({
			"margin-left": ( -100 * pos) + '%'
		});
		if(pos == 0) {
			$prevButton.addClass('disabled');
		}
		$nextButton.removeClass('disabled');
	});

});