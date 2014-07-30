module.exports = function (dalek, assert, action, wait) {
  dalek.options({

    // the default engine to resolve selector strings
    // may be one of 'css', 'xpath', 'sizzle'
    selectorStrategy: 'css',


    // --- Logging and Console Output ---

    // disable all console output
    silent: true,
    // enable debugging output
    debug: true,


    // --- Internal ---

    // prevent a Unit and its Tasks from propagating their state
    // to the Reporter. Handles will still resolve normally, they
    // just won't communicate their state changes automatically.
    // This is used in RunLoop to silence the before/after Units.
    mute: true,

  });
};
