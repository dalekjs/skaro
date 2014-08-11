module.exports = function (dalek, assert, action, wait) {
  dalek.config({
    // --- Environment Variable Injection ---
    // using _.template - see http://underscorejs.org/#template
    // available variables: env, cli, cwd
    "fromEnv": "foo-<%= env.DALEK_ENV_TEST %>-",
    "fromEnvDefault": "foo-<%= env.DALEK_ENV_TEST || 'defaultvalue' %>-",


    // --- resources ---

    // export plugin namespaces to global scope
    // (e.g. to call is.foo() rather than dalek.is.foo())
    "globals": true,

    // link to isaacs/node-glob for docs and valuable hints (!, #, windows)
    // https://github.com/isaacs/node-glob#comparisons-to-other-fnmatchglob-implementations
    // glob pattern(s) to load test definitions
    "tests": ["tests/**/*.js"],
    // glob pattern(s) to load plugin definitions
    "plugins": ["plugins/**/*.js"],
    // glob pattern(s) to load data files (JSON) for use in tests
    "data": null,
    // script to load and execute first, before any user plugins, tests and CLI-files
    // (only the first of all globbing matches is executed)
    "init": null,


    // --- executing tests ---

    // sort test suites (none, alpha, random)
    "sort.suites": "alpha",
    // sort units withing test suites (none, alpha, random)
    "sort.units": "alpha",


    // --- unclear ---

    // TODO: [config] figure out what any of these options mean
    // source: https://github.com/dalekjs/dalek/blob/master/lib/dalek/config.js

    "reporter": ['console'],


    // remote proxy defaults
    "remote.interface": 'localhost',
    "remote.port": 9020,


  });
};
