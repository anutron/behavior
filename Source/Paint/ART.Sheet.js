/*
---
name: ART.Sheet
description: StyleSheet cascading emulator extension
requires: [UI.Sheet, UI.Widget, ART.Widget]
provides: ART.Sheet
...
*/

ART.Sheet = {

	define: function(name, properties, namespace){
		UI.Sheet.define(name, properties, namespace);
		ART.widgets.each(function(widget){
			widget.deferDraw();
		});
	},
	
	lookup: function(name, namespace){
		return UI.Sheet.lookup(name, namespace);
	}

};
