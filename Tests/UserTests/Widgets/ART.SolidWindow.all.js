{
	tests: [
		{
			title: "Makes a solid window dialog",
			description: "Makes a solid window that you can drag around and stuff.",
			verify: "Can you move the window around and resize it? Is it one solid gradient area?",
			before: function(){
				ART.Sheet.defineStyle('solidwindow', {
					'height': 200,
					'width': 250,

					'max-height': 440,
					'max-width': 390,

					'min-height': 100,
					'min-width': 200
				});
				window.w = new ART.SolidWindow({
					caption: 'This is the caption',
					content: $$('.some-content')[0].clone(),
					inject: {
						target: 'container'
					}
				});
			}
		},
		{
			title: "Makes a 'Glass' Window",
			description: "Makes a 'glassy' solid window.",
			verify: "Can you see a solid window that's got a glassy style?",
			before: function(){
				ART.Sheet.defineStyle('solidwindow', {
					'height': 200,
					'width': 250,

					'max-height': 440,
					'max-width': 390,

					'min-height': 100,
					'min-width': 200
				});
				window.w = new ART.SolidWindow({
					'className': 'smoke solid',
					caption: 'This is the caption',
					content: $$('.some-content')[0].clone(),
					inject: {
						target: 'container'
					}
				});
			}
		}
	],
	otherScripts: ['Selectors']
}