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


function check () {
	elements.filter(checkElement).forEach(changeState);
	if (!elements.length) {
		observer.stop();
	}
}

// Refresh positions and check for visibility changes.

function refresh () {
	elements.forEach(refreshElement);
	check();
}

module.exports = function factory (config) {

	if (!config.thresholdAttribute) {
		config.thresholdAttribute = "data-threshold";
	}
	if (!config.id) {
		config.id = uniqueId();
	}

	plugins[config.id] = config;

	var addBound = add.bind(null, observer, elements, config);
	var removeBound = remove.bind(null, elements);

	addBound();

	observer.start();

	return {
		add: addBound,
		remove: removeBound,
		isVisible: function (element) {
			var data = element._postpwn;
			// Get visibility.
			return data ? data.visible : true;
		}
	};
};

module.exports.refresh = refresh;