/*
---
name: Delegator.verifyTargets
description: Provides a static method on Delegator to verify that its specified
             targets are present and meet the specified conditions
requires: [/Behavior, /Delegator]
provides: [Delegator.verifyTargets]
...
*/

(function(){

  /*
    conditional = the parsed json conditional configuration. Examples:

    <a data-trigger="foo" data-foo-options="
      'if': {
        'self::hasClass': ['bar']
      }
    ">
    This passes { 'self::hasClass': ['bar'] } through this parser
    which interpolates the 'self::hasClass' statement into an object that
    has the arguments specified below for verifyTargets, returning:
    {
      targets: 'self',
      method: 'hasClass',
      arguments: ['bar']
    }
  */
  var parseConditional = function(conditional){
    Object.each(conditional, function(value, key){
      if (key.contains('::')){
        conditional.targets = key.split('::')[0];
        conditional.method = key.split('::')[1];
        conditional.arguments = value;
      }
    });
    if (conditional.value === undefined) conditional.value = true;
    return conditional;
  };

  /*
    Conditionals have the following properties:

    * target - (*string*) a css selector *relative to the element* to find a single element to test.
    * targets - (*string*) a css selector *relative to the element* to find a group of elements to test. If the conditional is true for any of them, the delegator is fired.
    * property - (*string*) a property of the target element to evaluate. Do not use with the `method` option.
    * method - (*string*) a method on the target element to invoke. Passed as arguments the `arguments` array (see below). Do not use with the `property` option.
    * arguments - (*array* of *strings*) arguments passed to the method of the target element specified in the `method` option. Ignored if the `property` option is used.
    * value - (*string*) A value to compare to either the value of the `property` of the target or the result of the `method` invoked upon it.

  */
  Delegator.verifyTargets = function(el, conditional, api){
    var targets = [];

    conditional = parseConditional(conditional);

    // get the targets
    var targets = Behavior.getTargets(el, conditional.targets || conditional.target);
    if (targets.length == 0) api.fail('could not find target(s): ', conditional.targets || conditional.target);
    // check the targets for the conditionals
    return targets.some(function(target){
      if (conditional.property) return target.get(conditional.property) === conditional.value;
      else if (conditional.method) return target[conditional.method].apply(target, Array.from(conditional.arguments)) === conditional.value;
      else return (!conditional.method && !conditional.property)
    });
  };

})();