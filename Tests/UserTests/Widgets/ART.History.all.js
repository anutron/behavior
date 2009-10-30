{
	tests: [
		{
			title: "Makes a History Manager",
			description: "Makes a button that you can click and stuff.",
			verify: "Does the button exist?",
			before: function(){
				var h = new ART.History({
					editable: true,
					history: [
						{
							title: '/a',
							path: '/a'
						},
						{
							title: '/b',
							path: '/b'
						},
						{
							title: '/c',
							path: '/c'
						}
					]
				});
				$(h).inject('container');
				h.resize();
			}
		}
	],
	otherScripts: ['touch', 'MgOpen.Moderna', 'MgOpen.Moderna.Bold', 'Selectors']
}