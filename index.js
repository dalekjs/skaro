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

console.log('----- registering suites');
dalek.suite('name of the suite', function(suite, options) {

  suite.options({
    foo: 'bar'
  });

  suite.beforeUnit(function() {
    console.log('run before each unit to set up common stuff');
  });

  suite.afterUnit(function() {
    console.log('run after each unit (even on failure?) to clean things up');
  });

  suite.unit('first unit', function(options) {
    return [
      dalek.action.click('.somewhere'),
      dalek.until.timeout(100),
      dalek.assert.attribute('.rainbow', 'color', 'green'),
    ];
  });

  suite.unit('second unit', function(options) {
    return [
      dalek.action.click('.kansas'),
    ];
  });

});

dalek.suite('other suite', function(suite) {

  suite.unit('lalalal', function(options) {
    return [
      dalek.action.click('.kansas'),
    ];
  });

});

console.log('----- running suites');
dalek._runSuites();

return;

  // provoke failure
  //dalek.assert.attribute('some-selector');


  // this is what happens inside a unit test definition
  console.log('----- registering expectation equals');
  var called = dalek.is.not.equal('some-value');
  console.log(called.displayName);
  console.log('----- executing expectation equals');
  var result = called('some-value');
  console.log(result);

  // this is what happens inside a unit test definition
  console.log('----- registering attribute assertion');

  // literal example
  var called = dalek.assert.attribute('some-selector', 'attribute-name', 'Google');

  // custom function example
  // var comp = function(value){ return value === 'Apple' ? '' : 'bla bla'; };
  // comp.displayName = 'deine mudder';
  // var called = dalek.assert.not.attribute('some-selector', 'attribute-name', comp);

  // using is-plugin example
  // var called = dalek.assert.not.attribute('some-selector', 'attribute-name', is.equal('foobar'));

  // this is what happens when the unit test is executed
  console.log('----- running attribute assertion in test');
  var assertionInstance = called({runtime: 'options'});

  // this is what is returned to the unit test
  console.log('assertion', assertionInstance.label);
  assertionInstance.then(
    function(message){ console.log("SUCCESS", message); },
    function(message){ console.log("ERROR", message); }
  );

  console.log('----- registering click action');
  var called = dalek.action.click('some-selector');
  console.log('----- running attribute assertion in test');
  var actionInstance = called({runtime: 'options'});
  // this is what is returned to the unit test
  console.log('action', actionInstance.label);
  actionInstance.then(
    function(message){ console.log("SUCCESS", message); },
    function(message){ console.log("ERROR", message); }
  );

  console.log('----- registering timeout waiting');
  var called = dalek.until.timeout(1000);
  console.log('----- running timeout wait in test');
  var untilInstance = called({runtime: 'options'});
  // this is what is returned to the unit test
  console.log('until', untilInstance.label);
  untilInstance.then(
    function(message){ console.log("SUCCESS", message); },
    function(message){ console.log("ERROR", message); }
  );
  
});
