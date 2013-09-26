/*
---
name: Delegator.VerifyTargets
description: Extends Delegator to verify that it's specified targets are present
             and meet the specified conditions
requires: [/Behavior, /Delegator]
provides: [Delegator.verifyTargets]
...
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