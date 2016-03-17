module.exports = function (plugins, element) {
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
		// Element exited the view
		else {
			// Element should trigger onHidden if available
			if (config.onHidden) {
				config.onHidden(element);
			}
		}
	}
};