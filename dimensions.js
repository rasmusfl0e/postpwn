var win = window;
var doc = document;
var html = doc.documentElement;
var body = doc.body;

var getDocumentHeight = (body.offsetHeight > html.offsetHeight) ?
	function () {
		return body.offsetHeight;
	} :
	function () {
		return html.offsetHeight;
	};

var getViewportHeight = ("innerHeight" in win) ?
	function () {
		return win.innerHeight;
	} :
	function () {
		return html.clientHeight;
	};

var getViewportOffset = ("pageYOffset" in win) ?
	function () {
		return win.pageYOffset;
	} :
	(function () {
		var t = ("scrollTop" in html) ? html : body;
		return function () {
			return t.scrollTop;
		};
	} ());

return {
	document: {
		height: getDocumentHeight
	},
	viewport: {
		height: getViewportHeight,
		offset: getViewportOffset
	}
}