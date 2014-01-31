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

(function($, window, undef){

/**
 * creates a Mock event to be used with fire event
 * @param Element target an element to set as the target of the event - not required
 *  @param string type the type of the event to be fired. Will not be used by IE - not required.
 *
 */
Event.Mock = function(target, type){
	var e = window.event;

	type = type || 'click';

	if (document.createEvent){
		e = document.createEvent('HTMLEvents');
		e.initEvent(
			type, //Event type
			false, //Bubbles - set to false because the event should like normal fireEvent
			true //Cancelable
		);
	}

	e = new DOMEvent(e);

	e.target = target;

	return e;
}

})(document.id, window);
