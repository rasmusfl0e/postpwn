var win = window;

var add = function (event, func, element) {
	element = element || win; 
	element.addEventListener(event, func);
};

if (win.attachEvent) {
	add = function (event, func, element) {
		element = element || win;
		element.attachEvent("on" + event, func);
	};
}

var remove = function (event, func, element) {
	element = element || win; 
	element.removeEventListener(event, func);
};

if (win.detachEvent) {
	remove = function (event, func, element) {
		element = element || win;
		element.detachEvent("on" + event, func);
	};
}

module.exports = {
	add: add,
	remove: remove
};