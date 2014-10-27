Behavior Filter: Behavior.Events {#Behavior.Events}
====================================

Provides mechanism to invoke a Delegator trigger when an instance created by a Behavior filter fires an event.

### Note

Behavior executes filters in DOM order. For this reason, the `addEvents` filter always fires after Behavior
fires it's `apply` event (after it has run through the DOM). This means that a) any filter that has a delay on it
(and doesn't return an instance on startup) will not work with `addEvent` and b) that any instance that `addEvent`
references has already been instantiated. So if you are attaching an event to a class that fires, say, a `show`
event whenever it changes something, but it does so immediately on instantiation, then that first event will have
already been fired before your listener is attached. In this case, some additional startup logic is required on your
part - either change your DOM accordingly to have a startup state or use `Behavior.Startup` to invoke the
proper delegator based on the DOM state.

### Example

    <div data-behavior="addEvent" data-addevent-options="
      'events': {
        '.foo::BehaviorName': {
          'show': [
            {
              '.bar::addClass': {
                'class': 'hide',
                'if': {
                  'self::hasClass': 'baz'
                }
              }
            },
            {
              '.biz::removeClass': {
                'class': 'hide',
                'if': {
                  'eventArguments[1]': true  // triggers if the 2nd argument passed to the onShow event == true
                }
              }
            },
            {
              '.boz::removeClass': {
                'class': 'hide',
                'if': {
                  'instance.now': 0   // triggers if the instance returned by BehaviorName has a 'now' property == 0
                }
              }
            },
            {
              '.boz::removeClass': {
                'class': 'hide',
                'if': {
                  'instance.getNow()': 0  // triggers if the instance returned by BehaviorName has a `getNow`
                }                         // method that, when invoked with no arguments, == 0
              }
            },
            {
              '.buz::removeClass': {
                'class': 'hide',
                'if': {
                  'instance.getNow()': 0,  // triggers if the instance returned by BehaviorName has a `getNow` method
                  'arguments': ['foo']     // that returns 0 when invoked with the argument 'foo' (i.e. instance.getNow('foo') == 0)
                }
              }
            }
          ]
        }
      }
    "></div>

### Options

* events - (*object*) a set of targets, the behavior filter that generated the instance, and events to monitor and the triggers to invoke when they are fired

### Basic Syntax

    data-addevent-options="
      'events': {
        '.foo::BehaviorName': {            // .foo is the element to find relative to this one, BehaviorName is the filter that generated the instance
          'show': [                        // show is the event to listen for on the instance returned by BehaviorName
            {
              '.bar::addClass': {          // .bar is the element to fire the addClass trigger upon
                'class': 'hide',           // an argument passed to that trigger
                'if': {                    // but only if this conditional is true.
                  'self::hasClass': 'baz'
                }
              }
            }
          ]
        }
      }
    "



### Conditionals

See the notes about Conditionals in the Delegator docs. Those provided by Delegator are the basic checks against element methods or element properties as with the example above. However, Behavior.Events provides three additional conditional checks:

#### Checking event arguments

This allows you to fire a trigger if (or unless) the event fired on the instance received an argument of your specification. Example:

    data-addevent-options="
      'events': {
        '.foo::BehaviorName': {
          'show': [
            {
              '.bar::addClass': {
                'class': 'hide',
                'if': {
                  'eventArguments[0]': 'foo',
                  'eventArguments[1]': 'bar'
                }
              }
            }
          ]
        }
      }
    "

In this example, the `onShow` event must have been passed two (or more) arguments: `'foo'`, and `'bar'`. Both must match.

#### Checking instance properties

This allows you to fire a trigger if (or unless) a specified property on the instance matches a value

    data-addevent-options="
      'events': {
        '.foo::BehaviorName': {
          'show': [
            {
              '.bar::addClass': {
                'class': 'hide',
                'if': {
                  'instance.foo': 'bar',
                  'instance.baz': 'biz'
                }
              }
            }
          ]
        }
      }
    "

In this example, the trigger will be invoked when the `onShow` event fires but only if the instance that was created by the `BehaviorName` filter on the `.foo` element has a `.foo` property equalling `'bar'` and `.baz` property equalling `'biz'`.

#### Checking instance methods

This allows you to fire a trigger if (or unless) a specified method on the instance returns a value

    data-addevent-options="
      'events': {
        '.foo::BehaviorName': {
          'show': [
            {
              '.bar::addClass': {
                'class': 'hide',
                'if': {
                  'instance.foo()': 'bar',
                  'arguments': ['an argument to pass to foo()']
                }
              }
            }
          ]
        }
      }
    "

In this example, the trigger will be invoked when the `onShow` event fires but only if the instance that was created by the `BehaviorName` filter on the `.foo` element has a `.foo` *method* that, when called with the argument `'an argument to pass to foo()'` returns `'bar'`. If you don't specify the `arguments` value it just invokes the method.
