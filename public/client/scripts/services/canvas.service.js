function CanvasJS(){



  var subscribe = function(channelName, clientSecret, handler){
    var client = Sfdc.canvas.oauth.client();
    client.oauthToken = clientSecret;
    Sfdc.canvas.client.subscribe(
        client,
        {
          name: channelName,
          onData: handler
        }
      );

  };

  var publish = function(channelName, clientSecret, payLoad){
    var client = Sfdc.canvas.oauth.client();
    client.oauthToken = clientSecret;
    Sfdc.canvas.client.publish(client,{
        name: channelName,
        payload: payLoad
    });
  };


  //other events go here
  return{
    publish:publish,
    subscribe:subscribe

  };
}


angular
    .module('bpm-app')
    .service('CanvasJS', CanvasJS);
