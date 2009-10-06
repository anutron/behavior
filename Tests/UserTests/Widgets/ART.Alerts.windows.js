{
	tests: [
		{
			title: "Makes a simple alert Window on top of another Window.",
			description: "Makes a window with an 'ok' button above the main window when you click the link to launch it.",
			verify: "When you click the link, does the popup show? Can you drag it around, but only with the parent window? when you click the body of the main window ouside the popup, does the popup close?",
			before: function(){
				var win = new ART.Window({
					caption: 'testing alert',
					content: $$('.some-content')[0].clone()
				});
				$(win).getElements('a.popup').addEvent('click', function(){
					win.alert('This is the caption', 'Would you like a cookie?',
						function(){
							dbug.log('closed!');
						}
					);
				})
			}
		},
		{
			title: "Makes a simple alert Window on top of another Window.",
			description: "Makes a window with an 'ok' button above the main window when you click the link to launch it.",
			verify: "When you click the link, does the popup show? Can you drag it around, but only with the parent window? when you click the body of the main window ouside the popup, does the popup close?",
			before: function(){
				var win = new ART.Window({
					caption: 'testing alert',
					content: $$('.some-content')[0].clone()
				});
				$(win).getElements('a.popup').addEvent('click', function(){
					win.confirm('This is the caption', 'Would you like a cookie?',
						function(){
							dbug.log('closed!');
						}
					);
				})
			}
		},
		{
			title: "Makes a simple alert Window on top of another Window.",
			description: "Makes a window with an 'ok' button above the main window when you click the link to launch it.",
			verify: "When you click the link, does the popup show? Can you drag it around, but only with the parent window? when you click the body of the main window ouside the popup, does the popup close?",
			before: function(){
				var win = new ART.Window({
					caption: 'testing alert',
					content: $$('.some-content')[0].clone()
				});
				$(win).getElements('a.popup').addEvent('click', function(){
					win.prompt('This is the caption', 'What kind of cookie would you like?',
						function(val){
							dbug.log('you want a %s cookie.', val);
						},
						{
							overText: 'Chocolate Chip, Ginger Snap, etc...'
						}
					);
				})
			}
		}
	],
	otherScripts: ['Selectors']
}