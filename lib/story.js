// Useful for events that should be treated as continous actions like onscroll and onresize.

module.exports = function (start, middle, end, timeout) {

	var timer;
	if (!timeout) {
		timeout = 300;
	}

	function clear () {
		if (timer && end) {
			end();
		}
		timer = clearTimeout(timer);
	}

	return function () {
		if (!timer && start) {
			start();
		}
		timer = clearTimeout(timer);
		timer = setTimeout(clear, timeout);
		middle();
	};

};