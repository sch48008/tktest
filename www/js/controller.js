angular.module('starter.controllers', [])

// The login controller
.controller('LoginCtrl', ['$scope', '$state', 'UserService', '$ionicHistory',
    function($scope, $state, UserService, $ionicHistory) {

        $scope.user = {};

        $scope.loginSubmitForm = function(form) {
            if (form.$valid) {
                UserService.login($scope.user)
                    .then(function(response) {
                        if (response.status === 200) {
                            //Should return a token
                            console.log(response);
                            $ionicHistory.nextViewOptions({
                                historyRoot: true,
                                disableBack: true
                            });
                            $state.go('lobby');
                        }
                        else {
                            // invalid response
                            alert("Something went wrong, try again.");
                        }
                    }, function(response) {
                        // Code 401 corresponds to Unauthorized access, in this case, the email/password combination was incorrect.
                        if (response.status === 401) {
                            alert("Incorrect username or password");
                        }
                        else if (response.data === null) {
                            //If the data is null, it means there is no internet connection.
                            alert("The connection with the server was unsuccessful, check your internet connection and try again later.");
                        }
                        else {
                            alert("Something went wrong, try again.");
                        }
                    });
            }
        };
    }
])

// The register controller
.controller('RegisterCtrl', ['$scope', '$state', 'UserService', '$ionicHistory',
    function($scope, $state, UserService, $ionicHistory) {

        // used to register user
        $scope.register = {};
        
        // used to verify repeat password only
        $scope.password = {};        

        $scope.registerSubmitForm = function(form) {
            
            // Check that the passwords match
            if($scope.register.password !== $scope.password.repeatPassword) {
                alert("The repeat password is not the same as the password. Please correct.");
                return;
            }
            
            // Create user
            if (form.$valid) {
                UserService.create($scope.register)
                    .then(function(response) {
                        if (response.status === 200) {
                            console.log(response);
                            $ionicHistory.nextViewOptions({
                                historyRoot: true,
                                disableBack: true
                            });
                            $state.go('lobby');
                        }
                        else {
                            // invalid response
                            alert("Something went wrong, try again.");
                        }
                    }, function(response) {
                        // Code 422 means a user with that email already exists in the database.
                        if (response.status === 422) {
                            alert("A user with that email is already registered.");
                        }
                        else if (response.data === null) {
                            //If the data is null, it means there is no internet connection.
                            alert("The connection with the server was unsuccessful, check your internet connection and try again later.");
                        }
                        else {
                            alert("Something went wrong, try again.");
                        }
                    });
            }
        };
    }
]);