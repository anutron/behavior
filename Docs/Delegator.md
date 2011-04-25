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

### Events

* error - function invoked when a trigger is not found. Defaults to console errors if console.error is available.

### Usage

Delegator implements [Event Delegation](http://mootools.net/docs/more/Element/Element.Delegation) for reusable behaviors. Conceptually its similar to [Behavior][] in that you declare which behavior you want an element to have, but unlike Behavior's filters which are run at startup and instantiate widgets and the like, Delegator is designed to run its registered functions (which we call "triggers") at event time (such as click).

This should not be confused with deferred Behavior filters (which can be run at event time, too). Behavior filters deferred to an event (such as click) are only run once and are used to instantiate something. Delegator's triggers are event handlers to be used repeatedly (a trigger might, for example, hide its parent or remove itself from the DOM or load some content via AJAX).

### Example Usage

	var myDelegator = new Delegator();
	Delegator.attach(myContainerElement);
	Delegator.register('click', 'HideTarget', function(element, event, api){
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
3. handler - (*function* or *object*) The event handler for this trigger. Passed the element, the event, and an instance of [BehaviorAPI][]. See Note about extended declaration for this argument.
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
	Delegator.register('click', 'HideTarget', function(element, event, api){
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
		handler: function(element, event, api){...}
	});

Elements that fail to provide the required attributes will have these filters ignored. These triggers throw errors but by default these are caught unless you set `options.breakOnErrors` to *false*.

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