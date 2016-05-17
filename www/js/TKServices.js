// define new module
angular.module('TKServicesModule', [])

// first service in module
.service('TKQuestionsService', function() {

    var service = this;
    var questions = [];

    // method
    service.setQuestions = function(serverQuestions) {
        questions = serverQuestions;
    };

    // method
    service.getQuestion = function(questionID) {

        // return value
        var results = [];

        // Loop thru questions
        questions.forEach(function(question) {

            //Search for questions with the specified question ID
            if (question.Question_Number == questionID)
                results.push(question);
        });

        // return value
        return results;
    };

    // method
    service.questionsLength = function() {
        return questions.length;
    };
});