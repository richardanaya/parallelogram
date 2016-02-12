// parallelogram.js
// repo    : https://github.com/richardanaya/parallelogram
// license : MIT

(function (window, module) {
  "use strict";
  window.parallelogram = module.exports = function(url,fns,namespace){
    if(!namespace){
      namespace="";
    }
    var depsAcquired = function(deps){
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

      // URL.createObjectURL
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

      var counter = 0;
      var resolvers = {};
      //var worker = new Worker(url);
      worker.postMessage(namespace)
      worker.addEventListener('message', function(e) {
        var id = e.data[0];
        var result = e.data[1];
        resolvers[id](result);
      }, false);
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

      var handles = {};
      for(var i = 0; i < fns.length; i++){
        var fn = fns[i];
        handles[fn] = createHandler(fn)
      }
      return handles;
    }

    if(url.constructor !== Array){
      url = [url]
    };
    var allFilePromises = url.map(function(x){
      return fetch(x).then(function(response) {
        return response.text()
      })
    })
    return Promise.all(allFilePromises).then(
      function(allText) {
        return depsAcquired(allText);
    })
  }
})(
  typeof window !== "undefined" ? window : {},
  typeof module !== "undefined" ? module : {}
);
