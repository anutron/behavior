var container = new Element('div');
var target = new Element('div', {
	'data-filters': 'Test1 Test2'
}).inject(container);

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