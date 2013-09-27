/*
---
name: Delegator.VerifyTargets
description: Provides a static method on Delegator to verify that its specified
             targets are present and meet the specified conditions
requires: [/Behavior, /Delegator]
provides: [Delegator.verifyTargets]
...
*/

/*
  See

  The passed-in delegator will be invoked if the conditional is true. Conditionals have the following properties:

  * target - (*string*) a css selector *relative to the element* to find a single element to test.
  * targets - (*string*) a css selector *relative to the element* to find a group of elements to test. If the conditional is true for any of them, the delegator is fired.
  * property - (*string*) a property of the target element to evaluate. Do not use with the `method` option.
  * method - (*string*) a method on the target element to invoke. Passed as arguments the `arguments` array (see below). Do not use with the `property` option.
  * arguments - (*array* of *strings*) arguments passed to the method of the target element specified in the `method` option. Ignored if the `property` option is used.
  * value - (*string*) A value to compare to either the value of the `property` of the target or the result of the `method` invoked upon it.
  * delay - (*number*) If set, the trigger will be invoked after this many milliseconds have passed.

*/


Delegator.verifyTargets = function(el, conditional, delegator, api){
  var targets = [];
  // get the target of these delegators
  if (conditional.targets){
    targets = el.getElement(conditional.targets);
  } else if (conditional.target && conditional.target != 'self'){
    var target = el.getElement(conditional.target);
    if (target) targets = new Elements([target]);
  } else {
    targets = new Elements([el]);
  }
  if (targets.length == 0) api.fail('could not find targets for specified delegator: ', delegator, conditional.targets);
  // check the targets for the conditionals
  return targets.some(function(target){
    if (conditional.property) return target.get(conditional.property) === conditional.value;
    else if (conditional.method) return target[conditional.method].apply(target, conditional.arguments || []) === conditional.value;
    else return (!conditional.method && !conditional.property)
  });
};