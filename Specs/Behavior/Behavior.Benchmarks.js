/*
---
name: Behavior.Benchmarks
description: n/a
requires: [Behavior-Tests/Behavior.SpecsHelpers]
provides: [Behavior.Benchmarks]
...
*/
(function(){

	Behavior.addGlobalFilter('BenchmarkFilter', function(){});

	Behavior.addFilterTest({
		filterName: 'BenchmarkFilter',
		desc: 'Applies an empty filter',
		content: '<div data-filters="BenchmarkFilter"></div>',
		noSpecs: true
	});

})();