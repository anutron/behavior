Behavior Filter: Behavior.Startup {#Behavior.Startup}
====================================

Invokes delegators on startup when specified conditions are met. This allows you to check the state of elements in the DOM and invoke some action that is appropriate. It's especially useful for form inputs where the client (browser) maintains a state if the user reloads.

### Example

	<input type="checkbox" data-trigger="toggleReveal" data-togglereveal-options="
		'target': '.foo'
	" data-behavior="Startup" data-startup-options="
		'delegators': {
			'reveal': {
				'target': 'self',
				'property': 'checked'
				'value': true
			},
			'dissolve': {
				'targets': '.severalThings',
				'method': 'hasClass',
				'arguments': ['.someClass'],
				'value': true
			}
		}
	"/> enable

### Options

* delegators - (*object*) a set of delegators to fire if their conditionals are true.

### Conditionals

Each delegator listed will be invoked if their conditional is true. The delegator name is the key, and the value is an object with the following properties:

* target - (*string*) a css selector *relative to the element* to find a single element to test.
* targets - (*string*) a css selector *relative to the element* to find a group of elements to test. If the conditional is true for any of them, the delegator is fired.
* property - (*string*) a property of the target element to evaluate. Do not use with the `method` option.
* method - (*string*) a method on the target element to invoke. Passed as arguments the `arguments` array (see below). Do not use with the `property` option.
* arguments - (*array* of *strings*) arguments passed to the method of the target element specified in the `method` option. Ignored if the `property` option is used.
* value - (*string*) A value to compare to either the value of the `property` of the target or the result of the `method` invoked upon it.
* delay - (*number*) If set, the trigger will be invoked after this many milliseconds have passed.

### Notes

* delegator conditionals that do not have a `property` OR `method` setting will always be invoked.
* This behavior (like all others) is only applied once (on startup or when new content is run through `Behavior.apply`). Be careful as this adds a startup cost to delegators; use wisely.