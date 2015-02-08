var events = require("./events");
var uniqueId = require("./uniqueId");
var viewport = require("./viewport");
var throttle = require("./throttle");
var toElements = require("./toElements");

var win = window;
var doc = document;

var viewportOffset = 0; // Cached scroll offset.
var viewportHeight = 0; // Cached viewport height.
var active = false; // Is postpwn active.
var data = []; // Data relating to controlled elements.
var plugins = {}; // Plugin data.
var elements = []; // Controlled elements.
var checkThrottled = throttle(check); // Dynamically throttled check function.

// Initiate postpwn.
function start () {
	if (elements.length) {

		// For clients that do not support scrollevents
		if (win.operamini) {
			elements.forEach(replace);
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
		elements = toElements(arguments);
	}
	add(this.id, elements);
	return this;
};

Plugin.prototype.remove = function (/*elements*/) {
	var elements = toElements(arguments);
	remove(elements);
	return this;
};



// Update position data when layout has changed on resize.
function update() {
	var element, rect, top, d;
	var length = elements.length;
	var index = 0;

	while (index < length) {
		element = elements[index];
		d = data[index];
		if (element && d) {
			rect = element.getBoundingClientRect();
			d.top = viewportOffset + rect.top - d.threshold;
			d.bottom = viewportOffset + rect.bottom + d.threshold;
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
		var visible = [];
		var viewTop = viewportOffset;
		var viewBottom = viewportOffset + viewportHeight;
		var d, element, top, bottom;

		while (index < length) {
			element = elements[index];
			d = data[index];
			if (element && d) {
				top = d.top;
				bottom = d.bottom;
				if ((top < viewTop && bottom > viewBottom) || (top >= viewTop && top <= viewBottom) || (bottom >= viewTop && bottom <= viewBottom)) {
					visible.push(element);
				}
			}
			index++;
		}

		// Loop in reverse to keep indexes intact.
		index = visible.length;
		while (index--) {
			init(visible[index]);
		}
	}
	// No more elements - shut postpwn down.
	else {
		stop();
	}
}

// Once a controlled element becomes visible in the viewport
// `init` runs it through the plugin's `init` function
// and removes it from `elements`.
function init(element) {
	var index = elements.indexOf(element);
	if (index > -1) {
		plugins[data[index].id].config.init(element);
		removeElement(element);
	}
}

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
		data[index] = {
			id: id,
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
}

// Remove single element from controlled eleemnts.
function removeElement (element) {
	index = elements.indexOf(element);
	if (index > -1) {
		elements.splice(index, 1);
		data.splice(index, 1);
	}
	return index;
}

module.exports = factory;
module.exports.update = onresize;