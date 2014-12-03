var qsa = require("./qsa");
var event = require(".events");
var viewport = require("./viewport");
var throttle = require("./throttle");

var win = window;
var doc = document;

var viewportOffset = 0;
var viewportHeight = 0;
var active = false;
var buffer = 800;
var data = [];
var plugins = {};
var elements = [];
var checkThrottled = throttle(check);

function check() {
	var i = 0;
	var l = elements.length;

	if (!l) {
		stop();
	}
	else {
		var visible = [];
		var top = viewportOffset - buffer;
		var bottom = viewportOffset + viewportHeight + buffer;
		var d, element, elementTop, elementBottom;

		while (i < l) {
			element = elements[i];
			if (element) {
				d = data[i];
				if (d) {
					elementTop = d.top;
					elementBottom = d.bottom;
					if ((elementTop >= top && elementTop <= bottom) || (elementBottom >= top && elementBottom <= bottom)) {
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
		elements.splice(index, 1);
		data.splice(index, 1);
	}
} 

function stop() {
	if (active) {
		event.remove(win, "scroll", scroll);
		event.remove(win, "resize", resize);
		active = false;
	}
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
			top = viewportOffset + rect.top;
			d.top = top;
			d.bottom = rect.bottom;
		}
		i++;
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

function search (plugin, root) {
	qsa(plugin.selector, root || doc).forEach(function (element) {
		var index = elements.indexOf(element);
		if (index < 0) {
			index = elements.length;
			data[index] = {
				type: plugin.type
			};
			elements.push(element);
		}
	});
}

function register (name, selector, init) {
	plugins[name] = {
		type: name,
		selector: selector,
		init: init
	};
	initialize();
}

function initialize (root) {
	root = root || doc;

	Object.keys(plugins).forEach(function (type) {
		search(plugins[type], root);
	});

	if (elements.length) {

		// for clients that do not support lazyloading
		if (win.operamini) {
			elements.forEach(replace);
		}
		else {

			if (!active) {
				active = true;
				event.remove(win, "scroll", scroll);
				event.remove(win, "resize", resize);
			}

			setTimeout(function () {
				viewportOffset = viewport.offset();
				viewportHeight = viewport.height();
				update();
				check();
			}, 0);

		}
	}
};

module.exports = {
	register: register,
	initialize: initialize
};