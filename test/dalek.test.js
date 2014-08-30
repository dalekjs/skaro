'use strict';

var expect = require('chai').expect;
var Config = require('../src/config/Config');
var Dalek = require('../src/Dalek');


describe('Dalek', function() {
  describe('#construct()', function() {
    it('should be an object', function() {
      var config = new Config({}, []);
      var dalek = new Dalek(config);

      expect(dalek).to.be.an('object');
    });
  });
});
