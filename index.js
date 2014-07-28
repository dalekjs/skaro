// TODO: what's the public interface of Dalek?

console.log('----- loading dalek');
var Dalek = require('./src/Dalek');

console.log('----- starting dalek');
var dalek = new Dalek();

var domain = require('domain').create();
domain.on('error', function(error) {
  dalek.reporter.error(error);
});

domain.run(function() {

  // triggering DalekErrors with custom stack
  // throw new dalek.Error('foobar', dalek.Error.PLUGIN_CALL, [
  //   {name: 'someFunction', file: 'index.js', line: 123}
  // ]);

  // this is what happens inside a unit test definition
  console.log('----- registering attribute assertion');

  // literal example
  // var called = dalek.assert.attribute('some-selector', 'attribute-name', 'Google');

  // custom function example
  var comp = function(value){ return value === 'Apple' ? '' : 'bla bla'; };
  comp.displayName = 'deine mudder';
  var called = dalek.assert.not.attribute('some-selector', 'attribute-name', comp);

  // using is-plugin example
  // var called = dalek.assert.not.attribute('some-selector', 'attribute-name', is.equal('foobar'));

  // this is what happens when the unit test is executed
  console.log('----- running attribute assertion in test');
  var assertionInstance = called();

  // this is what is returned to the unit test
  console.log('assertion', assertionInstance.label);
  assertionInstance.then(
    function(message){ console.log("SUCCESS", message); },
    function(message){ console.log("ERROR", message); }
  );

});
