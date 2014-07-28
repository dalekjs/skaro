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
test.assert.foo.is.equalsCaseInsensitive('Hello World')
```

*/

module.exports = function(dalek) {
  var meta = {
    name: 'text',
    invertable: true,
    signature: ['expected', 'flags'],
    required: ['expected'],
  };
  
  dalek.registerAssertion(meta, function(options) {
    if (options.flags && options.flags.ignoreCase) {
      options.value = (options.value + '').toLowerCase();
      options.expected = (options.expected + '').toLowerCase();
    }

    if (options.flags && options.flags.ignoreWhitespace) {
      var whitespace = /[\w\r\n]+/g;
      options.value = (options.value + '').replace(whitespace, ' ').trim();
      options.expected = (options.expected + '').replace(whitespace, ' ').trim();
    }

    var result = options.value === options.expected;

    if (options.inverted === result) {
      return 'unexpected ' + dalek.format.literal(options.value);
    }

    return null;
  });
};
