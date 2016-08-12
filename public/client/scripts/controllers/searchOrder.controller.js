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