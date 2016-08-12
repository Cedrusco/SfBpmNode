angular.module('bpm-app')
.controller('HomeCtrl', ['$scope', 'processes', function($scope, processes) {
	$scope.init = function(){
		processes.getProcesses().then(function(response){
			$scope.processes = response.exposedItemsList;
		});
	}
	$scope.init();
}]);