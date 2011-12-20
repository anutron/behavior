Class: BehaviorAPI {#BehaviorAPI}
==========================

Provides methods to read values from annotated HTML configured for the [Behavior][] class and its associated [Filters](Behavior.md#Behavior.Filter).

### Syntax

	new BehaviorAPI(element[, prefix]);

### Arguments

1. element - (*element*) An element you wish to read.
2. prefix - (*string*; optional) A prefix to all the properties; a namespace.

### Notes

Examples of the HTML expressions evaluated are as follows (all of the following produce the same output*):

	<tag data-behavior="Filter1 Filter2" data-filter1-options="{'opt1': 'foo', 'opt2': 'bar', 'selector': '.selector'}"> //prefered
	<tag data-behavior="Filter1 Filter2" data-filter1-options="'opt1': 'foo', 'opt2': 'bar', 'selector': '.selector'"> //no braces on JSON
	<tag data-behavior="Filter1 Filter2" data-filter1-options="{'opt1': 'foo', 'opt2': 'bar'}" data-filter1-selector=".selector">
	<tag data-behavior="Filter1 Filter2" data-filter1-opt1='foo' data-filter1-opt2='false' data-filter1-selector=".selector">

The `-options` value is parsed as JSON first (it's slightly more permissive in that you don't have to wrap it in `{}` just for convenience). Values defined here are read as defined allowing you to express arrays, numbers, booleans, etc. Functions / callbacks are generally not used by [Behavior][].

If you attempt to read a value that isn't defined in this options object, the property name is attempted to be read from the property directly (e.g. `data-behaviorname-prop`). This value is *always* a string unless you specify a type. If a type is specified the value is run through the JSON parser and validated against that type.

Note that filter names that contain characters other than A-Z, 0-9, or dash are stripped and what remains is case insensitive. Dots are turned to dashes. Further, camelCase properties are hyphenated to camel-case. So, for example, you would express the following:

	<tag data-behavior="Foo.Bar" data-foo-bar-options="'someThing': true">
	//and - note the hyphenation
	<tag data-behavior="Foo.Bar" data-foo-bar-some-thing="true">

BehaviorAPI Method: get {#BehaviorAPI:get}
------------------------------------------

Gets a value for the specified name.

### Syntax

	api.get(name[, name, name, name])

### Arguments

1. name - (*string*) The name of the property you wish to retrieve. Pass more than one to get back multiple.

### Example

	var api = new BehaviorAPI(target, 'foo');
	api.get('bar'); //returns the value of data-foo-bar or null
	api.get('bar', 'baz'); //returns {bar: 'value', baz: 'value'}

### Returns

* (*mixed*) Values defined as strings will be returned as strings. Values defined in JSON will be returned as their
	type is evaluated. When you expect anything other than a string it's better to use [getAs](#BehaviorAPI:getAs).
	When more than one name is specified you'll receive an object response with key/value pairs for the name/property values.

BehaviorAPI Method: getAs {#BehaviorAPI:getAs}
------------------------------------------

Gets a value for the specified name and runs it through [JSON.decode][] and verifies that the value is parsed as the specified type (specifically a MooTools Type: [String](http://mootools.net/docs/core/Types/String), [Function](http://mootools.net/docs/core/Types/Function), [Array](http://mootools.net/docs/core/Types/Array), [Date](http://mootools.net/docs/more/Types/Date), etc.).

### Syntax

	api.getAs(Type, name[, defaultValue]);

### Arguments

1. Type - (*Type*) A MooTools Type instance (a function) that the value, when run through [JSON.decode][], should return
2. name - (*string*) The name of the value to read.
3. defaultValue - (*mixed*) The value to set if there no value found.

### Example

	var api = new BehaviorAPI(target, 'foo');
	api.getAs(Number, 'some-number');

### Returns

* (*mixed*) Either returns the value as the Type you specified, the default (if provided), or undefined.

BehaviorAPI Method: require {#BehaviorAPI:require}
------------------------------------------

Validates that an element has a value set for a given name. Throws an error if the value is not found.

### Syntax

	api.require(name[, name, name]);

### Arguments

1. name - (*string*) The name of the property you wish to require. Pass more than one if needed.

### Example

	var api = new BehaviorAPI(target, 'foo');
	api.require('foo'); //throws an error if data-foo-foo is not set
	api.require('foo', 'bar'); //throws an error if data-foo-foo or data-foo-bar are not set

### Returns

* *object* - the instance of BehaviorAPI.

BehaviorAPI Method: requireAs {#BehaviorAPI:requireAs}
------------------------------------------

Requires that an element has a value set for a given name that can be parsed into a given type (using [JSON.decode][]). If a value is not present or does not parse to the specified Type an error is thrown.

### Syntax

	api.requireAs(obj);

### Arguments

1. obj - (*object*) a set of name/Type pairs to require.

### Example

	api.requireAs({
		option1: Number,
		option2: Boolean
	});

### Returns

* *object* - the instance of BehaviorAPI.

BehaviorAPI Method: setDefault {#BehaviorAPI:setDefault}
------------------------------------------

Sets the default values. Note that setting defaults for required properties is not useful.

### Syntax

	api.setDefault(name, value);
	api.setDefault(obj);

### Arguments

1. name - (*string*) The name of the property you wish to set.
2. value - (*mixed*) The default value for the given name.

OR

1. obj - (*object*) a set of name/value pairs to use if the element doesn't have values present.

### Example

	api.setDefault('duration', 1000);
	api.setDefault({
		duration: 1000,
		link: 'chain'
	});

### Returns

* *object* - the instance of BehaviorAPI.

BehaviorAPI Method: refreshAPI {#BehaviorAPI:refreshAPI}
------------------------------------------

The API class caches values read from the element to avoid the cost of DOM interaction. Once you read a value, it is never read from the element again. If you wish to refresh this to re-read the element properties, invoke this method. Note that default values are maintained.

### Syntax

	api.refreshAPI();

### Returns

* *object* - the instance of BehaviorAPI.

[Behavior]: Behavior.md
[JSON.decode]: http://mootools.net/docs/core/Utilities/JSON#JSON:decode