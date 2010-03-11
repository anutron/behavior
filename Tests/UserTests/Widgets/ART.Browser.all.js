{
	tests: [
		{
			title: "Makes a Window with a history manager",
			description: "Makes a button that you can click and stuff.",
			verify: "Does the button exist?",
			before: function(){
				var b = new ART.Browser({
					caption: 'this is a browser window'
				});
				$(b).inject('container');
			}
		}
	],
	otherScripts: ['Moderna', 'Moderna.Bold', 'Selectors']
}