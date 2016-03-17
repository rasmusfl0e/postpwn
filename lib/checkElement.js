module.exports = function (plugins, observer, element) {
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
	window.console && console.log("checkElement", element, isVisible, data.top, data.bottom, window.postpwn_offset, window.postpwn_height);
	// Element visibility changed
	if (data.visible !== isVisible) {
		data.visible = isVisible;
		changed = true;
	}
	return changed;
};