function MessagingJS(CanvasJS){

  var subscribe = function(channelName, topic, handler, errorHandler, consumptionMode){
    if(consumptionMode.toUpperCase() == 'CANVAS'){
      //topic is being used to pass auth token
      CanvasJS.subscribe(channelName, topic, handler);
    }

  };

  var publish = function(channelName, topic, payLoad, consumptionMode){

      if(consumptionMode.toUpperCase() == 'CANVAS'){
          //topic is being used to pass auth token
          CanvasJS.publish(channelName, topic, payLoad);
        }
    };


  //other events go here
  return{
    publish:publish,
    subscribe:subscribe

  };
}


angular
    .module('bpm-app')
    .service('MessagingJS', MessagingJS);
