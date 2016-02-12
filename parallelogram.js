// parallelogram.js
// repo    : https://github.com/richardanaya/parallelogram
// license : MIT

(function (window, module) {
  "use strict";

  var chan = function(){
    var queue = [];
    var builder = function(){
      var args = arguments;
      var p = new Promise(function(resolve){
        queue.push([Array.prototype.slice.call(args),resolve]);
      });
      return p;
    }
    builder.collect = function(){
      var results = queue;
      queue = null;
      return results;
    }
    return builder;
  }

  window.parallelogram = module.exports = function(url,fns,namespace){
    //default namespace is nothing, this will target self in the webworker
    if(!namespace){
      namespace="";
    }

    //create the interface that will collect values called on functions until we have a webworker
    var api = {}
    for(var j = 0 ; j < fns.length; j++){
      var fn = fns[j];
      api[fn] = chan();
    }

    var depsAcquired = function(deps){
      //put together the web worker
      var response = deps.join("\n")+
      "var ______namespace = null;\n"+
      "self.addEventListener('message', function(e) {\n"+
        "if(______namespace === null && e.data!=\"\"){\n"+
          "______namespace = self[e.data];\n"+
          "return;\n"+
        "}\n"+
        "else if(______namespace === null){______namespace =self;return;}"+
        "var fn = e.data[0];\n"+
        "var id = e.data[1];\n"+
        "var args = e.data.splice(2)\n"+
        "self.postMessage([id,______namespace[fn].apply(this,args)]);\n"+
      "}, false);"

      // create url for our string webworker
      window.URL = window.URL || window.webkitURL;

      var blob;
      try {
          blob = new Blob([response], {type: 'application/javascript'});
      } catch (e) { // Backwards-compatibility
          window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;
          blob = new BlobBuilder();
          blob.append(response);
          blob = blob.getBlob();
      }
      var worker = new Worker(URL.createObjectURL(blob));

      //this is our stupid id system
      var counter = 0;
      var resolvers = {};

      worker.postMessage(namespace)
      worker.addEventListener('message', function(e) {
        //when we get a result back with an do we have, call its resolver with the value
        var id = e.data[0];
        var result = e.data[1];
        resolvers[id](result);
      }, false);

      //create a handler that can create an id, call the function by id
      //then return it via promise when we get a result back with the id
      var createHandler = function(fn){
        return function(){
          var args = Array.prototype.slice.call(arguments);
          worker.postMessage([fn,counter].concat(args));
          return new Promise(function(resolve){
            resolvers[counter]=resolve;
            counter++;
          })
        }
      }

      //helper function for calling real handlers with the queued call arguments and resolve those
      function resolveCall(handler,args,resolve){
        handler.apply(this,args).then(function(x){
          resolve(x)
        })
      }

      for(var i = 0; i < fns.length; i++){
        var fn = fns[i];
        //creat the real handlers
        var handler = createHandler(fn);
        //get all the queued handlers calls and call the real handler
        var calls = api[fn].collect();
        for(var k=0;k<calls.length;k++){
          var call = calls[k];
          resolveCall(handler,call[0],call[1])
        }

        //use real handler from now on
        api[fn] = handler;
      }
    }

    //make sure our urls are in an array
    if(url.constructor !== Array){
      url = [url]
    };
    //fetch all the urls
    var allFilePromises = url.map(function(x){
      return fetch(x).then(function(response) {
        return response.text()
      })
    })
    //wait til we have everything
    Promise.all(allFilePromises).then(
      function(allText) {
        //once we have all the files, put together the web worker
        depsAcquired(allText);
    })

    //return the queueing api
    return api;
  }
})(
  typeof window !== "undefined" ? window : {},
  typeof module !== "undefined" ? module : {}
);
