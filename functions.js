var freezer = new Freezer({
  count: 0
});

// Let's get the frozen data stored
var model = freezer.get();

// Listen to changes in the state
freezer.on('update', function( newValue ){
  model = newValue;
  newModelHandler(model)
});

var newModelHandler = null;

function onModel(callback){
  newModelHandler = callback;
  newModelHandler(model);
}

function doAction(name,data){
  if(name=="increment"){
    model.set("count",model.count+1);
  }
  else if(name=="decrement"){
    model.set("count",model.count-1);
  }
}
