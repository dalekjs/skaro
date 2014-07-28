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
  var meta = {
    name: 'equal',
    invertable: true,
    signature: ['expected'],
    required: ['expected'],
    displayName: function(options) {
      return 'equals ' + dalek.format.literal(options.expected);
    },
  };

  dalek.registerExpectation(meta, function(options) {
    var result = options.value === options.expected;

    if (options.inverted === result) {
      return 'unexpected ' + dalek.format.literal(options.value);
    }

    return null;
  });
};
