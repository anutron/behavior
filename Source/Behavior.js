/*
---
name: Behavior
description: Auto-instantiates widgets/classes based on parsed, declarative HTML.
requires: [Core/Class.Extras, Core/Element.Event, Core/Selectors, /Element.Data, More/Table]
provides: [Behavior]
...
*/

(function(){

	var getLog = function(method){
		return function(){
			if (window.console && console[method]){
				if(console.warn.apply) console[method].apply(console, arguments);
				else console[method](Array.from(arguments).join(' '));
			}
		};
	};

	var spaceOrCommaRegex = /\s*,\s*|\s+/g;

	this.Behavior = new Class({

		Implements: [Options, Events],

		options: {
			//by default, errors thrown by filters are caught; the onError event is fired.
			//set this to *true* to NOT catch these errors to allow them to be handled by the browser.
			// breakOnErrors: false,

			//default error behavior when a filter cannot be applied
			onError: getLog('error'),
			onWarn: getLog('warn')
		},

		initialize: function(options){
			this.setOptions(options);
			this.API = new Class({ Extends: Behavior.API });
			this.passMethods({
				addEvent: this.addEvent.bind(this), 
				removeEvent: this.removeEvent.bind(this),
				addEvents: this.addEvents.bind(this), 
				removeEvents: this.removeEvents.bind(this),
				fireEvent: this.fireEvent.bind(this),
				applyFilters: this.apply.bind(this),
				applyFilter: this.applyFilter.bind(this),
				getContentElement: this.getContentElement.bind(this),
				getContainerSize: function(){ return this.getContentElement().getSize(); }.bind(this),
				error: function(){ this.fireEvent('error', arguments); }.bind(this),
				fail: function(){
					var msg = Array.join(arguments, ' ');
					throw msg;
				},
				warn: function(){
					this.fireEvent('warn', arguments);
				}.bind(this)
			});
		},
		
		//pass a method pointer through to a filter
		//by default the methods for add/remove events are passed to the filter
		//pointed to this instance of behavior. you could use this to pass along
		//other methods to your filters. For example, a method to close a popup
		//for filters presented inside popups.
		getContentElement: function(){
			return this.options.container || document.body;
		},

		passMethod: function(method, fn){
			this.API.implement(method, fn);
			return this;
		},

		passMethods: function(methods){
			this.API.implement(methods);
			return this;
		},


		//Applies all the behavior filters for an element.
		//container - (element) an element to apply the filters registered with this Behavior instance to.
		//force - (boolean; optional) passed through to applyFilter (see it for docs)
		apply: function(container, force){
			document.id(container).getElements('[data-filters]').each(function(element){
				var plugins = [];
				element.getDataFilters().each(function(name){
					var filter = this.getFilter(name);
					if (!filter){
						this.fireEvent('error', ['There is no filter registered with this name: ', name, element]);
					} else {
						if (filter.config.delay !== undefined){
							this._delayFilter(filter.config.delay, element, filter, force);
						} else if(filter.config.delayUntil){
							this._delayFilterUntil(filter.config.delayUntil, element, filter, force);
						} else if(filter.config.initializer){
							this._customInit(filter.config.initializer, element, filter, force);
						} else {
							plugins.extend(this.applyFilter(element, filter, force, true));
						}
					}
				}, this);
				plugins.each(function(plugin){ plugin(); });
			}, this);
			return this;
		},

		_delayFilter: function(delay, element, filter, force){
			this.applyFilter.delay(delay, this, [element, filter, force]);
		},

		_delayFilterUntil: function(event, element, filter, force){
			var init = function(e){
				element.removeEvent(event, init);
				var setup = filter.setup;
				filter.setup = function(element, api, _pluginResult){
					api.event = e;
					setup.apply(filter, [element, api, _pluginResult]);
				};
				this.applyFilter(element, filter, force);
				filter.setup = setup;
			}.bind(this);
			element.addEvent(event, init);
		},

		_customInit: function(init, element, filter, force){
			var api = new this.API(element, filter.name);
			api.runSetup = this.applyFilter.pass([element, filter, force], this);
			init(element, api);
		},

		//Applies a specific behavior to a specific element.
		//element - the element to which to apply the behavior
		//filter - (object) a specific behavior filter, typically one registered with this instance or registered globally.
		//force - (boolean; optional) apply the behavior to each element it matches, even if it was previously applied. Defaults to *false*.
		//_returnPlugins - (boolean; optional; internal) if true, plugins are not rendered but instead returned as an array of functions
		//_pluginTargetResult - (obj; optional internal) if this filter is a plugin for another, this is whatever that target filter returned
		//                      (an instance of a class for example)
		applyFilter: function(element, filter, force, _returnPlugins, _pluginTargetResult){
			var pluginsToReturn = [];
			if (this.options.breakOnErrors){
				pluginsToReturn = this._runFilter.apply(this, arguments);
			} else {
				try {
					pluginsToReturn = this._runFilter.apply(this, arguments);
				} catch (e){
					this.fireEvent('error', ['Could not apply the behavior ' + filter.name, e]);
				}
			}
			return _returnPlugins ? pluginsToReturn : this;
		},

		_runFilter: function(element, filter, force, _returnPlugins, _pluginTargetResult){
			var pluginsToReturn = [];
			element = document.id(element);
			//get the filters already applied to this element
			var applied = getApplied(element);
			//if this filter is not yet applied to the element, or we are forcing the filter
			if (!applied[filter.name] || force){
				//if it was previously applied, garbage collect it
				if (applied[filter.name]) applied[filter.name].cleanup(element);
				var api = new this.API(element, filter.name);

				//deprecated
				api.markForCleanup = filter.markForCleanup.bind(filter);
				api.onCleanup = function(fn){
					filter.markForCleanup(element, fn);
				};

				//deal with requirements and defaults
				if (filter.config.requireAs){
					api.requireAs(filter.config.requireAs);
				} else if (filter.config.require){
					api.require.apply(api, Array.from(filter.config.require));
				} if (filter.config.defaults) api.setDefault(defaults);

				//apply the filter
				var result = filter.setup(element, api, _pluginTargetResult);
				if (filter.config.returns && !instanceOf(result, filter.config.returns)){
					throw "Filter " + filter.name + " did not return a valid instance.";
				}
				element.store('Behavior:' + filter.name, result);
				//and mark it as having been previously applied
				applied[filter.name] = filter;
				//apply all the plugins for this filter
				var plugins = this.getPlugins(filter.name);
				if (plugins){
					for (var name in plugins){
						if (_returnPlugins){
							pluginsToReturn.push(this.applyFilter.pass([element, plugins[name], force, null, result], this));
						} else {
							this.applyFilter(element, plugins[name], force, null, result);
						}
					}
				}
			}
			return pluginsToReturn;
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
			for (var filter in applied){
				applied[filter].cleanup(element);
				element.eliminate('Behavior:' + filter);
				delete applied[filter];
			}
			if (!ignoreChildren) element.getElements('[data-filters]').each(this.cleanup, this);
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
	
	var addFilters = function(obj, overwrite){
		for (var name in obj){
			addFilter.apply(this, [name, obj[name], overwrite]);
		}
	};
	
	//Registers a behavior plugin
	//filterName - (*string*) the filter (or plugin) this is a plugin for
	//name - (*string*) the name of this plugin
	//setup - a function that applies the filter to the given element
	var addPlugin = function(filterName, name, setup, overwrite){
		if (!this._plugins[filterName]) this._plugins[filterName] = {};
		if (!this._plugins[filterName][name] || overwrite) this._plugins[filterName][name] = new Behavior.Filter(name, setup);
	};
	
	var addPlugins = function(obj, overwrite){
		for (var name in obj){
			addPlugin.apply(this, [obj[name].fitlerName, obj[name].name, obj[name].setup], overwrite);
		}
	};
	
	//Add methods to the Behavior namespace for global registration.
	Object.append(Behavior, {
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

		config: {
			/**
				returns: Foo,
				require: ['req1', 'req2'],
				//or
				requireAs: {
					req1: Boolean,
					req2: Number,
					req3: String
				},
				defaults: {
					opt1: false,
					opt2: 2
				},
				//simple example:
				setup: funciton(element, API){
					var kids = element.getElements(API.get('selector'));
					//some validation still has to occur here
					if (!kids.length) API.fail('there were no child elements found that match ', API.get('selector'));
					if (kids.length < 2) API.warn("there weren't more than 2 kids that match", API.get('selector'));
					var fooInstance = new Foo(kids, API.get('opt1', 'opt2'));
					API.onCleanup(function(){
						fooInstance.destroy();
					});
					return fooInstance;
				},
				delayUntil: 'mouseover',
				//OR
				delay: 100,
				//OR
				initializer: function(element, API){
					element.addEvent('mouseover', API.runSetup); //same as specifying event
					//or
					API.runSetup.delay(100); //same as specifying delay
					//or something completely esoteric
					var timer = (function(){
						if (element.hasClass('foo')){
							clearInterval(timer);
							API.runSetup();
						}
					}).periodical(100);
					//or
					API.addEvent('someBehaviorEvent', API.runSetup);
				}
				*/
		},

		//Pass in an object with the following properties:
		//name - the name of this filter
		//setup - a function that applies the filter to the given element
		initialize: function(name, setup){
			this.name = name;
			if (typeOf(setup) == "function"){
				this.setup = setup;
			} else {
				Object.append(this.config, setup);
				this.setup = this.config.setup;
			}
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
			if (marks){
				marks.each(function(fn){ fn(); });
				this._marks.erase(element);
			}
			return this;
		}

	});

	//a selector to find all elements that have behaviors applied to them.
	Slick.definePseudo('hasBehaviors', function(){
		return !!Element.retrieve(this, '_appliedBehaviors');
	});


	Element.implement({

		addDataFilter: function(name){
			return this.setData('filters', this.getDataFilters().include(name).join(' '));
		},

		removeDataFilter: function(name){
			return this.setData('filters', this.getDataFilters().erase(name).join(' '));
		},

		getDataFilters: function(){
			var filters = this.getData('filters');
			if (!filters) return [];
			return filters.trim().split(spaceOrCommaRegex);
		},

		hasDataFilter: function(name){
			return this.getDataFilters().contains(name);
		},

		getFilterResult: function(name){
			return this.retrieve('Behavior:' + name);
		}

	});


})();
