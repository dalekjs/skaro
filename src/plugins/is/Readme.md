# Skaro Is Comparison

This is the namespace for plugins performing value comparisons (for assertions)

Dalek 0.0.x knew the following calls:

* is -- testShallowEquals
* not -- testShallowEquals
* between -- testBetween
* gt -- testGreaterThan
* gte -- testGreaterThanEqual
* lt -- testLowerThan
* lte -- testLowerThanEqual
* contain -- contain
* notContain -- notContain
* match -- match
* equalsCaseInsensitive -- caseInsensitiveMatch

maybe it would be best to simply import [Chai](http://chaijs.com/api/assert/)