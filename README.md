# RExpress

## Synopsis

RExpress is a convenient R wrapper written in node.js, allowing you to build a simple **HTTP API** over your R application.
To improve reactivity and replicability, RExpress is :
	- stateless
	- asynchronous
	- made of a **pool of active R interpreters** (to avoid interpreter/libraries/data loading on each call)

## Code Example

```bash
# SERVER
# -- assuming R is installed
node ./api.js

# CLIENT
# -- execute a script given in body
curl -X POST -H "Cache-Control: no-cache" -d \
'a <- "Hello World"\n a \n' "http://127.0.0.1/R/"
> [1] "Hello World"
# -- call 'qnorm' built-in function (value at the p percentile of normal distribution)
curl -X POST -H "Cache-Control: no-cache" -H "Content-Type: multipart/form-data; " -F "p=.42" "http://127.0.0.1/R/qnorm"
> [1] -0.2018935
```

## Installation

```bash
# clone repo
git clone theplatypus/RExpress
cd RExpress
npm install

node ./api.js

```

## API Reference

The default API exposes two main endpoints :

```javascript
// api.js
// call a function w/ form-data (safe)
.post('/R/:function', upload.array(), function (request, response) {

	// ...
})
// execute the R program given in body
// -- very unsafe but useful in testing purposes
.post('/R', text_parser, function (request, response) {

	// ...
})
```

**Function call**
*POST http://ip:port/R/:function*
Read the form-data arguments given to call the function (replace this parameter with the actual function name).
Users action is therefore limited to this function scope.

**Script execute**
 *POST http://ip:port/R*
Interpret the whole POST body as a R program to execute.
As you imagine, it is very unsafe to do that, especially if your program have access to some data.
Testing purposes only, do not use in production.

## Tests

test is for the weak

## Issues and roadmap

- multi response calls (normal distribution for example)

## Contributors

theplatypus

## License

MIT
