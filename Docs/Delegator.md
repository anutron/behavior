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
	Delegator.register('click', 'hide', function(event, element, api){
		event.preventDefault();
		api.getElement('target').hide();
	});

### Example HTML

	<a data-trigger="hide" data-hide-target="!body #foo">click me to hide foo</a>
	<div id="foo">I hide when you click the link above me!</div>

### HTML properties

Delegator uses a clearly defined API to read HTML properties off the elements it configures. See [BehaviorAPI][] for details.

### Using Multiple Triggers Together

It's possible to declare more than one data trigger property for a single element (`data-trigger="disableMe submitParentForm"`)

### Integrating with Behavior

If you're using [Behavior](Behavior.md) you should connect the two so that links that Delegator uses to update the DOM can have their response run through your Behavior instance's `apply` method. Example:

	var myBehavior = new Behavior().apply(document.body);
	var myDelegator = new Delegator({
		getBehavior: function(){ return myBehavior; }
	}).attach(document.body);
	myBehavior.setDelegator(myDelegator);

### Conventions

* MooTools has the convention that classes are upper case and methods and functions are not. Becuase Delegator triggers do not necessarily instantiate classes as Behavior filters do, they are usually registered with lower case names.
* Whenever a delegator trigger references another element (or elements) with its options, by convention the selector given always is relative to the element with the trigger. In the example above, the `data-hide-target` value is `!body #foo` (instead of just `#foo`). This convention is codified in the passed api methods `getElement` and `getElements` (detailed below) which will get the element(s) referenced by that selector for you, optionally throwing warnings when they aren't found.

### Conditionals

Delegator also allows any trigger's options to include conditionals that will prevent or allow the trigger from being invoked if they match. These conditionals are run at event time, allowing you to program your UI for different states. Delegator provides two conditionals - `if` and `unless`. In theory this could be extended to include others like less than or greater than at some point.

#### Examples

	<a data-trigger="foo" data-foo-options="
		'if': {
			'self::hasClass': ['foo'] //could also just be 'foo'; use an array for multiple arguments
		}
	">...</a>

	<a data-trigger="foo" data-foo-options="
		'unless': {
			'self::hasClass': ['foo']
		}
	">...</a>

