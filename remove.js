module.exports = function (/*elements*/) {
	var args = arguments;
	var els = (args.length === 1 && args[0] && args[0].length) ? args[0] : args;

	var length = els.length;
	var index = 0;
	while (index < length) {
		var _index = elements.indexOf(els[index++]);
		if (_index > -1) {
			elements.splice(_index, 1);
		}
	}
};