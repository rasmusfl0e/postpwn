var qsa = require("./qsa");
var timer = require("./timer");
var dim = require("./dimensions");

var win = window;
var doc = document;
var body = doc.body;
var html = doc.documentElement;

// utility functions

function hasClass(element, className) {
	var classList = element.className.split(/\s+/);
	return !(classList.indexOf(className) === -1);
}

/************/

var documentHeight = 0;
var viewportOffset = 0;
var viewportHeight = 0;
var uid = 0;
var active = false;
var data = {};
var plugins = {};
var placeholders = [];
var buffer = 800;
var scrollableClassName = null;

function check() {
	var i = 0;
	var l = placeholders.length;

	if (!l) {
		stop();
	}
	else {
		var visible = [];
		var top = viewportOffset - buffer;
		var bottom = viewportOffset + viewportHeight + buffer;
		var placeholder, d, placeholderTop, placeholderBottom;

		while (i < l) {
			placeholder = placeholders[i++];
			if (placeholder) {
				d = data[placeholder.id];
				if (d) {
					placeholderTop = d.top;
					placeholderBottom = d.bottom;
					if (bottom < placeholderTop) {
						break;
					}
					else if (placeholderTop > top || (placeholderBottom > top && placeholderBottom < bottom)) {
						visible.push(placeholder);
					}
				}
			}
		}

		i = 0;
		l = visible.length;
		while (i < l) {
			replace(visible[i++]);
		}
	}
}

var checkStart = timer(check).start;

function replace(placeholder) {
	var index = placeholders.indexOf(placeholder);
	var id = placeholder.id;

	plugins[data[id].type].replace(placeholder);

	if (index > -1) {
		placeholders.splice(index, 1);
		delete data[id];
	}
}

function stop() {
	if (active) {
		global.removeEventListener("scroll", setAndStartCheck);
		global.removeEventListener("resize", updateAndCheck);
		active = false;
	}
}

function updatePositions(_placeholders) {
	_placeholders = _placeholders || placeholders;
	var i = 0;
	var l = _placeholders.length;
	var placeholder;
	var rect, top, id, d;

	while (i < l) {
		placeholder = _placeholders[i++];
		var rect = placeholder.getBoundingClientRect();
		if (rect.height) {
			var top = viewportOffset + rect.top;
			var id = placeholder.id;
			var d = data[id];
			if (d) {
				d.top = top;
				d.bottom = top + rect.height;
			}
		}
	}
	_placeholders.sort(function (a, b) {
		return data[a.id].top - data[b.id].top;
	});
	}

function updateAndCheck() {
	viewportHeight = dim.viewport.height();
	updatePositions();
	check();
}

function setAndStartCheck() {
	viewportOffset = dim.viewport.offset();
	checkStart();
}

function handleScrollable(element) {
	var _placeholders = [];
	var type;

	for (type in plugins) {
		_placeholders.concat(getPlaceholders(element, plugins[type]));
	}
	element.addEventListener("scroll", function () {
		updatePositions(_placeholders);
		check();
	});
};

function getPlaceholders(plugin, element) {
	var _placeholders = [];
	var elements = qsa(plugin.selector, element || doc);

	elements.forEach(function (placeholder) {
		if (placeholders.indexOf(placeholder) < 0) {
			var id = placeholder.id;
			if (!id) {
				id = placeholder.id = "_dr-placeholder-" + uid++;
			}
			if (!data[id]) {
				data[id] = {
					type: plugin.type
				};
			}
			placeholders.push(placeholder);
		}
		_placeholders.push(placeholder);
	});

	return _placeholders;
}

function config (options) {
	var key;
	for (key in options) {
	
		switch (key) {
			case "plugins":
				options[key].forEach(function (plugin) {
					plugins[plugin.type] = plugin; 
				});
				break;

			case "scrollableClassName":
				scrollableClassName = options[key];
				break;
		}
	}
}

function register (name, selector, replacer) {
	var plugin = {
		type: name,
		selector: selector,
		replacer: replacer
	};
	plugins[name] = plugin;
	var _placeholders = getPlaceholders(plugin);
	if (_placeholders.length) {
		updatePositions(_placeholders);
	}
}

function init (element) {
	element = element || doc;

	if (scrollableClassName) {
		var scrollables = (hasClass(element, scrollableClassName)) ? [element] : qsa("." + scrollableClassName, element);
		scrollables.forEach(handleScrollable);
	}

	var _placeholders = [];
	var type;

	for (type in plugins) {
		_placeholders = _placeholders.concat(getPlaceholders(plugins[type], element));
	}

	if (_placeholders.length) {

		// for clients that do not support lazyloading
		if (win.operamini) {
			placeholders.forEach(replace);
		}
		else {

			if (!active) {
				active = true;
				global.addEventListener("scroll", setAndStartCheck);
				global.addEventListener("resize", updateAndCheck);
			}

			setTimeout(function () {
				viewportOffset = dim.viewport.offset();
				viewportHeight = dim.viewport.height();
				updatePositions(placeholders);
				check();
			}, 0);

		}
	}
};

return {
	register: register,
	update: updateAndCheck
};