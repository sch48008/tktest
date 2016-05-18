// define new module
angular.module('TKServicesModule', [])

// Question service
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
})

// Answers service
.service('TKAnswersService', function() {

    var service = this;
    var categoryTotals = {
        "competing": 0,
        "collaborating": 0,
        "compromising": 0,
        "avoiding": 0,
        "accommodating": 0
    };
    var answers = {};

    service.saveAnswer = function(questionNumber, answerCategory, option) {
        categoryTotals[answerCategory.toLowerCase()]++;
        answers[questionNumber] = option;
    };

    service.getCategoryTotals = function() {
        return categoryTotals;
    };
    
    

});