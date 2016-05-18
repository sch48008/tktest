angular.module('starter.controllers', [])

// The login controller
.controller('LoginCtrl', ['$scope', '$state', 'UserService', '$ionicHistory', '$window',
    function($scope, $state, UserService, $ionicHistory, $window) {

        $scope.user = {};

        $scope.loginSubmitForm = function(form) {
            if (form.$valid) {
                UserService.login($scope.user)
                    .then(function(response) {
                        if (response.status === 200) {
                            //Should return a token
                            console.log(response);

                            // save userId and token
                            $window.localStorage["userID"] = response.data.userId;
                            $window.localStorage['token'] = response.data.id;

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
.controller('RegisterCtrl', ['$scope', '$state', 'UserService', '$ionicHistory', '$window',
    function($scope, $state, UserService, $ionicHistory, $window) {


        // used to register user
        $scope.register = {};

        // used to verify repeat password only
        $scope.password = {};



        //Here is a sub-function required to get the access token after registration.
        function loginAfterRegister() {
            UserService.login($scope.register)
                .then(function(response) {
                    if (response.status === 200) {

                        //Should return a token
                        $window.localStorage["userID"] = response.data.userId;
                        $window.localStorage['token'] = response.data.id;

                        console.log("successful login after register");

                        $ionicHistory.nextViewOptions({
                            historyRoot: true,
                            disableBack: true
                        });
                        $state.go('lobby');
                    }
                    else {
                        // invalid response
                        $state.go('landing');
                    }
                }, function(response) {
                    // something went wrong
                    console.log(response);
                    $state.go('landing');
                });
        }



        // Here is the registration function
        $scope.registerSubmitForm = function(form) {

            // Check that the passwords match
            if ($scope.register.password !== $scope.password.repeatPassword) {
                alert("The repeat password is not the same as the password. Please correct.");
                return;
            }

            // Create user
            if (form.$valid) {
                UserService.create($scope.register)
                    .then(function(response) {
                        if (response.status === 200) {
                            loginAfterRegister();
                        }
                        else {
                            // invalid response
                            console.log(response);
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
])

// The Lobby Controller
.controller('LobbyCtrl', ['$scope', '$state', '$ionicHistory', 'UserService', '$window', 'ServerQuestionService', 'TKQuestionsService',
    function($scope, $state, $ionicHistory, UserService, $window, ServerQuestionService, TKQuestionsService) {

        // Logout function - called from template
        $scope.logout = function() {
            UserService.logout($window.localStorage.token)
                .then(function(response) {
                    //The successful code for logout is 204
                    if (response.status === 204) {
                        console.log("successful logout");

                        $ionicHistory.nextViewOptions({
                            historyRoot: true,
                            disableBack: true
                        });

                        $state.go('landing');
                    }
                    else {
                        alert("Could not logout at this moment, try again.");
                    }
                }, function(response) {
                    alert("Could not logout at this moment, try again.");
                });
        };

        // Take Test Button Handler- called from template
        $scope.takeTestButtonTapped = function() {
            if (TKQuestionsService.questionsLength() === 0)
                getQuestions();
            else {

                // hold for now...
                $state.go('test.detail', {
                    testID: 1
                });
            }
        };


        // This code runs on startup...


        //Get Questions Initially if they are not already stored
        if (TKQuestionsService.questionsLength() === 0) {

            console.log("questions length = 0 so will get questions");
            getQuestions();
        }
        else {
            console.log("questions length > 0");
        }

        // Get Questions
        function getQuestions() {
            ServerQuestionService.all($window.localStorage['token'])
                .then(function(response) {
                    if (response.status === 200) {

                        // debug
                        console.log("questions were retrieved from db");

                        var questions = response.data;
                        TKQuestionsService.setQuestions(questions);
                    }
                    else {
                        // invalid response
                        confirmPrompt();
                    }
                }, function(response) {
                    // something went wrong
                    confirmPrompt();
                });
        }

        // method
        function confirmPrompt() {
            var response = confirm("The questions could not be retrieved at this time, do you want to try again?");
            if (response == true) {
                getQuestions();
            }
        }
    }
])

// The Test controller
.controller('TestCtrl', ['$scope', 'testInfo', '$stateParams', '$state', '$window', 'ServerAnswersService', 'TKQuestionsService', 'TKAnswersService', '$ionicHistory',
    function($scope, testInfo, $stateParams, $state, $window, ServerAnswersService, TKQuestionsService, TKAnswersService, $ionicHistory) {

        // set title
        var qNumber = $stateParams.testID;
        $scope.title = "Question #" + qNumber;

        testInfo.forEach(function(testQuestion) {
            if (testQuestion.Answer_ID === "A")
                $scope.questionA = testQuestion;
            else if (testQuestion.Answer_ID === "B")
                $scope.questionB = testQuestion;
        });

        $scope.buttonClicked = function(option) {
            var category = $scope["question" + option].Style;
            TKAnswersService.saveAnswer(qNumber, category, option);

            var nextqNumber = Number(qNumber) + 1;
            if (nextqNumber > 30) {
                performRequest();
            }
            else {
                $state.go('test.detail', {
                    testID: nextqNumber
                });
            }
        };

        // This method stores the category totals for the user/date/time to the database
        function performRequest() {

            var userCategoryTotals = TKAnswersService.getCategoryTotals();

            // add these properties to the user's category totals object. Because javascript is dynamic we can add properties to the object at any time.

            // user id
            userCategoryTotals["userID"] = $window.localStorage['userID'];

            // date/time
            var date = new Date();
            userCategoryTotals["createDate"] = date.toUTCString();

            // Call the REST service
            ServerAnswersService.create(userCategoryTotals, $window.localStorage['token'])
                .then(function(response) {
                    if (response.status === 200) {
                        $ionicHistory.nextViewOptions({
                            disableBack: true
                        });
                        $state.go('results');
                    }
                    else {
                        // invalid response
                        confirmPrompt();
                    }
                }, function(response) {
                    // something went wrong
                    confirmPrompt();
                });
        }

        // Only used if we have trouble storing the results
        function confirmPrompt() {
            var response = confirm("The answers could not be saved at the moment, do you want to try again?");
            if (response == true) {
                performRequest();
            }
            else {
                $ionicHistory.nextViewOptions({
                    disableBack: true
                });
                $state.go('results');
            }
        }

    } // end function
])

// The Results controller
.controller('ResultsCtrl', ['$scope', 'TKAnswersService', '$ionicHistory', '$state',
    function($scope, TKAnswersService, $ionicHistory, $state) {

        $scope.menuButtonTapped = function() {
            $ionicHistory.nextViewOptions({
                historyRoot: true,
                disableBack: true
            });
            $state.go('lobby');
        };

        // The chart x-axis labels
        $scope.labels = ["Competing", "Collaborating", "Compromising", "Avoiding", "Accommodating"];

        var categoryTotals = TKAnswersService.getCategoryTotals();

        // To compute percentage. The maximum value a user can obtain for a category is twelve.
        function returnPercentage(value) {
            return (value / 12) * 100;
        }

        // The chart series data
        $scope.data = [
            [returnPercentage(categoryTotals["competing"]), returnPercentage(categoryTotals["collaborating"]),
                returnPercentage(categoryTotals["compromising"]), returnPercentage(categoryTotals["avoiding"]), returnPercentage(categoryTotals["accommodating"])
            ]
        ];

        $scope.options = {
            scaleIntegersOnly: true,
            animation: false,
            responsive: true,
            maintainAspectRatio: false,
            scaleOverride: true,
            scaleSteps: 4,
            scaleStepWidth: 25,
            scaleStartValue: 0,
            scaleLabel: "<%=value%>" + "%",
            tooltipTemplate: "<%if (label){%><%=label%>: <%}%><%= value.toFixed(0) %>" + "%"
        };

        $scope.colours = [{
            fillColor: "rgba(151,187,205,0.2)",
            strokeColor: "rgba(15,187,25,1)",
            pointColor: "rgba(15,187,25,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(151,187,205,0.8)"
        }];
    }
]);
