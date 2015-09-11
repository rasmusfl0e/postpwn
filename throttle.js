// A function that wraps `firstCall` (and optionally `nextCall`) and adds dynamic throttling.
// Useful for events that fire rapidly like onscroll and onresize.

module.exports = function (firstCall, nextCall) {

	nextCall = nextCall || firstCall;

	var timer, last, fire;
	var base = 16;
	var interval = base;

	function timeout () {
		timer = clearTimeout(timer);
		interval = (base + (new Date()).valueOf() - last) / 2;

		if (fire) {
			fire = false;
			nextCall();
		}
	}

	return function () {
		if (!timer) {
			var now = (new Date()).valueOf();
			if (last && last + interval < now) {
				interval = base;
			}
			last = now;
			timer = setTimeout(timeout, interval);
			firstCall();
		}
		else if (!fire) {
			fire = true;
		}
	};

};