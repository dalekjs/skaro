/**
# test if a value is in a given range

assert that a value is between a and b, where all values are treated as floats.


## Examples

```js
is.between(10, 20)
is.not.between(10, 20)
```


## Notes


## Compatibility


## See Also


## Dalek 0.0.x Reference

* Source: https://github.com/dalekjs/dalek/blob/master/lib/dalek/assertions.js#L1696-L1704

```js
test.assert.foo.is.between(10, 20)
```

*/

module.exports = function(dalek) {
  var meta = {
    name: 'between',
    invertable: true,
    signature: ['lower', 'upper'],
    required: ['lower', 'upper'],
  };

  dalek.registerExpectation(meta, function() {
    ['lower', 'upper', 'value'].forEach(function() {
      if (typeof options[key] !== 'number') {
        options[key] = parseFloat(options[key]);
      }
    });

    var _lower = Math.min(options.lower, options.upper);
    var _upper = Math.max(options.lower, options.upper);
    var result = lower <= options.value && options.value <= _upper;

    if (options.inverted === result) {
      return dalek.format.literal(options.value) 
        + ' is not between ' + dalek.format.literal(_lower) 
        + ' and ' + dalek.format.literal(_upper);
    }

    return null;
  });
};
