var raf = require("./raf");

return function (func) {
	var frameId, timer;
	var timeout = 300;

	function frame() {
		frameId = raf.request(func);
	}

	function start() {
		if (!frameId) {
			frame();
		}
		if (timer) {
			timer = clearTimeout(timer);
		}
		timer = setTimeout(stop, timeout);
	}

	function stop() {
		frameId = raf.cancel(frameId);
		timer = clearTimeout(timer);
	}

	return start;
};