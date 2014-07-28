/**
# compare values for strict equality

compare one value to another using strict equality


## Examples

```js
is.text(expected, {
  ignoreCase: true, 
  ignoreWhitespace: true
});
is.not.text(expected, {
  ignoreCase: true, 
  ignoreWhitespace: true
});
```


## Notes


## Compatibility


## See Also


## Dalek 0.0.x Reference

* Source: https://github.com/dalekjs/dalek/blob/master/lib/dalek/assertions.js#L1782-L1794

```js
test.assert.foo.is('Hello World')
```

*/

module.exports = function(dalek) {
  dalek.registerAssertion('text', function(inverted, value, expected, options) {
    if (options && options.ignoreCase) {
      value = (value + '').toLowerCase();
      expected = (expected + '').toLowerCase();
    }

    if (options && options.ignoreWhitespace) {
      var whitespace = /[\w\r\n]+/g;
      value = (value + '').replace(whitespace, ' ').trim();
      expected = (expected + '').replace(whitespace, ' ').trim();
    }

    var result = value === expected;

    if (Boolean(inverted) === result) {
      return 'unexpected ' + dalek.format.literal(value);
    }

    return null;
  });
};
