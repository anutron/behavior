var UnitTester = {
	site: 'MooTools Art',
	title: 'Unit Tests',
	path: 'UnitTester/',
	ready: function(){
		var sources = {
			core: '../assets/core',
			more: '../assets/more',
			color: '../assets/color',
			touch: '../assets/touch',
			slick: '../assets/slick',
			art: '../'
		};
		window.ut = new UnitTester(sources, {
			'art': 'UserTests'
		}, {
			autoplay: true
		});
	}
};
