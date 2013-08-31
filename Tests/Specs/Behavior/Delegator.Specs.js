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
	var target = new Element('a', {
		'data-trigger': 'Test1 Test2',
		'data-Required-options': '"foo": "bar", "number": 9',
		'data-Required-true': 'true',
		'data-Reader-options': '"foo": "bar", "number": 9',
		'data-Reader-true': 'true'
	}).inject(container);

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

			var test4 = function(){};
			instance.register('click', {
				Test3: test4
			}, true);
			expect(instance.getTrigger('Test3').handler).toBe(test4);
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

			it('should detach from a previously attached container', function(){
				instance.detach(container);
				var test1current = test1count;
				simulateEvent('click', [{}, target], function(){
					expect(test1count).toBe(test1current);
					instance.attach(container);
				});
			});

		}

	});

})();