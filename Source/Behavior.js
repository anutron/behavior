/*
---
name: Behavior
description: Auto-instantiates widgets/classes based on parsed, declarative HTML.
requires: [Core/Class.Extras, Core/Element, Core/Selectors, /Element.Data, More/Table]
provides: [DashSelectors, Behavior]
...
*/

(function(){

	this.Behavior = new Class({

		Implements: [Options, Events],

		options: {
			//by default, errors thrown by filters are caught; the onError event is fired.
			//set this to *true* to NOT catch these errors to allow them to be handled by the browser.
			// breakOnErrors: false,

			//default error behavior when a filter cannot be applied
			onError: function(){
				if (window.console && console.warn){
					if(console.warn.apply) console.warn.apply(console, arguments);
					else console.warn($A(arguments).join(' '));
				}
			}
			//Components that have a Behavior instance (like an ART.Window)
			//call these events to tell filters that need to know that the state
			//has changed:
			// onResize: $empty, //the element's dimensions have changed
			// onShow: $empty, //the element is displayed
			// onHide: $empty //the element is hidden
		},

		initialize: function(options){
			this.setOptions(options);
			this.passMethods({
				addEvent: this.addEvent.bind(this), 
				removeEvent: this.removeEvent.bind(this),
				addEvents: this.addEvents.bind(this), 
				removeEvents: this.removeEvents.bind(this),
				fireEvent: this.fireEvent.bind(this),
				applyFilters: this.apply.bind(this),
				applyFilter: this.applyFilter.bind(this),
				//this doesn't really stand up; the container is variable - one behavior instance
				//can handle numerous containers... TODO: revisit
				getContainerSize: function() { return this.currentSize; }.bind(this),
				error: function(){ this.fireEvent('error', arguments); }.bind(this)
			});
		},
		
		//pass a method pointer through to a filter
		//by default the methods for add/remove events are passed to the filter
		//pointed to this instance of behavior. you could use this to pass along
		//other methods to your filters. For example, a method to close a popup
		//for filters presented inside popups.
		_passedMethods: {},
		passMethod: function(method, fn){
			var self = this;
			this._passedMethods[method] = function(){
				return fn.apply(this, arguments);
			};
			return this;
		},

		passMethods: function(methods){
			for (var method in methods) {
				this.passMethod(method, methods[method]);
			}
			return this;
		},

		//These methods don't change the element's state but rather are used
		//to tell filters that need to adapt to the new element state that
		//it has changed.
		show: function(){
			return this.fireEvent('show');
		},

		//the element is hidden
		hide: function(){
			return this.fireEvent('hide');
		},

		//the element's dimensions are now the specified width and height
		resize: function(x, y){
			this.currentSize = {x: x, y: y};
			return this.fireEvent('resize', [x, y]);
		},

		//Applies all the behavior filters for an element.
		//container - (element) an element to apply the filters registered with this Behavior instance to.
		//force - (boolean; optional) passed through to applyFilter (see it for docs)
		apply: function(container, force){
			document.id(container).getElements('[data-filters]').each(function(element){
				element.getData('filters').split(',').each(function(name){
					var behavior = this.getFilter(name.trim());
					if (!behavior) this.fireEvent('error', ['There is no behavior registered with this name: ', name, element]);
					else this.applyFilter(element, behavior, force);
				}, this);
			}, this);
			return this;
		},

		//Applies a specific behavior to a specific element.
		//element - the element to which to apply the behavior
		//filter - (object) a specific behavior filter, typically one registered with this instance or registered globally.
		//force - (boolean; optional) apply the behavior to each element it matches, even if it was previously applied. Defaults to *false*.
		applyFilter: function(element, filter, force){
			var run = function(){
				element = document.id(element);
				//get the filters already applied to this element
				var applied = getApplied(element);
				//if this filter is not yet applied to the element, or we are forcing the filter
				if (!applied[filter.name] || force) {
					//if it was previously applied, garbage collect it
					if (applied[filter.name]) applied[filter.name].cleanup(element);
					//apply the filter
					filter.attach(element, this._passedMethods);
					//and mark it as having been previously applied
					applied[filter.name] = filter;
					//apply all the plugins for this filter
					var plugins = this.getPlugins(filter.name);
					if (plugins) {
						for (var name in plugins) {
							this.applyFilter(element, plugins[name], force);
						}
					}
				}
			}.bind(this);
			if (this.options.breakOnErrors) {
				run();
			} else {
				try {
					run();
				} catch (e) {
					this.fireEvent('error', ['Could not apply the behavior ' + filter.name, e]);
				}
			}
			return this;
		},

		//given a name, returns a registered behavior
		getFilter: function(name){
			return this._registered[name] || Behavior._registered[name];
		},

		getPlugins: function(name){
			return this._plugins[name] || Behavior._plugins[name];
		},

		//Garbage collects all applied filters for an element and its children.
		//element - (*element*) container to cleanup
		//ignoreChildren - (*boolean*; optional) if *true* only the element will be cleaned, otherwise the element and all the
		//	  children with filters applied will be cleaned. Defaults to *false*.
		cleanup: function(element, ignoreChildren){
			element = document.id(element);
			var applied = getApplied(element);
			for (var behavior in applied) {
				applied[behavior].cleanup(element);
				delete applied[behavior];
			}
			if (!ignoreChildren) element.getElements(':hasBehaviors').each(this.cleanup, this);
			return this;
		}

	});

	//Returns the applied behaviors for an element.
	var getApplied = function(el){
		return el.retrieve('_appliedBehaviors', {});
	};

	//Registers a behavior filter.
	//name - the name of the filter
	//fn - a function that applies the filter to the given element
	//overwrite - (boolean) if true, will overwrite existing filter if one exists; defaults to false.
	var addFilter = function(name, fn, overwrite){
		if (!this._registered[name] || overwrite) this._registered[name] = new Behavior.Filter(name, fn);
	};
	
	var addFilters = function(obj, overwrite) {
		for (var name in obj) {
			addFilter.apply(this, [name, obj[name], overwrite]);
		}
	};
	
	//Registers a behavior plugin
	//filterName - (*string*) the filter (or plugin) this is a plugin for
	//name - (*string*) the name of this plugin
	//attacher - a function that applies the filter to the given element
	var addPlugin = function(filterName, name, attacher, overwrite) {
		if (!this._plugins[filterName]) this._plugins[filterName] = {};
		if (!this._plugins[filterName][name] || overwrite) this._plugins[filterName][name] = new Behavior.Filter(name, attacher);
	};
	
	var addPlugins = function(obj, overwrite) {
		for (var name in obj) {
			addPlugin.apply(this, [obj[name].fitlerName, obj[name].name, obj[name].attacher], overwrite);
		}
	};
	
	//Add methods to the Behavior namespace for global registration.
	$extend(Behavior, {
		_registered: {},
		_plugins: {},
		addGlobalFilter: addFilter,
		addGlobalFilters: addFilters,
		addGlobalPlugin: addPlugin,
		addGlobalPlugins: addPlugins
	});
	//Add methods to the Behavior class for instance registration.
	Behavior.implement({
		_registered: {},
		_plugins: {},
		addFilter: addFilter,
		addFilters: addFilters,
		addPlugin: addPlugin,
		addPlugins: addPlugins
	});

	//This class is an actual filter that, given an element, alters it with specific behaviors.
	Behavior.Filter = new Class({

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
		}

	});


})();


//a selector to find all elements that have behaviors applied to them.
Selectors.Pseudo.hasBehaviors = function(){
	return !!Element.retrieve(this, '_appliedBehaviors');
};


Element.implement({

	addDataFilter: function(name){
		return this.set('data', 'filters', this.getDataFilters().include(name).join(','));
	},

	removeDataFilter: function(name){
		return this.set('data', 'filters', this.getDataFilters().erase(name).join(','));
	},

	getDataFilters: function(){
		var filters = this.getData('filters');
		if (!filters) return [];
		return filters.split(',').map(String.trim);
	},

	hasDataFilter: function(name){
		return this.getDataFilters().contains(name);
	}

});

//allows for selectors like $$('[data-foo-bar]'); TODO: Note that it'll be in Moo 1.3; remove then.
if (window.Selectors && Selectors.RegExps) {
	Selectors.RegExps.combined = (/\.([\w-]+)|\[([\w-]+)(?:([!*^$~|]?=)(["']?)([^\4]*?)\4)?\]|:([\w-]+)(?:\(["']?(.*?)?["']?\)|$)/g);
}
