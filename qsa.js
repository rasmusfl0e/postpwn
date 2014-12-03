var slice = Array.prototype.slice;

function qsa (selector, root) {
	return slice.call((root || document).querySelectorAll(selector));
}

try {
	qsa("html");
}
catch (e) {
	function qsa (selector, root) {
		var nodes = (root || document).querySelectorAll(selector);
		var elements = [];
		var i = 0;
		var l = nodes.length;
		while (i < l) {
			elements.push(nodes[i++]);
		}
		return elements;
	}
}

module.exports = qsa;