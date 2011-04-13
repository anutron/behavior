/*
---
name: Behavior.API
description: HTML getters for Behavior's API model.
requires: [/Behavior, /Element.Data]
provides: [Behavior.API]
...
*/


(function(){
	
	Behavior.API = new Class({
		element: null,
		prefix: '',
		defaults: {},

		initialize: function(element, prefix){
			this.element = element;
			this.prefix = prefix;
		},

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
				if (this._getValue(arguments[i]) == undefined) throw 'Could not find ' + this.prefix + '-' + arguments[i] + ' option on element.';
			}
			return this;
		},

		requireAs: function(returnType, name /* OR {name: returnType, name: returnType, etc}*/){
			var val;
			if (typeOf(arguments[0]) == 'object'){
				for (var objName in arguments[0]){
					val = this._getValueAs(arguments[0][objName], objName);
					if (val === undefined || val === null) throw "Could not find " + this.prefix + '-' + objName + " option on element or its type was invalid.";
				}
			} else {
				val = this._getValueAs(returnType, name);
				if (val === undefined || val === null) throw "Could not find " + this.prefix + '-' + name + " option on element or its type was invalid.";
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

		_getObj: function(names){
			var obj = {};
			names.each(function(name){
				obj[name] = this._getValue(name);
			}, this);
			return obj;
		},
		_getOptions: function(){
			if (!this.options){
				var options = this.element.getData(this.prefix + '-options', '{}');
				if (options && options[0] != '{') options = '{' + options + '}';
				this.options = JSON.isSecure(options) ? JSON.decode(options) : {};
			}
			return this.options;
		},
		_getValue: function(name){
			var options = this._getOptions();
			if (!options.hasOwnProperty(name)){
				var inline = this.element.getData(this.prefix + '-' + name);
				if (inline) options[name] = inline;
			}
			return options[name];
		},
		_getValueAs: function(returnType, name, defaultValue){
			var value = this._coerceFromString(returnType, this._getValue(name));
			return instanceOf(value, returnType) ? value : defaultValue;
		},
		_getValuesAs: function(obj){
			var returnObj = {};
			for (var name in obj){
				returnObj[name] = this._getValueAs(obj[name], name);
			}
			return returnObj;
		},
		_coerceFromString: function(toType, value){
			if (typeOf(value) == 'string' && toType != String){
				if (JSON.isSecure(value)) value = JSON.decode(value);
			}
			if (instanceOf(value, toType)) return value;
			return null;
		}
	});

})();