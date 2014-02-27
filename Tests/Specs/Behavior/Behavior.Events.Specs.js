/*
---
name: Behavior.Events.Specs
description: n/a
requires: [Behavior-Tests/Behavior.SpecsHelpers, Behavior/Behavior.Events]
provides: [Behavior.Events.Specs]
...
*/
if (window.describe){
	(function(){

		describe('Behavior.Events', function(){

			var SimpleEventsClass = new Class({

				Implements: [Events],

				get: function(what){
					return what || 'nothing';
				}

			});

			Behavior.addGlobalFilter('SimpleEventsClass', {
				returns: SimpleEventsClass,
				setup: function(){
					return new SimpleEventsClass();
				}
			});

			var d = new Delegator();
			behaviorInstance.setDelegator(d);

			var container = new Element('div.container');
			var target = new Element('div.simple', {
				'data-behavior': 'SimpleEventsClass'
			}).inject(container);

			var simpleTriggerValue = '-';
			Delegator.register('click', {
				simpleTrigger: function(event, target, api){ simpleTriggerValue = api.get('value'); }
			});

			var div = new Element('div')
								.addBehaviorFilter('addEvent')
								.setJSONData('addevent-options', {
									events: {
										'!.container div.simple::SimpleEventsClass': {
											'elementMethodCall': [
												{
													'.bar::simpleTrigger': {
														'value': 'methodCallWorked',
														'if': {
															'self::hasClass': 'baz'
														}
													}
												}
											],
											'eventArgumentCheck': [
												{
													'.bar::simpleTrigger': {
														'value': 'argumentCheckWorked',
														'if': {
															'eventArguments[0]': 'does',
															'eventArguments[1]': 'work'
														}
													}
												}
											],
											'instancePropertyCheck': [
												{
													'.bar::simpleTrigger': {
														'value': 'instancePropertyCheckWorked',
														'if': {
															'instance.prop': 'it works!'
														}
													}
												}
											],
											'methodWithoutArgumentsCheck': [
												{
													'.bar::simpleTrigger': {
														'value': 'methodWithoutArgumentsCheckWorked',
														'if': {
															'instance.get()': 'nothing'
														}
													}
												}
											],
											'methodWithArgumentsCheck': [
												{
													'.bar::simpleTrigger': {
														'value': 'methodWithoutArgumentsCheckWorked',
														'if': {
															'instance.get()': 'something',
															'arguments': ['something']
														}
													}
												}
											]
										}
									}
								}).inject(container);
			var bar = new Element('div.bar').inject(div);

			// adds events
			behaviorInstance.apply(container);


			it('should add a simple event monitor and check against an element method', function(){

				// no change to our default value
				expect(simpleTriggerValue).toBe('-');

				var instance = target.getBehaviorResult('SimpleEventsClass');

				// now we fire our event
				instance.fireEvent('elementMethodCall');

				// still no change, as conditional doesn't match
				expect(simpleTriggerValue).toBe('-');

				// we add the .baz class, now our conditional matches
				div.addClass('baz');

				// fire event again
				instance.fireEvent('elementMethodCall');

				// should have changed
				expect(simpleTriggerValue).toBe('methodCallWorked');

				simpleTriggerValue = '-';

			});

			it('should add a simple event monitor and check against an argument', function(){

				// no change to our default value
				expect(simpleTriggerValue).toBe('-');

				var instance = target.getBehaviorResult('SimpleEventsClass');

				// now we fire our event
				instance.fireEvent('eventArgumentCheck', ['it', 'does', 'not', 'work']);

				// still no change, as conditional doesn't match
				expect(simpleTriggerValue).toBe('-');

				// fire event again
				instance.fireEvent('eventArgumentCheck', ['does', 'work']);

				// should have changed
				expect(simpleTriggerValue).toBe('argumentCheckWorked');

				simpleTriggerValue = '-';

			});

			it('should add a simple event monitor and check against an instance property', function(){

				// no change to our default value
				expect(simpleTriggerValue).toBe('-');

				var instance = target.getBehaviorResult('SimpleEventsClass');

				// now we fire our event
				instance.fireEvent('instancePropertyCheck');

				// still no change, as conditional doesn't match
				expect(simpleTriggerValue).toBe('-');

				// fire event again
				instance.prop = 'it works!';
				instance.fireEvent('instancePropertyCheck');

				// should have changed
				expect(simpleTriggerValue).toBe('instancePropertyCheckWorked');

				simpleTriggerValue = '-';

			});

			it('should add a simple event monitor and check against an instance method', function(){

				// no change to our default value
				expect(simpleTriggerValue).toBe('-');

				var instance = target.getBehaviorResult('SimpleEventsClass');

				// now we fire our event
				instance.fireEvent('methodWithoutArgumentsCheck');
				expect(simpleTriggerValue).toBe('methodWithoutArgumentsCheckWorked');

				instance.fireEvent('methodWithArgumentsCheck');

				// should have changed
				expect(simpleTriggerValue).toBe('methodWithoutArgumentsCheckWorked');

				simpleTriggerValue = '-';

			});

		});

	})();
}