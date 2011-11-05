/*
---
name: Behavior.Startup
description: Invokes delegators on startup when specified conditions are met.
requires: [/Behavior, /Delegator]
provides: [Behavior.Startup]
...
*/

Behavior.addGlobalFilter('Startup', {
	setup: function(el, api){
		//get the delegators to set up
		var delegators = api.get('delegators');
		if (delegators) {
			Object.each(delegators, function(conditional, delegator){
				var targets = [];
				//get the target of these delegators
				if (api.get('targets')){
					targets = el.getElement(api.get('targets'));
				} else if (api.get('target') && api.get('target') != 'self'){
					var target = el.getElement(api.get('target'));
					if (target) targets = new Elements([target]);
				} else {
					targets = new Elements(el);
				}
				if (targets.length == 0) api.fail('could not find targets for startup delegator: ', delegator, api.get('targets'));
				//check the targets for the conditionals
				var fire = targets.some(function(target){
					if (conditional.property) return element.get(conditional.property) === conditional.value;
					else if (conditional.method) return element[method].apply(element, conditional.arguments || []) === conditiona.value;
				});
				//if any were true, fire the delegator ON THIS ELEMENT
				if (fire) api.getDelegator().trigger(delegator, el);
			});
		}
	}
});