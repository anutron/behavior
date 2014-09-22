/*
---
name: Behavior.SpecsHelpers
description: n/a
requires: [Behavior/Behavior]
provides: [Behavior.SpecsHelpers]
...
*/

//simple class that adds a class name and counts how many times it's been applied
var ClassAdder = new Class({
  initialize: function(element, className){
    this.element = element.addClass(className);
    this.className = className;
    this.setCount(this.getCount() + 1);
  },
  getCount: function(){
    return (this.element.getData('class-adder-count-' + this.className) || 0).toInt();
  },
  setCount: function(count){
    this.element.setData('class-adder-count-' + this.className, count);
  },
  destroy: function(){
    this.element.removeClass(this.className);
  }
});

//a vanilla behavior instance
var behaviorInstance = new Behavior({
  onLog: function(){},
  onError: function(){},
  onWarn: function(){}
});
//returns a Behavior.Filter setup function that creates a ClassAdder instance (see above)
//for a specified CSS className
ClassAdder.makeAdder = function(className){
  return function(el, API){
    var adder = new ClassAdder(el, className);
    API.markForCleanup(el, function(){
      adder.destroy();
    });
    return adder;
  };
};
(function(){
  //given a peice of content (either an HTML string or a DOM tree)
  //multiply it by a given number of times and return it
  var multiplyContent = function(content, times){
    var combo;
    if (typeOf(content) == 'string'){
      combo = content;
      (times - 1).times(function(){
        combo += content;
      });
    } else {
      combo = new Element('div');
      times.times(function(){
        combo.adopt(content.clone(true, true));
      });
    }
    return combo;
  };

  if (window.MooBench){
    /**
      defines a convenience method for adding benchmarks
      note that you should use Behavior.addFilterTest instead of this method directly
      options is an object with:
        desc - the name of the test as displayed on the screen
        content - an HTML string or a DOM tree to run behaviorInstance.apply against (will be injected into a common container DIV)
      */

    MooBench.addBehaviorTest = function(options){
      var name = options.desc,
          content = options.content;
      //content wrapper
      var tester,
          container = new Element('div');
      if (typeOf(content) == 'string') container.set('html', content);
      else container.adopt(content);

      //cleans up any instances before each test cycle
      var clean = function(){
        if (tester){
          tester.destroy();
          tester = null;
        }
      };

      //add a benchmark for instantiating the widget
      MooBench.add(name + ': instantiation', function(){ behaviorInstance.apply(document.body); }, {
        // compiled/called before the test loop
        'setup': function(){
          tester = container.cloneNode(true);
          document.body.appendChild(tester);
        },

        // compiled/called after the test loop
        'teardown': function(){
          behaviorInstance.cleanup(document.body);
          clean();
        }
      });

      //add a benchmark for destroying the widget
      MooBench.add(name + ': cleanup', function(){ behaviorInstance.cleanup(document.body); }, {
        // compiled/called before the test loop
        'setup': function(){
          tester = container.cloneNode(true);
          document.body.appendChild(tester);
          behaviorInstance.apply(document.body);
        },

        // compiled/called after the test loop
        'teardown': clean

      });

    };

  }
  /**
    The prefered method for adding unit tests and benchmarks for Behavior.Filters. This
    method will actually add both for you (unless you specify otherwise).
    Options object argument is:
      filterName: "Accordion", //the name of the filter as registered w/ Behavior
      desc: "Creates an Accordion with 20 sections." //a description of the test
      returns: Fx.Accordion, //a pointer to the class instantiated and returned; if nothing is returned, omit
      content: "<div>...</div>", //the HTML string or DOM tree to run behaviorInstance.apply() against
      //expects is a function passed the element filtered and the instance created
      //write any Jasmine style expectation string you like; this is run after the filter is applied
      expectation: function(element, instanceReturedByFilter){ expects(something).toBe(whatever); },
      specs: true/false, //excludes from specs tests if false; optional
      benchmarks: true/false //excludes from benchmarks if false; optional
    */

  Behavior.addFilterTest = function(options){
    if (options.multiplier){
      options.content = multiplyContent(options.content, options.multiplier);
    }
    //if we're in the benchmark suite, add a benchmark
    if (window.MooBench){
      //unless benchmarks: false is specified
      if (options.benchmarks !== false) MooBench.addBehaviorTest(options);
    } else if (window.describe){
      //else we're in specs; add spec test unless specs:false is specified
      if (options.specs !== false) Behavior.addSpecsTest(options);
    }
  };

  //run any additional tests specified in the options
  /**
    options - the options object passed to addSpecsTest
    element - the element the filter was applied to
    instance - the widget instance returned by the filter (if any)
    */
  var checkExpectations = function(options, element, instance){
    if (options.expect) options.expect(element, instance);
  };

  Behavior.addSpecsTest = function(options){

    describe(options.desc, function(){
      it('should run the ' + options.filterName + ' filter and return a result', function(){
        //new instance of behavior for each specs test
        var behaviorInstance = new Behavior({
          onLog: function(){},
          onError: function(){},
          onWarn: function(){}
        });
        var tester,
            container = new Element('div').inject(document.body);
        //content wrapper
        if (typeOf(options.content) == 'string') container.set('html', options.content);
        else container.adopt(options.content);

        var created = false,
            filterReturned, filterElement;
        //a plugin to run after the filter
        var plugin = function(element, api, instance){
          if (options.returns) created = instanceOf(instance, options.returns);
          else created = true;
          filterReturned = instance;
          filterElement = element;
        };
        //add a plugin for the specified filterName
        behaviorInstance.addPlugin(options.filterName, options.filterName + ' test plugin', plugin);
        //apply the filters
        behaviorInstance.apply(container);
        //check to see if the filter was deferred; if it was, wait for it or invoke it
        var filter = behaviorInstance.getFilter(options.filterName);
        var checkCreated = function(){
          expect(created).toBe(true);
        };
        if (filter.config.delay){
          waits(filter.config.delay + 50);
          runs(function(){
            checkCreated();
            checkExpectations(options, filterElement, filterReturned);
            runs(function(){
              behaviorInstance.cleanup(container);
              container.dispose();
            });
          });
        } else if (filter.config.delayUntil){
          container.getElements('[data-behavior]').fireEvent(filter.config.delayUntil.split(',')[0], true);
          checkCreated();
          checkExpectations(options, filterElement, filterReturned);
          runs(function(){
            behaviorInstance.cleanup(container);
            container.dispose();
          });
        } else if (filter.config.initializer){
          container.getElement('[data-behavior]').each(function(element){
            if (element.hasBehavior(filter.name)){
              behaviorInstance.applyFilter(element, filter);
              checkCreated();
              checkExpectations(options, filterElement, filterReturned);
              runs(function(){
                behaviorInstance.cleanup(container);
                container.dispose();
              });
            }
          });
        } else {
          //not deffered
          checkCreated();
          checkExpectations(options, filterElement, filterReturned);
          runs(function(){
            behaviorInstance.cleanup(container);
            container.dispose();
          });
        }
      });
    });
  };
})();
