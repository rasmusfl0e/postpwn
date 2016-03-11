var observe = require("./observe");
var uniqueId = require("./uniqueId");
var add = require("./add");
var remove = require("./remove");

var plugins = {}; // Plugin instances.
var elements = [];
var observer = observe(refresh, check);

var changeState = require("./changeState").bind(null, plugins);
var checkElement = require("./checkElement").bind(null, plugins, observer);
var refreshElement = require("./refreshElement").bind(null, observer);

// Refresh positions and check for visibility changes.

function refresh () {
	elements.forEach(refreshElement);
	check();
}

function check () {
	elements.filter(checkElement).forEach(changeState);
	if (!elements.length) {
		observer.stop();
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

	add(observer, elements, config, null);

	observer.start();

	return {
		add: function () {
			add(observer, elements, config, arguments.length ? arguments : null);
		},
		remove: function (arguments) {
			remove(elements, arguments);
		},
		isVisible: function (element) {
			var data = element._postpwn;
			// Get visibility.
			return data ? data.visible : true;
		}
	};
};

module.exports.refresh = refresh;