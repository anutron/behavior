var ClassAdder = new Class({
	initialize: function(element, className){
		this.element = element.addClass(className);
		this.className = className;
		this.setCount(this.getCount() + 1);
	},
	getCount: function(){
		return (this.element.getData('class-adder-count-' + this.className) || 0).toInt();
	},
	setCount: function(count){
		this.element.setData('class-adder-count-' + this.className, count);
	},
	destroy: function(){
		this.element.removeClass(this.className);
	}
});

var behaviorInstance = new Behavior();

var makeAdder = function(className){
	return function(el, API){ 
		var adder = new ClassAdder(el, className);
		API.markForCleanup(el, function(){
			adder.destroy();
		});
		return adder;
	};
};

MooBench.addBehaviorTest = function(name, content) {
	var tester,
	    container = new Element('div');
	if ($type(content) == 'string') container.set('html', content);
	else container.adopt(content);

	var clean = function(){
		if (tester) {
			tester.destroy();
			tester = null;
		}
	};

	MooBench.add(name + ': instantiation', function(){ behaviorInstance.apply(document.body); }, {
		// compiled/called before the test loop
		'setup': function(){
			tester = container.cloneNode(true);
			document.body.appendChild(tester);
		},

		// compiled/called after the test loop
		'teardown': function(){
			behaviorInstance.cleanup(document.body);
			clean();
		}
	});

	MooBench.add(name + ': cleanup', function(){ behaviorInstance.cleanup(document.body); }, {
		// compiled/called before the test loop
		'setup': function(){
			tester = container.cloneNode(true);
			document.body.appendChild(tester);
			behaviorInstance.apply(document.body);
		},

		// compiled/called after the test loop
		'teardown': clean

	});

};

MooBench.addMultipleBehaviorTest = function(name, content, times){
	var tenX;
	if ($type(content) == 'string'){
		tenX = content;
		(9).times(function(){
			tenX += content;
		});
	} else {
		tenX = new Element('div');
		(10).times(function(){
			tenX.adopt(content.clone(true, true));
		});
	}
	MooBench.addBehaviorTest(name, tenX);
};