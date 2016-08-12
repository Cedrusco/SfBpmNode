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