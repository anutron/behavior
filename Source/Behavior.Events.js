/*
---
name: Behavior.Events
description: Allows for the triggering of delegators when classes instantiated by Behavior fire arbitrary events.
requires: [/Behavior, /Delegator]
provides: [Behavior.Events]
...
*/

/*

	<div data-behavior="addEvent" data-addevent-options="
		'events': {
			'.foo::BehaviorName': {
				'show': [
					{
						'.bar::addClass': {
							'class': 'hide',
							'if': {
								'self::hasClass': 'baz'
							}
						}
					},
					{
						'.biz::removeClass': {
							'class': 'hide',
							'if': {
								'eventArguments[1]': true  // triggers if the 2nd argument passed to the onShow event == true
							}
						}
					},
					{
						'.boz::removeClass': {
							'class': 'hide',
							'if': {
								'instance.now': 0   // triggers if the instance returned by BehaviorName has a 'now' property == 0
							}
						}
					},
					{
						'.boz::removeClass': {
							'class': 'hide',
							'if': {
								'instance.getNow()': 0  // triggers if the instance returned by BehaviorName has a `getNow`
							}                         // method that, when invoked with no arguments, == 0
						}
					},
					{
						'.buz::removeClass': {
							'class': 'hide',
							'if': {
								'instance.getNow()': 0,  // triggers if the instance returned by BehaviorName has a `getNow` method
								'arguments': ['foo']     // that returns 0 when invoked with the argument 'foo' (i.e. instance.getNow('foo') == 0)
							}
						}
					}
				]
			}
		}
	"></div>

*/
(function(){

	var reggies = {
		eventArguments: /^eventArguments/,
		eventArgumentIndex: /.*\[(.*)\]/,
		instanceMethod: /^instance\.([a-zA-Z].*)\(/,
		instanceProperty: /^instance\./
	};

	var parseConditional = function(element, api, conditional, instance, eventArguments){
		var result = Object.every(conditional, function(value, key){
			// key == "eventArguments[1]"
			if (key.match(reggies.eventArguments)){
				var index = key.match(reggies.eventArgumentIndex)[1].toInt();
				// index == 1
				return eventArguments[index] == value;
			}
			// key == instance.foo()
			if (key.match(reggies.instanceMethod)){
				var method = key.match(reggies.instanceMethod)[1];
				if (instance[method]){
					if (conditional['arguments']) return instance[method].apply(instance, conditional['arguments']) == value;
					else return instance[method]() == value;
				}

			}
			// key == instance.foo
			if (key.match(reggies.instanceProperty)){
				return instance[key.split('.')[1]] == value;
			}
			return Delegator.verifyTargets(element, conditional, api);
		});
		return result;
	};

	Behavior.addGlobalFilter('addEvent', {
		setup: function(element, api){
			api.addEvent('apply:once', function(){
				var events = api.getAs(Object, 'events');
				Object.each(events, function(eventsToAdd, key){
					var selector = key.split('::')[0];
					var behaviorName = key.split('::')[1];
					var target = Behavior.getTarget(element, selector);
					if (!target) return api.warn('Could not find element at ' + selector + ' to add event to ' + behaviorName);
					var instance = target.getBehaviorResult(behaviorName);
					if (!instance) return api.warn('Could not find instance of ' + behaviorName + ' for element at ' + selector);
					Object.each(eventsToAdd, function(triggers, eventName){
						instance.addEvent(eventName, function(){
							var eventArgs = arguments;
							triggers.each(function(trigger){
								Object.each(trigger, function(options, delegatorTarget){
									var valid = true;
									if (options['if'] && !parseConditional(element, api, options['if'], instance, eventArgs)) valid = false;
									if (options['unless'] && parseConditional(element, api, options['unless'], instance, eventArgs)) valid = false;

									if (valid){
										// we've already tested these, so remove
										options['_if'] = options['if'];
										options['_unless'] = options['unless'];
										delete options['if'];
										delete options['unless'];
										// invoke the trigger
										api.getDelegator()._invokeMultiTrigger(element, null, delegatorTarget, options);
										// put them back
										options['if'] = options['_if'];
										options['unless'] = options['_unless'];
										delete options['_if'];
										delete options['_unless'];
									}
								});
							});
						});
					});
				});
			});
			return element;
		}
	});
})();