/*
---
name: Behavior.Specs
description: n/a
requires: [Behavior-Tests/Behavior.SpecsHelpers]
provides: [Behavior.Specs]
...
*/
if (window.describe){
	(function(){
		var container = new Element('div');
		var target = new Element('div', {
			'data-behavior': 'Test1 Test2',
			'data-defaults-options':'{"foo":"bar"}',
			'data-require-options':'{"foo": "bar", "nine": 9, "arr": [1, 2, 3]}',
			'data-require-number': '0',
			'data-require-true': 'true',
			'data-require-false': 'false'
		}).inject(container);

		var SimpleClass = new Class({
			simple: 'simple'
		});

		describe('Behavior', function(){

			it('should register a delegator', function(){
				var d = new Delegator();
				behaviorInstance.setDelegator(d);
				expect(behaviorInstance.getDelegator()).toBe(d);
				var error;
				try {
					behaviorInstance.setDelegator({});
				} catch(e){
					error = true;
				}
				expect(error).toBe(true);
			});

			it('should register a filter', function(){
				var test1 = ClassAdder.makeAdder('one');
				Behavior.addGlobalFilter('Test1', test1);
				expect(behaviorInstance.getFilter('Test1').setup).toBe(test1);

				var test2 = ClassAdder.makeAdder('two');
				Behavior.addGlobalFilters({
					Test2: test2
				});

				expect(behaviorInstance.getFilter('Test2').setup).toBe(test2);
			});

			it('should not overwrite a filter unless forced', function(){
				var test1 = function(){};
				var test2 = function(){};
				Behavior.addGlobalFilter('T1', test1);
				try {
					Behavior.addGlobalFilter('T1', test2);
					expect(true).toBe(false); //should not get here
				} catch(e){
					expect(e.message).toBe('Could not add the Behavior filter "T1" as a previous trigger by that same name exists.');
				}
				expect(behaviorInstance.getFilter('T1').setup).toNotBe(test2);
			});

			it('should overwrite a filter when forced', function(){
				var test1 = function(){};
				var test2 = function(){};
				Behavior.addGlobalFilter('T2', test1);
				Behavior.addGlobalFilter('T2', test2, true);
				expect(behaviorInstance.getFilter('Test1').setup).toNotBe(test2);
			});

			it('should invoke a filter', function(){
				behaviorInstance.applyFilter(target, behaviorInstance.getFilter('Test1'));
				expect(target.getBehaviorResult('Test1')).toBeTruthy();
			});

			it('should store the filter result', function(){
				Behavior.addGlobalFilter('SimpleClass', {
					returns: SimpleClass,
					setup: function(){
						return new SimpleClass();
					}
				});
				target.addBehaviorFilter('SimpleClass');
				behaviorInstance.apply(container);
				target.removeBehaviorFilter('SimpleClass');
				expect(target.getBehaviorResult('SimpleClass')).toBeTruthy();
			});

			it('should fail if a filter fails to return a proper instance', function(){
				Behavior.addGlobalFilter('SimpleClass2', {
					returns: SimpleClass,
					setup: function(){
						//note that this does not return!
						new SimpleClass();
					}
				});
				target.addBehaviorFilter('SimpleClass2');
				behaviorInstance.options.breakOnErrors = true;
				try {
					behaviorInstance.apply(container);
					expect(true).toBe(false); //this shouldn't get this far as an error should be thrown
				} catch(e) {
					expect(e.message).toBe("Filter SimpleClass2 did not return a valid instance.");
				}
				behaviorInstance.options.breakOnErrors = false;
				target.removeBehaviorFilter('SimpleClass2');
				expect(target.getBehaviorResult('SimpleClass2')).toBeFalsy();
			});


			it('should create a filter that fails', function(){
				Behavior.addGlobalFilter('Failure', {
					setup: function(element, api){
						api.fail('this thing is totally broken');
					}
				});
				target.addBehaviorFilter('Failure');
				behaviorInstance.options.breakOnErrors = true;
				try {
					behaviorInstance.apply(container);
					expect(true).toBe(false); //this shouldn't get this far as an error should be thrown
				} catch(e) {
					expect(e.message).toBe("this thing is totally broken");
				}
				behaviorInstance.options.breakOnErrors = false;
				target.removeBehaviorFilter('Failure');
			});

			it('should create a filter that warns', function(){
				var warning,
				    warner = function(msg){
							warning = msg;
						};
				behaviorInstance.addEvent('warn', warner);
				Behavior.addGlobalFilter('Warn', {
					setup: function(element, api){
						api.warn("you've been warned");
					}
				});
				target.addBehaviorFilter('Warn');
				behaviorInstance.apply(container);
				behaviorInstance.removeEvent('warn', warner);
				expect(warning).toBe("you've been warned");
				target.removeBehaviorFilter('Warn');
			});

			it('should not invoke a filter twice unless forced', function(){
				behaviorInstance.applyFilter(target, behaviorInstance.getFilter('Test1'));
				expect(target.getBehaviorResult('Test1').getCount()).toBe(1);
				behaviorInstance.applyFilter(target, behaviorInstance.getFilter('Test1'), true);
				expect(target.getBehaviorResult('Test1').getCount()).toBe(2);
			});

			it('should clean up a filter', function(){
				behaviorInstance.cleanup(target);
				expect(target.getBehaviorResult('Test1')).toBeNull();
				expect(target.hasClass('one')).toBe(false);
			});

			it('should set the defaults for a filter', function(){
				target.addBehaviorFilter('Defaults');
				Behavior.addGlobalFilter('Defaults', {
					defaults: {
						foo: 'baz',
						number: 9
					},
					setup: function(element, api){
						expect(api.get('number')).toEqual(9);
						expect(api.get('foo')).toEqual('bar');
					}
				});
				behaviorInstance.apply(container);
				target.removeBehaviorFilter('Defaults');
			});


			var makeRequirementTest = function(options){
				return function(){
					behaviorInstance.options.breakOnErrors = true;

					var filter = {
						setup: function(){
							return new SimpleClass();
						}
					};

					if (options.require) filter.require = options.require;
					if (options.requireAs) filter.requireAs = options.requireAs;

					Behavior.addGlobalFilter('Require', filter, true);
					target.addBehaviorFilter('Require');
					if (options.catcher) {
						try {
							behaviorInstance.apply(container, true);
							expect(true).toBe(false); //this shouldn't get this far as an error should be thrown
						} catch(e) {
							expect(e.message).toBe(options.catcher);
						}
					} else {
						behaviorInstance.apply(container, true);
					}
					if (options.truthy) expect(instanceOf(target.getBehaviorResult('Require'), SimpleClass)).toBeTruthy();
					else expect(target.getBehaviorResult('Require')).toBeFalsy();
					target.eliminate('Behavior Filter result:Require');
					target.removeBehaviorFilter('Require');

					behaviorInstance.options.breakOnErrors = false;
				};
			};

			it('should require a set of arguments on the target element',
				makeRequirementTest({
					require: ['number', 'true', 'false'],
					truthy: true
				})
			);

			it('should require a set of arguments of a given type are present on the target element',
				makeRequirementTest({
					requireAs: {
						'number': Number,
						'true': Boolean,
						'false': Boolean
					},
					truthy: true
				})
			);

			it('should fail if a required argument of a specific type is not found on an element',
				makeRequirementTest({
					requireAs: {
						'number': Number,
						'true': Boolean,
						'false': Boolean,
						'nine': Array
					},
					truthy: false,
					catcher: "Could not retrieve value \'nine\' as the specified type. Its value is: 9"
				})
			);

			it('should fail if a required argument is not found on an element',
				makeRequirementTest({
					require: ['number', 'true', 'false', 'nope'],
					truthy: false,
					catcher: "Could not retrieve require-nope option from element."
				})
			);

			it('should apply all filters to a container\'s children', function(){
				behaviorInstance.apply(container);
				expect(target.hasClass('one')).toBe(true);
				expect(target.hasClass('two')).toBe(true);
			});

			it('should clean up all the filters applied to a container\'s children', function(){
				behaviorInstance.cleanup(container);
				expect(target.hasClass('one')).toBe(false);
				expect(target.hasClass('two')).toBe(false);
			});

			it('should overwrite a global filter with a local one', function(){
				var test1 = ClassAdder.makeAdder('ONE');
				behaviorInstance.addFilter('Test1', test1);
				expect(behaviorInstance.getFilter('Test1').setup).toBe(test1);
				behaviorInstance.apply(container);
				expect(target.hasClass('ONE')).toBe(true);
				behaviorInstance.cleanup(container);
				expect(target.hasClass('ONE')).toBe(false);
				runs(function(){
					delete behaviorInstance._registered.Test1;
				});
			});

			it('should return the data filters on an element', function(){
				expect(target.getBehaviors()).toEqual(['Test1', 'Test2']);
			});

			it('should log an error when a filter that isn\'t defined is encountered', function(){
				var logged = false,
				    log = function(){ logged = true; };
				behaviorInstance.addEvent('error', log);
				target.addBehaviorFilter('Test3');
				behaviorInstance.apply(container);
				expect(logged).toBe(true);
				behaviorInstance.cleanup(container);
				behaviorInstance.removeEvent('error', log);
				target.removeBehaviorFilter('Test3');
			});

			it('should add a filter to an element', function(){
				target.addBehaviorFilter('Test3');
				expect(target.getBehaviors()).toEqual(['Test1', 'Test2', 'Test3']);
				target.removeBehaviorFilter('Test3');
			});

			it('should tell you if an element has a filter', function(){
				target.addBehaviorFilter('Test3');
				expect(target.hasBehavior('Test3')).toBe(true);
				target.removeBehaviorFilter('Test3');
			});

			it('should remove a data filter', function(){
				target.addBehaviorFilter('Test3');
				target.removeBehaviorFilter('Test3');
				expect(target.hasBehavior('Test3')).toBe(false);
			});

			it('should create a delayed filter', function(){
				target.addBehaviorFilter('Delayed');
				Behavior.addGlobalFilter('Delayed', {
					delay: 100,
					setup: function(element, API){
						element.addClass('wasdelayed');
					}
				});
				behaviorInstance.apply(container);
				expect(target.hasClass('wasdelayed')).toBe(false);
				waits(200);
				runs(function(){
					expect(target.hasClass('wasdelayed')).toBe(true);
					target.removeClass('wasdelayed');
					target.removeBehaviorFilter('Delayed');
				});
			});

			it('should create a filter that is run on mouseover', function(){
				target.addBehaviorFilter('MouseOver');
				var event;
				Behavior.addGlobalFilter('MouseOver', {
					delayUntil: 'mouseover',
					setup: function(element, API){
						element.addClass('wasmousedover');
						event = API.event;
					}
				});
				behaviorInstance.apply(container);
				expect(target.hasClass('wasmousedover')).toBe(false);
				expect(event).toBeFalsy();
				target.fireEvent('mouseover', true);
				expect(target.hasClass('wasmousedover')).toBe(true);
				expect(event).toBe(true);
				target.removeClass('wasmousedover');
				target.removeBehaviorFilter('MouseOver');
			});

			it('should create a filter with a custom initializer', function(){
				target.addBehaviorFilter('CustomInit');
				Behavior.addGlobalFilter('CustomInit', {
					initializer: function(element, api){
						var timer = (function(){
							if (element.hasClass('custom_init')) {
								clearInterval(timer);
								api.runSetup();
							}
						}).periodical(100);
					},
					setup: function(element, API){
						element.addClass('custom_init-ed');
					}
				});
				behaviorInstance.apply(container);
				expect(target.hasClass('custom_init-ed')).toBe(false);
				target.addClass('custom_init');
				waits(200);
				runs(function(){
					expect(target.hasClass('custom_init-ed')).toBe(true);
					target.removeClass('custom_init-ed');
					target.removeClass('custom_init');
					target.removeBehaviorFilter('CustomInit');
				});

			});

			it('should pass a method to a filter via the API', function(){
				var val = false;
				behaviorInstance.passMethod('changeVal', function(){
					val = true;
				});
				target.addBehaviorFilter('PassedMethod');
				Behavior.addGlobalFilter('PassedMethod', function(el, api){
					api.changeVal();
				});
				behaviorInstance.apply(container);
				expect(val).toBe(true);
				target.removeBehaviorFilter('PassedMethod');
			});

			it('should throw an error when attempting to pass a method that is already defined', function(){
				try {
					behaviorInstance.passMethod('addEvent', function(){});
					expect(true).toBe(false); //this shouldn't get this far as an error should be thrown
				} catch (e) {
					expect(e.message).toBe('Cannot overwrite API method addEvent as it already exists');
				}
			});

			it('should parse deprecated values', function(){
				target.setData('some-thing', 'some value');
				var depApi;
				behaviorInstance.addFilter('Deprecated', {
					deprecated: {
						'test': 'some-thing'
					},
					setup: function(element, api){
						depAPI = api;
					}
				});
				target.addBehaviorFilter('Deprecated');
				behaviorInstance.apply(container);
				expect(depAPI.get('test')).toBe('some value');
				behaviorInstance.options.enableDeprecation = false;
				behaviorInstance.apply(container, true);
				expect(depAPI.get('test')).toBe(undefined);
				behaviorInstance.options.enableDeprecation = true;
				target.removeBehaviorFilter('Deprecated');
			});

			it('should get a global filter', function(){
				var global = function(){};
				Behavior.addGlobalFilter('aGlobal', global);
				expect(Behavior.getFilter('aGlobal').setup).toBe(global);
			});

			it('should overwrite the defaults for a filter', function(){
				var before = {
					defaults: {
						letter: 'a',
						obj: {
							number: 1
						}
					}
				};
				Behavior.addGlobalFilter('iHasDefaults', Object.clone(before));
				Behavior.setFilterDefaults('iHasDefaults', {
					letter: 'b',
					obj: {
						number: 9
					}
				});
				expect(Behavior.getFilter('iHasDefaults').config.defaults.letter).toBe('b');
				expect(Behavior.getFilter('iHasDefaults').config.defaults.obj.number).toBe(9);
				behaviorInstance.addFilter('localDefaults', Object.clone(before));
				behaviorInstance.setFilterDefaults('localDefaults', {
					letter: 'b',
					obj: {
						number: 9
					}
				});
				expect(behaviorInstance.getFilter('localDefaults').config.defaults.letter).toBe('b');
				expect(behaviorInstance.getFilter('localDefaults').config.defaults.obj.number).toBe(9);
			});

			// plugins

			it('should define a global plugin', function(){

				var newTest1 = function(element, API, filterResult) {
					//verify that BOTH filters (Test1 and Test2) have run before this plugin
					expect(element.hasClass('one')).toBe(true);
					expect(element.hasClass('two')).toBe(true);
					element.addClass(filterResult.className + '_plugin');
				};
				Behavior.addGlobalPlugin('Test1', 'Test1Plugin', newTest1);
				behaviorInstance.apply(container, true);
				expect(target.hasClass('one_plugin')).toBe(true);
			});

		});

	})();
}