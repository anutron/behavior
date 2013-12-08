/*
---
name: Behavior.Startup.Specs
description: n/a
requires: [Behavior/Behavior.Startup, Behavior-Tests/Behavior.SpecsHelpers]
provides: [Behavior.Startup.Specs]
...
*/
if (window.describe){

	describe('Behavior.Startup', function(){

		var b = new Behavior();
		var d = new Delegator({
			getBehavior: function(){return b;}
		});
		b.setDelegator(d);
		var test1count = 0, test2count = 0, test3count = 0, test4count = 0, test5count = 0, test6count = 0;
		Delegator.register('click', {
			StartupTest1: function(){ test1count++; },
			StartupTest2: function(){ test2count++; },
			StartupTest3: function(){ test3count++; },
			StartupTest4: function(){ test4count++; },
			StartupTest5: function(){ test5count++; },
			StartupTest6: function(){ test6count++; }
		});

		var dom = new Element('div').adopt(
			new Element('div', {
				'data-trigger': 'StartupTest1, StartupTest2',
				'data-behavior': 'Startup',
				'data-startup-options': JSON.encode({
					delegators: {
						// should fire
						StartupTest1: {
							target:'input#foo',
							property:'value',
							value:'bar'
						},
						// should not fire
						StartupTest2: {
							target:'input#foo',
							property:'value',
							value:'baz'
						},
						// should fire
						StartupTest3: {
							targets: 'span.yo',
							method:'hasClass',
							arguments: ['oy'],
							value: true
						},
						// should not fire
						StartupTest4: {
							targets: 'span.yo',
							method:'get',
							arguments:'tag',
							value: 'div'
						},
						// should fire
						StartupTest5: {
							'span.yo::get': ['tag'],
							value: 'span'
						},
						// should not fire
						StartupTest6: {
							'span.yo::get': ['tag'],
							value: 'div'
						}
					}
				})
			})
			.adopt(new Element('input#foo', {name: 'foo', value: 'bar'}))
		  .adopt(new Element('span.yo.oy'))
	);

		b.apply(dom);

		it('Expects the proper startup delegators to have fired', function(){
			expect(test1count).toBe(1);
			expect(test2count).toBe(0);
			expect(test3count).toBe(1);
			expect(test4count).toBe(0);
			expect(test5count).toBe(1);
			expect(test6count).toBe(0);
		});
	});
}