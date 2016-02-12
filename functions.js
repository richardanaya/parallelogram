var a = {
  foo: function(){
    return "blah"
  },
  fib: function(n) {
    if(n <= 2) {
        return 1;
    } else {
        return a.fib(n - 1) + a.fib(n - 2);
    }
  }
}
