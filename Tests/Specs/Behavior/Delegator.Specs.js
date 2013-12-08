/*
---
name: Delegator.Specs
description: n/a
requires: [Behavior/Delegator, Behavior/Behavior, Core/DomReady]
provides: [Delegator.Specs]
...
*/
(function(){
	var container = new Element('div').inject(document.body);
	var target = new Element('a.some-class', {
		'data-trigger': 'Test1 Test2',
		'data-required-options': '"foo": "bar", "number": 9',
		'data-required-true': 'true',
		'data-reader-options': '"foo": "bar", "number": 9',
		'data-reader-true': 'true'
	})
	.adopt(new Element('span.foo.bar'))
	.inject(container);

	var test1count = 0;
	Delegator.register('click', {
		Test1: function(){ test1count++; },
		Test2: function(){}
	});
	var instance = new Delegator().attach(container);

	describe('Delegator', function(){

		it('should return the triggers on an element', function(){
			expect(target.getTriggers()).toEqual(['Test1', 'Test2']);
		});

		it('should add a trigger to an element', function(){
			target.addTrigger('Test3');
			expect(target.getTriggers()).toEqual(['Test1', 'Test2', 'Test3']);
			target.removeTrigger('Test3');
		});

		it('should tell you if an element has a trigger', function(){
			target.addTrigger('Test3');
			expect(target.hasTrigger('Test3')).toBe(true);
			target.removeTrigger('Test3');
		});

		it('should remove a trigger', function(){
			target.addTrigger('Test3');
			target.removeTrigger('Test3');
			expect(target.hasTrigger('Test3')).toBe(false);
		});

		it('should register a global trigger', function(){
			var test3 = function(){};
			Delegator.register('click', 'Test3', test3);
			expect(instance.getTrigger('Test3').handler).toBe(test3);
			expect(Delegator.getTrigger('Test3').handler).toBe(test3);
		});

		it('should register a local trigger', function(){
			var test3 = function(){};
			instance.register('click', 'Test3', test3);
			expect(instance.getTrigger('Test3').handler).toBe(test3);
			expect(Delegator.getTrigger('Test3').handler).toNotBe(test3);
		});

		it('should fail to overwrite a filter', function(){
			var test3 = function(){};
			try {
				instance.register('click', 'Test3', test3);
				expect(true).toBe(false); //should not get here
			} catch(e){
				expect(e.message).toBe('Could add the trigger "Test3" as a previous trigger by that same name exists.');
			}
			expect(instance.getTrigger('Test3').handler).toNotBe(test3);
		});

		it('should overwrite a filter', function(){
			var overwrite = function(){};
			instance.register('click', 'Test2', overwrite, true);
			expect(instance.getTrigger('Test2').handler).toBe(overwrite);

			var test3 = function(){};
			instance.register('click', {
				Test3: test3
			}, true);
			expect(instance.getTrigger('Test3').handler).toBe(test3);
		});

		it('should bind to a behavior instance', function(){
			var b = new Behavior();
			var d = new Delegator({
				getBehavior: function(){ return b; }
			});
			expect(d.getBehavior()).toBe(b);
			var b2 = new Behavior();
			d.bindToBehavior(b2);
			expect(d.getBehavior()).toBe(b2);
			d.unbindFromBehavior(b2);
			expect(d.getBehavior()).toBeFalsy();
		});

		it('should return the value that the trigger returns', function(){

			Delegator.register('click', {
				Test4: function(){
					return 'test4';
				},
				Test5: function(){},
				Test6: function(event, target, api){
					return api.trigger('Test4');
				}
			});

			expect(instance.trigger('Test4')).toEqual('test4');
			expect(instance.trigger('Test5')).toBe(undefined);
			expect(instance.trigger('Test6')).toEqual('test4');

		});

		// Only run this spec in browsers other than IE6-8 because they can't properly simulate bubbling events
		if (window.addEventListener){

			it('should capture a click and run a filter only once', function(){
				var count = 0,
				    test1current = test1count;
				// instance is already attached to the container
				// so this should be ignored
				instance.attach(container);
				instance.register('click', 'ClickTest', function(){
					count++;
				});
				target.addTrigger('ClickTest');
				simulateEvent('click', [{}, target], function(){
					expect(count).toBe(1);
					expect(test1count).toBe(test1current + 1);
					target.removeTrigger('ClickTest');
				});
			});


			it('should use BehaviorAPI to read element properties', function(){
				var readerAPI;
				target.addTrigger('Reader');
				instance.register('click', 'Reader', function(event, target, api){
					readerAPI = api;
				});
				simulateEvent('click', [{}, target], function(){
					expect(readerAPI.get('foo')).toBe('bar');
					expect(readerAPI.getAs(Number, 'number')).toBe(9);
					expect(readerAPI.get('nope')).toBe(undefined);
					target.removeTrigger('Reader');
				});
			});

			it('should define a trigger with required and default values', function(){
				var reqAPI;
				target.addTrigger('Required');
				instance.register('click', 'Required', {
					handler: function(event, target, api){ reqAPI = api; },
					defaults: {
						'foo': 'baz',
						'ten': 10
					},
					require: ['foo'],
					requireAs: {
						'true': Boolean,
						'number': Number
					}
				});
				simulateEvent('click', [{}, target], function(){
					expect(reqAPI).toBeTruthy();
					expect(reqAPI.get('foo')).toBe('bar');
					expect(reqAPI.getAs(Number, 'ten')).toBe(10);
					target.removeTrigger('Required');
				});
			});

			it('should not fail when breakOnErrors is false', function(){
				target.addTrigger('Required');
				var success, msg;
				instance.addEvent('error', function(){
					msg = Array.join(arguments, ' ');
				});
				instance.register('click', 'Required', {
					handler: function(event, target, api){ success = true; },
					require: ['missing']
				}, true);
				simulateEvent('click', [{}, target], function(){
					expect(success).toBeFalsy();
					expect(msg).toBe('Could not apply the trigger Required Could not retrieve required-missing option from element.');
					target.removeTrigger('Required');
				});
			});

			it('should fail when breakOnErrors is true', function(){
				target.addTrigger('Required');
				instance.options.breakOnErrors = true;
				instance.register('click', 'Required', {
					handler: function(event, target, api){},
					require: ['missing']
				}, true);
				try{
					instance.trigger('Required', target);
					expect(true).toBe(false);
				} catch(e){
					expect(e.message).toBe('Could not retrieve required-missing option from element.');
				}
				target.removeTrigger('Required');
			});

			it('should capture a click and ignore a filter that isn\'t named', function(){
				var clicked;
				instance.register('click', 'Ignored', function(){
					clicked = true;
				});
				simulateEvent('click', [{}, target], function(){
					expect(clicked).toBe(undefined);
				});
			});

			it('should detach from a previously attached container and re-attach to it', function(){
				instance.detach(container);
				var test1current = test1count;
				simulateEvent('click', [{}, target], function(){
					expect(test1count).toBe(test1current);
					instance.attach(container);
					simulateEvent('click', [{}, target], function(){
						expect(test1count).toBe(test1current + 1);
					});
				});
			});


			it('should obey conditionals', function(){
				var test7count = 0, test8count = 0, test9count = 0, test10count = 0, test11count = 0;
				instance.register('click', {
					Test7:  function(){ test7count++; },
					Test8:  function(){ test8count++; },
					Test9:  function(){ test9count++; },
					Test10: function(){ test10count++; },
					Test11: function(){ test11count++; }
				});
				target.set({
					// should fire
					'data-test7-options': JSON.encode({
						'if': {
							'self::hasClass': ['some-class']
						}
					}),
					// should not fire
					'data-test8-options': JSON.encode({
						'unless': {
							'self::hasClass': ['some-class']
						}
					}),
					// should fire
					'data-test9-options': JSON.encode({
						'if': {
							'target': 'span.foo',
							'method': 'hasClass',
							'arguments': ['bar']
						}
					}),
					// should not fire
					'data-test10-options': JSON.encode({
						'if': {
							'target': 'span.foo',
							'method': 'get',
							'arguments': ['tag'],
							'value': 'div'
						}
					}),
					// should fire
					'data-test11-options': JSON.encode({
						'unless': {
							'target': 'span.foo',
							'method': 'get',
							'arguments': ['tag'],
							'value': 'div'
						}
					})
				});
				target.addTrigger('Test7')
							.addTrigger('Test8')
							.addTrigger('Test9')
							.addTrigger('Test10')
							.addTrigger('Test11');
				simulateEvent('click', [{}, target], function(){
					expect(test7count).toEqual(1);
					expect(test8count).toEqual(0);
					expect(test9count).toEqual(1);
					expect(test10count).toEqual(0);
					expect(test11count).toEqual(1);
				});
			});

			it('handle multi-triggers', function(){

				var foo = new Element('div.foo');
				var bar = new Element('div.bar');

				var multiTester = new Element('a', {
					'data-trigger': 'multi',
					'data-multi-triggers': JSON.encode(
						[
							{
								'.foo::multi1': {
									'arg':'blah'
								}
							},
							'.bar::multi2',
							{
								'.foo::multi3': {
									'if':{
										'self::hasClass':'foo'
									}
								}
							},
							{
								'.foo::multi4': {
									'unless':{
										'self::hasClass':'foo'
									}
								}
							}
						]
					)
				})
				.adopt(foo)
				.adopt(bar)
				.inject(container);

				var multi1 = 0, multi2 = 0, multi3 = 0, multi4 = 0;
				instance.register('click', {
					multi1: function(event, el, api){
						expect(api.get('arg')).toEqual('blah');
						expect(el).toEqual(foo);
						multi1++;
					},
					multi2: function(event, el, api){
						expect(el).toEqual(bar);
						multi2++;
					},
					multi3: function(event, el, api){
						expect(el).toEqual(foo);
						multi3++;
					},
					// shouldn't get called
					multi4: function(){
						multi4++;
					}
				});

				simulateEvent('click', [{}, multiTester], function(){
					expect(multi1).toEqual(1);
					expect(multi2).toEqual(1);
					expect(multi3).toEqual(1);
					expect(multi4).toEqual(0);
				});

			});


			it('handle multi-trigger switches', function(){

				var foo = new Element('div.foo');
				var bar = new Element('div.bar');

				var multiTester = new Element('a', {
					'data-trigger': 'first any',
					'data-first-switches': JSON.encode([
						// should NOT fire
						{
							'if': {
								'div.foo::hasClass':['baz']
							},
							triggers: [
								'.foo::switch1'
							]
						},
						// should fire
						{
							'unless': {
								'div.foo::hasClass':['baz']
							},
							triggers: [
								'.foo::switch2'
							]
						},
						// should NOT fire
						{
							triggers: [
								'.foo::switch3'
							]
						}
					]),
					'data-any-switches': JSON.encode([
						// should NOT fire
						{
							'if': {
								'div.foo::hasClass':['baz']
							},
							triggers: [
								'.foo::switch4'
							]
						},
						// should fire
						{
							'unless': {
								'div.foo::hasClass':['baz']
							},
							triggers: [
								'.foo::switch5'
							]
						},
						// should fire; no conditional
						{
							triggers: [
								'.foo::switch6'
							]
						}
					])
				})
				.adopt(foo)
				.adopt(bar)
				.inject(container);

				var switch1 = 0, switch2 = 0, switch3 = 0, switch4 = 0, switch5 = 0, switch6 = 0;
				instance.register('click', {
					switch1: function(event, el, api){
						// shouldn't fire
						switch1++;
					},
					switch2: function(event, el, api){
						expect(el).toEqual(foo);
						switch2++;
					},
					switch3: function(event, el, api){
						// shouldn't fire
						switch3++;
					},
					switch4: function(event, el, api){
						// shouldn't fire
						switch4++;
					},
					switch5: function(event, el, api){
						expect(el).toEqual(foo);
						switch5++;
					},
					switch6: function(event, el, api){
						expect(el).toEqual(foo);
						switch6++;
					}
				});

				simulateEvent('click', [{}, multiTester], function(){
					expect(switch1).toEqual(0);
					expect(switch2).toEqual(1);
					expect(switch3).toEqual(0);
					expect(switch4).toEqual(0);
					expect(switch5).toEqual(1);
					expect(switch6).toEqual(1);
				});

			});

		}

	});

})();