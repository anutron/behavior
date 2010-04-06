/*
Script: ART.Sheet.js

License:
	MIT-style license.
*/

ART.Sheet = {};

(function(){
	// http://www.w3.org/TR/CSS21/cascade.html#specificity
	var rules = [];

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

	var getSpecificity = function(selector){
		specificity = 0;
		selector.each(function(chunk){
			if (chunk.tag && chunk.tag != '*') specificity++;
			specificity += (chunk.pseudos || []).length;
			specificity += (chunk.classes || []).length * 100;
		});
		return specificity;
	};

	ART.Sheet.defineStyle = function(selectors, style, cssStyle){
		createRules(selectors, style, rules);
		if (cssStyle) createRules(selectors, cssStyle, cssRules);
		return this;
	};

	var containsAll = function(self, other){
		return other.every(function(x){
			return self.contains(x);
		}, this);
	};

	ART.Sheet.lookupStyle = function(selector){
		return getStyles(selector, rules);
	};
	
	
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
	
	var getStyles = function(selector, where) {
		var style = {};
		where.sort(function(a, b){
			return a.specificity - b.specificity;
		});

		selector = parseSelector(SubtleSlickParse(selector)[0]);
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
		if (Browser.Engine.trident) {
			for (prop in style) {
				var val = style[prop];
				if (val.isColor) {
					style[prop] = val.toRGB();
				}
			}
		}
		return style;
	};
	
	var cssRules = [];
	ART.Sheet.defineCSS = function(selector, style){
		createRules(selector, style, cssRules)
	};

	ART.Sheet.lookupCSS = function(selector){
		return getStyles(selector, cssRules);
	};

})();
