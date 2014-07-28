var expect = require('chai').expect;
var Dalek = require('../src/Dalek.js')

describe('Can init', function(){
  describe('#construct()', function(){
    it('should be an object', function(){
      var dalek = new Dalek({});
      expect(dalek).to.be.an('object');
    })
  })
})