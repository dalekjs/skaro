'use strict';

var path = require('path');
var _ = require('lodash');
var httpServer = require('http-server');
var portfinder = require('portfinder');

var host = '127.0.0.1';
var defaultOptions = {
  root: path.resolve(__dirname, 'web'),
  headers: {},
  cache: null,
  cors: true,
  https: false,
  proxy: null,
  showDir: true,
  autoIndex: true,
  ext: null,
  robots: true,
  before: null,
  logFn: function(req, res, error) {
    // var date = (new Date).toUTCString();
    // if (error) {
    //   console.log('[%s] "%s %s" Error (%s): "%s"', date, req.method, req.url, error.status.toString(), error.message);
    // } else {
    //   console.log('[%s] "%s %s" "%s"', date, req.method, req.url, req.headers['user-agent']);
    // }
  },
};

function startServer(callback, options) {
  portfinder.basePort = 8080;
  portfinder.getPort(function (err, port) {
    if (err) {
      throw err;
    }

    var _options = _.extend({}, defaultOptions, options || {});
    var server = httpServer.createServer(_options);
    server.listen(port, host, function () {
      // console.log('server is running', host, port);
      callback && callback(host, port, server);
    });
  });
}

module.exports = startServer;
