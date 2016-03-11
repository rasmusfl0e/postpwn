module.exports = function (observer, element) {
	var data = element._postpwn;
	if (data) {
		var pos = observer.getPosition(element);
		data.top = pos.top;
		data.bottom = pos.bottom;
	}
};