
// Add a single element to be controlled by a given `config`.
function addSingle (observer, elements, config, element) {
	// Return fast if element is already controlled
	var data = element._postpwn;
	if (!data) {
		var index = elements.indexOf(element);
		// Only add unhandled elements.
		if (index < 0) {
			var pos = observer.getPosition(element);
			data = {
				id: config.id,
				initiated: false,
				visible: false,
				previouslyVisible: false,
				withinThreshold: false,
				top: pos.top,
				bottom: pos.bottom
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

// Add multiple elements to be controlled by a given config.
module.exports = function (observer, elements, config, els) {
	if (!els) {
		if (config.selector) {
			els = document.querySelectorAll(config.selector);
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
		addSingle(observer, elements, config, els[index++]);
	}
};