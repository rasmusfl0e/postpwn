var events = require("./events");
var viewport = require("./viewport");
var initial = require("./initial");
var throttle = require("./throttle");

var win = window;
var doc = document;

var active;

var height = viewport.height();
var offset = viewport.offset();

var callbacks = {
	check: [],
	refresh: []
};

var resize = throttle(updateHeight);
var scroll = initial(throttle(updateOffset), refresh);

// Initiate postpwn.
function start () {
	if (!active) {
		events.add(win, "resize", resize);
		events.add(win, "scroll", scroll);
		active = true;
		setTimeout(init, 0);
	}
}

// Get initial positions
function init () {
	updateHeight();
	updateOffset();
	refresh();
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

function check () {
	callbacks.check.forEach(function (callback) {
		callback();
	});
}

// Refresh positions.
function refresh () {
	callbacks.refresh.forEach(function (callback) {
		callback();
	});
}

function getHeight () {
	return height;
}

function getPosition (element) {
	var rect = element.getBoundingClientRect();
	return {
		top: offset + rect.top,
		bottom: offset + rect.bottom
	}
}

function isVisible (top, bottom) {
	return !(bottom < offset || top > offset + height);
}


function stop() {
	if (active) {
		events.remove(win, "resize", resize);
		events.remove(win, "scroll", scroll);
		active = false;
	}
}

module.exports = function (options) {

	var keys = Object.keys(callbacks);

	keys.forEach(function (key) {
		if (typeof options[key] === "function" && callbacks[key].indexOf(options[key]) < 0) {
			callbacks[key].push(options[key]);
		}
	});

	function remove () {
		keys.forEach(function (key) {
			var index = callbacks[key].indexOf(options[key]);
			if (index  > -1) {
				callbacks[key].splice(index, 1);
			}
		});
	}

	return {
		start: start,
		stop: stop,
		refresh: refresh,
		remove: remove,
		isVisible: isVisible,
		getHeight: getHeight,
		getPosition: getPosition
	};
};
