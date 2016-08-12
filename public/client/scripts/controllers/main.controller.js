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