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

    // used to retract category totals when using the "Back" button
    var lastQuestionNumber = 0;
    var categoriesStack = [];

    service.setLastQuestionNumber = function(qNumber) {
        lastQuestionNumber = qNumber;
    };

    service.getLastQuestionNumber = function() {
        return lastQuestionNumber;
    };

    // save the individual answer but also increment the appropriate category total
    service.saveAnswer = function(questionNumber, answerCategory, option) {
        categoryTotals[answerCategory.toLowerCase()]++;
        answers[questionNumber] = option;
        categoriesStack.push(answerCategory);
    };

    // used to retract category totals when using the "Back" button
    service.eraseLastAnswer = function() {
        categoryTotals[categoriesStack.pop().toLowerCase()]--;
    };

    // get category totals
    service.getCategoryTotals = function() {
        return categoryTotals;
    };

    // set category totals
    service.setCategoryTotals = function(pCategoryTotals) {
        categoryTotals = pCategoryTotals;
    };

    // reset totals to zero once test is complete and has been viewed.
    service.resetCategoryTotals = function() {
        for (var property in categoryTotals) {
            if (categoryTotals.hasOwnProperty(property)) {
                categoryTotals[property] = 0;
            }
        }
        lastQuestionNumber = 0;
    };

})

// Show button service
.service('TKResultsButtonService', function() {
    var service = this;

    var shouldShowButton = false;

    service.setShouldShowMenuButton = function(show) {
        shouldShowButton = show;
    };

    service.getShouldShowMenuButton = function() {
        return shouldShowButton;
    };
});