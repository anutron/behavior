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
			'mootools-core/Source/Native/Array',
			'mootools-core/Source/Native/String',
			'mootools-core/Source/Native/Function',
			'mootools-core/Source/Native/Number',
			'mootools-core/Source/Native/Hash',
			'mootools-core/Source/Class/Class',
			'mootools-core/Source/Class/Class.Extras',
			'mootools-core/Source/Core/Browser',
			'mootools-core/Source/Element/Element',
			'mootools-core/Source/Element/Element.Dimensions',
			'mootools-core/Source/Utilities/Selectors',
			'mootools-more/Source/Core/More',
			'mootools-more/Source/Utilities/Table',
			'../Source/Behavior',
			'../Source/Element.Data'
		]
	}

};

})(typeof exports != 'undefined' ? exports : this);
