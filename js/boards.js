Jax = Jax || {}
Jax.BOARDS = {
	sequence: [
		'J1', '6d', '7d', '8d', '9d', 'td', 'qd', 'kd', 'ad', 'J2',
		'5d', '3h', '2h', '2s', '3s', '4s', '5s', '6s', '7s', 'ac',
		'4d', '4h', 'kd', 'ad', 'ac', 'kc', 'qc', 'tc', '8s', 'kc',
		'3d', '5h', 'qd', 'qh', 'th', '9h', '8h', '9c', '9s', 'qc',
		'2d', '6h', 'td', 'kh', '3h', '2h', '7h', '8c', 'ts', 'tc',
		'as', '7h', '9d', 'ah', '4h', '5h', '6h', '7c', 'qs', '9c',
		'ks', '8h', '8d', '2c', '3c', '4c', '5c', '6c', 'ks', '8c',
		'qs', '9h', '7d', '6d', '5d', '4d', '3d', '2d', 'as', '7c',
		'ts', 'th', 'qh', 'kh', 'ah', '2c', '3c', '4c', '5c', '6c',
		'J3', '9s', '8s', '7s', '6s', '5s', '4s', '3s', '2s', 'J4'
	],
	oneEyedJack: "\
		J1 td 9d 8d 7d 7s 8s 9s ts J2 \
		tc kc 6d 5d 4d 4s 5s 6s kh th \
		9c 5c qc 3d 2d 2s 3s qh 6h 9h \
		8c 6c 3c qd ad as qs 3h 5h 8h \
		7c 4c 2c ac kd ks ah 2h 4h 7h \
		7h 4h 2h ah ks kd ac 2c 4c 7c \
		8h 5h 3h qs as ad qd 3c 5c 8c \
		9h 6h qh 3s 2s 2d 3d qc 6c 9c \
		th kh 6s 5s 4s 4d 5d 6d kc tc \
		J3 ts 9s 8s 7s 7d 8d 9d td J4",
	custom1: [
		'kh', 'qh', 'th', '9h', '8h', '7h', '6h', '5h', '4h', 'ks',
		'4c', '3c', '2c', '6s', '7s', '8s', '9s', 'ts', '3h', 'qs',
		'5c', 'th', 'qh', '5s', 'J1', 'as', 'ks', 'qs', '2h', 'ts',
		'6c', '9h', 'kh', '4s', '2d', '3d', '4d', '5d', '6d', '9s',
		'7c', '8h', 'ah', '3s', 'ac', 'ah', '2c', 'J2', '7d', '8s',
		'8c', '7h', 'J4', '2s', 'ad', 'as', '3c', 'ad', '8d', '7s',
		'9c', '6h', '5h', '4h', '3h', '2h', '4c', 'kd', '9d', '6s',
		'tc', '2d', 'qc', 'kc', 'ac', 'J3', '5c', 'qd', 'td', '5s',
		'qc', '3d', 'tc', '9c', '8c', '7c', '6c', '2s', '3s', '4s',
		'kc', '4d', '5d', '6d', '7d', '8d', '9d', 'td', 'qd', 'kd'
	],
	checkerBoard: "\
		J1 kh ac qh 2c th 3c 9h 4c J2 \
		8h 5c 7h 6c 6h 7c 5h 8c 4h 9c \
		tc 3h qc 2h kc ah as kd 2s qd \
		td 3s 9d 4s 8d 5s 7d 6s 6d 7s \
		8s 5d 9s 4d ts 3d qs 2d ks ad \
		kh ac qh 2c th 3c 9h 4c 8h 5c \
		6c 7h 7c 6h 8c 5h 9c 4h tc 3h \
		2h qc ah kc kd as qd 2s td 3s \
		4s 9d 5s 8d 6s 7d 7s 6d 8s 5d \
		J3 9s 4d ts 3d qs 2d ks ad J4"
}