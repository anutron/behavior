// Put this file in the parent directory of the runner folder. Also rename the file to Configuration.js

(function(context){

var Configuration = context.Configuration = {};

// Runner name
Configuration.name = 'Behavior';


// Presets - combine the sets and the source to a preset to easily run a test
Configuration.presets = {
	
	'Behavior': {
		sets: ['Behavior'],
		source: ['Behavior']
	}
	
};

// An object with default presets
Configuration.defaultPresets = {
	browser: 'Behavior',
	nodejs: 'Behavior',
	jstd: 'Behavior'
};


/*
 * An object with sets. Each item in the object should have an path key', '
 * that specifies where the spec files are and an array with all the files
 * without the .js extension relative to the given path
 */
Configuration.sets = {

	'Behavior': {
		path: 'Behavior/',
		files: ['Behavior.SpecsHelpers', 'Behavior.Benchmarks']
	}

};


/*
 * An object with the source files. Each item should have an path key,
 * that specifies where the source files are and an array with all the files
 * without the .js extension relative to the given path
 */

Configuration.source = {

	'Behavior': {
		path: '',
		files: [
			'mootools-core/Source/Core/Core',
			'mootools-core/Source/Types/Array',
			'mootools-core/Source/Types/String',
			'mootools-core/Source/Types/Function',
			'mootools-core/Source/Types/Number',
			'mootools-core/Source/Types/Object',
			'mootools-core/Source/Class/Class',
			'mootools-core/Source/Class/Class.Extras',
			'mootools-core/Source/Browser/Browser',
			'mootools-core/Source/Slick/Slick.Parser',
			'mootools-core/Source/Slick/Slick.Finder',
			'mootools-core/Source/Element/Element',
			'mootools-core/Source/Element/Element.Event',
			'mootools-core/Source/Element/Element.Dimensions',
			'mootools-core/Source/Utilities/JSON',
			'mootools-more/Source/Core/More',
			'mootools-more/Source/Utilities/Table',
			'../Source/Behavior',
			'../Source/BehaviorAPI',
			'../Source/Element.Data'
		]
	}

};

})(typeof exports != 'undefined' ? exports : this);
