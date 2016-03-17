// A function that wraps `callback` and adds dynamic throttling.
// Useful for events that fire rapidly like onscroll and onresize.

module.exports = function (callback, intervalBase) {

	if (!intervalBase) {
		intervalBase = 16;
	}

	var timer, last, fire;
	var interval = intervalBase;

	function timeout () {
		timer = clearTimeout(timer);
		interval = (intervalBase + (new Date()).valueOf() - last) / 2;

		if (fire) {
			fire = false;
			callback();
		}
	}

	return function () {
		if (!timer) {
			var now = (new Date()).valueOf();
			if (last && last + interval < now) {
				interval = intervalBase;
			}
			last = now;
			timer = clearTimeout(timer);
			timer = setTimeout(timeout, interval);
			fire = false;
			callback();
		}
		else if (!fire) {
			fire = true;
		}
	};

};
