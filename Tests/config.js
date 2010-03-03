var UnitTester = {
	site: 'MooTools Art',
	title: 'Unit Tests',
	path: 'UnitTester/',
	ready: function(){
		var sources = {
			core: '../assets/core/Source/scripts.json',
			more: '../assets/more/Source/scripts.json',
			color: '../assets/mootools-color/scripts.json',
			table: '../assets/mootools-table/scripts.json',
			touch: '../assets/touch/scripts.json',
			slick: '../assets/slick/Source/scripts.json',
			art: '../assets/art/scripts.json',
			widgets: '../Source/scripts.json'
		};
		window.ut = new UnitTester(sources, {
			'art': 'UserTests'
		}, {
			appendSource: false,
			autoplay: true
		});
	}
};
