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