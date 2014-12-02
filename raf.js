var win = window;
var lastTime = 0;
var vendors = ['ms', 'moz', 'webkit', 'o'];
for (var x = 0; x < vendors.length && !win.requestAnimationFrame; ++x) {
	win.requestAnimationFrame = win[vendors[x] + 'RequestAnimationFrame'];
	win.cancelAnimationFrame = win[vendors[x] + 'CancelAnimationFrame'] || win[vendors[x] + 'CancelRequestAnimationFrame'];
}

var request = win.requestAnimationFrame || function (callback, element) {
	var currTime = new Date().getTime();
	var timeToCall = Math.max(0, 16 - (currTime - lastTime));
	var id = win.setTimeout(function () { callback(currTime + timeToCall); },
	  timeToCall);
	lastTime = currTime + timeToCall;
	return id;
};

var cancel =  win.cancelAnimationFrame || function (id) {
	clearTimeout(id);
};

return {
	request: request,
	cancel: cancel
};