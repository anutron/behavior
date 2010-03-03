{
	tests: [
		{
			title: "Makes two directional Buttons",
			description: "Makes two buttons that you can click and stuff. One points left, the other right.",
			verify: "Do the buttons exist? Do they have left and right arrows?",
			before: function(){
				var a = new ART.Button.Nav.Left();
				$(a).inject('container').setStyles({
					padding: '10px 0px 0px 10px',
					float: 'left'
				});
				var b = new ART.Button.Nav.Right();
				$(b).inject('container').setStyles({
					padding: '10px 0px 0px',
					float: 'left'
				});
				
			}
		}
	],
	otherScripts: ['touch', 'Moderna', 'Moderna.Bold', 'Selectors']
}