module.exports = function(config) {
  'use strict';

  var chalk = require('chalk');
  var Dalek = require('../../index.js');
  var dalek = new Dalek(config);
  // TODO: should dalek.options('silent', true); bubble through to everything?
  dalek.reporter.options.warnings = false;

  return dalek.load().then(function(index) {
    console.log('Listing Loaded Resources');

    var _configBase = config.getConfigFileContext();
    var _cwd = config._cwd;
    /*jshint laxbreak:true */
    var _significantPath = (_configBase === _cwd ? 'equal' : '')
      || (_cwd.indexOf(_configBase) === 0 ? 'config' : '')
      || (_configBase.indexOf(_cwd) === 0 ? 'cwd' : '');
    /*jshint laxbreak:false */

    var _seen = {};
    var _skipped = {};
    index.skipped.forEach(function(item) {
      _skipped[item] = true;
    });

    function hiliteCwd(item) {
      function cwd(match) {
        return chalk.cyan(match);
      }

      function configBase(match) {
        return chalk.magenta(match);
      }

      switch (_significantPath) {
        case 'equal':
          return item
            .replace(_cwd + '/', cwd);

        case 'cwd':
          return item.replace(_configBase + '/', function(match) {
            return configBase(match.replace(_cwd + '/', cwd));
          }).replace(_cwd + '/', cwd);

        case 'config':
          return item.replace(_cwd + '/', function(match) {
            return cwd(match.replace(_configBase + '/', configBase));
          }).replace(_configBase + '/', configBase);

        default:
          return item
            .replace(_cwd + '/', cwd)
            .replace(_configBase + '/', configBase);
      }
    }

    function logFile(item, flags) {
      var flag = '';
      if (flags) {
        /*jshint laxbreak:true */
        flag = (_skipped[item] ? chalk.yellow('skipped'): '')
          || (_seen[item] ? chalk.cyan('duplicate') : '');
        /*jshint laxbreak:false */
        _seen[item] = true;
      }

      console.log(' ', hiliteCwd(item) || chalk.red('none'), flag);
    }

    function logList(list, flags) {
      if (list && list.length) {
        list.forEach(function(item) {
          logFile(item, flags);
        });
      } else {
        console.log('  ' + chalk.red('none'));
      }
    }

    function via(key, _cli) {
      if (config._options[key]) {
        return 'via ' + 'cli ' + chalk.grey(_cli);
      }

      var origin = config.resourceOrigin(key);
      var from = '';
      if (origin) {
        from = ' from ' + hiliteCwd(origin._path);
      }

      return 'via config ' + chalk.green(key) + from;
    }

    function logConfigFile(configFile, level) {
      var prefix = new Array(level).join('  ') + (level ? '⌞ ' : '');
      logFile(prefix + configFile._path);
      configFile._parents.forEach(function(parent) {
        logConfigFile(parent, level + 1);
      });
    }


    console.log('\n' + chalk.blue('# Context'));
    console.log(' config:', _configBase ? chalk.magenta(_configBase) : chalk.red('none'));
    console.log('    CWD:', chalk.cyan(_cwd));

    console.log('\n' + chalk.blue('# Configuration'), via('config', '--config'));
    config.getConfigFiles().slice(1, -1).forEach(function(configFile) {
      logConfigFile(configFile, 0);
    });

    console.log('\n' + chalk.blue('# Data'), via('data', '--data'));
    logList(config._resources.data);

    console.log('\n' + chalk.blue('# Init'), via('init', '--init'));
    logFile(config.getInit() || '', true);

    console.log('\n' + chalk.blue('# Plugins'), via('plugins', '--plugins'));
    logList(config.getPlugins(), true);

    console.log('\n' + chalk.blue('# Tests'), via('tests', '--tests'));
    logList(config.getTests(), true);

    console.log('\n' + chalk.blue('# Files'), via('config', '--files'));
    logList(config.getFiles(), true);

    // TODO: list reporters, drivers, browsers, …
    console.log('\n' + chalk.blue('# Reporter'));
    console.log(' ', chalk.red('none'));
    console.log('\n' + chalk.blue('# Browser'));
    console.log(' ', chalk.red('none'));
    console.log('\n' + chalk.blue('# Driver'));
    console.log(' ', chalk.red('none'));

    process.exit(0);
  }, function(error) {
    dalek.reporter.error(error);
    process.exit(1);
  });
};