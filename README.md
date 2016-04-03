This is a library for creating functional programming distributed across web workers. In particular this library is meant to merge in powerful external libraries into your web workers easily. Some neat features this library has:

* Instantly usable functions that will call into the webworker once its instantiated (which may not always be immediate)
* Support for callback function parameters
```javascript
//functions.js
function foo(){
  return _.map([1, 2, 3], function(n) { return n * 3; })
}

function fib(n) {
  if(n <= 2) {
      return 1;
  } else {
      return fib(n - 1) + fib(n - 2);
  }
}

function echo(word,callback) {
  callback(word+" "word+" "word)
}
```
using a simple file full of your functions, created a interface to your functions in a web worker
```javascript
var p = parallelogram(["lodash.js","functions.js"],["foo","fib","echo"]);
p.foo().then(x=>console.log(x));
p.fib(5).then(x=>console.log(x));
p.echo("Hello",x=>console.log(x));
```
