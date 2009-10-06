{
	tests: [
		{
			title: "Makes a simple alert Window",
			description: "Makes a window with an 'ok' button.",
			verify: "Do you see an alert box? Does it close when you click 'ok'?",
			before: function(){
				ART.alert('This is the caption', 'Would you like a cookie?',
					function(){
						dbug.log('closed');
					},
					{
						inject: {
							target: 'container'
						}
					}
				);
			}
		},
		{
			title: "Makes a simple confirmation Window",
			description: "Makes a window with 'ok' and 'cancel' buttons.",
			verify: "Do you see an alert box? Does it close when you click 'ok'?",
			before: function(){
				ART.confirm('This is the caption', 'Would you like a cookie?',
					function(){
						dbug.log('closed');
					},
					{
						inject: {
							target: 'container'
						}
					}
				);
			}
		},
		{
			title: "Makes a simple alert Window",
			description: "Makes a window with an 'ok' button.",
			verify: "Do you see an alert box? Does it close when you click 'ok'?",
			before: function(){
				ART.prompt('This is the caption', 'What kind of cookie would you like?',
					function(val){
						dbug.log('you want a %s cookie.', val);
					},
					{
						inject: {
							target: 'container'
						},
						overText: 'Chocolate Chip, Ginger Snap, etc...'
					}
				);
			}
		}
	],
	otherScripts: ['Selectors']
}