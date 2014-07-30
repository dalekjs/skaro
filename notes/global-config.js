module.exports = function (dalek, assert, action, wait) {
  dalek.config({
    // --- Environment Variable Injection ---
    "fromEnv": "foo-${DALEK_ENV_TEST}-",
    "fromEnvDefault": "foo-${DALEK_ENV_TEST:-defaultvalue}-",

    // --- resources ---
    "test": ["tests/**/*.js"],
    "plugin": ["plugins/**/*.js"]


    // TODO: [config] figure out what any of these options mean
    // source: https://github.com/dalekjs/dalek/blob/master/lib/dalek/config.js

    "reporter": ['console'],


    // remote proxy defaults
    "remote.interface": 'localhost',
    "remote.port": 9020,


  });
};
