module.exports = function(dalek) {
  
  function Reporter(options) {
    this.options = options;
  }
  
  Reporter.prototype.log = function() {
    console.log.apply(console, arguments);
  };
  
  Reporter.prototype.debug = function() {
    var args = [].slice.call(arguments, 0);
    console.info.apply(console, args);
  };
  
  return Reporter;
};