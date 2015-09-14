var uniqueId = require("./uniqueId");

var win = window;
var doc = document;

function Plugin (config) {
	if (!config.thresholdAttribute) {
		config.thresholdAttribute = "data-threshold";
	}
	this.id = config.id || uniqueId();
	this.config = config;
	this.elements = [];
	if (config.selector) {
		this.add();
	}
	else {
		this.check();
	}
}

// Runs through array of controlled elements
// to check whether they are visible (and soon to be visible) in viewport.
Plugin.prototype.check = function (viewportOffset, viewportHeight) {
	var length = this.elements.length;
	var index = 0;

	// Find changes in element visibility.
	if (length) {
		var element, data, isVisible, threshold;
		var viewTop = viewportOffset;
		var viewBottom = viewportOffset + viewportHeight;
		var changed = [];

		while (index < length) {
			element = this.elements[index];
			data = element._postpwn;

			if (element && data) {
				// Check initiation threshold.
				if (!data.initiated && this.config.onInit) {
					threshold = ("threshold" in data) ? data.threshold : viewportHeight;
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
			changeState.call(this, changed[index++]);
		}
	}
};

Plugin.prototype.refresh = function (viewportOffset, viewportHeight) {
	getPositions.call(this, viewportOffset);
	this.check(viewportOffset, viewportHeight);
};

// Adds supplied `elements` to be controlled by the plugin
// - or find them via plugin `selector`.
Plugin.prototype.add = function (/*elements*/) {
	var elements;
	if (arguments.length === 0 && this.config.selector) {
		elements = doc.querySelectorAll(this.config.selector);
	}
	else {
		elements = arguments;
	}

	var length = elements.length;
	var index = 0;
	while (index < length) {
		addElement.call(this, elements[index++]);
	}

	this.check();

	return this;
};

Plugin.prototype.remove = function (/*elements*/) {
	remove.apply(this, arguments);
	return this;
};

Plugin.prototype.isVisible = function (element) {
	var data = element._postpwn;
	// Get visibility.
	return data ? data.visible : true;
};

// Add a single element to be controlled by a given plugin `id`.
function addElement (element) {
	// Return fast if element is already controlled
	var data = element._postpwn;
	if (!data) {
		var config = this.config;
		var index = this.elements.indexOf(element);
		// Only add unhandled elements.
		if (index < 0) {
			data = {
				plugin: config.id,
				initiated: false,
				soonVisible: false,
				visible: false
			};
			if (element.hasAttribute(config.thresholdAttribute)) {
				data.threshold = parseInt(element.getAttribute(config.thresholdAttribute), 10);
			}
			else if ("threshold" in config) {
				data.threshold = config.threshold;
			}
			element._postpwn = data;
			// Add property to mark element as being controlled
			this.elements.push(element);
		}
	}
}

// Get current positions of controlled elements.
function getPositions (viewportOffset) {
	var element, rect, data;
	var length = this.elements.length;
	var index = 0;

	while (index < length) {
		element = this.elements[index];
		data = element._postpwn;
		if (element && data) {
			rect = element.getBoundingClientRect();
			data.top = viewportOffset + rect.top;
			data.bottom = viewportOffset + rect.bottom;
		}
		index++;
	}
}

function isWithin (viewTop, viewBottom, top, bottom) {
	return bottom >= viewTop && top <= viewBottom;
}

function changeState (element) {
	var data = element._postpwn;
	if (!data) {
		return;
	}
	// Element should trigger onInit if available
	if (!data.initiated && data.soonVisible && this.config.onInit) {
		var remove = this.config.onInit(element);
		data.initiated = true;
		if (remove) {

		}
		return;
	}
	// Element has come into view
	if (data.visible) {
		// Element should trigger onVisible if available
		if (this.config.onVisible) {
			this.config.onVisible(element);
		}
	}
	else {
		// Element should trigger onHidden if available
		if (this.config.onHidden) {
			this.config.onHidden(element);
		}
	}
}

// Remove elements from the controlled elements.
function remove (elements) {
	var index = elements.length;
	while (index--) {
		var _index = this.elements.indexOf(elements[index]);
		if (_index > -1) {
			this.elements.splice(_index, 1);
		}
	}
}

module.exports = Plugin;