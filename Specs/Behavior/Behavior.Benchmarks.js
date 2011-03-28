(function(){
	Behavior.addGlobalFilter('Test1', function(){});

	MooBench.addBehaviorTest('Behavior: Empty filters', '<div data-filters="Test1">');
})();