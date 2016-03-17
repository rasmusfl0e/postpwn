var viewport = require("./viewport");
var story = require("./story");
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

function updateHeight () {
	height = viewport.height();
}

function updateOffset () {
	offset = viewport.offset();
}

module.exports = function (update, check) {

	var active;

	function init () {
		updateHeight();
		updateOffset();
		update();
		check();
	}

	function _resize () {
		updateHeight();
		update();
		check();
	}

	function scrollStart () {
		updateOffset();
		update();
	}

	function scrollMiddle () {
		updateOffset();
		check();
	}

	var resize = throttle(_resize);
	var scroll = story(scrollStart, throttle(scrollMiddle));

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
		isVisible: isVisible,
		getHeight: getHeight,
		getPosition: getPosition
	};
};
