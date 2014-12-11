postpwn
=======

Postpone initialization of components until they are in the viewport.

Make plugins and register them on the `postpwn` object.

**NB:** Does not handle horizontal scrolling.

## Usage

	var postpwn = require("postpwn");

	postpwn.register("is-my-div-in-view", {
		selector: ".my-div",
		threshold: 800,
		init: function (element) {
			element.className += " in-view";
		}
	});

### Methods

#### register
Register a plugin to handle elements that enter the viewport.

##### Arguments

* `name` (string) - Name of the plugin.
* `config`
   * `selector` (string) - Optional. The selector that matches elements that should be controlled by the plugin.
   * `threshold` (number) - Optional. Trigger the init function this number of pixels before becoming visible in the viewport. Default is `0`.  
   * `init` (function) - The init function that handles elements when they become visible in the viewport.
      The `init` function is passed a single argument:
      * `element` (Element) - The element that has come into view.

#### add
Add elements to be controlled by a plugin.

##### Arguments

* `type` (string) - Name of the plugin to control the added elements.
* `elements` (array-like object with elements) - The elements to be added.


##### remove
If elements that are handled by a plugin is removed from the DOM

* `elements` (array-like object with elements) - The elements to be removed.


## Browser support
Evergreen browsers and IE8 (provided you include [ES5-shim](https://github.com/es-shims/es5-shim/)).

## Changelog


### 1.5.0

Changes

* The `selector` and `init` arguments for `register` are now accepted as part of `config`.
* Deprecated `initialize`.

Features

* Added `add` and `remove`.