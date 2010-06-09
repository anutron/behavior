/*
---
name: Behavior
description: Auto-instantiates widgets/classes based on parsed, declarative HTML.
requires: [Core/Class.Extras, Core/Element, /ART.Window, /Element.Data]
provides: [Behavior]
...
*/

(function(){

this.Behavior = new Class({

	Implements: [Options, Events, ART.WindowTools],
	
	options: {
		getWidget: $empty,
		behaviors: null,
		//components that have a Behavior instance (like an ART.Window)
		//call these events to tell filters that need to know that the state
		//has changed:
		onMove: $empty,
		onResize: $empty,
		noShow: $empty,
		onHide: $empty
	},
	
	initialize: function(container, options){
		this.element = $(container);
		this.setOptions(options);
		if (this.options.behaviors) this.use(this.options.behaviors);
	},

	toElement: function(){
		return this.element;
	},
	
	_behaviors: [],
	
	use: function(names){
		$splat(names).each(function(name){
			this._behaviors.push(name);
		}, this);
		return this;
	},
	
	run: function(meta){
		this.sweep();
		this._behaviors.each(function(name){
			behavior = this.lookup(name);
			if (behavior) behavior.run(this.element, this, meta);
		}, this);
		return this;
	},
	
	lookup: function(name){
		return this._registered[name] || Behavior._registered[name];
	},
	
	mark: function(fn){
		if (!this._marked) this._marked = [];
		this._marked.push(fn);
	},
	
	sweep:function(){
		this._marked.each(function(fn){
			fn.apply(this);
		});
		this.marked.empty();
	}
	
});

var register = function(name, behavior){
	if ($type(name) == "object") {
		for (name in behaviors){
			this.register(name, behaviors[name]);
		}
		return this;
	}
	this._registered[name] = behavior;
	return this;
};

$extend(Behavior, {
	_registered: {},
	registerGlobal: register
});
Behavior.implement({
	_registered: {},
	register: register
});

})();