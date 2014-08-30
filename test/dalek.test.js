'use strict';

var expect = require('chai').expect;
var Config = require('../src/config/Config');
var Dalek = require('../src/Dalek');


describe('Dalek', function() {
  describe('#construct()', function() {
    it('should be an object', function() {
      // Note that this would fail, because config was not loaded yet
      var config = new Config({}, []);
      var dalek = new Dalek(config);

      expect(dalek).to.be.an('object');
    });
  });

  describe('test-instance', function() {
    var dalekPromise = require('./dalek-test-instance')();

    it('should be an object', function(done) {
      dalekPromise.then(function(dalek) {
        expect(dalek).to.be.an('object');
        done();
      });
    });

    it('should accept tests', function(done) {
      dalekPromise.then(function(dalek) {
        dalek.suite('first test', function(suite) {
          suite.unit('first unit', function() {
            return [
              dalek.assert.pass(),
            ]
          });
        });
        expect(dalek).to.be.an('object');
        done();
      });
    });

    it.skip('should load resources', function(done) {
      dalekPromise.then(function(dalek) {
        dalek.load().then(function() {
          expect(dalek).to.be.an('object');
          done();
        });
      });
    });

    it.skip('should start service', function(done) {
      dalekPromise.then(function(dalek) {
        dalek.start().then(function() {
          expect(dalek).to.be.an('object');
          done();
        });
      });
    });

    it.skip('should run tests', function(done) {
      dalekPromise.then(function(dalek) {
        dalek.run().then(function() {
          expect(dalek).to.be.an('object');
          done();
        });
      });
    });

    it.skip('should stop service', function(done) {
      dalekPromise.then(function(dalek) {
        dalek.stop().then(function() {
          expect(dalek).to.be.an('object');
          done();
        });
      });
    });

  });

});