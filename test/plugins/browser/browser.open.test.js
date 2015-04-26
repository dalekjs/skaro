'use strict';

var expect = require('chai').expect;

var startWdalek = require('../../resources/dalek-webdriver-only.js');

describe('plugin.browser.open', function() {
  var wdalek;
  var meta;
  var handler;

  before(function(done) {
    startWdalek(function(_wdalek) {
      wdalek = _wdalek;

      wdalek.registerPlugin = function(_meta, _handler) {
        meta = _meta;
        handler = _handler;
      };

      try {
        require('../../../src/plugins/browser/browser.open.js')(wdalek);
        done();
      } catch(e) {
        done(e);
      }
    });
  });

  after(function(done) {
    wdalek.stop(done);
  });

  it('should have registered', function(done) {
    expect(meta).to.be.a('object');
    expect(handler).to.be.a('function');
    done();
  });
  
  it('should return a Handle that resolves', function(done) {
    var url = wdalek.url + '/guineapig/';
    var handle = handler({
      'url': url,
    });

    expect(handle instanceof wdalek.Handle).to.be.ok();
    expect(handle.label).to.contain('open URL');

    handle.then(function(resolution) {
      expect(resolution).to.equal('opened ' + wdalek.format.link(url));
      done();
    }).catch(done);
  });

  it('should return a Handle that rejects', function(done) {
    var url = 'http://host-does-not-exist-asdkxykxckyxcyxkcad.axcyxcx/lalala.html';
    var handle = handler({
      'url': url,
    });

    expect(handle instanceof wdalek.Handle).to.be.ok();
    expect(handle.label).to.contain('open URL');

    handle.then(function(resolution) {
      done(new Error('unexpected handle.resolve("' + resolution + '")'));
    }, function(resolution) {
      expect(resolution).to.contain('could not open');
      done();
    }).catch(done);
  });
});