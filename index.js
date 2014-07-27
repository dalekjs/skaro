// TODO: what's the public interface of Dalek?

console.log('----- loading dalek');
var Dalek = require('./src/Dalek');

console.log('----- starting dalek');
var dalek = new Dalek();

// this is what happens inside a unit test definition
console.log('----- registering attribute assertion');
var called = dalek.assert.attribute('some-selector', 'attribute-name', 'Google');
//var called = dalek.assert.attribute('some-selector', 'attribute-name', function(value){ return value === 'Apple'; });

// this is what happens when the unit test is executed
console.log('----- running attribute assertion in test');
var assertionInstance = called();

// this is what is returned to the unit test
console.log('assertion', assertionInstance.label);
assertionInstance.then(
  function(message){ console.log("SUCCESS", message); },
  function(message){ console.log("ERROR", message); }
);
