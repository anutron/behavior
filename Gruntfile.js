"use strict";

module.exports = function(grunt) {

	require('load-grunt-tasks')(grunt);
	var options = require('./Tests/gruntfile-options');

	grunt.initConfig({
		'connect': options.grunt,
		'packager': {
			source: {
				options: {
					name: {
						Behavior: 'Source/',
						More: 'node_modules/mootools-more/',
						Core: 'node_modules/mootools-core/'
					},
					/*
					only: [
						'Behavior/Behavior', 
						'Behavior/Element.Data', 
						'Behavior/BehaviorAPI'
					]
					*/
				},
				src: [
					'node_modules/mootools-core/Source/**/*.js', 
					'node_modules/mootools-more/Source/**/*.js', 
					'Source/**/*.js'
				],
				dest: 'behavior.js'
			},
			specs: {
				options: {
					name: 'Specs',
					ignoreYAMLheader: true
				},
				src: 'Tests/Specs/Behavior/*.Specs.js',
				dest: 'behavior-specs.js'
			}
		},
		'karma': {
			options: options.karma,
			continuous: {
				browsers: ['PhantomJS']
			}
		},
		'clean': {
			all: {src: 'Behavior-*.js'}
		}
	});

	grunt.registerTask('default', ['clean', 'packager:source', 'packager:specs', 'karma:continuous']);

};
