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

* breakOnErrors - (*boolean*) By default, errors thrown by filters are caught; the onError event is fired. Set this to *true* to NOT catch these errors to allow them to be handled by the browser.

### Events

* error - function invoked when an error is caught in a filter. Defaults to console warnings if console.warn is available.
* resize - call this event, passing in x/y values for the new element size, when the container changes size. See the [resize](#Behavior:resize) method.
* show - call this event when the container is displayed. See the [resize](#Behavior:show) method.
* hide - call this event when the container is hidden. See the [resize](#Behavior:hide) method.

### Usage

Behavior is applied to an element whenever you want to parse that element's DOM for filters declared in the HTML of that element. Behavior then finds all elements with a "data-filters" property defined, invoking the filters named there. It will only invoke a filter once, so it's safe to run it more than once (if the DOM changes, for example).

### Example Usage

	 var myBehavior = new Behavior();
	 myBehavior.apply(myContainerElement);

### Example HTML

	<div data-filters="Accordion">
		<div class="toggle">Toggle 1</div>
		<div class="target">This area is controlled by Toggle 1.</div>
		<div class="toggle">Toggle 2</div>
		<div class="target">This area is controlled by Toggle 2.</div>
	</div>

The above example will invoke the registered "Accordion" filter. See the section on [Behavior.Filter][] below.

Behavior Method: passMethod {#Behavior:passMethod}
--------------------------------------------------

Defines a method that will be passed to filters. Behavior allows you to create a well defined API for filters to reference which increases their reusability. You define this API by explicitly passing named functions to them through the Behavior instance.

### Syntax

	myBehaviorInstance.passMethod(name, function);

### Returns

* (*object*) this instance of Behavior

### Notes

By default, Behavior passes the following methods to filters:

* addEvent - the addEvent on the behavior instance method provided by the [Events][] class.
* removeEvent - the removeEvent on the behavior instance method provided by the [Events][] class.
* addEvents - the addEvents on the behavior instance method provided by the [Events][] class.
* removeEvents - the removeEvents on the behavior instance method provided by the [Events][] class.
* getContainerSize - returns the current value of *this.containerSize* - does not actually measure the container (which may be hidden or not in the DOM at the time). See the [resize](#Behavior:resize) method for more details.
* error - fires the behavior instance's *error* event with the arguments passed.

You can add any other methods that our filters require. In general, your filters shouldn't reference anything in your environment except these methods and those methods defined in [Behavior.Filter][].

Behavior Method: passMethods {#Behavior:passMethods}
--------------------------------------------------

Iterates over an object of key/values passing them to the [passMethod](#Behavior:passMethod) method.

### Syntax

	myBehaviorInstance.passMethods(method);

### Returns

* (*object*) this instance of Behavior

Behavior Method: show {#Behavior:show}
--------------------------------------------------

Fires the *show* event which filters can monitor. Does not actually alter the visibility of anything. This is used for filters that need to know when their elements are visible. 

### Syntax

	myBehaviorInstance.show();

### Returns

* (*object*) this instance of Behavior

Behavior Method: hide {#Behavior:hide}
--------------------------------------------------

Fires the *hide* event which filters can monitor. Does not actually alter the visibility of anything. This is used for filters that need to know when their elements are hidden.

### Syntax

	myBehaviorInstance.hide();

### Returns

* (*object*) this instance of Behavior

Behavior Method: apply {#Behavior:apply}
--------------------------------------------------

Applies all the behavior filters for an element and its children.

### Syntax

	myBehaviorInstance.apply(container[, force]);

### Arguments

1. container - (*element*) The DOM container to process behavior filters.
2. force - (*boolean*; optional) if *true* elements that have already been processed will be processed again.

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
3. force - (*boolean*; optional) if *true* elements that have already been processed will be processed again.

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

* (*object*) the instance of [Behavior.Filter][] or *undefined* if one is not found.

Behavior Method: getPlugins {#Behavior:getPlugins}
--------------------------------------------------

Given a name, return the plugins registered for a filter by that name. See the section on [Behavior.Filter][] for details.

### Syntax

	myBehaviorInstance.getPlugins(name);

### Arguments

1. name - (*string*) The registered name of a filter plugin.

### Returns

* (*object*) the instance of [Behavior.Filter][] or *undefined* if one is not found.

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

Behavior applies all the registered filters to the element you specify (and its children). This requires that each element that should have a behavior applied name the filters it needs in its *data-filters* property. It also means that every named filter must be registered.

Filters can be registered to an *instance* of Behavior or to the global Behavior namespace. So if you register a "Foo" filter globally, all instance of Behavior get that filter. If a specific instance of Behavior defines a "Foo" filter, then the local instance is used regardless of the presence of a global filter.

There are methods to add and remove filters to instances as well as to the global namespace.

Behavior Method: addFilter {#Behavior:addFilter}
--------------------------------------------------

Add a new filter.

### Syntax

	myBehaviorInstance.addFilter(name, fn[, overwrite]);

### Arguments

1. name - (*string*) the name of the filter to add.
2. fn - (*function*) the function invoked when that filter is run against an element. See [Behavior.Filters][] below.
3. overwrite - (*boolean*; optional) if *true* and there is already an existing filter by the given name, that filter will be replaced, otherwise the original is retained.

### Returns

* nothing

Behavior Method: addFilters {#Behavior:addFilters}
--------------------------------------------------

Adds a group of filters.

### Syntax

	myBehaviorInstance.addFilters(obj[, overwrite]);

### Arguments

1. obj - (*object*) a key/value set of name/functions to be added.
2. overwrite - (*boolean*; optional) if *true* and there is already an existing filter by the given name, that filter will be replaced, otherwise the original is retained.

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
4. overwrite - (*boolean*; optional) if *true* and there is already an existing plugin by the given name, that plugin will be replaced, otherwise the original is retained.

### Returns

* nothing

Behavior Method: addPlugins {#Behavior:addPlugins}
--------------------------------------------------

Adds a group of plugins.

### Syntax

	myBehaviorInstance.addPlugins(obj[, overwrite]);

### Arguments

1. obj - (*object*) a key/value set of name/functions to be added as plugins.
2. overwrite - (*boolean*; optional) if *true* and there is already an existing plugin by the given name, that filter will be replaced, otherwise the original is retained.

### Returns

* nothing

Static Methods {#StaticMethods}
==============

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


Class: Behavior.Filter {#Behavior.Filter}
====================================

Behavior Filters are where you define what to do with elements that are marked with that filter. Elements can have numerous filters defined and filters can do anything with those elements that they like. In general, filters should only alter the element given, though it is possible to have elements that relate to others (for example, an *Accoridon* filter might set up an instance of *Fx.Accordion* using children that are the togglers and sections).

Typically filters allow for configuration using HTML5 data- properties, classes, and element attributes.

An important rule of filters is that they cannot know about each other or be in any way dependent on each other. When two filters need to be managed differently when both are present, use a [plugin](#Behavior.Filter:plugins) (this should be rare).

Filters are typically not created with the constructor (i.e. *new Behavior.Filter*) but instead with the [addFilter](#Behavior.addFilter)/[addFilters](#Behavior.addFilters) methods defined on the Behavior instance or the [addGlobalFilter](#Behavior.addGlobalFilter)/[addGlobalFilters](#Behavior.addGlobalFilters) methods on the Behavior namespace.

### Example

	Behavior.addGlobalPlugins({
		Accordion: function(element) {
			var toggles = element.getData('toggler-elements') || '.toggle';
			var sections = element.getData('section-elements') || '.target';
			var accordion = new Fx.Accordion(toggles, sections);
			this.markForCleanup(element, function() {
				accordion.detach();
			});
		}
	});

### Accessing passed methods

Behavior has a way to [define API methods passed to filters for their use](#Behavior:passMethod). To use these methods, access them in the second argument passed to your filter function:

	Behavior.addGlobalPlugins({
		MeasureOnResize: function(element, behaviorAPI) {
			var updater = function(w,h){
				element.set('html', 'the width is ' + w + ' and the height is ' + h);
			};
			behaviorAPI.addEvent('show', updater);
			this.markForCleanup(element, function(){
				behaviorAPI.removeEvent('show', updater);
			});
		}
	});

As you can see in the example above, we add an event whenever the Behavior instance fires it's "show" method. We also clean up that event with the [markForCleanup](#Behavior.Filter:markForCleanup) method.

Behavior.Filter Method: markForCleanup {#Behavior:markForCleanup}
--------------------------------------------------

Adds a function to invoke when the element referenced is cleaned up by the Behavior instance.

### Syntax

	myBehaviorFilter.markForCleanup(element, fn);

### Arguments

1. element - The element passed in to your filter function; the element with the data-filter applied to it.
2. fn - (*function*) the function invoked when that element is garbage collected.


Behavior.Filter Method: cleanup {#Behavior:cleanup}
--------------------------------------------------

Garbage collects the specific filter instance for a given element.

### Syntax

	myBehaviorFilter.cleanup(element);

### Arguments

1. element - The element passed in to your filter function; the element with the data-filter applied to it.


Filter Plugins {#FilterPlugins}
====================================

Filter Plugins are identical to regular filters with the exception that they are invoked only when the filter they are altering is invoked and always after that. Filters do not have any guarantee that they will be invoked in any given order, but plugins are always guaranteed to be invoked after the filter they reference.

### Example

	Behavior.defineGlobalPlugin('Mask', 'AlertOnMask', function(element, behaviorAPI){
		var mask = element.retrieve('Mask'); //get the instance of the Mask class created in the Mask filter
		var aleter = function(){
			alert('the mask is visible!');
		};
		mask.addEvent('show', alerter);
		this.markForCleanup(element, function(){
			mask.removeEvent('show', alerter);
		});
	});

The above example is guaranteed to always run after the "Mask" filter. You can define a plugin for a plugin just as well; simply name the plugin as the first argument (you could create a plugin for the above example by making a plugin for "AlertOnMask").

[Options]: http://mootools.net/docs/core/Class/Class.Extras#Options
[Events]: http://mootools.net/docs/core/Class/Class.Extras#Events
[Behavior.Filter]: #Behavior.Filter