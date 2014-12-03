postpwn
=======

Postpone initialization of components until they are in the viewport.

Make plugins (consisting of a name, selector and an init function) and register them on the `postpwn` object.

**NB:** Does not handle horizontal scrolling.

## Usage

	var postpwn = require("postpwn");

	postpwn.register("is-my-div-in-view", ".my-div", function (element) {
		element.className += " in-view";
	});

### Methods

#### register
Register a plugin to handle elements that match a selector via an init function.

##### Arguments

* `name` (string) - Name of the plugin.
* `selector` (string) - The selector that matches elements that should be controlled by the plugin.
* `init` (function) - The init function that handles elements when they become visible in the viewport.
   The `init` function is passed a single argument:
   * `element` (Element) - The element that has come into view.

#### initialize
Used for adding dynamically added areas of the DOM to the pool of elements handled by the registered `postpwn` plugins. 

##### Arguments

* `element` (Element) - Optional. The root of the added DOM elements to be initialized. Default value is `document`.


## Browser support
Evergreen browsers and IE8 (provided you include [ES5-shim](https://github.com/es-shims/es5-shim/)).