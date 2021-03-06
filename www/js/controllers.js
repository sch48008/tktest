angular.module('starter.controllers', [])

// The login controller
.controller('LoginCtrl', ['$scope', '$state', 'UserService', '$ionicHistory', '$window', 'SSFAlertsService',
    function($scope, $state, UserService, $ionicHistory, $window, SSFAlertsService) {

        $scope.user = {};


        // All this is about storing the user's email for future visits...
        var rememberMeValue;
        if ($window.localStorage["rememberMe"] === undefined || $window.localStorage["rememberMe"] == "true") {
            rememberMeValue = true;
        }
        else {
            rememberMeValue = false;
        }

        $scope.checkbox = {
            rememberMe: rememberMeValue
        };

        if ($window.localStorage["username"] !== undefined && rememberMeValue === true) {
            $scope.user.email = $window.localStorage["username"];
        }

        // On submit
        $scope.loginSubmitForm = function(form) {

            console.log("before check form valid");

            if (form.$valid) {
                UserService.login($scope.user)
                    .then(function(response) {

                        // debug
                        console.log("then function 1");

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

                            // All this is about storing the user's email for future visits...
                            $window.localStorage["rememberMe"] = $scope.checkbox.rememberMe;
                            if ($scope.checkbox.rememberMe) {
                                $window.localStorage["username"] = $scope.user.email;
                            }
                            else {
                                delete $window.localStorage["username"];
                                $scope.user.email = "";
                            }
                            $scope.user.password = "";
                            form.$setPristine();
                        }
                        else {

                            // debug
                            console.log("then function 1: else response.status !== 200");

                            // invalid response
                            SSFAlertsService.showAlert("Error", "Something went wrong, try again.");
                        }
                    }, function(response) {
                        // Code 401 corresponds to Unauthorized access, in this case, the email/password combination was incorrect.
                        if (response.status === 401) {
                            SSFAlertsService.showAlert("Error", "Incorrect username or password");
                        }
                        else if (response.data === null) {

                            // debug
                            console.log("then function 2: response.data === null");

                            //If the data is null, it means there is no internet connection.
                            SSFAlertsService.showAlert("Error", "The connection with the server was unsuccessful, check your internet connection and try again later.");
                        }
                        else {

                            // debug
                            console.log("then function 2: else catch-all");

                            SSFAlertsService.showAlert("Error", "Something went wrong, try again.");
                        }
                    });
            }
        };
    }
])

// The register controller
.controller('RegisterCtrl', ['$scope', '$state', 'UserService', '$ionicHistory', '$window', 'SSFAlertsService',
    function($scope, $state, UserService, $ionicHistory, $window, SSFAlertsService) {


        // used to register user
        $scope.register = {};

        // used to verify repeat password only
        $scope.password = {};


        function resetFields() {
            $scope.user.email = "";
            $scope.user.firstName = "";
            $scope.user.lastName = "";
            $scope.user.organization = "";
            $scope.user.password = "";
            $scope.repeatPassword.password = "";
        }


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
                    resetFields();

                }, function(response) {
                    // something went wrong
                    console.log(response);
                    $state.go('landing');
                    resetFields();
                });
        }



        // Here is the registration function
        $scope.registerSubmitForm = function(form) {

            // Check that the passwords match
            if ($scope.register.password !== $scope.password.repeatPassword) {
                SSFAlertsService.showAlert("Error", "The repeat password is not the same as the password. Please correct.");
                return;
            }

            // Create user
            if (form.$valid) {
                UserService.create($scope.register)
                    .then(function(response) {
                        if (response.status === 200) {
                            loginAfterRegister();
                            form.$setPristine();
                        }
                        else {
                            // invalid response
                            console.log(response);
                            SSFAlertsService.showAlert("Error", "Something went wrong, try again.");
                        }
                    }, function(response) {
                        // Code 422 means a user with that email already exists in the database.
                        if (response.status === 422) {
                            SSFAlertsService.showAlert("Error", "A user with that email is already registered.");
                        }
                        else if (response.data === null) {
                            //If the data is null, it means there is no internet connection.
                            SSFAlertsService.showAlert("Error", "The connection with the server was unsuccessful, check your internet connection and try again later.");
                        }
                        else {
                            SSFAlertsService.showAlert("Error", "Something went wrong, try again.");
                        }
                    });
            }
        };
    }
])

