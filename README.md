# Behavior

Auto-instantiates widgets/classes based on parsed, declarative HTML.

## Documentation

See markdown files in the *Docs* directory.

## Notes

Below are some notes regarding the implementation. The documentation should probably be read first as it gives usage examples.

* Only one selector is ever run; adding 1,000 filters doesn't affect performance
* Nodes can have numerous filters
* Nodes can have an arbitrary number of related properties (*data-foo-value*, *data-bar-value*); this arbitrary quality is cause for some debate, but for now it's proven to be extremely flexible
* Elements can be retired w/ custom destruction (*markForCleanup*); cleaning up an element also cleans up all the children of that element that have had behaviors applied
* Behaviors are only ever applied once to an element; if you call *myBehavior.apply(document.body)* a dozen times, the elements with filters will only have those filters applied once (can be forced to override and re-apply).
* Filters are instances of classes that are applied to any number of elements. They are named uniquely.
* There are "global" filters that are registered for all instances of behavior.
* Instance filters get precedence. This allows for libraries to provide filters (like [http://github.com/anutron/more-behaviors](http://github.com/cloudera/more-behaviors)) but for a specific instance to overwrite it without affecting the global state. (This pattern is in MooTools' *FormValidator* and works pretty well).
* Filters have "plugins". A requirement for Filters is that they are unaware of each other. They have no guarantee that they will be invoked in any order (the developer writing the HTML expresses their order) or that they will be invoked with others or on their own. In addition to this ignorance, it's entirely likely that in specific environments a developer might want to augment a filter with additional functionality invoked whenever the filter is. This is what plugins are for. Plugins name the filter they augment but otherwise are just filters themselves. It's possible to have plugins for plugins. At the moment, we use plugins for code that is esoteric to our environment ([Hue](http://github.com/cloudera/hue) or [JFrame](http://github.com/cloudera/jframe)) and when we need to make two filters aware of each other (*FilterInput* + *HtmlTable.Zebra*).
* Behavior defines a bottleneck for passing environment awareness to filters (*passMethod* / *behaviorAPI*). I wanted to avoid authoring filters that knew too explicitly about the environment they were invoked in. If the filters, for example, had to be able to call a method on *JFrame*, the filter shouldn't have to have a pointer to that instance itself. It would make things brittle; a change in *JFrame* would break any number of unknown filters. By forcing the code that creates the Behavior instance to declare what methods filters can use it makes a more maintainable API. JFrame passes a LOT of methods this way, but at least we know what they are and we can search the filters for where they are used.

## Limitations:

* Due to the DOM-searching for both creation and destruction, you can't have behavior instance's inside each other.
* There's a weak notion of "updates" for filters; there's show, hide, resize, but these have vague meanings. For instance, if you have a filter that needs to measure itself, it must do this on show and resize. But if the element that is controlled by the filter changes size and not the container, how does it know? This quality is marginally problematic and inelegant.
* Right now we require ALL of the global filters for *JFrame* instances. The filters require the things they set up (so *Behavior.FormValidator* requires *FormValidator* from MooTools More). As a result, the amount of code for a *JFrame* is rather large. In theory, we could integrate Behavior w/ *[Depender](http://github.com/anutron/depender)* so that when Behavior finds a filter that isn't defined it requires it from *Depender* before it sets it up. This would greatly reduce the initial footprint of our first app. It would complicate Behavior in that it would require the *Depender* client to work. It probably means we extend/patch Behavior in our environment only if we do this.
* At the moment *Behavior.Filter* implements *[ART.WindowTools](http://github.com/cloudera/art-widgets)* (so that filters can find the app window they are in). This needs to change obviously. An easy fix.
* Currently filter plugins that need to reference an instance created by the filter (a plugin for *FormValidator* that needs to reference the instance of *FormValidator*) must retrieve that instance it from the element. That means either the *FormValidator* class or the behavior filter must store it there. It's not always enforced or available. More generally, if a filter were to create numerous variables the plugin would have to recreate them (imagine a filter that did a DOM search based on a selector in a data property; the plugin would have to perform that search, too, unless the filter were to store the results somewhere, perhaps in the class instance it invoked). A pattern to consider here is to have a filters' invocation to return the instance and behavior to pass what was returned on to plugins.