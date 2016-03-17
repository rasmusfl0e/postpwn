var viewport = require("./viewport");
var initial = require("./initial");
var throttle = require("./throttle");

var win = window;

var height = viewport.height();
var offset = viewport.offset();

function getHeight () {
	return height;
}

function getPosition (element) {
	var rect = element.getBoundingClientRect();
	return {
		top: offset + rect.top,
		bottom: offset + rect.bottom
	};
}

function isVisible (top, bottom) {
	return !(bottom < offset || top > offset + height);
}

module.exports = function (refresh, check) {

	var active;

	// Get initial positions
	function init () {
		updateHeight();
		updateOffset();
	}

	// On resize layout needs to be refreshed.
	function updateHeight () {
		height = viewport.height();
		refresh();
	}

	// On scroll only offset needs to be updated - and check run.
	function updateOffset () {
		offset = viewport.offset();
		check();
	}


	var resize = throttle(updateHeight);
	var scroll = initial(throttle(updateOffset), refresh);

	function start () {
		if (!active) {
			win.addEventListener("resize", resize);
			win.addEventListener("scroll", scroll);
			active = true;
			setTimeout(init, 0);
		}
	}

	function stop() {
		if (active) {
			win.removeEventListener("resize", resize);
			win.removeEventListener("scroll", scroll);
			active = false;
		}
	}

	return {
		start: start,
		stop: stop,
		refresh: refresh,
		isVisible: isVisible,
		getHeight: getHeight,
		getPosition: getPosition
	};
};
