/*
---
name: Behavior.Startup
description: Invokes delegators on startup when specified conditions are met.
requires: [/Behavior, /Delegator, /Delegator.verifyTargets]
provides: [Behavior.Startup]
...
*/
(function(){
  Behavior.addGlobalFilter('Startup', {
    setup: function(el, api){
      //get the delegators to set up
      var delegators = api.get('delegators');
      if (delegators){
        Object.each(delegators, function(conditional, delegator){
          var timer =(function(){
            //if any were true, fire the delegator ON THIS ELEMENT
            if (Delegator.verifyTargets(el, conditional, api)) {
              api.getDelegator().trigger(delegator, el);
            }
          }).delay(conditional.delay || 0)
          api.onCleanup(function(){
            clearTimeout(timer);
          });
        });
      }
    }
  });
})();
