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

				window.split = new ART.Widget.SplitView({resizable: true});
				split.setLeftContent($$('.some-content')[0].clone());
				split.setRightContent($$('.some-content')[0].clone());

				window.w = new ART.Widget.Window({
					caption: 'This is the caption', 
					className: 'split', 
					onResize: function(w, h){
						split.resize(w, h);
					}
				});

				$(w).inject('container');

				$(w).setStyles({'top': 40, 'left': 40});

				w.setContent(split);

				split.setParent(w);
			}
		}
	],
	otherScripts: ['ART.Widget.Window', 'MgOpen.Moderna', 'MgOpen.Moderna.Bold', 'Selectors']
}