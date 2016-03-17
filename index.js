var observe = require("./lib/observe");
var uniqueId = require("./lib/uniqueId");
var add = require("./lib/add");
var remove = require("./lib/remove");

var plugins = {}; // Plugin instances.
var elements = [];
var observer = observe(update, check);

var changeState = require("./lib/changeState").bind(null, plugins);
var checkElement = require("./lib/checkElement").bind(null, plugins, observer);
var updateElement = require("./lib/updateElement").bind(null, observer);


function check () {
	elements.filter(checkElement).forEach(changeState);
	if (!elements.length) {
		observer.stop();
	}
}

function update () {
	elements.forEach(updateElement);
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