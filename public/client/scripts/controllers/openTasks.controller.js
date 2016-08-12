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