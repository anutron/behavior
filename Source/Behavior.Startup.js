/*
---
name: Behavior.Startup
description: Invokes delegators on startup when specified conditions are met.
requires: [/Behavior, /Delegator]
provides: [Behavior.Startup]
...
*/
(function(){
	var check = function(el, conditional, delegator, api){
		var targets = [];
		//get the target of these delegators
		if (conditional.targets){
			targets = el.getElement(conditional.targets);
		} else if (conditional.target && conditional.target != 'self'){
			var target = el.getElement(conditional.target);
			if (target) targets = new Elements([target]);
		} else {
			targets = new Elements([el]);
		}
		if (targets.length == 0) api.fail('could not find targets for startup delegator: ', delegator, conditional.targets);
		//check the targets for the conditionals
		return targets.some(function(target){
			if (conditional.property) return target.get(conditional.property) === conditional.value;
			else if (conditional.method) return target[conditional.method].apply(target, conditional.arguments || []) === conditional.value;
			else return (!conditional.method && !conditional.property)
		});
	};
	Behavior.addGlobalFilter('Startup', {
		setup: function(el, api){
			//get the delegators to set up
			var delegators = api.get('delegators');
			if (delegators){
				Object.each(delegators, function(conditional, delegator){
					var timer =(function(){
						//if any were true, fire the delegator ON THIS ELEMENT
						if (check(el, conditional, delegator, api)) {
							api.getDelegator().trigger(delegator, el);
						}
					}).delay(conditional.delay || 0)
					api.onCleanup(function(){
						clearTimeout(timer);
					});
				});
			}
		}
	});
})();