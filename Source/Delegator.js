/*
---
name: Delegator
description: Allows for the registration of delegated events on a container.
requires: [Core/Element.Delegation, Core/Options, Core/Events, /Event.Mock, /Behavior]
provides: [Delegator]
...
*/
(function(){

	var spaceOrCommaRegex = /\s*,\s*|\s+/g;

	var checkEvent = function(trigger, element, event){
		if (!event) return true;
		return trigger.types.some(function(type){
			var elementEvent = Element.Events[type];
			if (elementEvent && elementEvent.condition){
				return elementEvent.condition.call(element, event, type);
			} else {
				var eventType = elementEvent && elementEvent.base ? elementEvent.base : event.type;
				return eventType == type;
			}
		});
	};

	window.Delegator = new Class({

		Implements: [Options, Events, Behavior.PassMethods, Behavior.GetAPI],

		options: {
			// breakOnErrors: false,
			// onTrigger: function(trigger, element, event, result){},
			getBehavior: function(){},
			onLog: Behavior.getLog('info'),
			onError: Behavior.getLog('error'),
			onWarn: Behavior.getLog('warn')
		},

		initialize: function(options){
			this.setOptions(options);
			this._bound = {
				eventHandler: this._eventHandler.bind(this)
			};
			Delegator._instances.push(this);
			Object.each(Delegator._triggers, function(trigger){
				this._eventTypes.combine(trigger.types);
			}, this);
			this.API = new Class({ Extends: BehaviorAPI });
			this.passMethods({
				addEvent: this.addEvent.bind(this),
				removeEvent: this.removeEvent.bind(this),
				addEvents: this.addEvents.bind(this),
				removeEvents: this.removeEvents.bind(this),
				fireEvent: this.fireEvent.bind(this),
				attach: this.attach.bind(this),
				trigger: this.trigger.bind(this),
				error: function(){ this.fireEvent('error', arguments); }.bind(this),
				fail: function(){
					var msg = Array.join(arguments, ' ');
					throw new Error(msg);
				},
				warn: function(){
					this.fireEvent('warn', arguments);
				}.bind(this),
				getBehavior: function(){
					return this.options.getBehavior();
				}.bind(this)
			});

			this.bindToBehavior(this.options.getBehavior());
		},

		/*
			given an instance of Behavior, binds this delegator instance
			to the behavior instance.
		*/
		bindToBehavior: function(behavior){
			if (!behavior) return;
			this.unbindFromBehavior();
			this._behavior = behavior;
			if (this._behavior.options.verbose) this.options.verbose = true;
			if (!this._behaviorEvents){
				var self = this;
				this._behaviorEvents = {
					destroyDom: function(elements){
						Array.from(elements).each(function(element){
							self._behavior.cleanup(element);
							self._behavior.fireEvent('destroyDom', element);
						});
					},
					ammendDom: function(container){
						self._behavior.apply(container);
						self._behavior.fireEvent('ammendDom', container);
					}
				};
			}
			this.addEvents(this._behaviorEvents);
		},

		getBehavior: function(){
			return this._behavior;
		},

		unbindFromBehavior: function(){
			if (this._behaviorEvents && this._behavior){
				this._behavior.removeEvents(this._behaviorEvents);
				delete this._behavior;
			}
		},

		/*
			attaches this instance to a specified DOM element to
			monitor events to it and its children
		*/
		attach: function(target, _method){
			_method = _method || 'addEvent';
			target = document.id(target);
			if ((_method == 'addEvent' && this._attachedTo.contains(target)) ||
			    (_method == 'removeEvent') && !this._attachedTo.contains(target)) return this;
			// iterate over all the event types for registered filters and attach listener for each
			this._eventTypes.each(function(event){
				target[_method](event + ':relay([data-trigger])', this._bound.eventHandler);
			}, this);
			this._attachedTo.push(target);
			return this;
		},


		/*
			detaches this instance of delegator from the target
		*/
		detach: function(target){
			if (target){
				this.attach(target, 'removeEvent');
				this._attachedTo.erase(target);
			} else {
				this._attachedTo.each(this.detach, this);
			}
			return this;
		},


		/*
			invokes a specific trigger upon an element
		*/
		trigger: function(name, element, event, ignoreTypes, _api){
			var e = event;
			// if the event is a string, create an mock event object
			if (!e || typeOf(e) == "string") e = new Event.Mock(element, e);
			if (this.options.verbose) this.fireEvent('log', ['Applying trigger: ', name, element, event]);

			var result,
					trigger = this.getTrigger(name);
			// warn if the trigger isn't found and exit quietly
			if (!trigger){
				this.fireEvent('warn', 'Could not find a trigger by the name of ' + name);
			// check that the event type matches the types registered for the filter unless specifically ignoring types
			} else if (ignoreTypes || checkEvent(trigger, element, e)) {
				// invoke the trigger
				if (this.options.breakOnErrors){
					result = this._trigger(trigger, element, e, _api);
				} else {
					try {
						result = this._trigger(trigger, element, e, _api);
					} catch(error) {
						this.fireEvent('error', ['Could not apply the trigger', name, error.message]);
					}
				}
			}
			// log the event
			if (this.options.verbose && result) this.fireEvent('log', ['Successfully applied trigger: ', name, element, event]);
			else if (this.options.verbose) this.fireEvent('log', ['Trigger applied, but did not return a result: ', name, element, event]);
			// return the result of the trigger
			return result;
		},

		// returns the trigger object for a given trigger name
		getTrigger: function(triggerName){
			return this._triggers[triggerName] || Delegator._triggers[triggerName];
		},

		// adds additional event types for a given trigger
		addEventTypes: function(triggerName, types){
			this.getTrigger(triggerName).types.combine(Array.from(types));
			return this;
		},

		/******************
		 * PRIVATE METHODS
		 ******************/

		 /*
			invokes a trigger for a specified element
		 */
		_trigger: function(trigger, element, event, _api){
			// create an instance of the API if one not already passed in; atypical to specify one,
			// really only used for the multi trigger functionality to set defaults
			var api = _api || this._getAPI(element, trigger);

			// if we're debugging, stop
			if (Delegator.debugging && Delegator.debugging.contains(name)) debugger;

			// set defaults, check requirements
			if (trigger.defaults) api.setDefault(trigger.defaults);
			if (trigger.requireAs) api.requireAs(trigger.requireAs);
			if (trigger.require) api.require.apply(api, Array.from(trigger.require));

			// if the element is specified, check conditionals
			if (element && !this._checkConditionals(element, api)) return;

			// invoke the trigger, return result
			var result = trigger.handler.apply(this, [event, element, api]);
			this.fireEvent('trigger', [trigger, element, event, result]);
			return result;
		},

		/*
			checks the conditionals on a trigger. Example:

			// invoke the foo trigger if this link has the class "foo"
			// in this example, it will not
			<a data-trigger="foo" data-foo-options="
			  'if': {
					'self::hasClass': ['foo']
			  }
			">...</a>

			// inverse of above; invoke the foo trigger if the link
			// does NOT have the class "foo", which it doesn't, so
			// the trigger will be invoked
			<a data-trigger="foo" data-foo-options="
			  'unless': {
					'self::hasClass': ['foo']
			  }
			">...</a>

			this method is passed the element, the api instance, the conditional
			({ 'self::hasClass': ['foo'] }), and the type ('if' or 'unless').

			See: Delegator.verifyTargets for how examples of conditionals.
		*/
		_checkConditionals: function(element, api, _conditional){

			var conditionalIf, conditionalUnless, result = true;

			if (_conditional){
				conditionalIf = _conditional['if'];
				conditionalUnless = _conditional['unless'];
			} else {
				conditionalIf = api.get('if') ? api.getAs(Object, 'if') : null;
				conditionalUnless = api.get('unless') ? api.getAs(Object, 'unless') : null;
			}

			// no element? NO SOUP FOR YOU
			if (!element) result = false;
			// if this is an if conditional, fail if we don't verify
			if (conditionalIf && !Delegator.verifyTargets(element, conditionalIf, api)) result = false;
			// if this is an unless conditional, fail if we DO verify
			if (conditionalUnless && Delegator.verifyTargets(element, conditionalUnless, api)) result = false;

			// logging
			if (!result && this.options.verbose){
				this.fireEvent('log', ['Not executing trigger due to conditional', element, conditionType]);
			}

			return result;
		},

		/*
			event handler for all events we're monitoring on any of our attached DOM elements
		*/
		_eventHandler: function(event, target){
			// get the triggers from the target element
			var triggers = target.getTriggers();
			// if the trigger is of the special types handled by delegator itself,
			// run those and remove them from the list of triggers
			if (triggers.contains('Stop')) triggers.erase('Stop') && event.stop();
			if (triggers.contains('PreventDefault')) triggers.erase('PreventDefault') && event.preventDefault();
			if (triggers.contains('multi')) triggers.erase('multi') && this._handleMultiple(target, event);
			if (triggers.contains('any')) triggers.erase('any') && this._runSwitch('any', target, event);
			if (triggers.contains('first')) triggers.erase('first') && this._runSwitch('first', target, event, 'some');

			// execute the triggers
			triggers.each(function(trigger){
				this.trigger(trigger, target, event);
			}, this);
		},

		/*
			iterates over the special "multi" trigger configuration and invokes them
		*/
		_handleMultiple: function(element, event){
			// make an api reader for the 'multi' options
			var api = this._getAPI(element, { name: 'multi' });

			if (!this._checkConditionals(element, api)) return;

			// get the triggers (required)
			var triggers = api.getAs(Array, 'triggers');
			// if there are triggers, run them
			if (triggers && triggers.length) this._runMultipleTriggers(element, event, triggers);
		},

		/*
			given an element, event, and an array of triggers, run them;
			only used by the 'multi', 'any', and 'first' special delegators
		*/
		_runMultipleTriggers: function(element, event, triggers){
			// iterate over the array of triggers
			triggers.each(function(trigger){
				// if it's a string, invoke it
				// example: '.selector::trigger' << finds .selector and calls 'trigger' delegator on it
				if (typeOf(trigger) == 'string'){
					this._invokeMultiTrigger(element, trigger);
				} else if (typeOf(trigger) == 'object'){
					// if it's an object, iterate over it's keys and config
					// example:
					// { '.selector::trigger': {'arg':'whatevs'} } << same as above, but passes ['arg'] as argument
					//                                                to the trigger as *defaults* for the trigger
					Object.each(trigger, function(config, key){
						this._invokeMultiTrigger(element, key, config);
					}, this);
				}
			}, this);
		},

		/*
			invokes a trigger with an optional default configuration for each target
			found for the trigger.
			trigger example: '.selector::trigger' << find .selector and invoke 'trigger' delegator
		*/
		_invokeMultiTrigger: function(element, trigger, config){
			// split the trigger name
			trigger = this._splitTriggerName(trigger);
			if (!trigger) return; //craps out if the trigger is mal-formed
			// get the targets specified by that trigger
			var targets = Behavior.getTargets(element, trigger.selector);
			// fail if nothing found
			if (!targets.length) api.fail('Could not apply multi trigger ' + trigger.name + ' because no target elements were found for element', element);
			// iterate over each target
			targets.each(function(target){
				var api;
				// create an api for the trigger/element combo and set defaults to the config (if config present)
				if (config) api = this._getAPI(target, trigger).setDefault(config);
				// invoke the trigger
				this.trigger(trigger.name, target, event, true, api);
			}, this)
		},

		/*
			given a trigger name string, split it on "::" and return the name and selector
			invokes
		*/
		_splitTriggerName: function(str){
			var split = str.split('::'),
			    selector = split[0],
			    name = split[1];
			if (!name || !selector){
				this.fireEvent('error', 'could not invoke multi delegator for ' + str +
					'; could not split on :: to derive selector and trigger name');
				return;
			}
			return {
				name: name,
				selector: selector
			}
		},

		/*
			Runs the custom switch triggers. Examples:

			the 'first' trigger runs through all the groups
			checking their conditions until it finds one that
			passes, then executes the driggers defined in it.
			if no conditional clause is defined, that counts
			as a pass.

			<a data-trigger="first" data-first-switches="
				[
					{
						'if': {
							'self::hasClass': ['foo']
						},
						'triggers': [
							'.seletor::triggerName',
							'...another'
						]
					},
					{
						'if': {
							'.someThingElse::hasClass': ['foo']
						},
						'triggers': [
							'.seletor::triggerName',
							'...another'
						]
					},
					{
						'triggers': [
							'.selector::triggerName'
						]
					}
				]
			">...</a>

		*/
		_runSwitch: function(switchName, element, event, method){
			method = method || 'each'
			// make an api reader for the switch options
			var api = this._getAPI(element, { name: switchName }),
					switches = api.getAs(Array, 'switches');

			if (!this._checkConditionals(element, api)) return;

			switches[method](function(config){
				if (this._checkConditionals(element, api, config)){
					this._runMultipleTriggers(element, event, config['triggers'], method);
					return true;
				} else {
					return false;
				}
			}, this);
		},


		/*
			function that attaches listerners for each unique
			event type for filtesr as they're added (but only once)
		*/
		_onRegister: function(eventTypes){
			eventTypes.each(function(eventType){
				if (!this._eventTypes.contains(eventType)){
					this._attachedTo.each(function(element){
						element.addEvent(eventType + ':relay([data-trigger])', this._bound.eventHandler);
					}, this);
				}
				this._eventTypes.include(eventType);
			}, this);
		},

		_attachedTo: [],
		_eventTypes: [],
		_triggers: {}

	});

	Delegator._triggers = {};
	Delegator._instances = [];
	Delegator._onRegister = function(eventType){
		this._instances.each(function(instance){
			instance._onRegister(eventType);
		});
	};

	Delegator.register = function(eventTypes, name, handler, overwrite /** or eventType, obj, overwrite */){
		eventTypes = Array.from(eventTypes);
		if (typeOf(name) == "object"){
			var obj = name;
			for (name in obj){
				this.register.apply(this, [eventTypes, name, obj[name], handler]);
			}
			return this;
		}
		if (!this._triggers[name] || overwrite){
			if (typeOf(handler) == "function"){
				handler = {
					handler: handler
				};
			}
			handler.types = eventTypes;
			handler.name = name;
			this._triggers[name] = handler;
			this._onRegister(eventTypes);
		} else {
			throw new Error('Could add the trigger "' + name +'" as a previous trigger by that same name exists.');
		}
		return this;
	};

	Delegator.getTrigger = function(name){
		return this._triggers[name];
	};

	Delegator.addEventTypes = function(triggerName, types){
		this.getTrigger(triggerName).types.combine(Array.from(types));
		return this;
	};

	Delegator.debug = function(name){
		if (!Delegator.debugging) Delegator.debugging = [];
		Delegator.debugging.push(name);
	};


	Delegator.implement('register', Delegator.register);

	Element.implement({

		addTrigger: function(name){
			return this.setData('trigger', this.getTriggers().include(name).join(' '));
		},

		removeTrigger: function(name){
			return this.setData('trigger', this.getTriggers().erase(name).join(' '));
		},

		getTriggers: function(){
			var triggers = this.getData('trigger');
			if (!triggers) return [];
			return triggers.trim().split(spaceOrCommaRegex);
		},

		hasTrigger: function(name){
			return this.getTriggers().contains(name);
		}

	});

})();