/*
---
name: Event.Mock

description: Supplies a Mock Event object for use on fireEvent

license: MIT-style

authors:
- Arieh Glazer

requires: Core/Event

provides: [Event.Mock]

...
*/

(function($,window,undef){

/**
 * creates a Mock event to be used with fire event
 * @param Element target an element to set as the target of the event - not required
 *  @param string type the type of the event to be fired. Will not be used by IE - not required.
 *
 */
Event.Mock = function(target,type){
	type = type || 'click';

	var e = {
		type: type,
		target: target
	};

	if (document.createEvent){
		e = document.createEvent('HTMLEvents');
		e.initEvent(
			type //event type
			, false //bubbles - set to false because the event should like normal fireEvent
			, true //cancelable
		);
	}

	e = new Event(e);

	e.target = target;

	return e;
};

})(document.id,window);