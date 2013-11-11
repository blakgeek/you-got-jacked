$(function() {
	var suitMapping = {d: 'diamond', h: 'heart', c: 'club', s: 'spade'},
		cards = [
			"ac", "2c", "3c", "4c", "5c", "6c", "7c", "8c", "9c", "tc", "jc", "qc", "kc",
			"ad", "2d", "3d", "4d", "5d", "6d", "7d", "8d", "9d", "td", "jd", "qd", "kd",
			"ah", "2h", "3h", "4h", "5h", "6h", "7h", "8h", "9h", "th", "jh", "qh", "kh",
			"as", "2s", "3s", "4s", "5s", "6s", "7s", "8s", "9s", "ts", "js", "qs", "ks",
			"J1", "J2", "J3", "J4"
		],
		tpls = {
			stdCell: Handlebars.compile('<li class="{{classes}} suit {{suit}}" data-card="{{card}}"></li>'),
			joker: Handlebars.compile('<li class="{{classes}} joker joker-{{type}}" data-card="{{card}}"></li>'),
			stdCard: Handlebars.compile('<li class="{{classes}} suit {{suit}}" data-card="{{card}}"><span></span></li>')
		},
		$board = $('#board'),
		$p1 = $('section.p1'),
		$p2 = $('section.p2'),
		$p3 = $('section.p3'),
		$p4 = $('section.p4'),
		$p1Cards = $p1.find('ul.cards'),
		$p2Cards = $p2.find('ul.cards'),
		$p3Cards = $p3.find('ul.cards'),
		$p4Cards = $p4.find('ul.cards'),
		$p1Cells = $p1.find('ul.board'),
		$p2Cells = $p2.find('ul.board'),
		$p3Cells = $p3.find('ul.board'),
		$p4Cells = $p4.find('ul.board'),
		cardsHtml = [],
		cellsHtml = [],
		card, i, j;

	for(i = 0; i < cards.length; i++) {

		card = cards[i];
		if(card[0] == 'J') {
			cardsHtml.push(tpls.joker({
				type: card[1],
				card: card
			}));
		} else {
			cardsHtml.push(tpls.stdCard({
				card: card,
				suit: suitMapping[card[1]]
			}));

			if(card[0] != 'j') {
				cellsHtml.push(tpls.stdCell({
					card: card,
					suit: suitMapping[card[1]]
				}));
			}
		}
	}

	function f(p) {
		return function(html) {
			return html.replace(/class="/, 'class="' + p);
		}
	}

	$board.html(cellsHtml.join(''));

	$p1Cells.html(cellsHtml.map(f('p1')).join(''));
	$p2Cells.html(cellsHtml.map(f('p2')).join(''));
	$p3Cells.html(cellsHtml.map(f('p3')).join(''));
	$p4Cells.html(cellsHtml.map(f('p4')).join(''));

	$p1Cards.html(cardsHtml.map(f('p1')).join(''));
	$p2Cards.html(cardsHtml.map(f('p2')).join(''));
	$p3Cards.html(cardsHtml.map(f('p3')).join(''));
	$p4Cards.html(cardsHtml.map(f('p4')).join(''));

});