$(function() {
	var $cards = $('ul#cards'),
		$cells = $('#cells'),
		cardsHtml = [],
		cellsHtml = [],
		i, j;

	for(i = 1; i <= 4; i++) {
		cardsHtml.push('<li data-joker="' + i + '"><span></span></li>');
	}

	for(i = 1; i <= 13; i++) {
		for(j = 1; j <= 4; j++) {
			cardsHtml.push('<li data-suit="' + j + '" data-value="' + i + '"><span></span></li>');
			cellsHtml.push('<li data-suit="' + j + '" data-value="' + i + '"></li>');
		}
	}

	cellsHtml.push('<li data-joker="4"></li>')
	cellsHtml.splice(46,0,'<li data-joker="3"></li>')
	cellsHtml.splice(6,0,'<li data-joker="2"></li>')
	cellsHtml.unshift('<li data-joker="1"></li>')

	$cards.html(cardsHtml.join(''));
	$cells.html(cellsHtml.join(''));

});