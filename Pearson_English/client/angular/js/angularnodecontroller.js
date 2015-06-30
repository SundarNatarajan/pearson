'use strict';

var myApp = angular.module('myApp', []);

myApp.config(['$httpProvider', function($httpProvider) {
        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
    }
]);


/* Controllers */

function UserListCtrl($scope, $http, $templateCache) {
  
  var method = 'POST';
  var inserturl = 'http://services.test.com:8000/api/addentry';
  $scope.codeStatus = "";
  $scope.save = function() {
    var formData = {
      'username' : this.username,
      'password' : this.password,
	  'email' : this.email
    };
	this.username = '';
	this.password = '';
	this.email = '';
	
	var jdata = 'mydata='+JSON.stringify(formData);
	
	$http({
      method: method,
      url: inserturl,
      data:  jdata ,
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).
    success(function(response) {
		console.log("success");
        $scope.codeStatus = response.data;
		//console.log($scope.codeStatus);
    
    }).
    error(function(response) {
		console.log("error");
        $scope.codeStatus = response || "Request failed";
		//console.log($scope.codeStatus);
    });
	$scope.list();
    return false;
  };	

  
  $scope.list = function() {
	  //var url = 'http://localhost:7780/api/getemailsearchresult';	
	  
	$http({
      method: 'GET',
      url: 'http://services.test.com:8000/api/getemailsearchresult',
      headers: {'Content-Type': 'application/json'}
    }).success(function(data) {
		 // alert(JSON.stringify(data));
		$scope.users = data;
	});
  };
  
  $scope.list();
}

//PhoneListCtrl.$inject = ['$scope', '$http'];
