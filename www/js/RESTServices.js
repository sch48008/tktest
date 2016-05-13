angular.module('RESTConnection', [])

.constant('ENDPOINT_URL', 'https://strongloop-backend-bitflipper86.c9users.io/api/')

// The UserService which can create a new user (register a new user) or can login a user.
.service('UserService', ['$http', 'ENDPOINT_URL',
function ($http, ENDPOINT_URL) {
    
    var service = this;
    var path = 'SSFUsers/';
    
    // Get full path
    function getUrl() {
        return ENDPOINT_URL + path;
    }
    
    // Create a new user
    service.create = function(user) {
        return $http.post(getUrl(), user);
    };
    
    // Login
    service.login = function(user) {
        return $http.post(getUrl()+"login", user);
    };
    
}]);