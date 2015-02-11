var events = require("./events");
var uniqueId = require("./uniqueId");
var viewport = require("./viewport");
var throttle = require("./throttle");

var win = window;
var doc = document;

var viewportOffset = 0; // Cached scroll offset.
var viewportHeight = 0; // Cached viewport height.
var active = false; // Is postpwn active.
var plugins = {}; // Plugin data.
var elements = []; // Controlled elements.
var elementData = []; // Data relating to controlled elements.
var checkThrottled = throttle(check); // Dynamically throttled check function.
var getPositionsThrottled = throttle(getPositions); // Dynamically throttled getPositions function.

// Initiate postpwn.
function start () {
	if (elements.length) {

		// For clients that do not support scrollevents
		if (win.operamini) {
			noscroll();
		}
		else {

			if (!active) {
				active = true;
				events.add(win, "scroll", scroll);
				events.add(win, "resize", resize);
			}

			setTimeout(function () {
				viewportOffset = viewport.offset();
				viewportHeight = viewport.height();
				getPositions();
				check();
			}, 0);

		}
	}
}

// When no more elements are being controlled - wind down postpwn.
function stop() {
	if (active) {
		events.remove(win, "scroll", scroll);
		events.remove(win, "resize", resize);
		active = false;
	}
}

// On resize layout needs to be recalculated and rechecked.
function resize () {
	viewportHeight = viewport.height();
	refresh();
}

// On scroll only offset needs to be updated - and check run.
function scroll () {
	viewportOffset = viewport.offset();
	checkThrottled();
}

// Refresh positions and check for visibility changes.
function refresh () {
	getPositionsThrottled();
	checkThrottled();
}

// Get current positions of controlled elements.
function getPositions() {
	var element, rect, data;
	var length = elements.length;
	var index = 0;

	while (index < length) {
		element = elements[index];
		data = elementData[index];
		if (element && data) {
			rect = element.getBoundingClientRect();
			data.top = viewportOffset + rect.top;
			data.bottom = viewportOffset + rect.bottom;
		}
		index++;
	}
}

// Fallback function for initiating elements
// on known clients with no scroll event support.
function noscroll () {
	var element, data;
	var length = elements.length;
	var index = 0;
	while (index < length) {
		element = elements[index];
		data = elementData[index];
		if (data.onInit) {
			data.onInit(element);
		}
		index++;
	}
}

// Runs through array of controlled elements
// to check whether they are visible in viewport.
function check() {
	var length = elements.length;
	var index = 0;

	// Find visible elements.
	if (length) {
		var element, data, isVisible;
		var viewTop = viewportOffset;
		var viewBottom = viewportOffset + viewportHeight;
		var changed = [];

		while (index < length) {
			element = elements[index];
			data = elementData[index];
			if (element && data) {
				if (data.onInit && !data.initiated) {
					isVisible = isWithin(viewTop, viewBottom, data.top - data.threshold, data.bottom + data.threshold);
					if (data.soonVisible !== isVisible) {
						data.soonVisible = isVisible;
						changed.push([element, data]);
					}
				}
				else {
					isVisible = isWithin(viewTop, viewBottom, data.top, data.bottom);
					// Element visibility changed
					if (data.visible !== isVisible) {
						data.visible = isVisible;
						changed.push([element, data]);
					}
				}
			}
			index++;
		}

		length = changed.length;
		index = 0;
		while (index < length) {
			changeState.apply(null, changed[index++]);
		}

	}
	// No more elements - shut postpwn down.
	else {
		stop();
	}
}

function isWithin (viewTop, viewBottom, top, bottom) {
	return !(bottom < viewTop || top > viewBottom);
}

function changeState (element, data) {
	// Element should trigger onInit if available
	if (data.onInit && !data.initiated && data.soonVisible) {
		data.onInit(element);
		data.initiated = true;
		return;
	}
	// Element has come into view
	if (data.visible) {
		// Element should trigger onVisible if available
		if (data.onVisible) {
			data.onVisible(element);
		}
	}
	else {
		// Element should trigger onHidden if available
		if (data.onHidden) {
			data.onHidden(element);
		}
	}
}

// Create plugin and start postpwn.
function factory (config) {
	var id = uniqueId();
	var plugin = new Plugin(id, config);

	plugins[id] = plugin;

	if (plugin.config.selector) {
		add(plugin.id, doc.querySelectorAll(plugin.config.selector));
	}

	start();

	return plugin;
}

function Plugin (id, config) {
	this.id = id;
	this.config = config;
	if (!("threshold" in this.config)) {
		this.config.threshold = 0;
	}
}

Plugin.prototype.add = function (/*elements*/) {
	var elements;
	if (arguments.length === 0 && this.config.selector) {
		elements = doc.querySelectorAll(this.config.selector);
	}
	else {
		elements = arguments;
	}
	add(this.id, elements);
	return this;
};

Plugin.prototype.remove = function (/*elements*/) {
	remove(arguments);
	return this;
};

Plugin.prototype.isVisible = function (element) {
	var index = elements.indexOf(element);
	var data = (index > -1) ? elementData[index] : null;
	// Get visibility.
	if (data) {
		return isWithin(viewportOffset, viewportOffset + viewportHeight, data.top, data.bottom);
	}
	// No data available for element - return default value.
	return true;
};

Plugin.prototype.refresh = refresh;

// Adds supplied `elements` to be controlled by plugin `id`
// - or find them via plugin `selector`.
function add (id, elements) {
	var length = elements.length;
	var index = 0;
	while (index < length) {
		addElement(id, elements[index++]);
	}
	start();
}

// Add a single element to be controlled by a given plugin `id`.
function addElement (id, element) {
	// Return fast if element is already controlled
	if ("_postpwned" in element) {
		return;
	}
	var threshold;
	var plugin = plugins[id];
	var index = elements.indexOf(element);
	// Only add unhandled elements.
	if (index < 0) {
		index = elements.length;
		threshold = element.hasAttribute("data-threshold") ?
			parseInt(element.getAttribute("data-threshold"), 10) :
			plugin.config.threshold;
		elementData[index] = {
			id: id,
			visible: false,
			initiated: false,
			soonVisible: false,
			onInit: plugin.config.onInit || null,
			onVisible: plugin.config.onVisible || null,
			onHidden: plugin.config.onHidden || null,
			threshold: threshold
		};
		// Add property to mark element as being controlled
		element._postpwned = true;
		elements.push(element);
	}
}

// Remove elements from the controlled elements.
function remove (elements) {
	var index = elements.length;
	while (index--) {
		removeElement(elements[index]);
	}
	if (!elements.length) {
		stop();
	}
}

// Remove single element from controlled elements.
function removeElement (element) {
	index = elements.indexOf(element);
	if (index > -1) {
		elements.splice(index, 1);
		elementData.splice(index, 1);
	}
}

module.exports = factory;
module.exports.refresh = refresh;
