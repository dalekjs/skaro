// TODO: Use a proper Proxy that can also deal with HTTPS & WebSocket connections
// TODO: Make the implementattion register itself transparently
module.exports = function (dalek) {
  'use strict';

  function Proxy (options) {
    this.options = options;
  };


  Proxy.prototype.start = function() {
    var proxy = require('http-proxy-simple').createProxyServer({
        host: '127.0.0.1',
        port: 4129
    });

    proxy.on("connection-open", function (cid, socket) {
       console.log("proxy: " + cid + ": TCP connection open");
    });

    proxy.on("connection-error", function (cid, socket, error) {
       console.log("proxy: " + cid + ": TCP connection error: " + error);
    });

    proxy.on("connection-close", function (cid, socket, had_error) {
       console.log("proxy: " + cid + ": TCP connection close");
    });

    proxy.on("http-request", function (cid, request, response) {
       console.log("proxy: " + cid + ": HTTP request: " + request.url);
    });

    proxy.on("http-error", function (cid, error, request, response) {
       console.log("proxy: " + cid + ": HTTP error: " + error);
    });

    proxy.on("http-intercept-request", function (cid, request, response, remoteRequest, performRequest) {
       console.log("proxy: " + cid + ": HTTP intercept request", request.headers);
       performRequest(remoteRequest);
    });

    proxy.on("http-intercept-response", function (cid, request, response, remoteResponse, remoteResponseBody, performResponse) {
       console.log("proxy: " + cid + ": HTTP intercept response");
       performResponse(remoteResponse, remoteResponseBody);
    });
  };

  return Proxy;
};
