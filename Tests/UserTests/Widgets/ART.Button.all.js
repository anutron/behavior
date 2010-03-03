{
	tests: [
		{
			title: "Makes a Button",
			description: "Makes a button that you can click and stuff.",
			verify: "Does the button exist?",
			before: function(){
				var b = new ART.Button({text: 'Hello, I am a button!'});
				$(b).inject('container').setStyle('padding', 10);
			}
		}
	],
	otherScripts: ['Moderna', 'Moderna.Bold', 'Selectors']
}