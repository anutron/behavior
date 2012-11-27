/*
---
name: BehaviorAPI
description: HTML getters for Behavior's API model.
requires: [Core/Class, /Element.Data]
provides: [BehaviorAPI]
...
*/


(function(){
	//see Docs/BehaviorAPI.md for documentation of public methods.

	var reggy = /[^a-z0-9\-]/gi,
	    dots = /\./g;

	window.BehaviorAPI = new Class({
		element: null,
		prefix: '',
		defaults: {},

		initialize: function(element, prefix){
			this.element = element;
			this.prefix = prefix.toLowerCase().replace(dots, '-').replace(reggy, '');
		},

		/******************
		 * PUBLIC METHODS
		 ******************/

		get: function(/* name[, name, name, etc] */){
			if (arguments.length > 1) return this._getObj(Array.from(arguments));
			return this._getValue(arguments[0]);
		},

		getAs: function(/*returnType, name, defaultValue OR {name: returnType, name: returnType, etc}*/){
			if (typeOf(arguments[0]) == 'object') return this._getValuesAs.apply(this, arguments);
			return this._getValueAs.apply(this, arguments);
		},

		require: function(/* name[, name, name, etc] */){
			for (var i = 0; i < arguments.length; i++){
				if (this._getValue(arguments[i]) == undefined) throw new Error('Could not retrieve ' + this.prefix + '-' + arguments[i] + ' option from element.');
			}
			return this;
		},

		requireAs: function(returnType, name /* OR {name: returnType, name: returnType, etc}*/){
			var val;
			if (typeOf(arguments[0]) == 'object'){
				for (var objName in arguments[0]){
					val = this._getValueAs(arguments[0][objName], objName);
					if (val === undefined || val === null) throw new Error("Could not retrieve " + this.prefix + '-' + objName + " option from element.");
				}
			} else {
				val = this._getValueAs(returnType, name);
				if (val === undefined || val === null) throw new Error("Could not retrieve " + this.prefix + '-' + name + " option from element.");
			}
			return this;
		},

		setDefault: function(name, value /* OR {name: value, name: value, etc }*/){
			if (typeOf(arguments[0]) == 'object'){
				for (var objName in arguments[0]){
					this.setDefault(objName, arguments[0][objName]);
				}
				return;
			}
			name = name.camelCase();
			this.defaults[name] = value;
			if (this._getValue(name) == null){
				var options = this._getOptions();
				options[name] = value;
			}
			return this;
		},

		refreshAPI: function(){
			delete this.options;
			this.setDefault(this.defaults);
			return;
		},

		/******************
		 * PRIVATE METHODS
		 ******************/

		//given an array of names, returns an object of key/value pairs for each name
		_getObj: function(names){
			var obj = {};
			names.each(function(name){
				var value = this._getValue(name);
				if (value !== undefined) obj[name] = value;
			}, this);
			return obj;
		},
		//gets the data-behaviorname-options object and parses it as JSON
		_getOptions: function(){
			try {
				if (!this.options){
					var options = this.element.getData(this.prefix + '-options', '{}');
					if (options === "") return this.options = {};
					if (options && options.substring(0,1) != '{') options = '{' + options + '}';
					var isSecure = JSON.isSecure(options);
					if (!isSecure) throw new Error('warning, options value for element is not parsable, check your JSON format for quotes, etc.');
					this.options = isSecure ? JSON.decode(options) : {};
					for (option in this.options) {
						this.options[option.camelCase()] = this.options[option];
					}
				}
			} catch (e){
				throw new Error('Could not get options from element; check your syntax. ' + this.prefix + '-options: "' + this.element.getData(this.prefix + '-options', '{}') + '"');
			}
			return this.options;
		},
		//given a name (string) returns the value for it
		_getValue: function(name){
			name = name.camelCase();
			var options = this._getOptions();
			if (!options.hasOwnProperty(name)){
				var inline = this.element.getData(this.prefix + '-' + name.hyphenate());
				if (inline) options[name] = inline;
			}
			return options[name];
		},
		//given a Type and a name (string) returns the value for it coerced to that type if possible
		//else returns the defaultValue or null
		_getValueAs: function(returnType, name, defaultValue){
			var value = this._getValue(name);
			if (value == null || value == undefined) return defaultValue;
			var coerced = this._coerceFromString(returnType, value);
			if (coerced == null) throw new Error("Could not retrieve value '" + name + "' as the specified type. Its value is: " + value);
			return coerced;
		},
		//given an object of name/Type pairs, returns those as an object of name/value (as specified Type) pairs
		_getValuesAs: function(obj){
			var returnObj = {};
			for (var name in obj){
				returnObj[name] = this._getValueAs(obj[name], name);
			}
			return returnObj;
		},
		//attempts to run a value through the JSON parser. If the result is not of that type returns null.
		_coerceFromString: function(toType, value){
			if (typeOf(value) == 'string' && toType != String){
				if (JSON.isSecure(value)) value = JSON.decode(value);
			}
			if (instanceOf(value, toType)) return value;
			return null;
		}
	});

})();