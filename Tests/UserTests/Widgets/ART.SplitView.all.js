{
	tests: [
		{
			title: "Makes a Split Window",
			description: "Makes a window that you can drag around and stuff with columns you can resize.",
			verify: "Can you move the window around and resize it? Can you resize its columns",
			before: function(){
				
				ART.Sheet.defineStyle('window.split', {
					'content-overflow': 'hidden'
				});

				var split = new ART.SplitView({resizable: true});
				split.setLeftContent($$('.some-content')[0].clone());
				split.setRightContent($$('.some-content')[0].clone());

				var w = new ART.Window({
					caption: 'This is the caption', 
					content: $(split),
					className: 'split', 
					onResize: function(w, h){
						split.resize(w, h);
					},
					inject: {
						target: 'container'
					},
					parentWidget: w
				});

			}
		}
	],
	otherScripts: ['ART.Window', 'MgOpen.Moderna', 'MgOpen.Moderna.Bold', 'Selectors']
}