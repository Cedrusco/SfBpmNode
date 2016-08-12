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