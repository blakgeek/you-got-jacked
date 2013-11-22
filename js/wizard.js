(function($) {

	$.fn.bgWizard = function(options) {

		var config = $.extend({
				next: ".next",
				prev: ".prev"
			}, options),
			currentPosition = 0,
			$wizard = this,
			$sections = $wizard.find('> section'),
			$firstSection = $sections.first(),
			maxPosition = $sections.length - 1,
			$next = $wizard.find(config.next),
			$prev = $wizard.find(config.prev);

		$wizard.addClass('bg-wizard');

		$next.click(function next() {
			currentPosition = Math.min(currentPosition + 1, maxPosition);
			$firstSection.css({
				"margin-left": (currentPosition * -100) + '%'
			});
			if(currentPosition == totalSections - 1) {
				$next.addClass('bg-wizard-disabled');
			}
			$prev.removeClass('bg-wizard-disabled');
		});

		$prev.click(function next() {
			currentPosition = Math.max(currentPosition - 1, 0);
			$firstSection.css({
				"margin-left": (currentPosition * -100) + '%'
			});
			if(currentPosition == 0) {
				$prev.addClass('bg-wizard-disabled');
			}
			$next.removeClass('bg-wizard-disabled');
		});

		this.reset = function() {
			currentPosition = 0;
			$firstSection.css({
				"margin-left": '0'
			});
			$prev.addClass('bg-wizard-disabled');
			$next.removeClass('bg-wizard-disabled');
			$wizard.find('.bg-wizard-selected').removeClass('bg-wizard-selected');
		}

		this.vals = function() {
			var result = {};

			$wizard.find('.bg-wizard-selected').each(function() {
				var $this = $(this);
				result[$this.attr('data-bg-wizard-name')] = $this.attr('data-bg-wizard-value');
			});

			return result;
		}

		return this;
	}

})(jQuery);