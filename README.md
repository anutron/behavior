# Behavior

Auto-instantiates widgets/classes based on parsed, declarative HTML.

### Purpose

All well-written web sites / apps that are interactive have the same basic pattern:

![Web app layers](https://github.com/anutron/behavior/raw/master/layers.png)

Each page of the site or app is esoteric. It may have any combination of interactive elements, some of which interact with each other (for example, a form validation controller might interact with an ajax controller to prevent it sending a form that isn't valid). Typically this "glue" code exists in a domready statement. It says, get *this* form and instantiate *that* class with *these* options. This code is brittle; if you change either the DOM or the code the state breaks easily. It's not reusable, it only works for a specific page state. It can easily get out of hand.

Behavior attempts to abstract that domready code into something you only write once and use often. It's fast and easily customized and extended. Instead of having a domready block that, say, finds all the images on a page and turns them into a gallery, and another block that searches the page for all the links on the page and turns them into tool tips, Behavior does a single search for all the elements you've marked. Each element is passed through the filter it names, where a filter is a function (and perhaps some configuration) that you've named. Each of these functions takes that element, reads properties defined on it in a prescribed manner and invokes the appropriate UI component.

## Documentation

See markdown files in the *Docs* directory.

* [Behavior](Docs/Behavior.md)
* [BehaviorAPI](Docs/BehaviorAPI.md)
* [Element.Data](Docs/Element.Data.md)

### Why?

The nutshell is that instead of having a domready function that finds the stuff in your DOM and sets up instances of classes and whatnot, you put the configuration in the HTML itself and write the code that calls "new Foo(...)" only once. Example:

Instead of this:

	$$('form').each(function(form){
	  new FormValidator(form, someOptions);
	  new Form.Request(form, someOptions);
	});
	new Tips($$('.tip'));
	$$('.accordion').each(function(container){
	  new Accordion(container.getElements('.toggler'), container.getElements('.section'), someOptions);
	});
	etc

You do this:

	<form data-behavior="FormValidator FormRequest" data-formvalidator-options="{someOptions}">...</form>
	<a data-behavior="Tip" title="I'm a tip!">blah</a>
	<div data-behavior="Accordion" data-accordion-options="{someOptions}">...</div>

Think of it as delegation (as in event delegation) for class invocation. If you use domready to do your setup and you want to swap out some HTML with XHR, you need to reapply that startup selectively to only your components that you're updating, which is often painful. Not with Behavior, you just apply the filters to the response and call it a day.

You do a lot less DOM selection; you only ever run `$$('[data-behavior]')` once (though some filters may run more selectors on themselves - like Accordion finding its togglers and sections).

Domready setup is always closely bound to the DOM anyway, but it's also separated from it. If you change the DOM, you might break the JS that sets it up and you always have to keep it in sync. You almost can't do that here because the DOM and its configuration is closely bound and in the same place.

Developers who maybe aren't interested in writing components don't need to wade into the JS to use it. This is a big deal if you're working with a team you must support.

Behavior is designed for apps that are constantly updating the UI with new data from the server. It's *not* an MVC replacement though. It's designed for web development that uses HTML fragments not JSON APIs (though it can play nicely with them). If you destroy a node that has a widget initialized it's easy to make sure that widget cleans itself up. The library also allows you to create enforcement to prevent misconfiguration and an API that makes it easy to read the values of the configuration.

There are some other nifty things you get out of it; you get essentially free specs tests and benchmarks because the code to create both of them is in the Behavior filter. Here's an example of what it takes to write a spec for a widget and ALSO the benchmark for it's instantiation (this uses [Behavior.SpecsHelpers.js](https://github.com/anutron/behavior/blob/master/Tests/Specs/Behavior/Behavior.SpecsHelpers.js)).

	Behavior.addFilterTest({
	  filterName: 'OverText',
	  desc: 'Creates an instance of OverText',
	  content:  '<input data-behavior="OverText" title="test"/>',
	  returns: OverText
	});

This code above can be used to validate that the HTML fragment passed in does, in fact, create an OverText instance and it can also be used with [Benchmark.js](http://benchmarkjs.com/) to see which of your filters are the most expensive. More on this stuff in a minute.

### Delegator

Included in the library is also a file called Delegator which is essentially the same thing except for events. For example, let's say you have a predictable UI pattern of having a link that, when clicked, it hides a parent element. Rather than writing that code each time:

	document.body.addEvent("click:a.hideParent", function(e, link){
	  e.preventDefault();
	  link.getParent().hide();
	});

You register this pattern with Delegator and now you just do:

	<a data-trigger="hideParent" data-hideparent-options ="{'target': '.someSelector'}">Hide Me!</a>

It provides essentially the same value as Behavior, but at event time. The above example is pretty straight forward so, you know, why bother, right? But consider how many of these little things you write to make a web app function. If you can create them once and configure them inline, you save yourself a lot of code.

### Stock Behaviors

Check out these resources of available Behavior Filters provided by the author:

* [https://github.com/anutron/more-behaviors](https://github.com/anutron/more-behaviors)
* [https://github.com/anutron/clientcide](https://github.com/anutron/clientcide)
* [https://github.com/anutron/mootools-bootstrap](https://github.com/anutron/mootools-bootstrap)


## Notes

Below are some notes regarding the implementation. The documentation should probably be read first as it gives usage examples.

* Only one selector is ever run; adding 1,000 filters doesn't affect performance.
* Nodes can have numerous filters.
* Nodes can have an arbitrary number of supported options for each filter (`data-behaviorname-foo="bar"`).
* Nodes can define options as JSON (this is actually the preferred implementation - `data-behaviorname-options="<your JSON>"`).
* Elements can be retired w/ custom destruction; cleaning up an element also cleans up all the children of that element that have had behaviors applied.
* Behaviors are only ever applied once to an element; if you call `myBehavior.apply(document.body)` a dozen times, the elements with filters will only have those filters applied once (can be forced to override and re-apply).
* Filters are instances of classes that are applied to any number of elements. They are named uniquely.
* Filters can be namespaced. Declare a filter called `Foo.Bar` and reference its options as `data-foo-bar-options="..."`.
* There are "global" filters that are registered for all instances of behavior.
* Instance filters get precedence. This allows for libraries to provide filters (like [http://github.com/anutron/more-behaviors](http://github.com/anutron/more-behaviors)) but for a specific instance to overwrite it without affecting the global state. (This pattern is in MooTools' `FormValidator` and works pretty well).
* Filters have "plugins". A requirement for Filters is that they are unaware of each other. They have no guarantee that they will be invoked in any order (the developer writing the HTML expresses their order) or that they will be invoked with others or on their own. In addition to this ignorance, it's entirely likely that in specific environments a developer might want to augment a filter with additional functionality invoked whenever the filter is. This is what plugins are for. Plugins name the filter they augment but otherwise are just filters themselves. It's possible to have plugins for plugins. When you need to make two filters aware of each other (`FilterInput` + `HtmlTable.Zebra`). Note that plugins are always executed after all the filters are, so when writing a plugin that checks for a combination of two filters it is guaranteed that both filters have been applied.
* Behavior defines a bottleneck for passing environment awareness to filters (`passMethod` / `behaviorAPI`). Filters should not know too explicitly about the environment they were invoked in. If the filters, for example, had to be able to call a method on some containing class - one that has created an instance of Behavior for example, the filter shouldn't have to have a pointer to that instance itself. It would make things brittle; a change in that class would break any number of unknown filters. By forcing the code that creates the Behavior instance to declare what methods filters can use it makes a more maintainable API.

## Limitations:

* Due to the DOM-searching for both creation and destruction, you can't have behavior instances inside each other.