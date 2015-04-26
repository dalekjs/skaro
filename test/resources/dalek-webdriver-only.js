'use strict';

var startHttpServer = require('./http-server.js');
var startWdPhantom = require('./wd-phantom.js');

module.exports = function(done) {
  startHttpServer(function(host, port, server) {
    var url = 'http://' + host + ':' + port;
    startWdPhantom(function(options) {
      options.server = server;
      options.url = url;

      var stop = options.stop;
      options.stop = function(callback) {
        stop(function() {
          server.close();
          callback && callback();
        });
      };

      done(options);
    });
  });
};