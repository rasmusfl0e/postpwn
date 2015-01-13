postpwn
=======

> Postpone initialization of components until they are in the viewport.

* Create plugins to handle elements coming into view.
* Configurable `threshold` for visibility.
* Automatically find elements via `selector` optionally.
* Uses dynamic throttling when checking visibility to avoid choking.
* Caches positions of elements to avoid DOM access.
* Supports evergreen browsers and IE8 (provided you include [ES5-shim](https://github.com/es-shims/es5-shim/)).
* No library dependencies.
* *NB*: Only handles vertical scrolling.

## Usage

```js
var postpwn = require("postpwn");

// Create a usecase-specific plugin to handle certains elements.

var myPlugin = postpwn({
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
```

## API

### postpwn
Create a plugin to handle elements that enter the viewport.

##### Arguments

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


## Changelog

### 3.0.0

Changes

* Drop `name` argument from plugin creation.

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
