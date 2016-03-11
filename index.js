var observe = require("./observe");
var uniqueId = require("./uniqueId");

var win = window;
var doc = document;

var active = false; // Is postpwn active.
var plugins = {}; // Plugin instances.
var elements = [];

var observer = observe(refresh, check);

function add (config, els) {
	if (!els) {
		if (config.selector) {
			els = doc.querySelectorAll(config.selector);
		}
	}
	else if (els.length === 1 && !els[0]) {
		return;
	}
	else {
		els = (els.length === 1 && els[0] && els[0].length) ? els[0] : els;
	}

	var length = els.length;
	var index = 0;
	while (index < length) {
		addElement(config, els[index++]);
	}
}

// Add a single element to be controlled by a given plugin `id`.
function addElement (config, element) {
	// Return fast if element is already controlled
	var data = element._postpwn;
	if (!data) {
		var index = elements.indexOf(element);
		// Only add unhandled elements.
		if (index < 0) {
			data = {
				id: config.id,
				initiated: false,
				visible: false,
				withinThreshold: false,
				pos: observer.getPosition(element)
			};
			if (element.hasAttribute(config.thresholdAttribute)) {
				data.threshold = parseInt(element.getAttribute(config.thresholdAttribute), 10);
			}
			else if ("threshold" in config) {
				data.threshold = config.threshold;
			}
			// Add property to mark element as being controlled
			element._postpwn = data;
			elements.push(element);
		}
	}

}


function remove (/*elements*/) {
	var args = arguments;
	var els = (args.length === 1 && args[0] && args[0].length) ? args[0] : args;

	var length = els.length;
	var index = 0;
	while (index < length) {
		var _index = elements.indexOf(els[index++]);
		if (_index > -1) {
			elements.splice(_index, 1);
		}
	}
}

// Refresh positions and check for visibility changes.

function refresh () {
	elements.forEach(refreshElement);
	check();
}

function refreshElement (element) {
	var data = element._postpwn;
	if (data) {
		var pos = observer.getPosition(element);
		data.top = pos.top;
		data.bottom = pos.bottom;
	}
}

function check () {
	elements.filter(checkElement).forEach(changeState);
	if (!elements.length) {
		observer.stop();
	}
}

function checkElement (element) {
	var changed;
	var data = element._postpwn;
	var config = plugins[data.id];
	if (!data.initiated && config.onInit) {
		var threshold = ("threshold" in data) ? data.threshold : observer.getHeight();
		var withinThreshold = observer.isVisible(data.top - threshold, data.bottom + threshold);
		// Element is within initiation threshold.
		if (data.withinThreshold !== withinThreshold) {
			data.withinThreshold = withinThreshold;
			changed = true;
		}
	}

	// Check general visibility changes.
	var isVisible = observer.isVisible(data.top, data.bottom);
	// Element visibility changed
	if (data.visible !== isVisible) {
		data.visible = isVisible;
		changed = true;
	}
	return changed;
}

function changeState (element) {
	var data = element._postpwn;
	var config = plugins[data.id];
	if (data && config) {
		// Element should trigger onInit if available
		if (!data.initiated && data.withinThreshold && config.onInit) {
			config.onInit(element);
			data.initiated = true;
			return;
		}
		// Element has come into view
		if (data.visible) {
			// Element should trigger onVisible if available
			if (config.onVisible) {
				config.onVisible(element);
			}
		}
		else {
			// Element should trigger onHidden if available
			if (config.onHidden) {
				config.onHidden(element);
			}
		}
	}
}

module.exports = function factory (config) {

	if (!config.thresholdAttribute) {
		config.thresholdAttribute = "data-threshold";
	}
	if (!config.id) {
		config.id = uniqueId();
	}

	plugins[config.id] = config;

	add(config, null);

	observer.start();

	return {
		add: function () {
			add(config, arguments.length ? arguments : null);
		},
		remove: remove,
		isVisible: function (element) {
			var data = element._postpwn;
			// Get visibility.
			return data ? data.visible : true;
		}
	};
};

module.exports.refresh = refresh;