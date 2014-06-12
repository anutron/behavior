/*
---

name: Behavior.Trigger

description: Because Delegator is inefficient for mouse over/out events, this behavior
             allows you to invoke delegator triggers on elements when they occur using
             normal event monitoring.

requires:
 - Behavior
 - Delegator

provides: [Behavior.Trigger]

...
*/

/*

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

  on mouse over of any div.foo, the addClass trigger is invoked
  IF div.bar has the class .boo.

*/

Behavior.addGlobalFilter('Trigger', {

  requireAs: {
    triggers: Array
  },

  setup: function(element, api){
    var delegator = api.getDelegator();
    if (!delegator) api.fail('MouseTrigger behavior requires that Behavior be connected to an instance of Delegator');

    api.getAs(Array, 'triggers').each(function(triggerConfig){



      // get the configuration for mouseover/mouseout
      Object.each(triggerConfig.targets, function(triggers, selector){
        // get the selector for the elements to monitor
        var eventTargets = Behavior.getTargets(element, selector);
        // loop over the elements that match
        console.log('targets:', eventTargets);
        eventTargets.each(function(eventTarget){
          // add our mouse event on each target

          var eventHandler = function(event){
            // when the user mouses over/out, loop over the triggers
            Object.each(triggers, function(config, trigger){
              // split the trigger name - '.foo::addClass' > {name: addClass, selector: .foo}
              trigger = delegator._splitTriggerName(trigger);
              if (!trigger) return;

              // iterate over the elements that match that selector using the event target as the root
              Behavior.getTargets(eventTarget, trigger.selector).each(function(target){
                var api;
                // create an api for the trigger/element combo and set defaults to the config (if config present)
                if (config) api = delegator._getAPI(target, trigger).setDefault(config);
                // invoke the trigger
                delegator.trigger(trigger.name, target, event, true, api);
              });
            });
          };

          Array.from(triggerConfig.events).each(function(eventType){
            eventType = {mouseover: 'mouseenter', mouseout: 'mouseleave'}[eventType] || eventType;
            eventTarget.addEvent(eventType, eventHandler);
          });
        });
      });

    });
  }
});