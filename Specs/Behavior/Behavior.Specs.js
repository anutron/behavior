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
			'data-filters': 'Test1 Test2',
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
				expect(target.getFilterResult('Test1')).toBeTruthy();
			});
		
			it('should store the filter result', function(){
				Behavior.addGlobalFilter('SimpleClass', {
					returns: SimpleClass,
					setup: function(){
						return new SimpleClass();
					}
				});
				target.addDataFilter('SimpleClass');
				behaviorInstance.apply(container);
				target.removeDataFilter('SimpleClass');
				expect(target.getFilterResult('SimpleClass')).toBeTruthy();
			});
		
			it('should fail if a filter fails to return a proper instance', function(){
				Behavior.addGlobalFilter('SimpleClass2', {
					returns: SimpleClass,
					setup: function(){
						//note that this does not return!
						new SimpleClass();
					}
				});
				target.addDataFilter('SimpleClass2');
				behaviorInstance.options.breakOnErrors = true;
				try {
					behaviorInstance.apply(container);
					expect(true).toBe(false); //this shouldn't get this far as an error should be thrown
				} catch(e) {
					expect(e.message).toBe("Filter SimpleClass2 did not return a valid instance.");
				}
				behaviorInstance.options.breakOnErrors = false;
				target.removeDataFilter('SimpleClass2');
				expect(target.getFilterResult('SimpleClass2')).toBeFalsy();
			});


			it('should create a filter that fails', function(){
				Behavior.addGlobalFilter('Failure', {
					setup: function(element, api){
						api.fail('this thing is totally broken');
					}
				});
				target.addDataFilter('Failure');
				behaviorInstance.options.breakOnErrors = true;
				try {
					behaviorInstance.apply(container);
					expect(true).toBe(false); //this shouldn't get this far as an error should be thrown
				} catch(e) {
					expect(e.message).toBe("this thing is totally broken");
				}
				behaviorInstance.options.breakOnErrors = false;
				target.removeDataFilter('Failure');
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
				target.addDataFilter('Warn');
				behaviorInstance.apply(container);
				behaviorInstance.removeEvent('warn', warner);
				expect(warning).toBe("you've been warned");
				target.removeDataFilter('Warn');
			});

			it('should not invoke a filter twice unless forced', function(){
				behaviorInstance.applyFilter(target, behaviorInstance.getFilter('Test1'));
				expect(target.getFilterResult('Test1').getCount()).toBe(1);
				behaviorInstance.applyFilter(target, behaviorInstance.getFilter('Test1'), true);
				expect(target.getFilterResult('Test1').getCount()).toBe(2);
			});
		
			it('should clean up a filter', function(){
				behaviorInstance.cleanup(target);
				expect(target.getFilterResult('Test1')).toBeNull();
				expect(target.hasClass('one')).toBe(false);
			});
		
			it('should set the defaults for a filter', function(){
				target.addDataFilter('Defaults');
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
				target.removeDataFilter('Defaults');
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
					target.addDataFilter('Require');
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
					if (options.truthy) expect(instanceOf(target.getFilterResult('Require'), SimpleClass)).toBeTruthy();
					else expect(target.getFilterResult('Require')).toBeFalsy();
					target.eliminate('Behavior Filter result:Require');
					target.removeDataFilter('Require');
		
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
				expect(target.getDataFilters()).toEqual(['Test1', 'Test2']);
			});
		
			it('should log an error when a filter that isn\'t defined is encountered', function(){
				var logged = false,
				    log = function(){ logged = true; };
				behaviorInstance.addEvent('error', log);
				target.addDataFilter('Test3');
				behaviorInstance.apply(container);
				expect(logged).toBe(true);
				behaviorInstance.cleanup(container);
				behaviorInstance.removeEvent('error', log);
				target.removeDataFilter('Test3');
			});
		
			it('should add a filter to an element', function(){
				target.addDataFilter('Test3');
				expect(target.getDataFilters()).toEqual(['Test1', 'Test2', 'Test3']);
				target.removeDataFilter('Test3');
			});
		
			it('should tell you if an element has a filter', function(){
				target.addDataFilter('Test3');
				expect(target.hasDataFilter('Test3')).toBe(true);
				target.removeDataFilter('Test3');
			});
		
			it('should remove a data filter', function(){
				target.addDataFilter('Test3');
				target.removeDataFilter('Test3');
				expect(target.hasDataFilter('Test3')).toBe(false);
			});

			it('should create a delayed filter', function(){
				target.addDataFilter('Delayed');
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
					target.removeDataFilter('Delayed');
				});
			});

			it('should create a filter that is run on mouseover', function(){
				target.addDataFilter('MouseOver');
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
				target.removeDataFilter('MouseOver');
			});

			it('should create a filter with a custom initializer', function(){
				target.addDataFilter('CustomInit');
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
					target.removeDataFilter('CustomInit');
				});
			
			});

			it('should pass a method to a filter via the API', function(){
				var val = false;
				behaviorInstance.passMethod('changeVal', function(){
					val = true;
				});
				target.addDataFilter('PassedMethod');
				Behavior.addGlobalFilter('PassedMethod', function(el, api){
					api.changeVal();
				});
				behaviorInstance.apply(container);
				expect(val).toBe(true);
				target.removeDataFilter('PassedMethod');
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
				target.addDataFilter('Deprecated');
				behaviorInstance.apply(container);
				expect(depAPI.get('test')).toBe('some value');
				behaviorInstance.options.enableDeprecation = false;
				behaviorInstance.apply(container, true);
				expect(depAPI.get('test')).toBe(undefined);
				behaviorInstance.options.enableDeprecation = true;
				target.removeDataFilter('Deprecated');
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