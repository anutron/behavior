{
	tests: [
		{
			title: "Makes a Window",
			description: "Makes a window that you can drag around and stuff.",
			verify: "Can you move the window around and resize it?",
			before: function(){
				
				ART.Sheet.defineStyle('window', {
					'height': 200,
					'width': 250,

					'max-height': 440,
					'max-width': 390,

					'min-height': 100,
					'min-width': 200,
				});
				
				window.w = new ART.Window({
					caption: 'This is the caption',
					content: $$('.some-content')[0].clone(),
					inject: {
						target: 'container'
					}
				});
			}
		},
		{
			title: "Makes a group of Windows",
			description: "Makes numerous windows; you should be able to focus them to bring them to the top.",
			verify: "Can you interact with the windows? When you click one does it focus and come to the top of the other windows?",
			before: function(){
				
				ART.Sheet.defineStyle('window', {
					'height': 200,
					'width': 250,

					'max-height': 440,
					'max-width': 390,

					'min-height': 100,
					'min-width': 200,
				});
				var makeWindow = function() {
					var w = new ART.Window({caption: 'This is the caption'});

					$(w).inject('container');

					$(w).setStyles({'top': 40, 'left': 0});

					w.setContent($$('.some-content')[0].clone());

					w.addEvent('close', function(){
						w.destroy();
					});

					w.addEvent('minimize', function(){
						w.resize(100, 100);
					});

					w.addEvent('maximize', function(){
						w.resize(250, 300);
					});
				};
				(5).times(makeWindow);
				ART.WM.cascade(true, 0, 40);
			}
		}
	],
	otherScripts: ['touch', 'MgOpen.Moderna', 'MgOpen.Moderna.Bold', 'Selectors']
}