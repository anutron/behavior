/*
---
description: Stores data in HTML5 data properties
provides: [Element.Data]
requires: [Core/Element, Core/JSON]
script: Element.Data.js

...
*/
(function(){

	var isSecure = function(string){
		//this verfies that the string is parsable JSON and not malicious (borrowed from JSON.js in MooTools, which in turn borrowed it from Crockford)
		//this version is a little more permissive, as it allows single quoted attributes because forcing the use of double quotes
		//is a pain when this stuff is used as HTML properties
		return (/^[,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]*$/).test(string.replace(/\\./g, '@').replace(/"[^"\\\n\r]*"/g, '').replace(/'[^'\\\n\r]*'/g, ''));
	};

	Element.implement({
		/*
			sets an HTML5 data property.
			arguments:
				name - (string) the data name to store; will be automatically prefixed with 'data-'.
				value - (string, number) the value to store.
		*/
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

		/* 
			arguments:
				name - (string) the data name to store; will be automatically prefixed with 'data-'
				value - (string, array, or object) if an object or array the object will be JSON encoded; otherwise stored as provided.
		*/
		setJSONData: function(name, value) {
			return this.setData(name, JSON.encode(value));
		},

		/*
			retrieves a property from HTML5 data property you specify
		
			arguments:
				name - (retrieve) the data name to store; will be automatically prefixed with 'data-'
				strict - (boolean) if true, will set the JSON.decode's secure flag to true; otherwise the value is still tested but allows single quoted attributes.
				default_value - (string, array, or object) the value to set if no value is found (see storeData above)
		*/
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

	Element.Properties.data = {

		set: function(name, value, encode){
			if (encode) return this.setJSONData(name, value);
			else return this.setData(name, value);
		},

		get: function(name, decode, default_value, strict){
			if (decode) return this.getJSONData(name, default_value, strict);
			else return this.getData(name, default_value);
		},

		erase: function(name){
			this.erase('data-' + name);
		}

	};

})();