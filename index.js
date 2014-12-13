var events = require("./events");
var viewport = require("./viewport");
var throttle = require("./throttle");

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

// Create/get plugin and start postpwn.
function plugin (name, config) {
	var plugin;

	if (name in plugins) {
		
		plugin = plugins[name];

		if (config) {
			Object.keys(config).forEach(function (key) {
				plugin.config[key] = config[key];
			});
		}
	}
	else {

		plugin = new Plugin(name, config);

		plugins[name] = plugin;

		if (plugin.config.selector) {
			add(plugin.name, doc.querySelectorAll(plugin.config.selector));
		}
		
		start();

	}

	return plugin;
}

function Plugin (name, config) {
	this.name = name;
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
		elements = splat(arguments);
	}
	add(this.name, elements);
	return this;
};

Plugin.prototype.remove = function (/*elements*/) {
	var elements = splat(arguments)
	remove(elements);
	return this;
};

// Turn args into array of elements
function splat (args) {
	var elements = [];

	switch (args.length) {
		case 0:
			break;
		case 1:
			elements = ("nodeType" in args[0]) ? [args] : args;
		default:
			elements = args;
			break;
	}

	return elements;
} 

// Update position data when layout has changed on resize.
function update() {
	var i = 0;
	var l = elements.length;
	var element, rect, top, d;

	while (i < l) {
		element = elements[i];
		var d = data[i];
		if (element && d) {
			rect = element.getBoundingClientRect();
			d.top = viewportOffset + rect.top - d.threshold;
			d.bottom = viewportOffset + rect.bottom + d.threshold;
		}
		i++;
	}
}

// Runs through array of controlled elements
// to check whether they are visible in viewport.
function check() {
	var i = 0;
	var l = elements.length;

	// No more elements - shut postpwn down.
	if (!l) {
		stop();
	}
	// Find visible elements.
	else {
		var visible = [];
		var top = viewportOffset;
		var bottom = viewportOffset + viewportHeight;
		var d, element, elementTop, elementBottom;

		while (i < l) {
			element = elements[i];
			if (element) {
				d = data[i];
				if (d) {
					elementTop = d.top;
					elementBottom = d.bottom;
					if ((elementTop < top && elementBottom > bottom) || (elementTop >= top && elementTop <= bottom) || (elementBottom >= top && elementBottom <= bottom)) {
						visible.push(element);
					}
				}
			}
			i++;
		}

		// Loop in reverse to keep indexes intact.
		l = visible.length;
		while (l--) {
			init(visible[l]);
		}
	}
}

// Once a controlled element becomes visible in the viewport
// `init` runs it through the plugin's `init` function
// and removes it from `elements`.
function init(element) {
	var index = elements.indexOf(element);
	if (index > -1) {
		plugins[data[index].name].config.init(element);
		removeElement(element);
	}
}

// Adds supplied `elements` to be controlled by plugin `type`
// - or find them via plugin `selector`.
function add (name, elements) {
	var i = 0;
	var l = elements.length;
	while (i < l) {
		addElement(name, elements[i++]);
	}
	start();
}

// Add a single element to be controlled by a given plugin `type`.
function addElement (name, element) {
	var plugin = plugins[name];
	var index = elements.indexOf(element);
	// Only add unhandled elements.
	if (index < 0) {
		index = elements.length;
		data[index] = {
			name: name,
			threshold: plugin.config.threshold
		};
		elements.push(element);
	}
	return index;
}

// Remove elements from the controlled elements.
function remove (elements) {
	var i = elements.length;
	while (i--) {
		removeElement(elements[i]);
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

module.exports = plugin;
module.exports.update = onresize;