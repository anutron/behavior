describe('Behavior', function(){

	it('should register a filter', function(){
		var test1 = makeAdder('one');
		Behavior.addGlobalFilter('Test1', test1);
		expect(behaviorInstance.getFilter('Test1').attach).toBe(test1);

		var test2 = makeAdder('two');
		Behavior.addGlobalFilters({
			Test2: test2
		});

		expect(behaviorInstance.getFilter('Test2').attach).toBe(test2);

	});

	it('should invoke a filter', function(){
		behaviorInstance.applyFilter(target, behaviorInstance.getFilter('Test1'));
		expect(target.getFilterResult('Test1')).toBeTruthy();
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
		var test1 = makeAdder('ONE');
		behaviorInstance.addFilter('Test1', test1);
		expect(behaviorInstance.getFilter('Test1').attach).toBe(test1);
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

	it('should add a filter to an element', function(){
		target.addDataFilter('Test3');
		expect(target.getDataFilters()).toEqual(['Test1', 'Test2', 'Test3']);
	});

	it('should log an error when a filter that isn\'t defined is encountered', function(){
		var logged = false,
		    log = function(){ logged = true; };
		behaviorInstance.addEvent('error', log);
		behaviorInstance.apply(container);
		expect(logged).toBe(true);
		behaviorInstance.cleanup(container);
		behaviorInstance.removeEvent('error', log);
	});

	it('should tell you if an element has a filter', function(){
		expect(target.hasDataFilter('Test3')).toBe(true);
	});

	it('should remove a data filter', function(){
		target.removeDataFilter('Test3');
		expect(target.hasDataFilter('Test3')).toBe(false);
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
		behaviorInstance.apply(container);
		expect(target.hasClass('one_plugin')).toBe(true);
	});

});
