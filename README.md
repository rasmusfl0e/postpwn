postpwn
=======

Postpone initialization of components until they are in the viewport.

**NB:** Does not handle horizontal scrolling.

## Usage

	var postpwn = require("postpwn");

	// Create a usecase-specific plugin to handle certains elements.

	var myPlugin = postpwn("is-my-div-in-view", {
		selector: ".my-div",
		threshold: 800,
		init: function (element) {
			element.className += " in-view";
		}
	});

	// Manually add elements.

	var anotherDiv = document.querySelector(".anotherDiv");
	myPlugin.add(anotherDiv);

	// Manually remove elements.

	myPlugin.remove(anotherDiv);
	anotherDiv.parentNode.removeChild(anotherDiv);

## API

### postpwn
Create - or retrieve - a plugin to handle elements that enter the viewport.
You can retrieve a plugin by only passing the plugin `name`.

##### Arguments

* `name` (string) - Name of the plugin.
* `config`
   * `selector` (string) - Optional. A selector that matches elements that should be controlled by the plugin. If supplied 
   * `threshold` (number) - Optional. Trigger the init function this number of pixels before becoming visible in the viewport. Default is `0`.  
   * `init` (function) - The init function that handles elements when they become visible in the viewport.
      The `init` function is passed a single argument:
      * `element` (Element) - The element that has come into view.

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


## Browser support
Evergreen browsers and IE8 (provided you include [ES5-shim](https://github.com/es-shims/es5-shim/)).

## Changelog

### 2.0.0

Changes

* 

### 1.6.0

Changes

* `add`: If `elements` are not supplied and the plugin has a `selector` defined - that is used to find new elements.

### 1.5.0

Changes

* The `selector` and `init` arguments for `register` are now accepted as part of `config`.
* Deprecated `initialize`.

Features

* Added `add` and `remove`.
