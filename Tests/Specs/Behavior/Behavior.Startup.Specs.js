/*
---
name: Behavior.Startup.Specs
description: n/a
requires: [Behavior/Behavior.Startup, Behavior-Tests/Behavior.SpecsHelpers]
provides: [Behavior.Startup.Specs]
...
*/
if (window.describe){
	(function(){

		describe('Behavior.Startup', function(){

			var b = new Behavior();
			var d = new Delegator({
				getBehavior: function(){return b;}
			});
			b.setDelegator(d);
			var test1count = 0, test2count = 0, test3count = 0, test4count = 0;
			Delegator.register('click', {
				StartupTest1: function(){ test1count++; },
				StartupTest2: function(){ test2count++; },
				StartupTest3: function(){ test3count++; },
				StartupTest4: function(){ test4count++; }
			});

			var dom = new Element('div', {
				'data-trigger': 'StartupTest1, StartupTest2',
				'data-behavior': 'Startup',
				'data-startup-options': JSON.encode({
					delegators: {
						StartupTest1: {
							target:'input#foo',
							property:'value',
							value:'bar'
						},
						StartupTest2: {
							target:'input#foo',
							property:'value',
							value:'baz'
						},
						StartupTest3: {
							targets: 'span.yo',
							method:'hasClass',
							arguments: ['oy'],
							value: true
						},
						StartupTest4: {
							targets: 'span.yo',
							method:'get',
							arguments:'tag',
							value: 'div'
						}
					}
				})
			}).adopt(new Element('input#foo', {name: 'foo', value: 'bar'}))
			  .adopt(new Element('span.yo'))
			  .adopt(new Element('span.yo.oy'));
		});

	})();
}