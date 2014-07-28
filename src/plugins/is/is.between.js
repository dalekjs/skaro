/**
# compare values for strict equality

compare one value to another using strict equality


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
  dalek.registerAssertion('between', function(inverted, value, lower, upper) {
    if (typeof lower !== 'number') {
      lower = parseFloat(lower);
    }

    if (typeof upper !== 'number') {
      upper = parseFloat(upper);
    }

    if (typeof value !== 'number') {
      value = parseFloat(value);
    }

    var _lower = Math.min(lower, upper);
    var _upper = Math.max(lower, upper);
    var result = lower <= value && value <= _upper;

    if (Boolean(inverted) === result) {
      return dalek.format.literal(value) 
        + ' is not between ' + dalek.format.literal(_lower) 
        + ' and ' + dalek.format.literal(_upper);
    }

    return null;
  });
};
