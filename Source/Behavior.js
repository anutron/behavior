/*
---
name: Behavior
description: Auto-instantiates widgets/classes based on parsed, declarative HTML.
requires: [Core/Class.Extras, Core/Element, Core/Selectors, /Element.Data, More/Table]
provides: [Behavior]
...
*/

/**
	@fileOverview Class for auto-instantiating widgets and classes based on parsed, declarative Html.
	*/

(function(){

	var spaceOrCommaRegex = /\s*,\s*|\s+/g;

	this.Behavior = new Class(/** @lends Behavior.prototype */{

		Implements: [Options, Events],

		/**
		 Options object, a key/value set of default options.
		 */
		options: {
			// breakOnErrors: false,

			onError: function(){
				if (window.console && console.warn){
					if(console.warn.apply) console.warn.apply(console, arguments);
					else console.warn(Array.from(arguments).join(' '));
				}
			}
		},

	/**
		Initialization constructor for Behavior instances.
		@class Class and namespace for parsing a DOM tree and invoking functions on nodes with named filters.
		@constructs
		@param {Object} options An object containing key/value options for this instance
		@config {Boolean=false} breakOnErrors By default, errors thrown by filters are caught; the onError event is fired.
		                   set this to *true* to NOT catch these errors to allow them to be handled by the browser.
		@config {Container} Element The top-level DOM node that this instance of Behavior is likely to be acting from. Defaults to document.body.
		@config {Function} onError An event handler to perform when an error occurs. Passed an unknown set of arguments
		     that conforms to firebug/console's command line API. Defaults to passing these to console.warn, if present.
	 */
		initialize: function(options){
			this.setOptions(options);

			/**
				Passed methods
				
				<p>Each time a filter is invoked upon an Element it can be passed numerous methods
				as part of the "api" object (@see Behavior.Filter).</p>
				
				<p>By default, filters are passed the following methods:</p>
				
				<ul>
					<li>addEvent - see <a href="http://mootools.net/docs/core/Class/Class.Extras">http://mootools.net/docs/core/Class/Class.Extras</a></li>
					<li>addEvents - see <a href="http://mootools.net/docs/core/Class/Class.Extras">http://mootools.net/docs/core/Class/Class.Extras</a></li>
					<li>removeEvent - see <a href="http://mootools.net/docs/core/Class/Class.Extras">http://mootools.net/docs/core/Class/Class.Extras</a></li>
					<li>removeEvents - see <a href="http://mootools.net/docs/core/Class/Class.Extras">http://mootools.net/docs/core/Class/Class.Extras</a></li>
					<li>fireEvent - see <a href="http://mootools.net/docs/core/Class/Class.Extras">http://mootools.net/docs/core/Class/Class.Extras</a></li>
					<li>getContainerSize - this function returns the x/y dimentions from the content element container defined in the options (defaults to document.body);</li>
					<li>error - a function that fires the onError event defined in the options, passing along all arguments passed to this method.</li>
				</ul>
				
				@name passedMethods
				@member Behavior#
				
			 */
			this.passMethods({
				addEvent: this.addEvent.bind(this), 
				removeEvent: this.removeEvent.bind(this),
				addEvents: this.addEvents.bind(this), 
				removeEvents: this.removeEvents.bind(this),
				fireEvent: this.fireEvent.bind(this),
				applyFilters: this.apply.bind(this),
				applyFilter: this.applyFilter.bind(this),
				getContentElement: this.getContentElement.bind(this),
				getContainerSize: function() { return this.getContentElement().getSize(); }.bind(this),
				error: function(){ this.fireEvent('error', arguments); }.bind(this)
			});
		},

		/** 
		  * Returns the container element defined in options.container; defaults to document.body. 
		  */
		getContentElement: function(){
			return this.options.container || document.body;
		},

		_passedMethods: {},

		/**
		 Pass a method pointer through to filters.
		 
		 @see Behavior#passedMethods
		 @param {String} method The name of the method to pass.
		 @param {Function} fn The method itself; it will be bound to this instance of Behavior.
			@returns {Behavior} this instance of Behavior
		 */
		passMethod: function(method, fn){
			var self = this;
			this._passedMethods[method] = function(){
				return fn.apply(this, arguments);
			};
			return this;
		},

		/**
			Pass a group of methods to filters.
			
			@see Behavior#passedMethods
			@see Behavior#passMethod
			@param {Object} methods A key/value set of names/methods
			@returns {Behavior} this instance of Behavior
		*/

		passMethods: function(methods){
			for (var method in methods) {
				this.passMethod(method, methods[method]);
			}
			return this;
		},

		/**
			Applies all the behavior filters for an element.
			@param {Element} container An element to apply the filters registered with this Behavior instance to.
			@force {Boolean} force Optional; passed through to applyFilter. @see Behavior.applyFilter.
			@returns {Behavior} this instance of Behavior.
			*/
		apply: function(container, force){
			document.id(container).getElements('[data-filters]').each(function(element){
				var plugins = [];
				element.getDataFilters().each(function(name){
					var behavior = this.getFilter(name.trim());
					if (!behavior) {
						this.fireEvent('error', ['There is no behavior registered with this name: ', name, element]);
					} else {
						plugins.extend(this.applyFilter(element, behavior, force, true));
					}
				}, this);
				plugins.each(function(plugin){ plugin(); });
			}, this);
			return this;
		},


		/**
			Applies a specific behavior to a specific element.
			@param {Element} element The element to which to apply the behavior.
			@param {Behavior.Filter} filter A specific behavior filter, typically one registered with this instance or registered globally.
			@param {Boolean} force Optional; apply the behavior to each element it matches, even if it was previously applied. Defaults to *false*.
			@param {Boolean} _return Plugins Optional; internal; if true, plugins are not rendered but instead returned as an array of functions.
			@param {Object} _pluginTargetResult Optional; internal; if this filter is a plugin for another, this is whatever that target filter returned
			       (an instance of a class for example).
			@returns {Behavior} this instance of Behavior (unless the internal _returnPlugins is specified).
		*/
		applyFilter: function(element, filter, force, _returnPlugins, _pluginTargetResult){
			var pluginsToReturn = [];
			var run = function(){
				element = document.id(element);
				//get the filters already applied to this element
				var applied = getApplied(element);
				//if this filter is not yet applied to the element, or we are forcing the filter
				if (!applied[filter.name] || force) {
					//if it was previously applied, garbage collect it
					if (applied[filter.name]) applied[filter.name].cleanup(element);
					this._passedMethods.markForCleanup = filter.markForCleanup.bind(filter);
					//apply the filter
					var result = filter.attach(element, this._passedMethods, _pluginTargetResult);
					delete this._passedMethods.markForCleanup;
					element.store('Behavior:' + filter.name, result);
					//and mark it as having been previously applied
					applied[filter.name] = filter;
					//apply all the plugins for this filter
					var plugins = this.getPlugins(filter.name);
					if (plugins) {
						for (var name in plugins) {
							if (_returnPlugins) {
								pluginsToReturn.push(this.applyFilter.pass([element, plugins[name], force, null, result], this));
							} else {
								this.applyFilter(element, plugins[name], force, null, result);
							}
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
			return _returnPlugins ? pluginsToReturn : this;
		},

		/**
			Given a name, returns a registered behavior.
			@param {string} name The name of a registered filter.
			@returns Behavior.Filter
		*/
		getFilter: function(name){
			return this._registered[name] || Behavior._registered[name];
		},

		/**
			Given a name, returns a registered behavior 
			@param {string} name The name of a registered filter.
			@returns {object} a key/value set of name / Behavior.Filter pairs.
		*/
		getPlugins: function(name){
			return this._plugins[name] || Behavior._plugins[name];
		},

		/**
			Garbage collects all applied filters for an element and its children.
			@param {Element} element Container to cleanup.
			@param {Boolean} ignoreChildren Optiona; if *true* only the element will be cleaned, otherwise the element and all the
			      children with filters applied will be cleaned. Defaults to *false*.
			@returns {Behavior} this instance of Behavior
		*/
		cleanup: function(element, ignoreChildren){
			element = document.id(element);
			var applied = getApplied(element);
			for (var filter in applied) {
				applied[filter].cleanup(element);
				element.eliminate('Behavior:' + filter);
				delete applied[filter];
			}
			if (!ignoreChildren) element.getElements('[data-filters]').each(this.cleanup, this);
			return this;
		}

	});

	/** 
	Returns the applied behaviors for an element.
	@private 
	*/
	var getApplied = function(el){
		return el.retrieve('_appliedBehaviors', {});
	};

	/**
		Registers a <i>global</i> behavior filter.
		@param {String} name The name of the filter
		@param {Function} fn A function that applies the filter to the given element
		@param {Boolean} overwrite If true, will overwrite existing filter if one exists; defaults to false.
		@name addGlobalFilter
		@methodOf Behavior
		@example
		Behavior.addGlobalFilter('FilterName', function(element, API){ ... });
		@see Behavior.Filter
		*/

	/**
		Registers an <i>instance</i> behavior filter.
		@param {String} name The name of the filter
		@param {Function} fn A function that applies the filter to the given element
		@param {Boolean} overwrite If true, will overwrite existing filter if one exists; defaults to false.
		@name addFilter
		@methodOf Behavior#
		@example
		instanceOfBehavior.addFilter('FilterName', function(element, API){ ... });
		@see Behavior.Filter
		*/

	/** @private */
	var addFilter = function(name, fn, overwrite){
		if (!this._registered[name] || overwrite) this._registered[name] = new Behavior.Filter(name, fn);
	};

	/**
		Registers a group of <i>global</i> behavior filters.
		@param {Object} obj An object of name / function pairs.
		@param {Boolean} overwrite If true, will overwrite existing filter if one exists; defaults to false.
		@methodOf Behavior
		@example
		Behavior.addGlobalFilters({
			FilterOne: function(element, API){...},
			FilterTwo: function(element, API){...}
		});
		@see Behavior.Filter
	*/
	/**
		Registers a group of <i>instance</i> behavior filters.
		@param {Object} obj An object of name / function pairs.
		@param {Boolean} overwrite If true, will overwrite existing filter if one exists; defaults to false.
		@methodOf Behavior#
		@example
		instanceOfBehavior.addFilters({
			FilterOne: function(element, API){...},
			FilterTwo: function(element, API){...}
		});
		@see Behavior.Filter
	*/
	/** @private */
	var addFilters = function(obj, overwrite) {
		for (var name in obj) {
			addFilter.apply(this, [name, obj[name], overwrite]);
		}
	};
	
	/**
		Registers a <i>global</i> behavior plugin.
		@param {String} filterName The filter (or plugin) this is a plugin for
		@param {String} name The name of this plugin
		@param {Function} attacher A function that applies the filter to the given element
		@methodOf Behavior
		@example
		Behavior.addGlobalPlugin('Filter1', 'PluginForFilter1', function(element, API){...});
	*/
	/**
		Registers an <i>instance</i> behavior plugin.
		@param {String} filterName The filter (or plugin) this is a plugin for
		@param {String} name The name of this plugin
		@param {Function} attacher A function that applies the filter to the given element
		@methodOf Behavior#
		@example
		instanceOfBehavior.addPlugin('Filter1', 'PluginForFilter1', function(element, API){...});
	*/
	/** @private */
	var addPlugin = function(filterName, name, attacher, overwrite) {
		if (!this._plugins[filterName]) this._plugins[filterName] = {};
		if (!this._plugins[filterName][name] || overwrite) this._plugins[filterName][name] = new Behavior.Filter(name, attacher);
	};

	/** @private */
	var addPlugins = function(obj, overwrite) {
		for (var name in obj) {
			addPlugin.apply(this, [obj[name].fitlerName, obj[name].name, obj[name].attacher], overwrite);
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
	Behavior.Filter = new Class(/** @lends Behavior.Filter.prototype */{

		/**
			Initialization constructor for Behavior.Filter instances.

			@class A filter that, given an element, will instantiate a given widget/class.
			@constructs
			@param {String} name The name of this filter.
			@param {Function} attacher A function that applies the filter to the given Element.
			@example
Behavior.addGlobalFilter('Tips', function(element, API){
	return new Tips(element);
});
//HTML
&lt;a data-filters="Tips" title="I'm the tip content!">Link...&lt;/a>
		*/

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
		/** @ignore */
		markForCleanup: function(element, fn){
			var marks = this._marks.get(element);
			if (!marks) marks = [];
			marks.include(fn);
			this._marks.set(element, marks);
			return this;
		},

		//Garbage collect a specific element.
		//NOTE: this should be an element that has a data-filter property that matches this filter.
		/** @ignore */
		cleanup: function(element){
			var marks = this._marks.get(element);
			if (marks) {
				marks.each(function(fn){ fn(); });
				this._marks.erase(element);
			}
			return this;
		}

	});

	/**
		@class
		@name Element
	*/
	Element.implement(/** @lends Element.prototype */ {

		/**
			Adds a data filter by a given name to an element (adding it to the space-delemited list on the data-filters propert of the Element).
			@param {String} name The name of the filter to add.
			@returns {Element} This element.
		*/
		addDataFilter: function(name){
			return this.setData('filters', this.getDataFilters().include(name).join(' '));
		},

		/**
			Removes a data filter by a given name from an element.
			@param {String} name The name of the filter to remove.
			@see Element#addDataFilter
			@returns {Element} This element.
		*/
		removeDataFilter: function(name){
			return this.setData('filters', this.getDataFilters().erase(name).join(' '));
		},

		/**
			Gets the names of data filters present on an element.
			@see Element#addDataFilter
			@returns {Array} an array of data names (Strings).
		*/
		getDataFilters: function(){
			var filters = this.getData('filters');
			if (!filters) return [];
			return filters.trim().split(spaceOrCommaRegex);
		},

		/**
			Returns *true* if the element has a given data filter.
			@param {String} name The name of the filter to check.
			@returns {Boolean} *True* if the filter is present.
			*/
		hasDataFilter: function(name){
			return this.getDataFilters().contains(name);
		},

		/**
			Returns the result of an applied filter.
			@param {String} name The name of the filter whose result you wish to retrieve.
			@returns {object} Returns the result of a Behavior.Filter invokation, typically an instance of a class.
			*/
		getFilterResult: function(name){
			return this.retrieve('Behavior:' + name);
		}

	});


})();
