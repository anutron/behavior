/*
---
name: Behavior
description: Auto-instantiates widgets/classes based on parsed, declarative HTML.
requires: [Core/Class.Extras, Core/Element, Core/Selectors, /ART.Window, /Element.Data, Table/Table, /DashSelectors]
provides: [Behavior]
...
*/

(function(){

	this.Behavior = new Class({

		Implements: [Options, Events],

		options: {
			//apply behaviors on instantiation?
			applyNow: true,
			//default error behavior when a filter cannot be applied
			onError: function(){
				if (window.console && console.warn) console.warn.apply(console, arguments);
			}
			//Components that have a Behavior instance (like an ART.Window)
			//call these events to tell filters that need to know that the state
			//has changed:
			// onResize: $empty, //the element's dimensions have changed
			// onShow: $empty, //the element is displayed
			// onHide: $empty //the element is hidden
		},

		initialize: function(element, options){
			this.element = $(element);
			this.setOptions(options);
			if (this.options.applyNow) this.apply();
		},

		toElement: function(){
			return this.element;
		},

		//These methods don't change the element's state but rather are used
		//to tell filters that need to adapt to the new element state that
		//it has changed.
	
		//the element is now visible
		show: function(){
			this.element.fireEvent('show');
			this.fireEvent('show');
		},

		//the element is hidden
		hide: function(){
			this.element.fireEvent('hide');
			this.fireEvent('hide');
		},

		//the element's dimensions are now the specified width and height
		resize: function(w, h){
			this.element.fireEvent('resize', [w, h]);
			this.fireEvent('resize', [w, h]);
		},

		//Applies all the behavior filters for an element.
		//force is passed through to _applyBehavior (see it for docs)
		apply: function(force){
			this.element.getElements('[data-filters]').each(function(element){
				element.get('data', 'filters').split(',').each(function(name){
					var behavior = this.getBehavior(name.trim());
					if (!behavior) this.fireEvent('error', ['There is no behavior registered with this name: ', name, element]);
					else this._applyBehavior(element, behavior, force);
				}, this);
			}, this);
			return this;
		},

		//Applies a specific behavior to a specific element.
		//element - the element to which to apply the behavior
		//behavior - a specific behavior filter, typically one registered with this instance or registered globally
		//force - apply the behavior to each element it matches, even if it was previously applied
		_applyBehavior: function(element, behavior, force){
			//get the filters already applied to this element
			var applied = getApplied(element);
			//if this filter is not yet applied to the element, or we are forcing the filter
			if (!applied[behavior.name] || force) {
				//if it was previously applied, garbage collect it
				if (applied[behavior.name]) applied[behavior.name].cleanup(element);
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

		//Garbage collects all applied filters for this element and its children.
		cleanup:function(element, ignoreChildren){
			var applied = getApplied(element);
			for (behavior in applied) {
				applied[behavior].cleanup(element);
				delete applied[behavior];
			}
			if (!ignoreChildren) element.getElements(':hasBehaviors').each(this.cleanup, this);
		}

	});

	//Returns the applied behaviors for an element.
	var getApplied = function(el){
		return el.retrieve('_appliedBehaviors', {});
	};

	//Registers a behavior filter.
	//name - the name of the filter
	//behavior - an instance of Behavior.Filter
	//overwrite - (boolean) if true, will overwrite existing filter if one exists; defaults to false
	var register = function(name, behavior, overwrite){
		if (!this._registered[name] || overwrite) this._registered[name] = behavior;
		return this;
	};
	//Overwrites a filter.
	var overwrite = function(name, behavior){
		return register(name, behavior, true);
	};
	//Add methods to the Behavior namespace for global registration.
	$extend(Behavior, {
		_registered: {},
		registerGlobal: register,
		overwriteGlobal: overwrite
	});
	//Add methods to the Behavior class for instance registration.
	Behavior.implement({
		_registered: {},
		register: register,
		overwrite: overwrite
	});

	//This class is an actual filter that, given an element, alters it with specific behaviors.
	Behavior.Filter = new Class({

		//Filter implements window tools for filters that integrate with ART.Window.
		Implements: [ART.WindowTools],

		//Pass in an object with the following properties:
		//name - the name of this filter
		//attacher - a function that applies the filter to the given element
		initialize: function(name, attacher){
			this.name = name;
			this.attach = attacher;
			this._marks = new Table();
		},

		//Stores a garbage collection pointer for a specific element.
		//Example: if your filter enhances all the inputs in the container
		//you might have a function that removes that enhancement for garbage collection.
		//You would mark each input matched with its own cleanup function.
		//NOTE: this MUST be the element passed to the filter - the element with this filters
		//      name in its data-filter property. I.E.:
		//<form data-filter="FormValidator">
		//  <input type="text" name="email"/>
		//</form>
		//If this filter is FormValidator, you can mark the form for cleanup, but not, for example
		//the input. Only elements that match this filter can be marked.
		markForCleanup: function(element, fn){
			var marks = this._marks.get(element);
			if (!marks) marks = [];
			marks.include(fn);
			this._marks.set(element, marks);
			return this;
		},

		//Garbage collect a specific element.
		//NOTE: this should be an element that has a data-filter property that matches this filter.
		cleanup: function(element){
			var marks = this._marks.get(element);
			if (marks) {
				marks.each(function(fn){ fn(); });
				this._marks.erase(element);
			}
			return this;
		},

		//Register this filter with a specific behavior.
		//behavior - an instance of Behavior
		//overwrite - (boolean) force this filter to register even if one with the same name exists
		register: function(behavior, overwrite){
			behavior.register(this.name, this, overwrite);
			return this;
		},

		//Globally registers this filter on the Behavior namespace.
		//overwrite - (boolean) force this filter to register even if one with the same name exists
		global: function(overwrite){
			Behavior.registerGlobal(this.name, this, overwrite);
			return this;
		}

	});


})();


//a selector to find all elements that have behaviors applied to them.
Selectors.Pseudo.hasBehaviors = function(){
	return !!this.retrieve('_appliedBehaviors');
};