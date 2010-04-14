/*
Script: ART.Sheet.js

License:
	MIT-style license.
*/

ART.Sheet = {};

(function(){
	// http://www.w3.org/TR/CSS21/cascade.html#specificity
	var rules = [];
	var cssRules = [];

	//parses a given selector into an array
	var parseSelector = function(selector){
		return selector.map(function(chunk){
			var result = [];
			if (chunk.tag && chunk.tag != '*'){
				result.push(chunk.tag);
			}
			if (chunk.pseudos) chunk.pseudos.each(function(pseudo){
				result.push(':' + pseudo.name);
			});
			if (chunk.classes) chunk.classes.each(function(klass){
				result.push('.' + klass);
			});
			return result;
		});
	};

	//computes specificity in the same manner that css rules do for a given selector
	var getSpecificity = function(selector){
		specificity = 0;
		selector.each(function(chunk){
			if (chunk.tag && chunk.tag != '*') specificity++;
			specificity += (chunk.pseudos || []).length;
			specificity += (chunk.classes || []).length * 100;
		});
		return specificity;
	};

	var containsAll = function(self, other){
		return other.every(function(x){
			return self.contains(x);
		}, this);
	};

	//defines rules for a given selector
	//takes an object for ART.Sheet "styles" - arbitrary key/value pairs used by widgets
	//and for "ccsStyles" - valid css key/value pairs applied with Element.setStyle
	ART.Sheet.defineStyle = function(selectors, style, cssStyle){
		createRules(selectors, style, rules);
		if (cssStyle) createRules(selectors, cssStyle, cssRules);
		return this;
	};
	//returns the "style" object for a given selector
	ART.Sheet.lookupStyle = function(selector){
		return getStyles(selector, rules);
	};


	//methods for setting and retrieving standard css rules
	ART.Sheet.defineCSS = function(selector, style){
		createRules(selector, style, cssRules);
	};

	ART.Sheet.lookupCSS = function(selector){
		return getStyles(selector, cssRules);
	};
	
	//defines the objects (sytle rules) for a given set of selectors
	//and pushes them into an array passed in (the 'where' argument)
	var createRules = function(selectors, style, where){
		SubtleSlickParse(selectors).each(function(selector){
			var rule = {
				'specificity': getSpecificity(selector),
				'selector': parseSelector(selector),
				'style': {}
			};
			for (var p in style) rule.style[p.camelCase()] = style[p];
			where.push(rule);
		});
	};
	
	//retrieves styles for a given selector, merging them into a single
	//object given an array of rules (the 'where' argument)
	var getStyles = function(selector, where) {
		var style = {};
		//sort the rules by specificity
		where.sort(function(a, b){
			return a.specificity - b.specificity;
		});

		selector = parseSelector(SubtleSlickParse(selector)[0]);
		//merge the objects (the rules) together so the most specific one
		//wins on conflict
		where.each(function(rule){
			var i = rule.selector.length - 1, j = selector.length - 1;
			if (!containsAll(selector[j], rule.selector[i])) return;
			while (i-- > 0){
				while (true){
					if (j-- <= 0) return;
					if (containsAll(selector[j], rule.selector[i])) break;
				}
			}
			$mixin(style, rule.style);
		});
		//for IE, handle the Color bug that requires the object be a native String
		if (Browser.Engine.trident) {
			for (prop in style) {
				var val = style[prop];
				if (val && val.isColor) {
					style[prop] = val.toRGB();
				}
			}
		}
		return style;
	};
	
})();
