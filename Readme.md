# Skaro - DalekJS

This repository is a work-in-progress playground for figuring out how to proceed with the new DalekJS API. 

Docs that lead up to this can be found [here](https://github.com/rodneyrehm/dalek-api/). The new API is trying to bring in ideas expressed in [breaking backward-compatibility](https://github.com/rodneyrehm/dalek-api/blob/master/breaking-bc-api.md)

## Playground

running `bin/dalek.cli.js` will show current status…


## Open Topics

---

* `--sort` to sort suites/units prior to execution? alphabetical order? randomized order?
* ServicePlugin to hook into `Dalek.start()`, `Dalek.stop()` and `Dalek.kill()` lifecycle-phases to transparently fire up services used by the test (web server, proxy, video capture, …)

---

required interfaces and packages [research, implementation]

* integration of Reporters ([junit](https://github.com/dalekjs/dalek-reporter-junit), [html](https://github.com/dalekjs/dalek-reporter-html), [json](https://github.com/dalekjs/dalek-reporter-json), [console ?](https://github.com/dalekjs/dalek-reporter-console))
* ~~implement driver facade~~ we'll expose [WD.js](https://github.com/admc/wd) to plugins directly. We're not sure about how to handle "additional features" (like HTTP Auth or SSL certificate validation pages) at this point.
* Dalek Remote Proxy

---

convenience [implementation]

* exporting the dalek.* objects (e.g. `dalek.is`, `dalek.assert`, …) to [global](http://nodejs.org/api/globals.html#globals_global) scope. *The test-file loader could export to global scope before loading files and revert that after the files were loaded.*
* include web server, so one can simply `--serve directory` (including setting the baseUrl for tests) [might be a service plugin]
* importing `dalek-*` plugins right off `node_modules`, maybe [matchdep](https://www.npmjs.org/package/matchdep)?
  * we can also look into using `src/util/find-installed-packages.js` and load stuff based off `package.json` meta: `dalek: { "assert.foo": "lib/assert.foo.js" }`

---

plugins [research]

* share code between mutliple plugins (assert and until, for example), if we wanted to add something like [trulyVisible](http://useallfive.com/thoughts/javascript-tool-detect-if-a-dom-element-is-truly-visible/)
  * simply exclude `src/plugins/helper` from resource glob?
  * exclude on file basis `!*.helper.js`?
  * separate directory `src/plugins-helper/`?

---

working with browser scripts [research]

* handling of [data()](https://github.com/dalekjs/dalek/blob/master/lib/dalek/actions.js#L1214) what about the old `.buffer()` concept?
* handling of browser-executed scripts
* old-dalek support assertions in the browser
* instrumenting tests based on data provided by the document

---

improve scalability [research]

* think about `continueOnFailure` on task-level, unit-level and suite-level - this should allow running all the tests to figure out what is failing, rather than aborting execution on first failure
* look at [dalek.ui](https://github.com/rodneyrehm/dalek-api/blob/master/breaking-bc-api.md#remembering-ui-elements) to compensate for the dropped .query()
* think about **macros** (re-usable unit-fragments)
* look at [semantic phases](https://github.com/rodneyrehm/dalek-api/blob/master/breaking-bc-api.md#semantic-phases)

---

make it production ready [implementation]

* writing tests for the runner
  * create WD.js mock
* implement all the plugins
* implement all the expectations ([chai?](http://chaijs.com/api/assert/))

---

documentation

* convert markdown and meta-object of plugins to HTML documents forming the API documentation (see [action.click](https://github.com/dalekjs/skaro/blob/master/src/plugins/action/action.click.js), [assert.attribute](https://github.com/dalekjs/skaro/blob/master/src/plugins/assert/assert.attribute.js), [is.equal](https://github.com/dalekjs/skaro/blob/master/src/plugins/is/is.equal.js), [until.timeout](https://github.com/dalekjs/skaro/blob/master/src/plugins/until/until.timeout.js))
* write CLI and API documentation (in markdown)
  * convert to HTML and man?
  * like npm [here](https://github.com/npm/npm/blob/master/Makefile#L11-L14) and [here](https://github.com/npm/npm/blob/master/Makefile#L97-L117), or use [cli-manpage](https://www.npmjs.org/package/cli-manpage)
* some diagrams (flow-charts, components) of Dalek works internally would be nice

---

* make [dalek-cli](https://github.com/dalekjs/dalek-cli) detect skaro and forward the call


# Possible 3rd Party replacements for self coded shit

## dalek-internal-webdriver
> [WD.js](https://github.com/admc/wd) (Completely replaces this package)

## dalek-browser-chrome
> [Chromedriver](https://www.npmjs.org/package/chromedriver) (Get rid of the homegrown installer script)

## dalek-browser-firefox
> [Firefox executor](https://github.com/mozilla-b2g/marionette-firefox-host) (Get rid of starting firefox 'manually')
> [Firefox Profile Builder](https://www.npmjs.org/package/marionette-profile-builder) (Better profile management)
> [Firefox Marionette Client](https://www.npmjs.org/package/marionette-client) (Get rid of the own Marionette Protocol impl.)

## dalek-browser-ie
> [selenium-binaries](https://www.npmjs.org/package/selenium-binaries) (Get rid of homegrown installer script, including registry fixes for security settings)