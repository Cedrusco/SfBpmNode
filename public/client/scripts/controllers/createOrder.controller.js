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