var viewport = require("./viewport");
var initial = require("./initial");
var throttle = require("./throttle");

var win = window;

var active;

var height = viewport.height();
var offset = viewport.offset();

var check = noop;
var refresh = noop;

var resize = throttle(updateHeight);
var scroll = initial(throttle(updateOffset), refresh);

function noop () {}

// Initiate postpwn.
function start () {
	if (!active) {
		win.addEventListener("resize", resize);
		win.addEventListener("scroll", scroll);
		active = true;
		setTimeout(init, 0);
	}
}

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

function stop() {
	if (active) {
		win.removeEventListener("resize", resize);
		win.removeEventListener("scroll", scroll);
		active = false;
	}
}

module.exports = function (_refresh, _check) {

	refresh = _refresh;
	check = _check;

	return {
		start: start,
		stop: stop,
		refresh: refresh,
		isVisible: isVisible,
		getHeight: getHeight,
		getPosition: getPosition
	};
};
