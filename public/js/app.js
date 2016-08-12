angular.module('bpm-app', 
	[
		'ui.router',
		'ngAnimate',
		'ngMaterial'
	]);
angular.module('bpm-app')
	.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function ($stateProvider, $urlRouterProvider, $locationProvider) {
		// This turns off hashbang urls (/#about) and changes it to something normal (/about)
		$locationProvider.html5Mode(true).hashPrefix('!');
        $urlRouterProvider.otherwise('/');
        $stateProvider.state('home', {
			url: '/',
			templateUrl: '/client/views/home.html'
        });
        $stateProvider.state('createOrder', {
			url: '/createOrder',
			templateUrl: '/client/views/createOrder.html'
        });
        $stateProvider.state('searchOrder', {
			url: '/searchOrder',
			templateUrl: '/client/views/searchOrder.html'
        });
        $stateProvider.state('openTasks', {
			url: '/openTasks',
			templateUrl: '/client/views/openTasks.html'
        });
	}]);
angular.module('bpm-app')
.controller('CreateOrderCtrl', ['$scope', '$http', 'Orders', function($scope, $http, Orders) {
	$scope.currentOrder = {
		shippingAddress: {}
	};
	$scope.currentCustomer = {};
	$scope.init = function(){
		$scope.invoice = {
			items: [{
				qty: 1,
				description: '',
				cost: 0
			}]
		};
		if($scope.$parent.canvasData){
			if($scope.$parent.canvasData.context){
				$scope.appLoadedFrom = 'salesforce';
				$scope.currentOrder.submittedBy = $scope.$parent.canvasData.context.user.lastName+' '+$scope.$parent.canvasData.context.user.firstName;
				if($scope.$parent.canvasData.context.environment.parameters){
					$scope.currentCustomer.billingAddress = {};
					$scope.currentOrder.shippingAddress = {};
					$scope.currentCustomer.customerName = $scope.$parent.canvasData.context.environment.parameters.AccountName;
					$scope.currentCustomer.billingAddress = angular.copy($scope.$parent.canvasData.context.environment.parameters.BillingAddress);
					$scope.currentOrder.shippingAddress  = angular.copy($scope.$parent.canvasData.context.environment.parameters.ShippingAddress);
				}
			}else{
				$scope.appLoadedFrom = 'browser';
				$scope.warning = 'Application not loaded from Salesforce';
			}
		}
	};
	$scope.orderForm = {
		currentOrder: $scope.currentOrder,
		currentCustomer: $scope.currentCustomer
	};
	$scope.removeItem = function(index) {
		$scope.invoice.items.splice(index, 1);
	};
	$scope.addItem = function() {
		$scope.invoice.items.push({
			qty: 1,
			description: '',
			cost: 0
		});
	};
	$scope.total = function() {
		var total = 0;
		angular.forEach($scope.invoice.items, function(item) {
			total += item.qty * item.cost;
		});
		$scope.currentOrder.totalCost = total;
		return total;
	};
	$scope.description = function() {
		var finalDescription = 'Ordering '+$scope.invoice.items.length+' items in total, ';
		angular.forEach($scope.invoice.items, function(item) {
			finalDescription += '('+item.qty+') '+item.description;
			finalDescription += ', ';
		});
		$scope.currentOrder.description = finalDescription;
		return finalDescription;
	};
	$scope.sendOrder = function () {
		Orders.submitOrder($scope.currentOrder, $scope.currentCustomer)
		.then(function(response){
			$scope.recentOrderId = response;
			var submittedBy = $scope.currentOrder.submittedBy;
			$scope.currentOrder = {
				submittedBy : submittedBy,
				shippingAddress: {}
			};
			//$scope.currentCustomer = {};
			$scope.createOrderForm.$setPristine();
			$scope.createOrderForm.$submitted = false;
		})
		.then(null, function(response){
			$scope.recentOrderId = response;
		})
		.catch(function(response){
			$scope.recentOrderId = response;
		});
	};
	$scope.updateAddress = function(){
		$scope.currentOrder.shippingAddress = angular.copy($scope.currentCustomer.billingAddress);
	}
	$scope.init();
}]);
angular.module('bpm-app')
.controller('HomeCtrl', ['$scope', 'processes', function($scope, processes) {
	$scope.init = function(){
		processes.getProcesses().then(function(response){
			$scope.processes = response.exposedItemsList;
		});
	}
	$scope.init();
}]);
angular.module('bpm-app')
.controller('MainCtrl', ['$scope', '$location', function($scope, $location) {
	$scope.pagename = function(){
        return $location.path();
	};
	$scope.htmlRelativePath = {
		createOrder: '/client/views/createOrder.html',
		searchOrder: '/client/views/searchOrder.html',
		openTasks: '/client/views/openTasks.html'
	};
	$scope.getCanvas = function(canvasData){
		if(canvasData){
			$scope.canvasData = JSON.parse(JSON.stringify(canvasData));
		}
	};
}]);
angular.module('bpm-app')
.controller('OpenTasksCtrl', ['$scope', 'Orders', function($scope, Orders) {
	$scope.init = function(){
		$scope.sortType     = 'instanceId';
  		$scope.sortReverse  = true;
		$scope.searchTasks();
	}

	$scope.error = false;

	$scope.searchTasks = function () {
		$scope.attrResults = [];
		Orders.searchByAttribute().then(function(response){
			if(response !== [{ instanceName: "No Results found", instanceStatus: "n/a", instanceId: "n/a" }]){
				if(response && response.length > 0){
					for(var i=0; i<response.length; i++){
						Orders.searchByTaskId(response[i].taskId).then(function(taskDetails){
							for (var x = $scope.attrResults.length - 1; x >= 0; x--) {
								if(taskDetails.tkiid === $scope.attrResults[x].taskId.toString()){
									$scope.attrResults[x].taskDetails = taskDetails.data.variables;
								}
							};
						});
					}
				}
				$scope.attrResults = response;
				if (!$scope.attrResults || !$scope.attrResults.length) $scope.attrResults = [{ instanceName: "No Results found", instanceStatus: "n/a", instanceId: "n/a" }];
			}else{
				$scope.attrResults = response;
			}
		});
	};

	$scope.updateOrder = function(rowData, updateStatus){
		Orders.finishTask(rowData.taskId, updateStatus).then(function(response){
			if(response.error){
				rowData.errorMessage = 'failed to update task';
			}else{
				rowData.instanceStatus = 'completed';
			}
		});
	}
	$scope.init();
}]);
angular.module('bpm-app')
.controller('SearchOrderCtrl', ['$scope', 'Orders', 'configFromNode', 'MessagingJS', function($scope, Orders, configFromNode, MessagingJS) {
	$scope.currentOrder = {
		shippingAddress: {}
	};
	$scope.currentCustomer = {};
	$scope.orderForm = {
		currentOrder: $scope.currentOrder,
		currentCustomer: $scope.currentCustomer
	};

	$scope.error = false;
	configFromNode.getSFSearchClientSecret().then(function(response){
		if(response !== 'No Env Variable Set'){
			try{
				MessagingJS.subscribe('bpmNodeOrderId', response, $scope.searchByPiid, $scope.messageError, 'CANVAS');
				MessagingJS.subscribe('bpmNodeCustAttributes', response, $scope.LoadDetailsFunc, $scope.messageError, 'CANVAS');
			}catch(ReferenceError){
				$scope.warning = 'Application not loaded from Salesforce';
			}
			
		}else{
			$scope.error = 'No Env Varible Set';
		}
		
	});

	$scope.messageError = function(message){
		$scope.error = 'Error Occurred while subscribing onto event:  '+JSON.stringify(message);
	};
	$scope.searchByPiid = function (piid) {
		$scope.taskResult = {};
		Orders.searchByPiid(piid)
		.then(function(response){
			if(response !== 'Unable to Determine Status, please check your Process Number'){
				$scope.taskResult = response;
			}else{
				$scope.taskResult.currentStep = response;
				$scope.piidForm.$setPristine();
				$scope.orderNumber = null;				
			}
		});
	};
	$scope.LoadDetailsFunc = function(message){
		console.log('++++++++++++++++++++++++', message);
		$scope.attr.customerName = message.accountName;
		$scope.searchByAttribute();
	}
	$scope.attr = {};
	$scope.attrResults = false;
	$scope.searchByAttribute = function () {
		$scope.attrResults = [];
		Orders.searchByAttribute($scope.attr).then(function(response){
			console.log('Total Results for ',response);
			if(response !== [{ instanceName: "No Results found", instanceStatus: "n/a", instanceId: "n/a" }]){
				if(response && response.length > 0){
					for(var i=0; i<response.length; i++){
						Orders.searchByTaskId(response[i].taskId).then(function(taskDetails){
							for (var x = $scope.attrResults.length - 1; x >= 0; x--) {
								if(taskDetails.tkiid === $scope.attrResults[x].taskId.toString()){
									$scope.attrResults[x].taskDetails = taskDetails.data.variables;
								}
							};
						});
					}
				}
				$scope.attrResults = response;
				if (!$scope.attrResults || !$scope.attrResults.length) $scope.attrResults = [{ instanceName: "No Results found", instanceStatus: "n/a", instanceId: "n/a" }];
				$scope.attrForm.$setPristine();
			}else{
				$scope.attrResults = response;
			}
		})
	}
}]);
angular.module('bpm-app')
.factory('configFromNode', ['$q', '$http', function($q, $http) {
	var getSFSearchClientSecret = function(){
		var deferred = $q.defer();
		$http.get('/api/getSFSearchClientSecret')
        .then(function (body) {
        	deferred.resolve(body.data);
        })
        .catch(function(error){
        	deferred.resolve('No Env Variable Set');
        });
        return deferred.promise;
	}
	return {
		getSFSearchClientSecret: getSFSearchClientSecret
	};
}]);
angular.module('bpm-app')
.factory('Orders', ['$q', '$http', function($q, $http) {
	var submitOrder = function(order, customer){
		var deferred = $q.defer();
		var order = {
			"itemID": "25.b3913c0e-fd41-480b-9948-af096b3732f9",
			"branchID": "2063.22fc59b3-f1fe-4160-9284-c77ec43d734c",
			currentOrder: order,
			currentCustomer: customer
		};
		$http.post('/api/processes/start', order)
        .then(function (body) {
        	deferred.resolve(body.data.data.piid);
        }, function(error){
        	deferred.resolve("Invalid Order");
        }).then(null,function () {
			deferred.resolve("Invalid Order");
		}).catch(function () {
			deferred.resolve("Invalid Order");
		});
        return deferred.promise;
	}

	var searchByPiid = function(piid){
		var deferred = $q.defer();
		$http.get('/api/status/' + piid)
		.then(function (response) {
			deferred.resolve(response.data);
		}, function(error){
			deferred.resolve("Unable to Determine Status, please check your Process Number");
		}).then(null,function () {
			deferred.resolve("Unable to Determine Status, please check your Process Number");
		}).catch(function () {
			deferred.resolve("Unable to Determine Status, please check your Process Number");
		});
		return deferred.promise;
	}

	var searchByAttribute = function(attr){
		var deferred = $q.defer();
		$http.post('/api/attrSearch', attr)
		.then(function (response) {
			deferred.resolve(response.data.data.data);
		}, function(error){
			deferred.resolve([{ instanceName: "No Results found", instanceStatus: "n/a", instanceId: "n/a" }]);
		}).then(null, function () {
			deferred.resolve([{ instanceName: "No Results found", instanceStatus: "n/a", instanceId: "n/a" }]);
		})
		return deferred.promise;
	}

	var searchByTaskId = function(taskId){
		var deferred = $q.defer();
		$http.get('/api/taskDetails/'+taskId)
		.then(function (response) {
			deferred.resolve(response.data.data);
		}, function(error){
			deferred.resolve([{ instanceName: "No Results found", instanceStatus: "n/a", instanceId: "n/a" }]);
		}).then(null, function () {
			deferred.resolve([{ instanceName: "No Results found", instanceStatus: "n/a", instanceId: "n/a" }]);
		})
		return deferred.promise;
	}

	var finishTask = function(taskId, action){
		var deferred = $q.defer();
		$http.post('/api/finishTask/'+taskId+'/'+action)
		.then(function (response) {
			deferred.resolve(response.data);
		}, function(error){
			deferred.resolve([{ instanceName: "No Results found", instanceStatus: "n/a", instanceId: "n/a" }]);
		})
		return deferred.promise;
	}
	return {
		submitOrder: submitOrder,
		searchByPiid: searchByPiid,
		searchByAttribute: searchByAttribute,
		searchByTaskId : searchByTaskId,
		finishTask : finishTask
	};
}]);
angular.module('bpm-app')
.factory('processes', ['$q', '$http', function($q, $http) {
	var getProcesses = function(){
		var deferred = $q.defer();
		$http.get('/api/processes')
        .then(function (body) {
        	deferred.resolve(body.data.data);
        });
        return deferred.promise;
	}
	return {
		getProcesses: getProcesses
	};
}]);
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
