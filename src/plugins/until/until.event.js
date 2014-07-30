'use strict';
/**
{
  Category: 'dom'
}

# Name Of Plugin

Description Of Plugin


## Examples

```js
until.event('load window', {timeout: 5000, retry: 1});

// mutlitple events without selector-DSL
until.event([
  {name: 'load', selector: 'window', timeout: 5000, retry: 1},
  {name: 'load', selector: 'window', timeout: 5000, retry: 1},
], {mode: "any|all"});

// Fully Qualified Example
until.event({
  name: 'transitionend',
  selector: '#some-selector'.css,
  match: 'first',
  timeout: 5000,
  retry: 1,
  message: 'width did not animate',
  // this function is run in the browser!
  filter: function(event) {
    if (event.propertyName === 'width') {
      // this is the event we were looking for
      return true;
    }

    // act like this event has never happened
    return false;
  }
});
```


## Notes


## Compatibility


## See Also


## Dalek 0.0.x Reference

* Docs: link
* Source: link

```js

```

*/

module.exports = function(/*dalek*/) {
  // TODO: implement plugin until.event
};
