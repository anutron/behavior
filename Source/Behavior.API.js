/*
---
name: Behavior.API
description: HTML getters for Behavior's API model.
requires: [/Behavior, /Element.Data]
provides: [Behavior.API]
...
*/


(function(){
	var API = {
		element: null,
		prefix: '',

		get: function(/* name[, name, name, etc] */){
			if (arguments.length > 1) return this._getObj(Array.from(arguments));
			return this._getValue(arguments[0]);
		},

		getAs: function(/*returnType, name, defaultValue OR {name: returnType, name: returnType, etc}*/){
			if (typeOf(arguments[0]) == "object") return this._getValuesAs.apply(this, arguments);
			return this._getValueAs.apply(this, arguments);
		},

		require: function(/* name[, name, name, etc] */){
			for (var i = 0; i < arguments.length; i++){
				if (this.get(arguments[i]) == null) throw "Could not find " + this.prefix + '-' + arguments[i] + " option on element.";
			}
		},

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

		_getObj: function(names){
			var obj = {};
			names.each(function(name){
				obj[name] = this.get(name);
			}, this);
			return obj;
		},
		_getOptions: function(){
			if (!this.options) this.options = this.element.getJSONData(this.prefix + '-options') || {};
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
		_getValueAs: function(returnType, name, defaultValue) {
			var value = this._coerceFromString(returnType, this.get(name));
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
			if (value == null || instanceOf(value, toType)) return value;
			switch(toType){
				case(Boolean):
					if (value == "false") return false;
					if (value == "true") return true;
				case(Number):
					var number = Number.from(value);
					if (!isNaN(number)) return number;
				default:
					return toType.from(value);
			}
			return null;
		}
	};


	Behavior.API = function(element, filterName){
		function F() {
			this.element = element;
			this.prefix = filterName;
		};
		F.prototype = API;
		return new F;
	};


})();