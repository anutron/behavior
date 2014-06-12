Behavior Filter: Behavior.Trigger {#Behavior.Trigger}
====================================

Because Delegator is inefficient for mouse over/out events, this behavior
allows you to invoke delegator triggers on elements when they occur using
normal event monitoring.


### Example

	<div data-behavior="Trigger"
	    data-trigger-options="
	      'triggers': [
	        {
	          'events': ['mouseover', 'focus'], //which events to monitor
	          'targets': {
	            'div.monitorMouseOver': { //elements whose events we monitor
	              'div.foo::addClass': { //selector for elements to invoke trigger :: trigger name
	                'class': 'foo', //api options for trigger
	                'if': {
	                  'div.bar::hasClass': ['boo']
	                }
	              }
	            }
	          }
	        }
	      ]
	    "
	>...</div>


### Options

* triggers - (*array*) Array of configurations for triggers (see below)

### Triggers

Each trigger listed includes the events to monitor (i.e. `click`) and a list of selectors that are
used to find the targets to monitor. The events are attached using traditional `addEvent` calls (instead
of using event delegation) on the elements that match this selector.


### Notes

* updates to the DOM that include new elements that match that selector will not have their events monitored.