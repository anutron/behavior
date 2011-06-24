/*
---
name: BehaviorAPI.Specs
description: n/a
requires: [Behavior/BehaviorAPI]
provides: [BehaviorAPI.Specs]
...
*/
if (window.describe){
	(function(){
		var target = new Element('div', {
			'data-behaviorname-options':'{"foo": "bar", "nine": 9, "arr": [1, 2, 3], "i-have-hyphens": "sweet"}',
			'data-behaviorname-number': '0',
			'data-behaviorname-true': 'true',
			'data-behaviorname-false': 'false'
		});

		describe('BehaviorAPI', function(){

			it('should get a data properties from an element', function(){
				var api = new BehaviorAPI(target, 'behaviorname');
				expect(api.get('number')).toBe('0');
				expect(api.get('number', 'true', 'false', 'iHaveHyphens')).toEqual({
					'number': '0', 'true': 'true', 'false': 'false', 'iHaveHyphens': 'sweet'
				});
				expect(api.get('i-have-hyphens')).toBe('sweet');
			});

			it('should get a data property from an element as a number', function(){
				var api = new BehaviorAPI(target, 'behaviorname');
				expect(api.getAs(Number, 'number')).toBe(0);
			});

			it('should get a data property from an element as a boolean', function(){
				var api = new BehaviorAPI(target, 'behaviorname');
				expect(api.getAs(Boolean, 'true')).toBe(true);
				expect(api.getAs(Boolean, 'false')).toBe(false);
			});

			it('should not fail when using getAs on a property that isn\'t present', function(){
				var api = new BehaviorAPI(target, 'behaviorname');
				expect(api.getAs(Boolean, 'notHere')).toBe(undefined);
			});

			it('should read JSON values', function(){
				var api = new BehaviorAPI(target, 'behaviorname');
				expect(api.get('foo')).toBe('bar');
				expect(api.get('nine')).toBe(9);
				expect(api.get('arr')).toEqual([1,2,3]);
			
			
				var target2 = new Element('div', {
					'data-behaviorname-options':'"foo": "bar", "nine": 9, "arr": [1, 2, 3]'
				});
				var api2 = new BehaviorAPI(target2, 'behaviorname');
				expect(api2.get('foo')).toBe('bar');
				expect(api2.get('nine')).toBe(9);
				expect(api2.get('arr')).toEqual([1,2,3]);
			});

			it('should set a default value', function(){
				var api = new BehaviorAPI(target, 'behaviorname');
				api.setDefault('foo', 'baz');
				expect(api.get('foo')).toBe('bar');

				api.setDefault('something', 'else');
				expect(api.get('something')).toBe('else');

				api.setDefault({
					'one': 1,
					'two': 2
				});
				expect(api.get('one')).toBe(1);
				expect(api.get('two')).toBe(2);
			});

			it('should reset cached values', function(){
				var clone = target.clone(true, true);
				var api = new BehaviorAPI(clone, 'behaviorname');
				api.setDefault('fred', 'flintsone');
				expect(api.get('number')).toBe('0');
				clone.setData('behaviorname-number', '5');
				expect(api.get('number')).toBe('0');
				api.refreshAPI();
				expect(api.get('number')).toBe('5');
			});


			it('should require an option that is present', function(){
				var api = new BehaviorAPI(target, 'behaviorname');
				api.require('number');
				api.requireAs(Number, 'number');

				api.require('number', 'true', 'false');
				api.requireAs({
					'number': Number,
					'true': Boolean,
					'false': Boolean
				});
			});

			it('should require an option that is NOT present', function(){
				var api = new BehaviorAPI(target, 'behaviorname');
				try {
					api.require('notThere');
					expect(true).toBe(false); //this shouldn't get this far as an error should be thrown
				} catch(e) {
					expect(e.message).toBe('Could not retrieve behaviorname-notThere option from element.');
				}

				try {
					api.requireAs(Number, 'true');
					expect(true).toBe(false); //this shouldn't get this far as an error should be thrown
				} catch(e) {
					expect(e.message).toBe('Could not retrieve value \'true\' as the specified type. Its value is: true');
				}

				try {
					api.requireAs(Boolean, 'number');
					expect(true).toBe(false); //this shouldn't get this far as an error should be thrown
				} catch(e) {
					expect(e.message).toBe('Could not retrieve value \'number\' as the specified type. Its value is: 0');
				}

				try {
					api.requireAs({
						'true': Boolean,
						'false': Boolean,
						'number': Boolean
					});
				} catch(e){
					expect(e.message).toBe('Could not retrieve value \'number\' as the specified type. Its value is: 0');
				}
			});

		});

	})();
}