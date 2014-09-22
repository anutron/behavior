"use strict";

var gruntOptions = {
    testserver: {
        options: {
            // We use end2end task (which does not start the webserver)
            // and start the webserver as a separate process
            // to avoid https://github.com/joyent/libuv/issues/826
            port: 8000,
            hostname: '0.0.0.0',
            middleware: function(connect, options){
                return [
                function(req, resp, next){
                    // cache get requests to speed up tests on travis
                    if (req.method === 'GET'){
                        resp.setHeader('Cache-control', 'public, max-age=3600');
                    }
                    next();
                },
                connect.static(options.base)];
            }
        }
    }
}

var karmaOptions = {
    captureTimeout: 60000 * 2,
    singleRun: true,
    frameworks: ['jasmine'/*, 'sinon'*/],
    files: [
    'behavior.js',
    'Tests/Specs/Behavior/Behavior.SpecsHelpers.js',
    'Tests/Specs/Behavior/Behavior.Benchmarks.js',
    'Tests/Specs/Syn.js',
    'behavior-specs.js'
  ],
    reporters: ['progress'],
}

exports.grunt = gruntOptions;
exports.karma = karmaOptions;
