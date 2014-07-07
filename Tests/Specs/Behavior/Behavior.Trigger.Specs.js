/*
---
name: Behavior.Trigger.Specs
description: n/a
requires: [Behavior/Behavior.Trigger, Behavior-Tests/Behavior.SpecsHelpers]
provides: [Behavior.Trigger.Specs]
...
*/
if (window.describe){

  describe('Behavior.Trigger', function(){

    var b = new Behavior({
      onLog: function(){},
      onError: function(){},
      onWarn: function(){}
    });
    var d = new Delegator({
      onLog: function(){},
      onError: function(){},
      onWarn: function(){},
      getBehavior: function(){return b;}
    });
    b.setDelegator(d);
    Delegator.register('click', {
      addClass: function(event, element, api){
        element.addClass(api.get('class'));
      }
    });

    var child = new Element('div.child');

    var div = new Element('div.inner', {
      'data-behavior': 'Trigger',
      'data-trigger-options':
        JSON.encode({
          'triggers': [
            {
              'events': ['click'], //which events to monitor
              'targets': {
                '> div': { //elements whose events we monitor
                  'self::addClass': { //selector for elements to invoke trigger :: trigger name
                    'class': 'success' //api options for trigger
                  }
                }
              }
            }
          ]
        })
    }).adopt(child);

    var dom = new Element('div').adopt(div);

    b.apply(dom);
    d.attach(dom);
    Syn.click({}, child);
    it('Expects the trigger to have invoked the delegator', function(){
      expect(child.hasClass('success')).toBe(true);
    });
  });
}
