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

// Initiate postpwn.
function start () {
	if (elements.length) {

		// For clients that do not support scrollevents
		if (win.operamini) {
			var element, data;
			var length = elements.length;
			var index = 0;
			while (index < length) {
				element = elements[index];
				data = elementData[index];
				if (data.onInit) {
					data.onInit(element, data);
				}
				index++;
			}
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
				update();
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
	update();
	checkThrottled();
}

// On scroll only offset needs to be updated - and check run.
function scroll () {
	viewportOffset = viewport.offset();
	checkThrottled();
}

// Update position data when layout has changed on resize.
function update() {
	var element, rect, data;
	var length = elements.length;
	var index = 0;

	while (index < length) {
		element = elements[index];
		data = elementData[index];
		if (element && data) {
			rect = element.getBoundingClientRect();
			data.top = viewportOffset + rect.top - data.threshold;
			data.bottom = viewportOffset + rect.bottom + data.threshold;
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
		var element, data, top, bottom, isVisible;
		var viewTop = viewportOffset;
		var viewBottom = viewportOffset + viewportHeight;
		var changed = [];

		while (index < length) {
			element = elements[index];
			data = elementData[index];
			if (element && data) {
				top = data.top;
				bottom = data.bottom;
				isVisible = (top < viewTop && bottom > viewBottom) || (top >= viewTop && top <= viewBottom) || (bottom >= viewTop && bottom <= viewBottom);
				// Element visibility changed
				if (data.visible !== isVisible) {
					data.visible = isVisible;
					changed.push([element, data]);
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

function changeState (element, data) {
	// Element has come into view
	if (data.visible) {
		// Element should trigger onInit if available
		if (!data.initiated && data.onInit) {
			data.onInit(element, data);
			data.initiated = true;
		}
		// Element should trigger onVisible if available
		else if (data.onVisible) {
			data.onVisible(element, data);
		}
	}
	else {
		// Element should trigger onHidden if available
		if (data.onHidden) {
			data.onHidden(element, data);
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
	var plugin = plugins[id];
	var index = elements.indexOf(element);
	// Only add unhandled elements.
	if (index < 0) {
		index = elements.length;
		elementData[index] = {
			id: id,
			visible: false,
			initiated: false,
			onInit: plugin.config.onInit || null,
			onVisible: plugin.config.onVisible || null,
			onHidden: plugin.config.onHidden || null,
			threshold: plugin.config.threshold
		};
		elements.push(element);
	}
	return index;
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
	return index;
}

module.exports = factory;
module.exports.update = onresize;
