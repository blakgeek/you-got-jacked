function displayCellPositions() {
	for(row = 0; row < 10; row++) {

		var line = [];
		for(col = 0; col < 10; col++) {
			start = (row * 10) + col;
			if(start < 10) {
				line.push("0" + start);
			} else {
				line.push("" + start);
			}
		}
		console.log(line);
	}
}

function tests() {

	console.log(allLines[0]);
	myCells[10] = true;
	myCells[20] = true;
	myCells[10] = true;
	console.log(calcLineOdds(allLines[0], 0));

	var t = 0;

	for(i = 0; i < 100; i++) {
		t += linesByCell[i].length * 5;
	}

	console.log(t);
}

function listCards() {
	var cnts = {j1: 4, j2: 4, j3: 4, j4: 4};
	var cards = board.sort()
		.filter(function(v, i, a) {
			return a.lastIndexOf(v) != i
		});

	cards.forEach(function(v) {
		cnts[v] = 2;
	});

	console.log(cards);
	console.log(JSON.stringify(cnts));

}

function testCalcBestPlay() {

	init();
	console.log(calcBestPlay(['ks', 'kd', 'td', '9d', '8d', 'kc', 'qc']));
}

//listCards()
//testCalcBestPlay();
//init();
//console.log(calcCellOdds(96, ['td', '9d', '8d'], 'p1').sort());
//console.log(calcCellOdds(3, ['td', '9d', '8d'], 'p1').sort());
//console.log(calcLineOdds([95,96,97,98,99], ['td', '9d', '8d', '7d'], 'p1'));
displayCellPositions();

red = [
	"ad", "2d", "3d", "4d", "5d", "6d", "7d", "8d", "9d", "td", "qd", "kd",
	"ah", "2h", "3h", "4h", "5h", "6h", "7h", "8h", "9h", "th", "qh", "kh",
	"ad", "2d", "3d", "4d", "5d", "6d", "7d", "8d", "9d", "td", "qd", "kd",
	"ah", "2h", "3h", "4h", "5h", "6h", "7h", "8h", "9h", "th", "qh", "kh"
]

black = [
	"ac", "2c", "3c", "4c", "5c", "6c", "7c", "8c", "9c", "tc", "qc", "kc",
	"as", "2s", "3s", "4s", "5s", "6s", "7s", "8s", "9s", "ts", "qs", "ks",
	"ac", "2c", "3c", "4c", "5c", "6c", "7c", "8c", "9c", "tc", "qc", "kc",
	"as", "2s", "3s", "4s", "5s", "6s", "7s", "8s", "9s", "ts", "qs", "ks"
]
var str = "J1 "
var flag = true
for(i = 1; i < 100; i++) {

	if(i == 9) {
		str += "J2 "

	} else if(i == 90) {
		str += "J3 "
	} else if(i == 99) {
		str += "J4 "
	} else if(i % 2 == flag) {
		str += red.pop() + " ";
	} else {
		str += black.shift() + " ";
	}

	if(i % 10 == 9) {
		str += "\n";
		flag = !flag;
	}
}

console.log(str)