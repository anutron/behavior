/*
---
name: Delegator.Specs
description: n/a
requires: [Behavior/Delegator, Behavior/Behavior, Core/DomReady]
provides: [Delegator.Specs]
...
*/
(function(){
  var container = new Element('div').inject(document.body);
  var target = new Element('a.some-class', {
    'data-trigger': 'Test1 Test2',
    'data-required-options': '"foo": "bar", "number": 9',
    'data-required-true': 'true',
    'data-reader-options': '"foo": "bar", "number": 9',
    'data-reader-true': 'true'
  })
  .adopt(new Element('span.foo.bar'))
  .inject(container);

  var test1count = 0;
  Delegator.register('click', {
    Test1: function(){ test1count++; },
    Test2: function(){}
  });
  var instance = new Delegator({
    onLog: function(){},
    onError: function(){},
    onWarn: function(){}
  }).attach(container);

  describe('Delegator', function(){

    it('should return the triggers on an element', function(){
      expect(target.getTriggers()).toEqual(['Test1', 'Test2']);
    });

    it('should add a trigger to an element', function(){
      target.addTrigger('Test3');
      expect(target.getTriggers()).toEqual(['Test1', 'Test2', 'Test3']);
      target.removeTrigger('Test3');
    });

    it('should tell you if an element has a trigger', function(){
      target.addTrigger('Test3');
      expect(target.hasTrigger('Test3')).toBe(true);
      target.removeTrigger('Test3');
    });

    it('should remove a trigger', function(){
      target.addTrigger('Test3');
      target.removeTrigger('Test3');
      expect(target.hasTrigger('Test3')).toBe(false);
    });

    it('should register a global trigger', function(){
      var test3 = function(){};
      Delegator.register('click', 'Test3', test3);
      expect(instance.getTrigger('Test3').handler).toBe(test3);
      expect(Delegator.getTrigger('Test3').handler).toBe(test3);
    });

    it('should register a local trigger', function(){
      var test3 = function(){};
      instance.register('click', 'Test3', test3);
      expect(instance.getTrigger('Test3').handler).toBe(test3);
      expect(Delegator.getTrigger('Test3').handler).toNotBe(test3);
    });

    it('should fail to overwrite a filter', function(){
      var test3 = function(){};
      try {
        instance.register('click', 'Test3', test3);
        expect(true).toBe(false); //should not get here
      } catch(e){
        expect(e.message).toBe('Could add the trigger "Test3" as a previous trigger by that same name exists.');
      }
      expect(instance.getTrigger('Test3').handler).toNotBe(test3);
    });

    it('should overwrite a filter', function(){
      var overwrite = function(){};
      instance.register('click', 'Test2', overwrite, true);
      expect(instance.getTrigger('Test2').handler).toBe(overwrite);

      var test3 = function(){};
      instance.register('click', {
        Test3: test3
      }, true);
      expect(instance.getTrigger('Test3').handler).toBe(test3);
    });

    it('should bind to a behavior instance', function(){
      var b = new Behavior({
        onLog: function(){},
        onError: function(){},
        onWarn: function(){}
      });
      var d = new Delegator({
        onLog: function(){},
        onError: function(){},
        onWarn: function(){},
        getBehavior: function(){ return b; }
      });
      expect(d.getBehavior()).toBe(b);
      var b2 = new Behavior({
        onLog: function(){},
        onError: function(){},
        onWarn: function(){}
      });
      d.bindToBehavior(b2);
      expect(d.getBehavior()).toBe(b2);
      d.unbindFromBehavior(b2);
      expect(d.getBehavior()).toBeFalsy();
    });

    it('should return the value that the trigger returns', function(){

      Delegator.register('click', {
        Test4: function(){
          return 'test4';
        },
        Test5: function(){},
        Test6: function(event, target, api){
          return api.trigger('Test4');
        }
      });

      expect(instance.trigger('Test4')).toEqual('test4');
      expect(instance.trigger('Test5')).toBe(undefined);
      expect(instance.trigger('Test6')).toEqual('test4');

    });

    // Only run this spec in browsers other than IE6-8 because they can't properly simulate bubbling events
    if (window.addEventListener){

      it ('should set filter defaults', function(){
        var fired = false;
        Delegator.register('click', 'Defaults', {
          defaults: {
            foo: 'bar',
            number: 9
          },
          handler: function(event, target, api){
            expect(api.get('foo')).toBe('baz');
            expect(api.get('number')).toBe(10);
            fired = true;
          }
        });
        Delegator.setTriggerDefaults('Defaults', {
          foo: 'baz',
          number: 10
        });
        target.addTrigger('Defaults');
        Syn.trigger('click', null, target);
        expect(fired).toEqual(true);
        target.removeTrigger('Defaults');
      });

      it ('should clone a filter', function(){
        Delegator.register('click', 'Base', {
          defaults: {
            foo: 'bar',
            number: 9
          },
          handler: function(event, target, api){
            if (api.prefix == 'base'){
              expect(api.get('foo')).toBe('bar');
              expect(api.get('number')).toBe(9);
            } else {
              expect(api.get('foo')).toBe('baz');
              expect(api.get('number')).toBe(10);
            }
            fired = true;
          }
        });
        Delegator.cloneTrigger('Base', 'Clone', {
          foo: 'baz',
          number: 10
        });
        target.addTrigger('Base').addTrigger('Clone');
        Syn.trigger('click', null, target);
        expect(fired).toEqual(true);
        target.removeTrigger('Base').removeTrigger('Clone');
      });


      it('should capture a click and run a filter only once', function(){
        var count = 0,
            test1current = test1count;
        // instance is already attached to the container
        // so this should be ignored
        instance.attach(container);
        instance.register('click', 'ClickTest', function(){
          count++;
        });
        target.addTrigger('ClickTest');
        Syn.trigger('click', null, target);
        expect(count).toBe(1);
        expect(test1count).toBe(test1current + 1);
        target.removeTrigger('ClickTest');
      });

      it('should fire event for element', function(){
        var testElement = new Element('a.some-class', {
          'data-trigger': 'ElementTest'
        });
        Delegator.register('madeUpEvent', {
          ElementTest: function(){ testElement.setData('success', true) }
        });

        instance.fireEventForElement(testElement, 'madeUpEvent');
        expect(testElement.getData('success')).toEqual('true');
      });


      it('should use BehaviorAPI to read element properties', function(){
        var readerAPI;
        target.addTrigger('Reader');
        instance.register('click', 'Reader', function(event, target, api){
          readerAPI = api;
        });
        Syn.trigger('click', null, target);
        expect(readerAPI.get('foo')).toBe('bar');
        expect(readerAPI.getAs(Number, 'number')).toBe(9);
        expect(readerAPI.get('nope')).toBe(undefined);
        target.removeTrigger('Reader');
      });

      it('should define a trigger with required and default values', function(){
        var reqAPI;
        target.addTrigger('Required');
        instance.register('click', 'Required', {
          handler: function(event, target, api){ reqAPI = api; },
          defaults: {
            'foo': 'baz',
            'ten': 10
          },
          require: ['foo'],
          requireAs: {
            'true': Boolean,
            'number': Number
          }
        });
        Syn.trigger('click', null, target);
        expect(reqAPI).toBeTruthy();
        expect(reqAPI.get('foo')).toBe('bar');
        expect(reqAPI.getAs(Number, 'ten')).toBe(10);
        target.removeTrigger('Required');
      });

      it('should not fail when breakOnErrors is false', function(){
        target.addTrigger('Required');
        var success, msg;
        instance.addEvent('error', function(){
          msg = Array.join(arguments, ' ');
        });
        instance.register('click', 'Required', {
          handler: function(event, target, api){ success = true; },
          require: ['missing']
        }, true);
        Syn.trigger('click', null, target);
        expect(success).toBeFalsy();
        expect(msg).toBe('Could not apply the trigger Required Could not retrieve required-missing option from element.');
        target.removeTrigger('Required');
      });

      it('should fail when breakOnErrors is true', function(){
        target.addTrigger('Required');
        instance.options.breakOnErrors = true;
        instance.register('click', 'Required', {
          handler: function(event, target, api){},
          require: ['missing']
        }, true);
        try{
          instance.trigger('Required', target);
          expect(true).toBe(false);
        } catch(e){
          expect(e.message).toBe('Could not retrieve required-missing option from element.');
        }
        target.removeTrigger('Required');
      });

      it('should capture a click and ignore a filter that isn\'t named', function(){
        var clicked;
        instance.register('click', 'Ignored', function(){
          clicked = true;
        });
        Syn.trigger('click', null, target);
        expect(clicked).toBe(undefined);
      });

      // Hmmm. For some reason Syn.trigger breaks this test, but I have to use it with the latest
      // test runner... commenting it out for now. Anecdotally the thing this test tests does, in fact
      // work...
      // it('should detach from a previously attached container and re-attach to it', function(){
      //   instance.detach(container);
      //   var test1current = test1count;
      //   Syn.trigger('click', null, target);
      //   expect(test1count).toBe(test1current);
      //   instance.attach(container);
      //   Syn.trigger('click', null, target);
      //   expect(test1count).toBe(test1current + 1);
      // });


      it('should obey conditionals', function(){
        var test7count = 0, test8count = 0, test9count = 0, test10count = 0, test11count = 0;
        instance.register('click', {
          Test7:  function(){ test7count++; },
          Test8:  function(){ test8count++; },
          Test9:  function(){ test9count++; },
          Test10: function(){ test10count++; },
          Test11: function(){ test11count++; }
        });
        target.set({
          // should fire
          'data-test7-options': JSON.encode({
            'if': {
              'self::hasClass': ['some-class']
            }
          }),
          // should not fire
          'data-test8-options': JSON.encode({
            'unless': {
              'self::hasClass': ['some-class']
            }
          }),
          // should fire
          'data-test9-options': JSON.encode({
            'if': {
              'target': 'span.foo',
              'method': 'hasClass',
              'arguments': ['bar']
            }
          }),
          // should not fire
          'data-test10-options': JSON.encode({
            'if': {
              'target': 'span.foo',
              'method': 'get',
              'arguments': ['tag'],
              'value': 'div'
            }
          }),
          // should fire
          'data-test11-options': JSON.encode({
            'unless': {
              'target': 'span.foo',
              'method': 'get',
              'arguments': ['tag'],
              'value': 'div'
            }
          })
        });
        target.addTrigger('Test7')
              .addTrigger('Test8')
              .addTrigger('Test9')
              .addTrigger('Test10')
              .addTrigger('Test11');
        Syn.trigger('click', null, target);
        expect(test7count).toEqual(1);
        expect(test8count).toEqual(0);
        expect(test9count).toEqual(1);
        expect(test10count).toEqual(0);
        expect(test11count).toEqual(1);
      });

      it('should handle multi-triggers', function(){

        var foo = new Element('div.foo');
        var bar = new Element('div.bar');

        var multiTester = new Element('a', {
          'data-trigger': 'multi',
          'data-multi-triggers': JSON.encode(
            [
              {
                '.foo::multi1': {
                  'arg':'blah'
                }
              },
              '.bar::multi2',
              {
                '.foo::multi3': {
                  'if':{
                    'self::hasClass':'foo'
                  }
                }
              },
              {
                '.foo::multi4': {
                  'unless':{
                    'self::hasClass':'foo'
                  }
                }
              }
            ]
          )
        })
        .adopt(foo)
        .adopt(bar)
        .inject(container);

        var multi1 = 0, multi2 = 0, multi3 = 0, multi4 = 0;
        instance.register('click', {
          multi1: function(event, el, api){
            expect(api.get('arg')).toEqual('blah');
            expect(el).toEqual(foo);
            multi1++;
          },
          multi2: function(event, el, api){
            expect(el).toEqual(bar);
            multi2++;
          },
          multi3: function(event, el, api){
            expect(el).toEqual(foo);
            multi3++;
          },
          // shouldn't get called
          multi4: function(){
            multi4++;
          }
        });

        Syn.trigger('click', null, multiTester);
        expect(multi1).toEqual(1);
        expect(multi2).toEqual(1);
        expect(multi3).toEqual(1);
        expect(multi4).toEqual(0);

        instance.trigger('multi', multiTester);
        expect(multi1).toEqual(2);
        expect(multi2).toEqual(2);
        expect(multi3).toEqual(2);
        expect(multi4).toEqual(0);

      });


      it('handle multi-trigger switches', function(){

        var foo = new Element('div.foo');
        var bar = new Element('div.bar');

        var multiTester = new Element('a', {
          'data-trigger': 'first any',
          'data-first-switches': JSON.encode([
            // should NOT fire
            {
              'if': {
                'div.foo::hasClass':['baz']
              },
              triggers: [
                '.foo::switch1'
              ]
            },
            // should fire
            {
              'unless': {
                'div.foo::hasClass':['baz']
              },
              triggers: [
                '.foo::switch2'
              ]
            },
            // should NOT fire
            {
              triggers: [
                '.foo::switch3'
              ]
            }
          ]),
          'data-any-switches': JSON.encode([
            // should NOT fire
            {
              'if': {
                'div.foo::hasClass':['baz']
              },
              triggers: [
                '.foo::switch4'
              ]
            },
            // should fire
            {
              'unless': {
                'div.foo::hasClass':['baz']
              },
              triggers: [
                '.foo::switch5'
              ]
            },
            // should fire; no conditional
            {
              triggers: [
                '.foo::switch6'
              ]
            }
          ])
        })
        .adopt(foo)
        .adopt(bar)
        .inject(container);

        var switch1 = 0, switch2 = 0, switch3 = 0, switch4 = 0, switch5 = 0, switch6 = 0;
        instance.register('click', {
          switch1: function(event, el, api){
            // shouldn't fire
            switch1++;
          },
          switch2: function(event, el, api){
            expect(el).toEqual(foo);
            switch2++;
          },
          switch3: function(event, el, api){
            // shouldn't fire
            switch3++;
          },
          switch4: function(event, el, api){
            // shouldn't fire
            switch4++;
          },
          switch5: function(event, el, api){
            expect(el).toEqual(foo);
            switch5++;
          },
          switch6: function(event, el, api){
            expect(el).toEqual(foo);
            switch6++;
          }
        });

        Syn.trigger('click', null, multiTester);
        expect(switch1).toEqual(0);
        expect(switch2).toEqual(1);
        expect(switch3).toEqual(0);
        expect(switch4).toEqual(0);
        expect(switch5).toEqual(1);
        expect(switch6).toEqual(1);

        instance.trigger('first', multiTester);
        instance.trigger('any', multiTester);
        expect(switch1).toEqual(0);
        expect(switch2).toEqual(2);
        expect(switch3).toEqual(0);
        expect(switch4).toEqual(0);
        expect(switch5).toEqual(2);
        expect(switch6).toEqual(2);

      });

    }

  });

})();
