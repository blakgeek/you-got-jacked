$(function() {

	var pos = 0,
		$rules = $('#tutorial'),
		$firstSection = $rules.find('section').first(),
		$nextButton = $rules.find('.next'),
		$prevButton = $rules.find('.prev'),
		totalSections = $rules.find('section').length;

	$rules.find('.next').on('click', function next() {
		pos = Math.min(pos + 1, totalSections - 1);
		$firstSection.css({
			"margin-left": ( -100 * pos) + '%'
		});

		if(pos == totalSections - 1) {
			$nextButton.addClass('disabled');
		}
		$prevButton.removeClass('disabled');

	});

	$rules.find('.prev').on('click', function next() {
		pos = Math.max(pos - 1, 0);
		$firstSection.first().css({
			"margin-left": ( -100 * pos) + '%'
		});
		$nextButton.removeClass('disabled');
		if(pos == 0) {
			$prevButton.addClass('disabled');
		}
	});
});