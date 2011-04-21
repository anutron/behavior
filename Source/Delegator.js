/*
---
name: Delegator
description: Allows for the registration of delegated events on a container.
requires: [More/Element.Delegation, Core/Options, Core/Events, /Event.Mock]
provides: [Delegator]
...
*/
(function(){

	var spaceOrCommaRegex = /\s*,\s*|\s+/g;

	window.Delegator = new Class({

		Implements: [Options, Events],

		options: {
			// breakOnErrors: false,
			onError: function(){
				if (window.console && console[method]){
					if(console.warn.apply) console[method].apply(console, arguments);
					else console[method](Array.from(arguments).join(' '));
				}
			}
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
		},

		attach: function(target, _method){
			_method = _method || 'addEvent';
			target = document.id(target);
			if ((_method == 'addEvent' && this._attachedTo.contains(target)) ||
			    (_method == 'removeEvent') && !this._attachedTo.contains(target)) return this;
			this._eventTypes.each(function(event){
				target[_method](event + ':relay([data-trigger])', this._bound.eventHandler);
			}, this);
			this._attachedTo.push(target);
			return this;
		},

		detach: function(target){
			if (target){
				this.attach(target, 'removeEvent');
				return this;
			} else {
				this._attachedTo.each(this.detach, this);
			}
		},

		trigger: function(name, element, event){
			if (!event || typeOf(event) == "string") event = new Event.Mock(element, event);
			var trigger = this._getTrigger(name);
			if (trigger && trigger.types.contains(event.type)) {
				if (this.options.breakOnErrors){
					this._trigger(trigger, element, event);
				} else {
					try {
						this._trigger(trigger, element, event);
					} catch(e) {
						this.fireEvent('error', ['Could not apply the trigger', name, e]);
					}
				}
			} else {
				this.fireEvent('error', 'Could not find a trigger with the name ' + name + ' for event: ' + event.type);
			}
			return this;
		},

		/******************
		 * PRIVATE METHODS
		 ******************/

		_getTrigger: function(name){
			return this._triggers[name] || Delegator._triggers[name];
		},

		_trigger: function(trigger, element, event){
			var api = new Behavior.API(element, trigger.name);
			if (trigger.requireAs){
				api.requireAs(trigger.requireAs);
			} else if (trigger.require){
				api.require.apply(api, Array.from(trigger.require));
			} if (trigger.defaults){
				api.setDefault(trigger.defaults);
			}
			trigger.handler(event, element, api);
		},

		_eventHandler: function(event, target){
			var triggers = target.getTriggers();
			if (triggers.contains('EventStop')) event.stop();
			if (triggers.contains('PreventDefault')) event.preventDefault();
			triggers.each(function(trigger){
				this.trigger(trigger, target, event);
			}, this);
		},

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
			throw new Error('Could add the trigger "' + name  +'" as a previous trigger by that same name exists.');
		}
		return this;
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