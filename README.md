This is a library for creating functional programming distributed across web workers. In particular this library is meant to merge in powerful external libraries into your web workers easily.

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
```

using a simple file full of your functions, created a interface to your functions in a web worker

```javascript
var p = parallelogram(["lodash.js","functions.js"],["foo","fib"]);
p.fib(5).then(x=>console.log(x));
```
