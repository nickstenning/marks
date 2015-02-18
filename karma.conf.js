module.exports = function(config) {
    config.set({
        files: [
            'test/vendor/syn.js',
            'test/*.js'
        ],
        preprocessors: {
            'test/*.js': ['browserify']
        },
        frameworks: [
            'browserify',
            'mocha',
            'referee'
        ],
        plugins: [
            'karma-browserify',
            'karma-mocha',
            'karma-phantomjs-launcher',
            'karma-referee'
        ],
        browserify: {
            debug: true,
            transform: ['babelify']
        },
        reporters: ['dots'],
        autoWatch: true,
        browsers: ['PhantomJS'],
        singleRun: false
    });
};
