var win = window;

var add = function (element, event, func) {
	element.addEventListener(event, func);
};

if (!win.addEventListener && win.attachEvent) {
	add = function (element, event, func) {
		element.attachEvent("on" + event, func);
	};
}

var remove = function (element, event, func) {
	element.removeEventListener(event, func);
};

if (!win.removeEventListener && win.detachEvent) {
	remove = function (element, event, func) {
		element.detachEvent("on" + event, func);
	};
}

module.exports = {
	add: add,
	remove: remove
};