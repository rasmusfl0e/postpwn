module.exports = function (func) {

	var timer, lasttime;
	var base = 16;
	var delta = base;

	function fire () {
		timer = clearTimeout(timer);
		delta = base / 2 + (new Date() - lasttime) / 2;
	}

	return function () {
		if (!timer) {
			lasttime = new Date();
			timer = setTimeout(fire, delta);
			func();
		}
	};

};