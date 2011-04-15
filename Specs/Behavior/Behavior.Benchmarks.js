/*
---
name: Behavior.Benchmarks
description: n/a
requires: [Behavior-Tests/Behavior.SpecsHelpers]
provides: [Behavior.Benchmarks]
...
*/
(function(){

	Behavior.addGlobalFilter('Test1', function(){});

	Behavior.addFilterTest({
		filterName: 'Test1',
		desc: 'Applies an empty filter',
		content: '<div data-filters="Test1"></div>',
		noSpecs: true
	});

})();