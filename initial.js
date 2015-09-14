// A function that calls `init` intially and `callback` continually.
// Useful for events that should be treated as a continous action like onscroll and onresize.

module.exports = function (init, callback, interval) {

	var timer;
	if (!interval) {
		interval = 300;
	}

	function clear () {
		timer = clearTimeout(timer);
	}

	return function () {
		if (!timer) {
			init();
		}
		timer = setTimeout(clear, interval);
		callback();
	};

};