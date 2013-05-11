Class: Delegator {#Delegator}
====================================

Manager for generic (DOM) event handlers.

### Implements

* [Options][], [Events][]

### Syntax

	new Delegator([options]);

### Arguments

1. options - (*object*; optional) a key/value set of options

### Options

* breakOnErrors - (*boolean*) By default, errors thrown by triggers are caught; the onError event is fired. Set this to `true` to NOT catch these errors to allow them to be handled by the browser.
* verbose - (*boolean*) If *true*, Delegator logs its activity to the console. This can create a lot of output. Defaults to *false*.
* getBehavior - (*function*) Returns an instance of [Behavior](Behavior.md) so that triggers can integrate with it.

### Events

* error - function invoked when a trigger is not found. Defaults to console errors if console.error is available. Also able to be invoked by triggers as `api.error`.
* warn - function invoked when a trigger calls `api.warn`. Defaults to `console.warn` if present.
* destroyDom - function invoked when a trigger destroys a portion of the DOM. Automatically integrated w/ Behavior's `cleanup` method if you set one in the options. Passed the element destroyed as an argument.
* ammendDom - function invoked when a trigger ammends a portion of the DOM. Automatically integrated w/ Behavior's `apply` method if you set one in the options. Passed two arguments: the parent node that contains all the updated elements and an array of those elements updated.
* trigger - function invoked whenever a trigger is called. Passed four arguments: `trigger` (the name of the trigger invoked), `element` (the element on which it was invoked), `event` (the event object), `result` (anything returned by the trigger's handler).

### Usage

Delegator implements [Event Delegation](http://mootools.net/docs/more/Element/Element.Delegation) for reusable behaviors. Conceptually its similar to [Behavior][] in that you declare which behavior you want an element to have, but unlike Behavior's filters which are run at startup and instantiate widgets and the like, Delegator is designed to run its registered functions (which we call "triggers") at event time (such as click).

This should not be confused with deferred Behavior filters (which can be run at event time, too). Behavior filters deferred to an event (such as click) are only run once and are used to instantiate something. Delegator's triggers are event handlers to be used repeatedly (a trigger might, for example, hide its parent or remove itself from the DOM or load some content via AJAX).

### Example Usage

	var myDelegator = new Delegator();
	Delegator.attach(myContainerElement);
	Delegator.register('click', 'HideTarget', function(event, element, api){
		event.preventDefault();
		var target = element.getElement(api.get('target'));
		if (target) target.hide();
	});

### Example HTML

	<a data-trigger="HideTarget" data-HideTarget-target="#foo">click me to hide foo</a>
	<div id="foo">I hide when you click the link above me!</div>

### HTML properties

Delegator uses a clearly defined API to read HTML properties off the elements it configures. See [BehaviorAPI][] for details.

### Using Multiple Triggers Together

It's possible to declare more than one data trigger property for a single element (`data-trigger="DisableMe SubmitParentForm"`)

### Integrating with Behavior

If you're using [Behavior](Behavior.md) you should connect the two so that links that Delegator uses to update the DOM can have their response run through your Behavior instance's `apply` method. Example:

	var myBehavior = new Behavior().apply(document.body);
	var myDelegator = new Delegator({
		getBehavior: function(){ return myBehavior; }
	}).attach(document.body);



Delegator Method: passMethod {#Delegator:passMethod}
--------------------------------------------------

Defines a method that will be passed to triggers. Delegator allows you to create a well defined API for triggers to reference which increases their reusability. You define this API by explicitly passing named functions to them through the Delegator instance.

### Syntax

	myDelegatorInstance.passMethod(name, function);

### Returns

* (*object*) this instance of Delegator

### Notes

By default, Delegator passes the following methods to triggers in addition to the methods defined in the [BehaviorAPI][]

* addEvent - the addEvent on the behavior instance method provided by the [Events][] class.
* removeEvent - the removeEvent on the behavior instance method provided by the [Events][] class.
* addEvents - the addEvents on the behavior instance method provided by the [Events][] class.
* removeEvents - the removeEvents on the behavior instance method provided by the [Events][] class.
* fireEvents - the fireEvents on the behavior instance method provided by the [Events][] class.
* attach - the [attach](#Delegator:attach) method provided by this Delegator instance.
* trigger - the [trigger](#Delegator:trigger) method provided by this Delegator instance.
* error - fires the Delegator instance's `error` event with the arguments passed.
* fail - stops the trigger and passes a message through to the error logger. Takes a string for the message as its only argument.
* getBehavior - returns the behavior instance defined in the `getBehavior` options object.
* See the [BehaviorAPI][] for additional methods passed by default.

You can add any other methods that your triggers require. In general, your filters shouldn't reference anything in your environment except these methods.

Delegator Method: passMethods {#Delegator:passMethods}
--------------------------------------------------

Iterates over an object of key/values passing them to the [passMethod](#Delegator:passMethod) method.

### Syntax

	myDelegatorInstance.passMethods(obj);

### Arguments

1. obj - (*object*) a set of name/function pairs to pass to the passMethod method.

### Returns

* (*object*) this instance of Delegator

Delegator Method: register {#Delegator:register}
--------------------------------------------------

This is both a static method and an instance method. Using the static method (`Delegator.register(...)`) will register a *global* trigger. Using the instance method will register a *local* trigger. The local trigger is used whenever both exist.

### Syntax

	Delegator.register(eventTypes, name, handler, overwrite);
	myDelegator.register(eventTypes, name, handler, overwrite);
	//also
	Delegator.register(eventTypes, object, overwrite);
	myDelegator.register(eventTypes, object, overwrite);

### Arguments

1. eventTypes - (*string* or *array*) The event type this trigger monitors. *It is not advised to ever use mouseout or mouseover*.
2. name - (*string*) The name of this trigger.
3. handler - (*function* or *object*) The event handler for this trigger. Passed the event, the element, and an instance of [BehaviorAPI][]. See Note about extended declaration for this argument.
4. overwrite - (*boolean*) If *true* and a trigger by this name already exists, it will be overwritten. Defaults to *false*.

### Alternate Arguments

1. eventTypes - same as above.
2. object - (*object*) a set of name/handler values to add.
3. overwrite - same as above.

### Examples

	//this is the same example as the one at the top of the page
	var myDelegator = new Delegator();
	myDelegator.attach(myContainerElement);
	//this adds a global trigger
	Delegator.register('click', 'HideTarget', function(event, element, api){
		event.preventDefault();
		var target = element.getElement(api.get('target'));
		if (target) target.hide();
	});

	//also
	Delegator.register(['click', 'submit'], {
		Foo: function(){...},
		Bar: {
			handler: function(){...},
			requires: [...]
		}
	});

Delegator Method: getTrigger {#Delegator:getTrigger}
--------------------------------------------------

This is both a static method and an instance method. Using the static method (`Delegator.getTrigger(...)`) will return a *global* trigger. Using the instance method will return a *local* trigger or, if not found, the global one.

### Syntax

	Delegator.getTrigger(name);
	myDelegator.getTrigger(name);

### Arguments

1. name - (*string*) the name of the trigger to retrieve.

### Returns

* trigger - (*object* or *null*) the trigger instance if found.

### Examples

	//this is the same example as the one at the top of the page
	var myDelegator = new Delegator();
	myDelegator.attach(myContainerElement);
	//this adds a global trigger
	Delegator.register('click', 'HideTarget', function(event, element, api){
		//...
	});

	Delegator.getTrigger('HideTarget'); //returns the GLOBAL trigger instance
	myDelegator.getTrigger('HideTarget'); //returns the GLOBAL trigger instance

	//but if we add a local one
	myDelegator.register('click', 'HideTarget', function(event, element, api){
		//... local version by the same name
	});

	Delegator.getTrigger('HideTarget'); //returns the GLOBAL trigger instance
	myDelegator.getTrigger('HideTarget'); //returns the LOCAL trigger instance

### Extended handlers

Handlers, much like Behavior's filter declaration, are passed an instance of [BehaviorAPI][] as they often have additional configuration properties (for example, a selector to find *which* form to submit or hide or what-have-you). You can declare a handler in object notation with values for defaults and required properties. Example:

	myDelegator.register('click', 'HideTarget', {
		require: ['target'],
		requireAs: {
			count: Number,
			whatever: Array
		},
		defaults: {
			someSelector: '#foo'
		},
		handler: function(event, element, api){...}
	});

Elements that fail to provide the required attributes will have these filters ignored. These triggers throw errors but by default these are caught unless you set `options.breakOnErrors` to *false*.

### Included handlers

Delegator includes two handlers:

* `Stop` - calls `event.stop()` on the event for you; this is typically done in the registered trigger, but can be done at the element level if you include this trigger in your HTML declaration.
* `PreventDefault` - similar to `Stop`, this calls `event.preventDefault()`.

### Events of note

Triggers can fire events on the instance of Delegator that invokes them. See the Events section above regarding the events supported by default. In particular, if you're using this class with Behavior you should take care to connect the two and to use the `destroyDom` and `ammendDom` events.

You can also have your triggers fire any other arbitrary event that you like to facilitate integration with other triggers or external objects that attach to Delegator's event model.

Delegator Method: addEventTypes {#Delegator:addEventTypes}
----------------------------------------------------------

Adds event types to a registered trigger.

### Syntax

	myDelegator.addEventTypes(triggerName, types);

### Arguments

1. triggerName - (*string*) the name of the trigger.
2. types - (*array*) the event types to add (`blur`, `click`, etc).

Delegator Method: attach {#Delegator:attach}
--------------------------------------------------

Attaches the appropriate event listeners to the provided container.

### Syntax

	myDelegator.attach(container);

### Returns

* (*object*) this instance of Delegator

### Notes

* Attaching the event listeners to nested elements is highly discouraged.

Delegator Method: detach {#Delegator:detach}
--------------------------------------------------

Detaches the appropriate event listeners from the provided container or, if none is provided, all of them that have previously been attached.

### Syntax

	myDelegator.detach([container]);

### Arguments

1. container - (*element*; optional) A DOM element (or its ID) to attach delegated events. If none is specified all previously attached elements are detached.

### Returns

* (*object*) this instance of Delegator

Delegator Method: trigger {#Delegator:trigger}
--------------------------------------------------

Invokes a specific trigger manually.

### Syntax

	myDelegator.trigger(trigger, element[, event]);

### Example

	myDelegator.trigger('UpdateOnSubmit', myForm, 'submit'); //creates a mock "submit" event

### Arguments

1. trigger - (*string*) The name of the registered trigger to invoke.
2. element - (*element*) A DOM element (or its ID) for the trigger's target.
3. event - (*event* or *string*; optional) An optional event to pass to the trigger. If you pass in a string, a mock event will be created for that type. If none is provided a mock event is created as a "click" event.

### Returns

* (*mixed*) - Whatever the trigger invoked returns.

Static Methods
==============

In addition to those listed above that are both static and instance methods...

Delegator Method: debug {#Delegator:debug}
--------------------------------------------------

Will invoke `debugger` before executing any trigger that matches that name, allowing you to walk through that filter's invocation.

### Syntax

	Delegator.debug(pluginName);

### Arguments

1. pluginName - (*string*) The name of the plugin.


Element Methods
===============

Delegator implements the following helper methods on the Element prototype.

Element Method: addTrigger {#Element:addTrigger}
------------------------------------------------------

Adds a trigger to the element.

### Syntax

	myElement.addTrigger(name);

### Arguments

1. name - (*string*) The name of the trigger to add.

### Returns

* (*element*) This element.

Element Method: removeTrigger {#Element:removeTrigger}
------------------------------------------------------

Removes a trigger to the element.

### Syntax

	myElement.removeTrigger(name);

### Arguments

1. name - (*string*) The name of the trigger to remove.

### Returns

* (*element*) This element.


Element Method: getTriggers {#Element:getTriggers}
------------------------------------------------------

Gets an array of triggers specified on an element.

### Syntax

	myElement.getTriggers();

### Returns

* (*array*) A list of trigger names.

Element Method: hasTrigger {#Element:hasTrigger}
------------------------------------------------------

Returns `true` if the element has the specified trigger.

### Syntax

	myElement.hasTrigger(name);

### Arguments

1. name - (*string*) The name of the trigger to check for.

### Returns

* (*boolean*) Returns `true` if the element has the specified trigger.

[Options]: http://mootools.net/docs/core/Class/Class.Extras#Options
[Events]: http://mootools.net/docs/core/Class/Class.Extras#Events
[Behavior]: Behavior