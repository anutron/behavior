Class: Behavior {#Behavior}
====================================

Auto-instantiates widgets/classes based on parsed, declarative HTML.

### Implements

* [Options][], [Events][]

### Syntax

	new Behavior([options]);

### Arguments

1. options - (*object*; optional) a key/value set of options

### Options

* breakOnErrors - (*boolean*) By default, errors thrown by filters are caught; the onError event is fired. Set this to `true` to NOT catch these errors to allow them to be handled by the browser.
* verbose - (*boolean*) If *true*, Behavior logs its activity to the console. This can create a lot of output. Defaults to *false*.
* container - (*element*; optional) The DOM element (or its ID) that contains all the applied behavior filters. Defaults to `document.body`;
* selector - (*string* or *function*; optional) The CSS selector used to find all elements with behaviors defined; defaults to `[data-behavior]`. This can also be a `function` which, when executed, returns the elements as an Elements collection; it is passed the container option if present. **Important** If you use a different `data-` property than `behavior` you need to also change `Behavior.elementDataProperty` to match. This property defaults to `behavior`, meaning that elements have a property defined for `data-behavior`. If you wanted to use `data-be` for example, you would need to set the selector option here to `[data-be]` AND include `Behavior.elementDataProperty = "be";` in your code.

### Events

* error - function invoked when an error is caught in a filter. Defaults to console errors if console.error is available.
* warn - function invoked when a filter calls the warn method no the method api. Defaults to console warnings if console.warn is available.

### Usage

Behavior is applied to an element whenever you want to parse that element's DOM for filters declared in the HTML of that element. Behavior then finds all elements with a "data-behavior" property defined, invoking the filters named there. It will only invoke a filter once, so it's safe to run it more than once (if the DOM changes, for example).

### Example Usage

	var myBehavior = new Behavior();
	myBehavior.apply(myContainerElement);

### Example HTML

	<div data-behavior="Accordion">
		<div class="toggle">Toggle 1</div>
		<div class="target">This area is controlled by Toggle 1.</div>
		<div class="toggle">Toggle 2</div>
		<div class="target">This area is controlled by Toggle 2.</div>
	</div>

The above example will invoke the registered "Accordion" filter. See the section on [Behavior.Filter][] below.

### HTML properties

Behavior uses a clearly defined API to read HTML properties off the elements it configures. See [BehaviorAPI][] for details as well as [passMethod](#Behavior:passMethod) for methods that Behavior instances themselves provide.

### Using Multiple Filters Together

It's possible to declare more than one data filter property for a single element (`data-behavior="FormRequest FormValidator"`)

### Using Your Behavior Instance as an Event Arbiter

When a filter performs an action that other filters might find useful to know about, the preferred usage is to fire an event on your Behavior instance via the `behaviorAPI` object passed to your filter. This provides a non-brittle way for filters to react to each other. For example, a Delegator that fetches new content via AJAX should fire the 'ammendDom' event. This event is also fired on the Behavior instances it's bound to (if it is). These two events are prescribed here, but you can use any you find useful. This allows filters to avoid referencing themselves.

* destroyDom - function invoked when a trigger destroys a portion of the DOM. Automatically integrated w/ Behavior's `cleanup` method if you set one in the options. Passed the element destroyed as an argument.
* ammendDom - function invoked when a trigger ammends a portion of the DOM. Automatically integrated w/ Behavior's `apply` method if you set one in the options. Passed two arguments: the parent node that contains all the updated elements and an array of those elements updated.

Other events the author has used is to denote layout changes, `layout:changed`, `layout:display`, `layout:size`, etc.

Behavior Method: passMethod {#Behavior:passMethod}
--------------------------------------------------

Defines a method that will be passed to filters. Behavior allows you to create a well defined API for filters to reference which increases their reusability. You define this API by explicitly passing named functions to them through the Behavior instance.

### Syntax

	myBehaviorInstance.passMethod(name, function);

### Returns

* (*object*) this instance of Behavior

### Notes

By default, Behavior passes the following methods to filters in addition to the methods defined in the [BehaviorAPI][]

* **addEvent** - the `addEvent` method of the behavior instance provided by the [Events][] class.
* **removeEvent** - the `removeEvent` method of the behavior instance provided by the [Events][] class.
* **addEvents** - the `addEvents` method of the behavior instance provided by the [Events][] class.
* **removeEvents** - the `removeEvents` method of the behavior instance provided by the [Events][] class.
* **fireEvents** - the `fireEvents` method of the behavior instance provided by the [Events][] class.
* **applyFilters** - the `apply` method of the behavior instance. This allows a Behavior to create new DOM structures and apply their behavior filters.
* **applyFilter** - the `applyFilter` method of the behavior instance. Allows you to invoke a specific behavior filter.
* **getElement** - a method to retrieve an element given a selector relative to the element with the filter. I.e. if your filter has a "target" option you can call `api.get('target')` and it'll get the element from the DOM using `.getElement` and the value for the `target` setting. Calls `api.fail` if not found and stops execution of your filter. Call `api.get('target', true)` to have it just warn on that error and return `null`.
* **getELements** - Same as `.getElement` but returns and array of matches for the selector.
* **getContentElement** - returns the "container" element of the Behavior instance. By default this points to `document.body`. Set `options.container` to change it.
* **getContainerSize** - returns the value of `getContentElement().getSize();` Note that if that element is not in the DOM this will return zeros.
* **getDelegator** - returns the instance of [Delegator][] set with the `setDelegator` method.
* **error** - fires the behavior instance's `error` event with the arguments passed.
* **fail** - stops the filter from iterating and passes a message through to the error logger. Takes a string for the message as its only argument.
* **cleanup** - tells Behavior that you are about to retire a DOM tree and allows it to run any garbage collection methods attached to it. Be ware of circular logic here! See also: [Behavior.cleanup](#Behavior:cleanup)
* **onCleanup** - accepts as its only argument a function that is run when the element is removed from the DOM and passed to [Behavior.cleanup](#Behavior:cleanup)
* See the [BehaviorAPI][] for additional methods passed by default.

You can add any other methods that your filters require. In general, your filters shouldn't reference anything in your environment except these methods and those methods defined in [Behavior.Filter][].

Behavior Method: passMethods {#Behavior:passMethods}
--------------------------------------------------

Iterates over an object of key/values passing them to the [passMethod](#Behavior:passMethod) method.

### Syntax

	myBehaviorInstance.passMethods(obj);

### Arguments

1. obj - (*object*) a set of name/function pairs to pass to the passMethod method.

### Returns

* (*object*) this instance of Behavior

Behavior Method: apply {#Behavior:apply}
--------------------------------------------------

Applies all the behavior filters for an element and its children.

### Syntax

	myBehaviorInstance.apply(container[, force]);

### Arguments

1. container - (*element*) The DOM container to process behavior filters.
2. force - (*boolean*; optional) if `true` elements that have already been processed will be processed again.

### Returns

* (*object*) this instance of Behavior

Behavior Method: applyFilter {#Behavior:applyFilter}
--------------------------------------------------

Applies a specific behavior filter to a specific element (but not its children).

### Syntax

	myBehaviorInstance.applyFilter(element, filter, [, force]);

### Arguments

1. container - (*element*) The DOM container to process behavior filters.
2. filter - (*object*) An instance of [Behavior.Filter][].
3. force - (*boolean*; optional) if `true` elements that have already been processed will be processed again.

### Returns

* (*object*) this instance of Behavior

Behavior Method: getFilter {#Behavior:getFilter}
--------------------------------------------------

Given a name, return the registered filter.

### Syntax

	myBehaviorInstance.getFilter(name);

### Arguments

1. name - (*string*) The registered name of a filter.

### Returns

* (*object*) the instance of [Behavior.Filter][] or `undefined` if one is not found.

Behavior Method: getPlugins {#Behavior:getPlugins}
--------------------------------------------------

Given a name, return the plugins registered for a filter by that name. See the section on [Behavior.Filter][] for details.

### Syntax

	myBehaviorInstance.getPlugins(name);

### Arguments

1. name - (*string*) The registered name of a filter plugin.

### Returns

* (*object*) the instance of [Behavior.Filter][] or `undefined` if one is not found.

Behavior Method: cleanup {#Behavior:cleanup}
--------------------------------------------------

Garbage collects the specified element, cleaning up all the filters applied to it. *This should be invoked when you delete an element from the DOM*. When you cleanup an element its children are also garbage collected.

### Syntax

	myBehaviorInstance.cleanup(element);

### Arguments

1. element - An element to remove all attached filters.

### Returns

* (*object*) this instance of Behavior.

Filters
=======

Behavior applies all the registered filters to the element you specify (and its children). This requires that each element that should have a behavior applied name the filters it needs in its `data-behavior` property. It also means that every named filter must be registered.

Filters can be registered to an *instance* of Behavior or to the global Behavior namespace. So if you register a "Foo" filter globally, all instance of Behavior get that filter. If a specific instance of Behavior defines a "Foo" filter, then the local instance is used regardless of the presence of a global filter.

There are methods to add and remove filters to instances as well as to the global namespace.

Behavior Method: addFilter {#Behavior:addFilter}
--------------------------------------------------

Add a new filter.

### Syntax

	myBehaviorInstance.addFilter(name, filter[, overwrite]);

### Arguments

1. name - (*string*) the name of the filter to add.
2. filter - (*function* or *object*) See [Behavior.Filters][] below.
3. overwrite - (*boolean*; optional) if `true` and there is already an existing filter by the given name, that filter will be replaced, otherwise the original is retained.

### Returns

* nothing

Behavior Method: addFilters {#Behavior:addFilters}
--------------------------------------------------

Adds a group of filters.

### Syntax

	myBehaviorInstance.addFilters(obj[, overwrite]);

### Arguments

1. obj - (*object*) a key/value set of name/functions to be added.
2. overwrite - (*boolean*; optional) if `true` and there is already an existing filter by the given name, that filter will be replaced, otherwise the original is retained.

### Returns

* nothing

Behavior Method: addPlugin {#Behavior:addPlugin}
--------------------------------------------------

Add a new plugin for a specified filter.

### Syntax

	myBehaviorInstance.addPlugin(filterName, pluginName, fn[, overwrite]);

### Arguments

1. filterName - (*string*) the name of the filter for the plugin.
2. pluginName - (*string*) the name of the plugin.
3. fn - (*function*) the function invoked after the filter is run against an element. See [plugins](#Behavior.Filter:plugins) below.
4. overwrite - (*boolean*; optional) if `true` and there is already an existing plugin by the given name, that plugin will be replaced, otherwise the original is retained.

### Returns

* nothing

Behavior Method: addPlugins {#Behavior:addPlugins}
--------------------------------------------------

Adds a group of plugins.

### Syntax

	myBehaviorInstance.addPlugins(obj[, overwrite]);

### Arguments

1. obj - (*object*) a key/value set of name/functions to be added as plugins.
2. overwrite - (*boolean*; optional) if `true` and there is already an existing plugin by the given name, that filter will be replaced, otherwise the original is retained.

### Returns

* nothing

Behavior Method: setFilterDefaults {#Behavior:setFilterDefaults}
--------------------------------------------------

Sets the default values for a filter, overriding any defaults previously defined.

### Syntax

	myBehaviorInstance.setFilterDefaults(name, defaults);

### Arguments

1. name - (*string*) The registered name of a filter.
2. defaults - (*object*) A key/value pair of defaults.

Behavior Method: setDelegator {#Behavior:setDelegator}
--------------------------------------------------

Stores a reference to a [Delegator][] instance that is returned by `api.getDelegator()`.

### Syntax

	myBehavior.setDelegator(myDelegator);

### Arguments

1. myDelegator - (*object*) an instance of [Delegator][]

### Returns

* (*object*) this instance of Behavior.

Behavior Method: getDelegator {#Behavior:getDelegator}
--------------------------------------------------

Returns a reference to the [Delegator][] instance that was set with `setDelegator`.

### Syntax

	myBehavior.getDelegator();

### Returns

* (*object* or *null*) whatever was set with `setDelegator`.

Static Methods {#StaticMethods}
==============

Behavior Method: debug {#Behavior:debug}
--------------------------------------------------

Will invoke `debugger` before executing any filter that matches that name, allowing you to walk through that filter's invocation.

### Syntax

	Behavior.debug(pluginName);

### Arguments

1. pluginName - (*string*) The name of the plugin.


Behavior Method: addGlobalFilter {#Behavior:addGlobalFilter}
--------------------------------------------------

Add a new filter to the global Behavior namespace.

### Syntax

	myBehaviorInstance.addGlobalFilter(name, fn[, overwrite]);

Behavior Method: addGlobalFilters {#Behavior:addGlobalFilters}
--------------------------------------------------

Adds a group of filters to the global Behavior namespace.

### Syntax

	myBehaviorInstance.addGlobalFilters(obj[, overwrite]);

Behavior Method: addGlobalPlugin {#Behavior:addGlobalPlugin}
--------------------------------------------------

Add a new global plugin for a specified filter.

### Syntax

	myBehaviorInstance.addGlobalPlugin(filterName, pluginName, fn[, overwrite]);


Behavior Method: addGlobalPlugins {#Behavior:addGlobalPlugins}
--------------------------------------------------

Adds a group of plugins to the global Behavior namespace.

### Syntax

	myBehaviorInstance.addGlobalPlugins(obj[, overwrite]);

Behavior Method: getFilter {#Behavior:getFilter}
--------------------------------------------------

Given a name, return the registered *global* filter.

### Syntax

	Behavior.getFilter(name);

### Arguments

1. name - (*string*) The registered name of a filter.

### Returns

* (*object*) the instance of [Behavior.Filter][] or `undefined` if one is not found.

Behavior Method: setFilterDefaults {#Behavior:setFilterDefaults}
--------------------------------------------------

Sets the default values for a filter, overriding any defaults previously defined.

### Syntax

	Behavior.setFilterDefaults(name, defaults);

### Arguments

1. name - (*string*) The registered name of a filter.
2. defaults - (*object*) A key/value pair of defaults.

Class: Behavior.Filter {#Behavior.Filter}
====================================

Behavior Filters are where you define what to do with elements that are marked with that filter. Elements can have numerous filters defined and filters can do anything with those elements that they like. In general, filters should only alter the element given, though it is possible to have elements that relate to others (for example, an *Accoridon* filter might set up an instance of `Fx.Accordion` using children that are the togglers and sections).

Typically filters allow for configuration using HTML5 data- properties, classes, and element attributes. See the [BehaviorAPI][] which automates the reading of these properties.

An important rule of filters is that they cannot know about each other or be in any way dependent on each other. When two filters need to be managed differently when both are present, use a [plugin](#Behavior.Filter:plugins) (this should be rare).

Filters are typically not created with the constructor (i.e. `new Behavior.Filter`) but instead with the [addFilter](#Behavior.addFilter)/[addFilters](#Behavior.addFilters) methods defined on the Behavior instance or the [addGlobalFilter](#Behavior.addGlobalFilter)/[addGlobalFilters](#Behavior.addGlobalFilters) methods on the Behavior namespace.

Filters nearly always return instances of classes (this is essentially their purpose). It's not a requirement, but it is generally preferred.

### Example

	Behavior.addGlobalFilters({
		Accordion: function(element, api) {
			var togglers = element.getElements(api.get('togglers'));
			var sections = element.getElements(api.get('sections'));
			if (togglers.length == 0 || sections.length == 0) api.fail('There are no togglers or sections for this accordion.');
			if (togglers.length != sections.length) api.warn('There is a mismatch in the number of togglers and sections for this accordion.')
			var accordion = new Fx.Accordion(togglers, sections);
			api.onCleanup(function() {
				accordion.detach();
			});
			return accorion; //note that the instance is always returned!
		}
	});

	/* the matching HTML
	<div data-behavior="Accordion" data-Accordion-togglers=".toggle" data-Accordion-sections=".section">
		<div class="toggle">Toggle 1</div>
	<div class="target">This area is controlled by Toggle 1.</div>
	</div> */

In the example above our filter finds the sections and togglers and validates that there is at least one of each. If there aren't it calls `api.fail` - this stops the filter's execution and Behavior.js catches it and calls its `onError` event (which defaults to `console.error`). It also checks if the number of togglers and the number of sections are equal and calls `api.warn` if they are off. This does *not* top execution; it only fires the `onWarn` event on Behavior (which defaults to `console.warn`).

### Advanced Filters

A simple filter is just a function and a name ("Accordion") and the function that creates accordions given an element and the api object. This is fine, but it's possible to express more complex configurations. Example:

	Behavior.addGlobalFilters({
		Accordion: {
			//if your filter does not return an instance of this value Behavior will throw an error
			//which is caught and logged by default
			returns: Accordion,
			require: ['togglers', 'togglers'],
			//or
			requireAs: {
				togglers: String,
				someNumericalValue: Number,
				someArrayValue: Array
			},
			//you wouldn't define defaults for required values, but this is just an example
			defaults: {
				togglers: '.toggler',
				sections: '.sections',
				initialDisplayFx: false
			},
			//simple example:
			setup: function(element, API){
				var togglers = element.getElements(api.get('togglers'));
				var sections = element.getElements(api.get('sections'));
				if (togglers.length == 0 || sections.length == 0) api.fail('There are no togglers or sections for this accordion.');
				if (togglers.length != sections.length) api.warn('There is a mismatch in the number of togglers and sections for this accordion.')
				var accordion = new Fx.Accordion(togglers, sections,
					api.getAs({
						fixedHeight: Number,
						fixedWidth: Number,
						display: Number,
						show: Number,
						height: Boolean,
						width: Boolean,
						opacity: Boolean,
						alwaysHide: Boolean,
						trigger: String,
						initialDisplayFx: Boolean,
						returnHeightToAuto: Boolean
					})
				);
				api.onCleanup(function() {
					accordion.detach();
				});
				return accorion; //note that the instance is always returned!
			},
			//don't instantiate this value until the user mouses over the target element
			delayUntil: 'mouseover,focus',
			//OR delay for a specific period
			delay: 100,
			//OR let me initialize the function manually
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
			});
		}
	});

In the long-form example above, we see that filters can be passed as objects that map to the config option in the Behavior.Filter constructor arguments. (see [Behavior.Filter's constructor](#Behavior.Filter:constructor)) below.

### Accessing passed methods

Behavior has a way to [define API methods passed to filters for their use](#Behavior:passMethod). To use these methods, access them in the second argument passed to your filter function:

	Behavior.addGlobalPlugins({
		MeasureOnResize: function(element, api) {
			api.addEvent('resize', updater);
			api.onCleanup(function(){
				api.removeEvent('resize', updater);
			});
		}
	});
	var myBehaviorInstance = new Behavior();
	myBehaviorInstance.apply(document.body); //applies all filters named in your content
	//let's assume there's an element with the data-behavior property set to MeasureOnResize
	myBehaviorInstance.fireEvent('resize');

As you can see in the example above, we add an event whenever the Behavior instance fires a "resize" method. We also clean up that event with the [markForCleanup](#Behavior.Filter:markForCleanup) method which is passed through the api object as "onCleanup".

Behavior.Filter constructor {#Behavior.Filter:constructor}
--------------------------------------------------

While is common (and recommended) for filters to be declared using Behavior's [addFilter](#Behavior.addFilter) method it's possible to create a filter on its own.

### Syntax

	new Behavior.Filter(name, filter);

### Arguments

1. name - (*string*) The name of this filter. This is not used directly by the filter, though Behavior instances use it. Stored as `this.name` on the instance of the filter.
2. filter - (*function* or *object*) Can be a single function or an object with the config options listed below. The function (which must be present either as the argument or as the `.setup` property on the object) expect to be invoked with an element and an instance of [BehaviorAPI][] passed to it. Filters in general expect this API object to be provided by a Behavior instance which also adds additional methods (see [Behavior.passMethod](#Behavior:passMethod)) for more details.

### Configuration

If the second argument passed to the constructor is an object, the following options are specified:

* setup - (*function*; required) The function to invoke when the filter is applied.
* delay - (*integer*; optional) If specified, the filter is to be delayed *by the caller* (typically Behavior instances) by this duration.
* delayUntil (*string*; optional) If specified, the filter is to be deferred until the event is fired upon the element the filter is applied to. This configuration is applied *by the caller*. Note that you can specify more than one event by separating with a comma (`mouseover,focus`). Whichever happens first will invoke the filter.
* initializer - (*function*; optional) If specified, the caller (e.g. a Behavior instance) does *not* call the setup function but instead calls this function, passing in the element and the api object. The api object has an additional method, `api.runSetup`, which this initializer can invoke when it pleases (or not at all).
* require - (*array*) an array of strings (names) of required attributes on the element. If the element does not have these attributes, the filter fails. Note that the actual attribute name is data-behaviorname-name (example: data-Accordion-togglers); the data-behaviorname- portion is not specified in this list of required names, just the suffix (in this example, just "togglers").
* requireAs - (*object*) a list of required attribute names mapped to their types. The types here being MooTools Type objects (String, Number, Function, etc); actual pointers to the actual Type instance (i.e. not a string).
* defaults - (*object*) a set of name / default value pairs. Note that setting defaults for required properties makes no sense.

### Note

You can namespace your filters to avoid conflicts. Simply give your filter a name with dots in it (`data-behavior="Foo.Bar"`) and then reference any arguments with dashes (`data-foo-bar-options="..."`).

Behavior.Filter Method: markForCleanup {#Behavior.Filter:markForCleanup}
--------------------------------------------------

Adds a function to invoke when the element referenced is cleaned up by the Behavior instance. Note that Behavior passes this method through as "onCleanup" in it's API object.

### Syntax

	myBehaviorFilter.markForCleanup(element, fn);

	//more commonly inside a filter:
	api.onCleanup(fn); //element is not specified on the api object

### Arguments

1. element - The element passed in to your filter function; the element with the data-behavior applied to it.
2. fn - (*function*) the function invoked when that element is garbage collected.


Behavior.Filter Method: cleanup {#Behavior.Filter:cleanup}
--------------------------------------------------

Garbage collects the specific filter instance for a given element. This is typically handled by the Behavior instance when you call its [cleanup](#Behavior:cleanup) method.

### Syntax

	myBehaviorFilter.cleanup(element);

	//more commonly
	myBehaviorInstance.cleanup(container);
	//here the container can be any element that is being removed from the DOM
	//all its children that have had filters applied will have their cleanup method run

### Arguments

1. element - The element passed in to your filter function; the element with the data-behavior applied to it.


Filter Plugins {#FilterPlugins}
====================================

Filter Plugins are identical to regular filters with the exception that they are invoked only when the filter they are altering is invoked and always after that. Filters do not have any guarantee that they will be invoked in any given order, but plugins are always guaranteed to be invoked after the filter they reference. More specifically, they are always invoked after all the filters on an element are invoked. If an element has two filters (A and B) and each of these filters have plugins (A1 and B1) the invocation order will be A, B, A1, B1.

### Example

	Behavior.addFilter('Mask', function(element, api){
		var maskInstance = new Mask(element);
		//this is silly
		var events = {
			mouseover: maskInstance.show.bind(maskInstance),
			mouseout: maskInstance.hide.bind(maskInstance)
		};
		element.addEvents(events);
		api.onCleanup(function(){
			element.removeEvents(events);
		});
		return maskInstance; //note that we return the instance!
	});

	Behavior.defineGlobalPlugin('Mask', 'AlertOnMask', function(element, api, maskInstance){
		//also silly
		var aleter = function(){ alert('the mask is visible!'); };
		maskInstance.addEvent('show', alerter);
		api.onCleanup(function(){
			maskInstance.removeEvent('show', alerter);
		});
	});

The above example is guaranteed to always run after the "Mask" filter. You can define a plugin for a plugin just as well; simply name the plugin as the first argument (you could create a plugin for the above example by making a plugin for "AlertOnMask"). Plugin setup functions are passed not only the target element and the api object but also the instance returned by the filter they augment.

Element Methods
===============

Behavior implements the following helper methods on the Element prototype.

Element Method: addBehaviorFilter {#Element:addBehaviorFilter}
------------------------------------------------------

Adds a data filter to the element.

### Syntax

	myElement.addBehaviorFilter(name);

### Arguments

1. name - (*string*) The name of the data filter to add.

### Returns

* (*element*) This element.

Element Method: removeBehaviorFilter {#Element:removeBehaviorFilter}
------------------------------------------------------

Removes a data filter to the element.

### Syntax

	myElement.removeBehaviorFilter(name);

### Arguments

1. name - (*string*) The name of the data filter to remove.

### Returns

* (*element*) This element.


Element Method: getBehaviors {#Element:getBehaviors}
------------------------------------------------------

Gets an array of data filters specified on an element.

### Syntax

	myElement.getBehaviors();

### Returns

* (*array*) A list of data filter names.

Element Method: hasBehavior {#Element:hasBehavior}
------------------------------------------------------

Returns `true` if the element has the specified data filter.

### Syntax

	myElement.hasBehavior(name);

### Arguments

1. name - (*string*) The name of the data filter to check for.

### Returns

* (*boolean*) Returns `true` if the element has the specified data filter.

Element Method: getBehaviorResult {#Element:getBehaviorResult}
------------------------------------------------------

Filters generally return the instance of the widget they instantiate. This method allows you to access that widget.

### Syntax

	myElement.getBehaviorResult(name);

### Arguments

1. name - (*string*) The name of the data filter to get the result of.

### Returns

* (*mixed*) Returns whatever the named filter returns.


[Options]: http://mootools.net/docs/core/Class/Class.Extras#Options
[Events]: http://mootools.net/docs/core/Class/Class.Extras#Events
[Behavior.Filter]: #Behavior.Filter
[BehaviorAPI]: BehaviorAPI