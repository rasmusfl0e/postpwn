// Functions for getting crossbrowser viewport dimensions.

var win = window;
var doc = document;
var html = doc.documentElement;
var body = doc.body;

var height = ("innerHeight" in win) ?
	function () {
		return win.innerHeight;
	} :
	function () {
		return html.clientHeight;
	};

var offset = ("pageYOffset" in win) ?
	function () {
		return win.pageYOffset;
	} :
	(function () {
		var t = ("scrollTop" in html) ? html : body;
		return function () {
			return t.scrollTop;
		};
	} ());

module.exports = {
	height: height,
	offset: offset
};