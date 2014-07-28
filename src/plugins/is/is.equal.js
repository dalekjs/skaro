/**
# compare values for strict equality

compare one value to another using strict equality


## Examples

```js
is.equal('Hello World')
is.not.equal('Hello World')
```


## Notes


## Compatibility


## See Also

* is.text


## Dalek 0.0.x Reference

* Source: https://github.com/dalekjs/dalek/blob/master/lib/dalek/assertions.js#L1656-L1664

```js
test.assert.foo.is('Hello World')
```

*/

module.exports = function(dalek) {
  dalek.registerAssertion('equal', function(inverted, value, expected) {
    var result = value === expected;

    if (Boolean(inverted) === result) {
      return 'unexpected ' + dalek.format.literal(value);
    }

    return null;
  });
};
