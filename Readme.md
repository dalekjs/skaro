# Skaro - DalekJS

> HINT: Run a first "real" UI test with:
`bin/dalek.cli.js run --config=example/browser-config.json

This repository is a work-in-progress playground for figuring out how to proceed with the new DalekJS API.

Docs that lead up to this can be found [here](https://github.com/rodneyrehm/dalek-api/). The new API is trying to bring in ideas expressed in [breaking backward-compatibility](https://github.com/rodneyrehm/dalek-api/blob/master/breaking-bc-api.md)

## Playground

Install by

```sh
git clone https://github.com/dalekjs/skaro.git
cd skaro
npm install
```

running `bin/dalek.cli.js` will show current status…

```sh
# run a simple test using phantomjs
bin/dalek.cli.js run --config=example/browser-config.json
# run a simple test using a custom browser (still phantomjs…)
bin/dalek.cli.js run --config=example/browser-config.json --browser gustav
# run a simple test using chrome
bin/dalek.cli.js run --config=example/browser-config.json --browser chrome
```

## Tools that may be handy for special-purpose plugins

* [DOM-Compare](https://github.com/Olegas/dom-compare)
* [estraverse](https://github.com/Constellation/estraverse)
* [molasses](https://www.npmjs.org/package/molasses) for a slow-http-response (not a bandwidth-throttle) proxy?
* [reverend](https://www.npmjs.org/package/reverend) to parse express-style URLs
