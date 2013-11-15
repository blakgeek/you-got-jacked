$(function() {

	var pos = 0,
		$rules = $('#rules'),
		$firstSection = $rules.find('section').first(),
		totalSections = $rules.find('section').length;

	$rules.find('.next').on('click', function next() {
		pos = Math.min(pos + 1, totalSections - 1);
		$firstSection.css({
			"margin-left": ( -100 * pos) + '%'
		});
	});

	$rules.find('.prev').on('click', function next() {
		pos = Math.max(pos - 1, 0);
		$firstSection.first().css({
			"margin-left": ( -100 * pos) + '%'
		});
	});
});