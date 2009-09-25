{
	tests: [
		{
			title: "Makes a Window",
			description: "Makes a window that you can drag around and stuff.",
			verify: "Can you move the window around and resize it?",
			before: function(){
				window.w = new ART.Alert({
					caption: 'This is the caption',
					content: 'Foooo!!!',
					inject: {
						target: 'container'
					}
				});
			}
		}
	],
	otherScripts: ['Selectors']
}