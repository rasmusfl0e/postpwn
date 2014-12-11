var qsa = require("./qsa");
var events = require("./events");
var viewport = require("./viewport");
var throttle = require("./throttle");

var win = window;
var doc = document;

var viewportOffset = 0;
var viewportHeight = 0;
var active = false;
var data = [];
var plugins = {};
var elements = [];
var checkThrottled = throttle(check);


function start () {
	if (elements.length) {

		// for clients that do not support lazyloading
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

function stop() {
	if (active) {
		events.remove(win, "scroll", scroll);
		events.remove(win, "resize", resize);
		active = false;
	}
}

function resize () {
	viewportHeight = viewport.height();
	update();
	check();
}

function scroll () {
	viewportOffset = viewport.offset();
	checkThrottled();
}

function register (name, config) {
	var plugin = {
		type: name,
		selector: config.selector,
		init: config.init,
		threshold: config.threshold || 0
	};
	plugins[name] = plugin;
	if (plugin.selector) {
		add(plugin.type, qsa(plugin.selector, doc));
	}
	start();
}

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

function check() {
	var i = 0;
	var l = elements.length;

	if (!l) {
		stop();
	}
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

		l = visible.length;
		while (l--) {
			init(visible[l]);
		}
	}
}

function init(element) {
	var index = elements.indexOf(element);
	if (index > -1) {
		plugins[data[index].type].init(element);
		removeElement(element);
	}
}

function add (type, elements) {
	if (!("length" in elements)) {
		addElement(type, elements);
	}
	var i = 0;
	var l = elements.length;
	while (i < l) {
		addElement(type, elements[i++]);
	}
	start();
}

function addElement (type, element) {
	var plugin = plugins[type];
	var index = elements.indexOf(element);
	if (index < 0) {
		index = elements.length;
		data[index] = {
			type: type,
			threshold: plugin.threshold
		};
		elements.push(element);
	}
	return index;
}

function remove (elements) {
	if (!("length" in elements)) {
		removeElement(elements);
	}
	var i = elements.length;
	while (i--) {
		removeElement(elements[i]);
	}
}

function removeElement (element) {
	index = elements.indexOf(element);
	if (index > -1) {
		elements.splice(index, 1);
		data.splice(index, 1);
	}
	return index;
}

module.exports = {
	add: add,
	remove: remove,
	register: register
};