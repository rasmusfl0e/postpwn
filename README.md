postpwn
=======

> Postpone initialization of components until they are in the viewport.

## Features

* Create plugins to handle elements coming into and out of view.
* Configurable `threshold` for visibility on plugins - or on elements via `data-threshold` attributes.
* Automatically find elements via `selector` optionally.
* Uses dynamic throttling when checking visibility to avoid choking.
* Caches positions of elements to avoid DOM access.
* Supports evergreen browsers and IE8 (provided you include [ES5-shim](https://github.com/es-shims/es5-shim/)).
* No library dependencies.

*NB*: Only handles vertical scrolling.

## Usage

```js
var postpwn = require("postpwn");

// Create a usecase-specific plugin to handle certains elements.

var myPlugin = postpwn({
	selector: ".my-div",
	threshold: 800,
	onInit: function (element) {
		var image = new Image();
		image.onload = function () {
			image.style.opacity = 0;
			element.appendChild(image);
			// Query visibility at the time image has loaded.
			if (myPlugin.isVisible(element)) {
				// Fade in image.
			}
			else {
				// Just display it.
			}
			myPlugin.remove(element);
		};
		image.src = "//mysite.com/path/to/image.jpg";
	}
});

// Manually add elements.

var anotherDiv = document.querySelector(".anotherDiv");
myPlugin.add(anotherDiv);
```

## API

### postpwn
Create a plugin to handle elements that enter the viewport.

##### Arguments

* `config`
   * `selector` (string) - Optional. A selector that matches elements that should be controlled by the plugin. If supplied elements matching it will automatically be added to the pool of controlled elements at plugin creation.
   * `threshold` (number) - Optional. Trigger the init function this number of pixels before becoming visible in the viewport. Default is `0`.  
   * `onInit` (function) - Optional. The init function that handles uninitiated elements when they become visible in the viewport.
      The function is passed a single argument:
      * `element` (Element) - The element that has come into view.
   * `onVisible` (function) - Optional. This function will be called every time the element comes into view with the same argument as `onInit`.
   * `onHidden` (function) - Optional. This function will be called every time the element comes out of view with the same argument as `onInit`.

##### Returns
A postpwn plugin.


### postpwn.update
Can be called to refresh the cached positions of controlled elements if your layout changes (onresize is handled automatically).


### postpwn plugin methods

#### [plugin].add
Add elements to be controlled by a plugin.

##### Arguments

* `elements` (Element or array-like object with elements) - Optional. The elements to be added. If no elements are supplied and the plugin has `selector` defined in its config - it will look for new elements matching this and add them.


#### [plugin].remove
Remove elements that are being controlled by a plugin when removed from the DOM.

##### Arguments

* `elements` (Element or array-like object with elements) - The elements to be removed.


#### [plugin].isVisible
Tell if an controlled element is visible or not.
Elements that are not controlled (either never added or removed from control) will result in `true`.

##### Arguments

* `element` (Element) - The element to query visibility for.

##### Returns
A boolean.


## Changelog

### 3.0.0

Changes

* Drop `name` argument from plugin creation.
* `init` renamed to `onInit`. Initiated elements are not automatically removed from the pool of controlled elements.
* Controlled elements are marked with a `_postpwned` property. 

Features

* Added support for individually set `threshold` on elements via `data-threshold` attributes.
* Added `onVisible` and `onHidden` callbacks to plugin config.

### 2.0.0

Changes

* The API is now exposed as a factory that creates plugins.

### 1.6.0

Changes

* `add`: If `elements` are not supplied and the plugin has a `selector` defined - that is used to find new elements.

### 1.5.0

Changes

* The `selector` and `init` arguments for `register` are now accepted as part of `config`.
* Deprecated `initialize`.

Features

* Added `add` and `remove`.
