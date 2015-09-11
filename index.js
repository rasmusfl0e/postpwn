var events = require("./events");
var uniqueId = require("./uniqueId");
var viewport = require("./viewport");
var throttle = require("./throttle");

var win = window;
var doc = document;

var active = false; // Is postpwn active.
var elements = []; // Controlled elements.
var plugins = {}; // Plugin instances.
var viewportHeight = 0; // Cached viewport height.
var viewportOffset = 0; // Cached scroll offset.

var resizeThrottled = throttle(resize, refresh); // Dynamically throttled check function.
var scrollThrottled = throttle(scroll, check); // Dynamically throttled refresh function.

// Initiate postpwn.
function start () {
	if (elements.length) {
		// For clients that do not support scrollevents
		if (win.operamini) {
			noscroll();
		}
		else {
			if (!active) {
				events.add(win, "scroll", scrollThrottled);
				events.add(win, "resize", resizeThrottled);
				active = true;
			}
			setTimeout(init, 0);
		}
	}
}

// When no more elements are being controlled - wind down postpwn.
function stop() {
	if (active) {
		events.remove(win, "scroll", scrollThrottled);
		events.remove(win, "resize", resizeThrottled);
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
	check();
}

// Get initial positions
function init () {
	viewportHeight = viewport.height();
	viewportOffset = viewport.offset();
	refresh();
}

// Refresh positions and check for visibility changes.
function refresh () {
	getPositions();
	check();
}

// Fallback function for initiating elements
// on known clients with no scroll event support.
function noscroll () {
	var plugin, element, data;
	var length = elements.length;
	var index = 0;

	while (index < length) {
		element = elements[index];
		data = element._postpwn;
		plugin = data && plugins[data.id];
		if (plugin && plugin.onInit) {
			plugin.onInit(element);
		}
		index++;
	}
}

// Get current positions of controlled elements.
function getPositions() {
	var element, rect, data;
	var length = elements.length;
	var index = 0;

	while (index < length) {
		element = elements[index];
		data = element_postpwn;
		if (element && data) {
			rect = element.getBoundingClientRect();
			data.top = viewportOffset + rect.top;
			data.bottom = viewportOffset + rect.bottom;
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
		var element, data, isVisible, threshold;
		var viewTop = viewportOffset;
		var viewBottom = viewportOffset + viewportHeight;
		var changed = [];

		while (index < length) {
			element = elements[index];
			data = element._postpwn;
			if (element && data) {
				// Check initiation threshold.
				if (!data.initiated && plugins[data.id].onInit) {
					threshold = "threshold" in data ? data.threshold : viewportHeight;
					isVisible = isWithin(viewTop, viewBottom, data.top - threshold, data.bottom + threshold);
					// Element is within initiation threshold.
					if (data.soonVisible !== isVisible) {
						data.soonVisible = isVisible;
						changed.push(element);
					}
				}
				// Check general visibility changes.
				else {
					isVisible = isWithin(viewTop, viewBottom, data.top, data.bottom);
					// Element visibility changed
					if (data.visible !== isVisible) {
						data.visible = isVisible;
						changed.push(element);
					}
				}
			}
			index++;
		}

		length = changed.length;
		index = 0;
		while (index < length) {
			changeState(changed[index++]);
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
	var data = element._postpwn;
	if (!data) {
		return;
	}
	var plugin = plugins[data.id];
	// Element should trigger onInit if available
	if (plugin.onInit && !data.initiated && data.soonVisible) {
		plugin.onInit(element);
		data.initiated = true;
		return;
	}
	// Element has come into view
	if (data.visible) {
		// Element should trigger onVisible if available
		if (plugin.onVisible) {
			plugin.onVisible(element);
		}
	}
	else {
		// Element should trigger onHidden if available
		if (plugin.onHidden) {
			plugin.onHidden(element);
		}
	}
}



function Plugin (config) {
	this.id = uniqueId();
	this.config = config;
	if (this.config.selector) {
		add(this.id, doc.querySelectorAll(this.config.selector));
	}
	plugins[id] = plugin;
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
	var data = element._postpwn;
	// Get visibility.
	if (data) {
		return isWithin(viewportOffset, viewportOffset + viewportHeight, data.top, data.bottom);
	}
	// No data available on element - return default value.
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
	var data = element._postpwn;
	if (!data) {
		var config = plugins[id].config;
		var index = elements.indexOf(element);
		// Only add unhandled elements.
		if (index < 0) {
			data = {
				id: id,
				initiated: false,
				soonVisible: false,
				visible: false,
				onInit: config.onInit || null,
				onHidden: config.onHidden || null,
				onVisible: config.onVisible || null
			};
			if (element.hasAttribute("data-threshold")) {
				data.threshold = parseInt(element.getAttribute("data-threshold"), 10);
			}
			else if ("threshold" in config) {
				data.threshold = config.threshold;
			}
			element._postpwn = data;
			// Add property to mark element as being controlled
			elements.push(element);
		}
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
	}
}

module.exports = function factory (config) {
	var plugin = new Plugin(config);
	start();
	return plugin;
};
module.exports.refresh = refresh;
