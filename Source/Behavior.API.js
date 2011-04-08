/*
---
name: Behavior.API
description: HTML getters for Behavior's API model.
requires: [/Behavior, /Element.Data]
provides: [Behavior.API]
...
*/


(function(){
	/**
		@class
		@name Behavior.API
		@class A filter that, given an element, will instantiate a given widget/class.
		@constructs
		@param {Element} element The element this instance of the API is bound to.
		@param {String} filterName The name of the filter for this instance, added to "data-" to prefix all property names.
	*/
	var API = {
		/** @scope Behavior.API.prototype */
		
		/** {Element} The element for this instance of the API. */
		element: null,
		/** {String} The filtername prefix for this instance of the API; optional.*/
		prefix: '',

		/**
			Gets a value or values from the HTML configuration of the Element.
			@param {String} name Any number of name arguments.
			@returns {String, Object, null} If you pass in more than one name argument, you'll be returned an object of name/results,
				otherwise just the result for the name given. If you pass in a single name and the value is not found, null is returned.
		*/
		get: function(/* name[, name, name, etc] */){
			if (arguments.length > 1) return this._getObj(Array.from(arguments));
			return this._getValue(arguments[0]);
		},

		/**
			Gets a value as a specified type.
			@param {Type} returnType Pointers to the type of object to return (Array, Number, Boolean). By default this will be passed
				to the <i>from</i> method on that type. For Numbers, the value will attempt to be converted to a number. If the result is isNan
				then null will be returned. For Boolean, the value will be tested for "false" and "true" and coerced accordingly, else returned
				as null.
			@param {String} name The name of the value to retrieve. The prefix, if defined, will be prepended along with 'data-'.
			@param {Object, String, Array, Number, Boolean} defaultValue The value to return if none is found on the Element.
		*/

		getAs: function(/*returnType, name, defaultValue OR {name: returnType, name: returnType, etc}*/){
			if (typeOf(arguments[0]) == "object") return this._getValuesAs.apply(this, arguments);
			return this._getValueAs.apply(this, arguments);
		},

		/**
			Require a set of properties be defined on the Element.
			@param {String} name Any number of arguments, all names of properties to check for.
			   The prefix, if defined, will be prepended along with 'data-'.
		*/

		require: function(/* name[, name, name, etc] */){
			for (var i = 0; i < arguments.length; i++){
				if (this.get(arguments[i]) == null) throw "Could not find " + this.prefix + '-' + arguments[i] + " option on element.";
			}
		},

		/**
			Checks for the presence of a value as a specified type.
			@param {Type} returnType Pointers to the type of object to enforce (Array, Number, Boolean). By default this will be passed
				to the <i>from</i> method on that type. For Numbers, the value will attempt to be converted to a number. If the result is isNan
				then an error will be thrown. For Boolean, the value will be tested for "false" and "true" and coerced accordingly, else an
				error is thrown.
			@param {String} name The name of the value to check. The prefix, if defined, will be prepended along with 'data-'.
		*/
		requireAs: function(returnType, name /* OR {name: returnType, name: returnType, etc}*/){
			var val;
			if (typeOf(arguments[0]) == "object"){
				for (var objName in arguments[0]){
					val = this.getAs(arguments[0][objName], objName);
					if (val === undefined || val === null) throw "Could not find " + this.prefix + '-' + objName + " option on element or it's type was invalid.";
				}
			} else {
				val = this.getAs(returnType, name);
				if (val === undefined || val === null) throw "Could not find " + this.prefix + '-' + name + " option on element or it's type was invalid.";
			}
		},
		/**
			Sets a default value if none is present.
			@param {String} name The name of the value to set. The prefix, if defined, will be prepended along with 'data-'.
			@param {Object, String, Array, Number, Boolean} value The default value.
		*/
		setDefault: function(name, value /* OR {name: value, name: value, etc }*/){
			if (typeOf(arguments[0]) == "object") {
				for (var objName in arguments[0]){
					this.setDefault(objName, arguments[0][objName]);
				}
				return;
			}
			if (this.get(name) == null) {
				var options = this._getOptions();
				options[name] = value;
			}
		},

		/**
			Gets the values for a given set of names.
			@param {Array} names Set of names to fetch and return as an Object.
			@type Object
		*/
		_getObj: function(names){
			var obj = {};
			names.each(function(name){
				obj[name] = this.get(name);
			}, this);
			return obj;
		},
		/**
			Get the options that have been fetched previously. Starts off as the parsed JSON of the data-prefix-options value.
			@type Object
		*/
		_getOptions: function(){
			if (!this.options) this.options = this.element.getJSONData(this.prefix + '-options') || {};
			return this.options;
		},
		/**
			Get a value for a given name. Returns the value defined in this.options and, if not present, attempts to read it from an element property.
		*/
		_getValue: function(name){
			var options = this._getOptions();
			if (!options.hasOwnProperty(name)){
				var inline = this.element.getData(this.prefix + '-' + name);
				if (inline) options[name] = inline;
			}
			return options[name];
		},
		/**
			Get a value for a given name with a specified type.
			@param {Type} returnType Pointers to the type of object to return (Array, Number, Boolean).
			@param {String} name The name of the value to check. The prefix, if defined, will be prepended along with 'data-'.
			@param {Object, String, Array, Number, Boolean} defaultValue The value to return if none is found on the Element.
		*/
		_getValueAs: function(returnType, name, defaultValue) {
			var value = this._coerceFromString(returnType, this.get(name));
			return instanceOf(value, returnType) ? value : defaultValue;
		},
		/**
		Gets a group of values coerced into given types.
		@param {Object} obj A set of name/Type pairs.
		@type {Object}
		*/
		_getValuesAs: function(obj){
			var returnObj = {};
			for (var name in obj){
				returnObj[name] = this._getValueAs(obj[name], name);
			}
			return returnObj;
		},
		/**
			Coerces a value into a specified Type.
			@param {Function} Pointers to the type of object to return (Array, Number, Boolean).
			@value {Object, String, Array, Number, Boolean} The value to coerce to the given type.
		*/
		_coerceFromString: function(toType, value){
			if (value == null || instanceOf(value, toType)) return value;
			switch(toType){
				case(Boolean):
					if (value == "false") return false;
					if (value == "true") return true;
				case(Number):
					var number = Number.from(value);
					if (!isNaN(number)) return number;
					break;
				default:
					return toType.from(value);
			}
			return null;
		}
	};

	Behavior.API = function(element, filterName){
		/** @private */
		function F() {
			this.element = element;
			this.prefix = filterName;
		};
		F.prototype = API;
		return new F;
	};


})();