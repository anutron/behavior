{
	tests: [
		{
			title: "Makes a Window with a history manager",
			description: "Makes a button that you can click and stuff.",
			verify: "Does the button exist?",
			before: function(){
				var b = new ART.Browser();
				$(b).inject('container');
			}
		}
	],
	otherScripts: ['touch', 'MgOpen.Moderna', 'MgOpen.Moderna.Bold', 'Selectors']
}