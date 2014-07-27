// TODO: what's the public interface of Dalek?

console.log('----- loading dalek');
var Dalek = require('./src/Dalek');

console.log('----- starting dalek');
var dalek = new Dalek();

console.log('----- registering attribute assertion');
var called = dalek.assert.attribute();

console.log('----- running attribute assertion in test');
var assertionInstance = called();

console.log('assertion', assertionInstance.label);

assertionInstance.then(
  function(message){ console.log("SUCCESS", message); }, 
  function(message){ console.log("ERROR", message); }
);