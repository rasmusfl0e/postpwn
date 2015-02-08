// Turn args into array of elements.

module.exports = function (args) {
	var elements = [];

	switch (args.length) {
		case 0:
			break;
		case 1:
			elements = ("nodeType" in args[0]) ? [args] : args;
			break;
		default:
			elements = args;
			break;
	}

	return elements;
};