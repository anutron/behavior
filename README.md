# Behavior

Auto-instantiates widgets/classes based on parsed, declarative HTML.

### Purpose

All well-written web sites / apps that are interactive have the same basic pattern:

![Web app layers](https://github.com/anutron/behavior/raw/master/layers.png)

Each page of the site or app is esoteric. It may have any combination of interactive elements, some of which interact with each other (for example, a form validation controller might interact with an ajax controller to prevent it sending a form that isn't valid). Typically this "glue" code exists in a DomReady statement. It says, get *this* form and instantiate *that* class with *these* options. This code is brittle; if you change either the DOM or the code the state breaks easily. It's not reusable, it only works for a specific page state. It can easily get out of hand.

Behavior attempts to abstract that DomReady code into something you only write once and use often. It's fast and easily customized and extended. Instead of having a DomReady block that, say, finds all the images on a page and turns them into a gallery, and another block that searches the page for all the links on the page and turns them into tool tips, Behavior does a single search for all the elements you've marked. Each element is passed through the filter it names, where a filter is a function (and perhaps some configuration) that you've named. Each of these functions takes that element, reads properties defined on it in a prescribed manner and invokes the appropriate UI component.

## Documentation

See markdown files in the *Docs* directory.

* [Behavior](Docs/Behavior.md)
* [Behavior.API](Docs/Behavior.API.md)
* [Element.Data](Docs/Element.Data.md)

## Notes

Below are some notes regarding the implementation. The documentation should probably be read first as it gives usage examples.

* Only one selector is ever run; adding 1,000 filters doesn't affect performance.
* Nodes can have numerous filters.
* Nodes can have an arbitrary number of supported options for each filter (`data-filterame-foo="bar"`).
* Nodes can define options as JSON (this is actually the preferred implementation - `data-filtername-options="<your JSON>"`).
* Elements can be retired w/ custom destruction; cleaning up an element also cleans up all the children of that element that have had behaviors applied.
* Behaviors are only ever applied once to an element; if you call `myBehavior.apply(document.body)` a dozen times, the elements with filters will only have those filters applied once (can be forced to override and re-apply).
* Filters are instances of classes that are applied to any number of elements. They are named uniquely.
* There are "global" filters that are registered for all instances of behavior.
* Instance filters get precedence. This allows for libraries to provide filters (like [http://github.com/anutron/more-behaviors](http://github.com/anutron/more-behaviors)) but for a specific instance to overwrite it without affecting the global state. (This pattern is in MooTools' `FormValidator` and works pretty well).
* Filters have "plugins". A requirement for Filters is that they are unaware of each other. They have no guarantee that they will be invoked in any order (the developer writing the HTML expresses their order) or that they will be invoked with others or on their own. In addition to this ignorance, it's entirely likely that in specific environments a developer might want to augment a filter with additional functionality invoked whenever the filter is. This is what plugins are for. Plugins name the filter they augment but otherwise are just filters themselves. It's possible to have plugins for plugins. When you need to make two filters aware of each other (`FilterInput` + `HtmlTable.Zebra`). Note that plugins are always executed after all the filters are, so when writing a plugin that checks for a combination of two filters it is guaranteed that both filters have been applied.
* Behavior defines a bottleneck for passing environment awareness to filters (`passMethod` / `behaviorAPI`). Filters should not know too explicitly about the environment they were invoked in. If the filters, for example, had to be able to call a method on some containing class - one that has created an instance of Behavior for example, the filter shouldn't have to have a pointer to that instance itself. It would make things brittle; a change in that class would break any number of unknown filters. By forcing the code that creates the Behavior instance to declare what methods filters can use it makes a more maintainable API.

## Limitations:

* Due to the DOM-searching for both creation and destruction, you can't have behavior instance's inside each other.