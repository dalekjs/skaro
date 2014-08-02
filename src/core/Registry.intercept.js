/*
    Registry Interception is a helper facility to provide meaningful
    errors when unknown plugins are accessed.

    It uses ES6 Proxies to accomplish that. Until Proxies work fine
    in V8, https://github.com/tvcutsem/proxy-handlers so we do not
    have to provide a full-blown Proxy handler.

    If node was *not* started with --harmony, this interceptor will
    simply not engage. Use --harmony for more convenience, but not
    mandatory.
 */

'use strict';

if (typeof Proxy === 'undefined' || typeof WeakMap === 'undefined') {
  module.exports = function(dalek, namespace, target) {
    return target;
  };

  return;
}

function intercept(dalek, namespace, target) {
  // http://soft.vub.ac.be/~tvcutsem/proxies/
  var DelegatingHandler = require('proxy-handlers').DelegatingHandler;
  function Interceptor(){}
  Interceptor.prototype = Object.create(DelegatingHandler.prototype);
  Interceptor.prototype.get = function(target, name) {
    if (target[name]) {
      return target[name];
    }
    // this is the place to lazy-load
    throw new dalek.Error(
      dalek.format.keyword(namespace) + ' ' + dalek.format.keyword(name) + ' does not exist',
      dalek.Error.PLUGIN_CALL,
      dalek.getStack(Interceptor.prototype.get)
    );
  };

  return DelegatingHandler.proxyFor.call(Interceptor, target);
}

module.exports = intercept;
