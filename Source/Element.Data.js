/*
---
description: Stores data in HTML5 data properties
provides: [Element.Data]
requires: [Core/Element, Core/JSON]
script: Element.Data.js

...
*/

/**
 * @overview Element methods for getting and setting data- properties.
 */

(function(){

	/** @private */
	var isSecure = function(string){
		//this verfies that the string is parsable JSON and not malicious (borrowed from JSON.js in MooTools, which in turn borrowed it from Crockford)
		//this version is a little more permissive, as it allows single quoted attributes because forcing the use of double quotes
		//is a pain when this stuff is used as HTML properties
		return (/^[,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]*$/).test(string.replace(/\\./g, '@').replace(/"[^"\\\n\r]*"/g, '').replace(/'[^'\\\n\r]*'/g, ''));
	};

	/**
		@class
		@name Element
	*/
	Element.implement(/** @lends Element.prototype */{
		setData: function(name, value) {
			return this.set('data-' + name, value);
		},

		getData: function(name, default_value){
			var value = this.get('data-' + name);
			if (value) {
				return value;
			} else if (default_value != null){
				this.setData(name, default_value);
				return default_value;
			}
			return null;
		},

		setJSONData: function(name, value) {
			return this.setData(name, JSON.encode(value));
		},

		getJSONData: function(name, strict, default_value){
			var value = this.get('data-' + name);
			if (value) {
				return isSecure(value) ? JSON.decode(value, strict) : null;
			} else if (default_value){
				this.setJSONData(name, default_value);
				return default_value;
			}
		}

	});

})();