// The Lobby Controller
.controller('LobbyCtrl', ['$scope', '$state', '$ionicHistory', 'UserService', '$window', 'ServerQuestionService', 'TKQuestionsService', 'TKAnswersService', 'SSFAlertsService',
    function($scope, $state, $ionicHistory, UserService, $window, ServerQuestionService, TKQuestionsService, TKAnswersService, SSFAlertsService) {

        // reset the category totals left over from previous tests every time we enter this view.
        $scope.$on('$ionicView.enter', function() {
            // console.log("reset");
            TKAnswersService.resetCategoryTotals();
            // console.log("get category totals from lobby controller:");
            // console.log(TKAnswersService.getCategoryTotals());
        });

        // Logout function - called from template
        $scope.logout = function() {
            UserService.logout($window.localStorage.token)
                .then(function(response) {
                    //The successful code for logout is 204
                    if (response.status === 204) {
                        console.log("successful logout");

                        // delete user info from local storage
                        delete $window.localStorage['token'];
                        delete $window.localStorage['userID'];

                        $ionicHistory.nextViewOptions({
                            historyRoot: true,
                            disableBack: true
                        });
                        $state.go('landing');
                    }
                    else {
                        SSFAlertsService.showAlert("Error", "Could not logout at this moment, try again.");
                    }
                }, function(response) {
                    SSFAlertsService.showAlert("Error", "Could not logout at this moment, try again.");
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
                    else if (response.status !== 401) {
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

            SSFAlertsService.showConfirm("Failed to Retrieve Questions", "The questions could not be retrieved at this time, do you want to try again?")
                .then(function(response) {
                    if (response == true) {
                        getQuestions();
                    }
                });
        }
    }
])

// The Test controller
.controller('TestCtrl', ['$scope', 'testInfo', '$stateParams', '$state', '$window', 'ServerAnswersService', 'TKQuestionsService', 'TKAnswersService', '$ionicHistory', 'TKResultsButtonService', 'SSFAlertsService',
    function($scope, testInfo, $stateParams, $state, $window, ServerAnswersService, TKQuestionsService, TKAnswersService, $ionicHistory, TKResultsButtonService, SSFAlertsService) {

        // rjs debug
        // console.log("category totals from the test controller:");
        // console.log(TKAnswersService.getCategoryTotals());


        // set title
        var qNumber = $stateParams.testID;
        $scope.title = "Question #" + qNumber;

        $scope.$on("$ionicView.beforeEnter", function() {
            var lastQuestionNumber = TKAnswersService.getLastQuestionNumber();
            if (parseInt(qNumber) < lastQuestionNumber) {
                TKAnswersService.setLastQuestionNumber(lastQuestionNumber - 1);
                TKAnswersService.eraseLastAnswer();
            }
            TKAnswersService.setLastQuestionNumber(parseInt(qNumber));
        });



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

            // If we have completed the last question, store the category results to the database.
            if (nextqNumber > 30) {

                storeToDatabase();
            }
            else {
                $state.go('test.detail', {
                    testID: nextqNumber
                });
            }
        };

        // This method stores the category totals for the user/date/time to the database
        function storeToDatabase() {

            // copy the category totals so that we don't affect the a reference object.
            var userCategoryTotals = angular.copy(TKAnswersService.getCategoryTotals());

            // Add these 2 properties to the copy of the category totals object. Because javascript is dynamic we can add properties to the object at any time.

            // add user id
            userCategoryTotals["userID"] = $window.localStorage['userID'];

            // add date/time
            var date = new Date();
            userCategoryTotals["createDate"] = date.toUTCString();

            // Call the REST service
            ServerAnswersService.create(userCategoryTotals, $window.localStorage['token'])
                .then(function(response) {
                    if (response.status === 200) {
                        $ionicHistory.nextViewOptions({
                            disableBack: true
                        });

                        // The user does not want to back through 30 pages to get back to the menu. Provide a menu button.
                        TKResultsButtonService.setShouldShowMenuButton(true);

                        $state.go('results');
                    }
                    else if (response.status !== 401) {
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

            SSFAlertsService.showConfirm("Failed to Save Answers", "The answers could not be saved at the moment, do you want to try again?")
                .then(function(response) {
                    if (response == true) {
                        storeToDatabase();
                    }
                    else {
                        $ionicHistory.nextViewOptions({
                            disableBack: true
                        });

                        // The user does not want to back through 30 pages to get back to the menu. Provide a menu button.
                        TKResultsButtonService.setShouldShowMenuButton(true);

                        $state.go('results');
                    }
                });
        }
    }
])

// The Results controller
.controller('ResultsCtrl', ['$scope', 'TKAnswersService', '$ionicHistory', '$state', 'TKResultsButtonService', 'SSFAlertsService',
    function($scope, TKAnswersService, $ionicHistory, $state, TKResultsButtonService, SSFAlertsService) {


        // These tasks should be performed anew each time we enter this view...
        $scope.$on('$ionicView.enter', function() {

            // rjs could not get this to work
            // In some cases this page needs to show a "menu" button, in ohers not.  This boolean is set in the page preceding this page.
            // $scope.shouldShowButton = TKResultsButtonService.getShouldShowMenuButton();

            // Get the category totals
            var categoryTotals = TKAnswersService.getCategoryTotals();

            // Compute the chart series data
            $scope.data = [
                [returnPercentage(categoryTotals["competing"]), returnPercentage(categoryTotals["collaborating"]),
                    returnPercentage(categoryTotals["compromising"]), returnPercentage(categoryTotals["avoiding"]), returnPercentage(categoryTotals["accommodating"])
                ]
            ];
        });



        $scope.menuButtonTapped = function() {
            $ionicHistory.nextViewOptions({
                historyRoot: true,
                disableBack: true
            });
            $state.go('lobby');
        };

        // The chart x-axis labels
        $scope.labels = ["Competing", "Collaborating", "Compromising", "Avoiding", "Accommodating"];


        // rjs debug
        // console.log("category totals from the results controller:");
        // console.log(categoryTotals);

        // To compute percentage. The maximum value a user can obtain for a category is twelve.
        function returnPercentage(value) {
            return (value / 12) * 100;
        }



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
])

// The History controller
.controller('HistoryCtrl', ['$scope', 'ServerAnswersService', '$window', '$state', 'TKAnswersService', 'TKResultsButtonService', 'SSFAlertsService',
    function($scope, ServerAnswersService, $window, $state, TKAnswersService, TKResultsButtonService, SSFAlertsService) {

        // array variable to hold all the tests
        $scope.tests = [];

        $scope.goToResult = function(test) {
            var categoryTotals = {
                "competing": test.competing,
                "collaborating": test.collaborating,
                "compromising": test.compromising,
                "avoiding": test.avoiding,
                "accommodating": test.accommodating
            };
            TKAnswersService.setCategoryTotals(categoryTotals);

            // menu button not needed from the page we are going to
            TKResultsButtonService.setShouldShowMenuButton(false);

            $state.go('results');
        };

        // internal method
        function confirmPrompt() {

            SSFAlertsService.showConfirm("Failed to Retrieve Results", "Your results could not be retrieved at the moment, do you want to try again?")
                .then(function(response) {
                    if (response == true) {
                        getResultsByUser();
                    }
                });
        }


        // internal method
        function getResultsByUser() {
            ServerAnswersService.getResultsByUser($window.localStorage['userID'], $window.localStorage['token'])
                .then(function(response) {
                    if (response.status === 200) {

                        // store response data
                        $scope.tests = response.data;
                    }
                    else if (response.status !== 401) {
                        // invalid
                        confirmPrompt();
                    }
                }, function(response) {
                    // something went wrong
                    console.log(response);
                    confirmPrompt();
                });
        }


        // call internal method to fill array variable
        getResultsByUser();
    }
]);
