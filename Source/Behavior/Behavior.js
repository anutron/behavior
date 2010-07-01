/*
---
name: Behavior
description: Auto-instantiates widgets/classes based on parsed, declarative HTML.
requires: [Core/Class.Extras, Core/Element, Core/Selectors, /ART.Window, /Element.Data, Table/Table]
provides: [Behavior]
...
*/

(function(){

//utility function to pass events through to another object
var passEvent = function(to, event) {
	return function(){
		to.fireEvent(event, arguments);
	};
};

this.Behavior = new Class({

	Implements: [Options, Events, ART.WindowTools],

	options: {
		//method to return the widget this behavior is bound to; optional
		getWidget: $empty,
		//behaviors to apply on startup; optional
		behaviors: null,
		//apply behaviors on startup?
		applyNow: true,
		//default error behavior when a filter cannot be applied
		onError: function(){
			if (window.console && console.warn) console.warn.apply(console, arguments);
		}
		//components that have a Behavior instance (like an ART.Window)
		//call these events to tell filters that need to know that the state
		//has changed:
		// onResize: $empty, //the element's dimensions have changed
		// onShow: $empty, //the element is displayed
		// onHide: $empty //the element is hidden
	},

	initialize: function(element, options){
		this.element = $(element);
		this.setOptions(options);
		if (this.options.behaviors) this.use(this.options.behaviors);
		if (this.options.applyNow) this.applyBehaviors();
	},

	toElement: function(){
		return this.element;
	},

	//these methods don't change the element's state but rather are used
	//to tell filters that need to adapt to the new element state that
	//it has changed
	
	//the element is now visible
	show: function(){
		this.element.fireEvent('show');
		this.fireEvent('show');
		this.isVisible = true;
	},

	//the element is hidden
	hide: function(){
		this.element.fireEvent('hide');
		this.fireEvent('hide');
		this.isVisible = true;
	},

	//the element's dimensions are now the specified width and height
	resize: function(w, h){
		this.element.fireEvent('resize', [w, h]);
		this.fireEvent('resize', [w, h]);
	},

	//applies all the behavior filters for an element
	//force is passed through to applyBehavior (see it for docs)
	applyBehaviors: function(force){
		this.element.getElements('[data-filters]').each(function(element){
			element.get('data', 'filters').split(',').each(function(name){
				var behavior = this.getBehavior(name.trim());
				if (!behavior) this.fireEvent('error', ['There is no behavior registered with this name: ', name, element]);
				else this.applyBehavior(element, behavior, force);
			}, this);
		}, this);
		return this;
	},
	
	//applies a specific behavior to the element
	//element - the element to which to apply the behavior
	//behavior - a specific behavior filter, typically one registered with this instance or registered globally
	//force - apply the behavior to each element it matches, even if it was previously applied
	applyBehavior: function(element, behavior, force){
		//get the filters already applied to this element
		var applied = getApplied(element);
		//if this filter is not yet applied to the element, or we are forcing the filter
		if (!applied[behavior.name] || force) {
			//if it was previously applied, garbage collect it
			if (applied[behavior.name]) applied[behavior.name].sweep(element);
			//apply the filter
			behavior.attach(element, this.element);
			//and mark it as having been previously applied
			applied[behavior.name] = behavior;
		}
	},

	//given a name, returns a registered behavior
	getBehavior: function(name){
		return this._registered[name] || Behavior._registered[name];
	},

	//garbage collects all applied filters for this element and its children
	sweep:function(element, ignoreChildren){
		var applied = getApplied(element);
		for (behavior in applied) {
			if (applied[behavior]) {
				applied[behavior].sweep(element);
			}
		}
		if (!ignoreChildren) element.getElements(':hasBehaviors').each(this.sweep, this);
	}

});

//returns the applied behaviors for an element
var getApplied = function(el){
	return el.retrieve('_appliedBehaviors', {});
};

//registers a behavior filter
//name - the name of the filter
//behavior - an instance of Behavior.Filter
//overwrite - (boolean) if true, will overwrite existing filter if one exists; defaults to false
var register = function(name, behavior, overwrite){
	if ($type(name) == "object") {
		for (name in behaviors){
			this.register(name, behaviors[name]);
		}
		return this;
	}
	if (!this._registered[name] || overwrite) this._registered[name] = behavior;
	return this;
};
//overwrites a filter
var overwrite = function(name, behavior){
	return register(name, behavior, true);
};
//add methods to the Behavior namespace for global registration
$extend(Behavior, {
	_registered: {},
	registerGlobal: register,
	overwriteGlobal: overwrite
});
//add methods to the Behavior class for instance registration
Behavior.implement({
	_registered: {},
	register: register,
	overwrite: overwrite
});

//this class is an actual filter that, given an element, alters it with specific behaviors
Behavior.Filter = new Class({

	//pass in an object with the following properties:
	//name - the name of this filter
	//attach - a function that applies the filter to the given element
	initialize: function(options){
		this.name = options.name;
		this.attach = options.attach;
		this._marks = new Table();
	},

	//register this filter with a specific behavior
	//behavior - an instance of Behavior
	//overwrite - (boolean) force this filter to register even if one with the same name exists
	register: function(behavior, overwrite){
		behavior.register(this.name, this, overwrite);
		return this;
	},

	//globally registers this filter on the Behavior namespace
	//overwrite - (boolean) force this filter to register even if one with the same name exists
	global: function(overwrite){
		Behavior.registerGlobal(this.name, this, overwrite);
		return this;
	},

	//stores a garbage collection pointer for a specific element
	//example: if your filter enhances all the inputs in the container
	//you might have a function that removes that enhancement for garbage collection
	//you would mark each input matched with its own cleanup function
	//NOTE: this MUST be an element returned by the select method above (it is passed
	//      to the filter)
	mark: function(element, fn){
		var marks = this._marks.get(element);
		if (!marks) marks = [];
		marks.include(fn);
		this._marks.set(element, marks);
		return this;
	},

	//garbage collect a specific element
	sweep: function(element){
		var marks = this._marks.get(element);
		if (marks) {
			marks.each(function(fn){ fn(); });
			this._marks.set(element, []);
		}
		return this;
	}

});

//a selector to find all elements that have behaviors applied to them.
Selectors.Pseudo.hasBehaviors = function(){
	return !!this.retrieve('_appliedBehaviors');
};

})();

//allows for selectors like $$('[data-foo-bar]'); TODO: Note that it'll be in Moo 1.3; remove then.
Selectors.RegExps.combined = (/\.([\w-]+)|\[([\w-]+)(?:([!*^$~|]?=)(["']?)([^\4]*?)\4)?\]|:([\w-]+)(?:\(["']?(.*?)?["']?\)|$)/g);