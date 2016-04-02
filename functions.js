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

function test(t){
  t(13);
  return 123;
}
