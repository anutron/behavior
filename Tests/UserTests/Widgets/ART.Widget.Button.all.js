{
	tests: [
		{
			title: "Makes a Button",
			description: "Makes a button that you can click and stuff.",
			verify: "Does the button exist?",
			before: function(){
				var b = new ART.Button({label: 'Hello, I am a button!'});
				$(b).inject('container');
			}
		}
	],
	otherScripts: ['touch', 'MgOpen.Moderna', 'MgOpen.Moderna.Bold', 'Selectors']
}