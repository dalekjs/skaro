module.exports = function (dalek, assert, action, wait) {
  dalek.config({
    // --- Environment Variable Injection ---
    // using _.template - see http://underscorejs.org/#template
    // available variables: env, cli, cwd
    "fromEnv": "foo-<%= env.DALEK_ENV_TEST %>-",
    "fromEnvDefault": "foo-<%= env.DALEK_ENV_TEST || 'defaultvalue' %>-",

    // --- resources ---
    // link to isaacs/node-glob for docs and valuable hints (!, #, windows)
    // https://github.com/isaacs/node-glob#comparisons-to-other-fnmatchglob-implementations
    "tests": ["tests/**/*.js"],
    "plugins": ["plugins/**/*.js"]


    // TODO: [config] figure out what any of these options mean
    // source: https://github.com/dalekjs/dalek/blob/master/lib/dalek/config.js

    "reporter": ['console'],


    // remote proxy defaults
    "remote.interface": 'localhost',
    "remote.port": 9020,


  });
};
