Native: Element {#Element}
==========================

Extends the [Element][] native object with methods useful for working with HTML5 data properties.

Element Method: setData {#Element:setData}
------------------------------------------

Sets a value for a given data property.

### Syntax

	myDiv.setData(name, value)

### Example

	myDiv.setData('foo-bar', 'baz');
	//result: <div data-foo-bar="baz"></div>

### Returns

* (*element*) the element

Element Method: getData {#Element:getData}
------------------------------------------

Gets a value for a given data property.

### Syntax

	myDiv.getData(name, defaultValue)

### Arguments

1. name - (*string*) the data property to get; this is prepended with "data-".
2. defaultValue - (*string, number*) the value to assign if none is set.

### Example

	myDiv.getData('foo-bar');
	//returns "baz" from: <div data-foo-bar="baz"></div>

### Returns

* (*string*) the value if found, otherwise *null*.

Element Method: setJSONData {#Element:setJSONData}
------------------------------------------

Sets a value for a given data property, encoding it into JSON.

### Syntax

	myDiv.setJSONData(name, object)

### Example

	myDiv.setJSONData('foo-bar', [1, 2, 'foo','bar']);
	//result: <div data-foo-bar='"[1, 2, \'foo\', \'bar\']"'></div>

### Returns

* (*element*) the element

Element Method: getJSONData {#Element:getJSONData}
------------------------------------------

Gets a value for a given data property, parsing it from JSON.

### Syntax

	myDiv.getJSONData(name, strict, defaultValue)

### Arguments

1. name - (*string*) the data property to get; this is prepended with "data-".
2. strict - (*boolean*) if *true*, will set the *JSON.decode*'s secure flag to *true*; otherwise the value is still tested but allows single quoted attributes.
3. defaultValue - (*string, number*) the value to assign if none is set.

### Example

	myDiv.getData('foo-bar');
	//returns [1, 2, 'foo','bar'] from: <div data-foo-bar='"[1, 2, \'foo\', \'bar\']"'></div>

### Returns

* (*object*) the value if found, otherwise *null*.