Both the examples above reference the `foo` trigger and specify conditionals. The first one uses the special `if` conditional and requires that the element itself has the class "foo" (which it doesn't), and thus the trigger will not fire. The second one is nearly identical but uses the special `unless` conditional, which does the same check but verifies that it's NOT true, so that one will.

There's a more verbose version of these conditionals that looks like this:

	<a data-trigger="foo" data-foo-options="
		'if': {
			'target': 'self',
			'method': 'hasClass',
			'arguments': ['foo'],
			'value': true
		}
	">...</a>

Here we explicitly name the target (`self`), the method invoked on that element (`hasClass`) - this can be any element method, the arguments passed to that method, and the value we expect it to return. The previous examples are just shorthands that are parsed into this more verbose format.

### Multiple Triggers

Delegator also provides a custom trigger called "multi" which allows a single element to invoke triggers on OTHER elements each with its own options. This allows you to have a single element that the user clicks and then it hides some elements, adds classes to others, etc.

#### Example

	<a data-trigger="multi" data-multi-triggers="
		[
			{
				'.foo::someTrigger': {
					'arg':'blah'
				}
			},

			'.bar::someOtherTrigger',

			{
				'.baz::yetAnotherTrigger': {
					'if':{
						'self::hasClass': 'foo'
					}
				}
			}
		]
	"></a>

Here we have 3 different Delegator triggers we are invoking when the user clicks our link.

* The first is the "someTrigger" trigger which is invoked on any child element with the "foo" class. This one has a configuration - the options for the trigger. See important note below about how these are used.
* The second one just invokes the "someOtherTrigger" on any child element with the "bar" class.
* The third invokes the "yetAnotherTrigger" on any element with the "baz" class *provided that it also has the "foo" class*.

#### Important Notes

* The configuration specified this way are passed to [BehaviorAPI][]'s `setDefault` method. This means that if the target element has its own configuration for these triggers that the configuration options specified on the element win.
* Conditionals evaluated in these triggers are evaluated on the targets, not the element where they are specified. In other words, in the last example above where there's a check to see if `'self::hasClass': 'foo'"`, `self` will reference each matched element for `.baz`. These options specified here are projected on each matched element as if the trigger were there.
* If you express more than one conditional statement in your `if` or `unless` object, each is evaluated and the condition **fails** if *any* of them do. In this example, each statement in the `unless` object is evaluated. If *any* are `true` (because it's an `unless` statement) the trigger is not invoked.

		<a data-trigger="foo" data-foo-options="
			'unless': {
				'self::hasClass': ['foo'],
				'.someElement::hasClass': ['bar']
			}
		">...</a>

* You can, if you like, still specify a conditional for the "multi" trigger. This means the entire list of triggers will be ignored if your condition fails. Example:

		<a data-trigger="multi" data-multi-options="
			'triggers': [
				'.foo::someTrigger',
				'.bar::someOtherTrigger'
			],
			'unless': {
				'self::hasClass': 'whatever'
			}
		"></a>

### Switches

Finally, Delegator offers a special trigger called a `switch`. These allow you to define multiple sets of triggers to execute when a condition is met. If the user clicks this button and some radio button is selected, execute these triggers on THAT group of elements, else execute these OTHER triggers on these OTHER elements.

There are two types of switches: `first` and `any`. The `first` switch iterates over your switch groups (in the order they are declared) and executes the first group whose condition is `true`, while the `any` switch iterates over all the trigger groups, executing any whose condition is true. As with all triggers, a group with no condition is treated as one that is `true` and executed.

#### Examples

	<a data-trigger="first" data-first-switches="[
		{
			'if': {
				'div.foo::hasClass':['baz']
			},
			triggers: [
				'.foo::trigger1'
			]
		},
		{
			'unless': {
				'div.foo::hasClass':['baz']
			},
			triggers: [
				'.foo::trigger2'
			]
		},
		{
			triggers: [
				'.foo::trigger3'
			]
		}
	]">...</a>

In the above example, Delegator iterates over the array of trigger groups defined in the `first` switches. When it finds one that is valid, it runs the triggers defined within it. The last group in the example has no condition and is essentially treated as the default case in the eventuality that none of the previous are `true`. (Note that in this example, because the first two in the group are the same condition with one an `if` and the other an `unless`, one of them *has* to be true.)

	<a data-trigger="any" data-any-switches="[
		{
			'if': {
				'div.foo::hasClass':['baz']
			},
			triggers: [
				'.foo::trigger1'
			]
		},
		{
			'unless': {
				'div.foo::hasClass':['baz']
			},
			triggers: [
				'.foo::trigger2'
			]
		},
		{
			triggers: [
				'.foo::trigger3'
			]
		}
	]">...</a>

In this example, which is nearly identical to the first one except the switch type is `any` instead of `first`, Delegator iterates over all of the trigger groups and executes each if their conditional is `true`. While the `first` example would execute one of the first two in the group (because they are opposites in the example) and stop, the `any` example will execute one of the first two (whichever is `true`) AND the last one.

#### Conditionals with Switches

Note that, as with any trigger, you can have a conditional for the switch itself:

	<a data-trigger="any" data-any-options="
		'switches': [
			{
				'if': {
					'div.foo::hasClass':['baz']
				},
				triggers: [
					'.foo::trigger1'
				]
			},
			{
				triggers: [
					'.foo::trigger3'
				]
			}
		],
		'unless': {
			'.foo::hasClass': ['bazoo']
		}
	">...</a>


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
* getElement - see note on getElement below.
* getElements - see note on getElements below.
* See the [BehaviorAPI][] for additional methods passed by default.

You can add any other methods that your triggers require. In general, your filters shouldn't reference anything in your environment except these methods.

### api.getElement and api.getElements

