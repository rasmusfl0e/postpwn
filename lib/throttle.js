// A function that wraps `callback` and adds dynamic throttling.
// Useful for events that fire rapidly like onscroll and onresize.

var raf = window.requestAnimationFrame || setTimeout;

module.exports = function (callback, intervalBase) {

	if (!intervalBase) {
		intervalBase = 16;
	}

	var scheduler, timer, last, fire;
	var interval = intervalBase;

	function post () {
		timer = clearTimeout(timer);
		scheduler = clearTimeout(scheduler);
		interval = (intervalBase + (new Date()).valueOf() - last) / 2;

		if (fire) {
			fire = false;
			callback();
		}
	}

	function schedule () {
		raf(post);
	}

	return function () {
		fire = true;
		if (!timer) {
			var now = (new Date()).valueOf();
			if (last && last + interval < now) {
				interval = intervalBase;
			}
			last = now;
			clearTimeout(timer);
			timer = setTimeout(schedule, interval);
			/*
			fire = false;
			scheduler = setTimeout(timeout, interval);
			callback();
			*/
		}
	};

};
