var story = require("./story");
var throttle = require("./throttle");
var viewport = require("./viewport");

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

module.exports = function (onStart, onUpdate, onCheck, onEnd) {

	var active;

	function init () {
		updateHeight();
		updateOffset();
		onUpdate();
		onCheck();
	}

	function _resize () {
		updateHeight();
		onUpdate();
		onCheck();
	}

	function scrollStart () {
		updateOffset();
		onUpdate();
		onStart();
	}

	function scrollMiddle () {
		updateOffset();
		onCheck();
	}

	var resize = throttle(_resize);
	var scroll = story(scrollStart, throttle(scrollMiddle), onEnd);

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