Like Behavior, Delegator provides two methods to help you get elements relative to the one with the trigger on it: `getElement` and `getElements`. These methods, given an option key, look up the key's value and find the first element using that value as a selector. This search is relative to the api's element (so, for example, to find an element by ID anywhere on the page, you'd pass "`!body #the-id`"). Returns the first element found or `null`. `getElements` returns an `Elements` instance with the result while `getElement` just returns the first.

By default, these methods will throw an error (quietly, in the console, unless the `breakOnErrors` option on the Delegator instance is `true`) if the option key is not defined or no element is found, stopping execution of the trigger. Pass in an optional second argument to have it only throw the warning in the console but continue execution.

#### Examples

	<a data-trigger="hide" data-hide-options="
		'target': 'span.foo'
	"><span class="foo">some stuff</span></a>

	<script>
		Delegator.register('click', 'foo', {
			handler: function(element, api){
				// get the first element using whatever the 'target' option is set to
				// as a selector; in this case, "span.foo" and call `.hide()` on it
				api.getElement('target').hide();
			}
		});
	</script>

If the user did not configure a target in the options or if the selector specified in that option were to fail to find a result, execution would be stopped and an error logged to console (or thrown if `breakOnErrors` is true).

	<a data-trigger="hide" data-hide-options="
		'target': 'span.foo'
	"><span class="foo">some stuff</span></a>

	<script>
		Delegator.register('click', 'foo', {
			handler: function(element, api){
				// here we tell the api not to stop execution and only warn in the console
				var target = api.getElement('target', 'warn');
				// if the target wasn't found, we hide the element (just an example)
				if (!target) element.hide();
				// otherwise hide the target
				else target.hide();
			}
		});
	</script>

`getElements` works the same way, but instead returns an array-like `Elements` object with all elements that match the selector.

#### Special selectors `self` and `window`

For convenience, Delegator provides two special selectors: `self` and `window`. `self` returns the element itself, while `window` returns the window. Unlike regular selectors which can contain pseudo-selectors and commas (i.e. `.foo:focused, .bar`), the `self` and `window` selectors must be on their own with no adornment. The reason for this is that some triggers (like the first example above) require that there be a selector given for an option. If the user wants to invoke the triggers's action on the element clicked, they need a way to reference it. Likewise, if they want reference the window (like scrolling it for example) they need a way to reference it.


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
	Delegator.register('click', 'hide', function(event, element, api){
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
	Delegator.register('click', 'hide', function(event, element, api){
		//...
	});

	Delegator.getTrigger('hide'); //returns the GLOBAL trigger instance
	myDelegator.getTrigger('hide'); //returns the GLOBAL trigger instance

	//but if we add a local one
	myDelegator.register('click', 'hide', function(event, element, api){
		//... local version by the same name
	});

	Delegator.getTrigger('hide'); //returns the GLOBAL trigger instance
	myDelegator.getTrigger('hide'); //returns the LOCAL trigger instance

### Extended handlers

Handlers, much like Behavior's filter declaration, are passed an instance of [BehaviorAPI][] as they often have additional configuration properties (for example, a selector to find *which* form to submit or hide or what-have-you). You can declare a handler in object notation with values for defaults and required properties. Example:

	myDelegator.register('click', 'hide', {
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

Elements that fail to provide the required attributes will have these filters ignored. These triggers throw errors but by default these are caught unless you set `options.breakOnErrors` to `true`.

### Included handlers

Delegator includes five handlers:

* `Stop` - calls `event.stop()` on the event for you; this is typically done in the registered trigger, but can be done at the element level if you include this trigger in your HTML declaration.
* `PreventDefault` - similar to `Stop`, this calls `event.preventDefault()`.
* `multi` - allows you to define numerous triggers to invoke on other elements (see section above on the `multi` trigger)
* `first` and `any` - special types of `multi`-filter groups. See section above on "switch" filters.

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

	myDelegator.trigger(trigger, element[, event, ignoreTypes]);

### Example

	myDelegator.trigger('UpdateOnSubmit', myForm, 'submit'); //creates a mock "submit" event

### Arguments

1. trigger - (*string*) The name of the registered trigger to invoke.
2. element - (*element*) A DOM element (or its ID) for the trigger's target.
3. event - (*event* or *string*; optional) An optional event to pass to the trigger. If you pass in a string, a mock event will be created for that type. If none is provided a mock event is created as a "click" event.
4. ignoreTypes - (*boolean*) if `true` does not check the event type to see if it matches the trigger's specified supported methods.

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
[BehaviorAPI]: BehaviorAPI