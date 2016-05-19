angular.module('SSFAlerts', [])
    .service('SSFAlertsService', ['$ionicPopup', '$q', function($ionicPopup, $q) {

        var service = this;

        // alert - using cordova navigator
        service.showAlert = function(title, body) {
            navigator.notification.alert(body, null, title);
        };

        // alert - using ionic popup
        // service.showAlert = function(title, body) {
        //     var alertPopup = $ionicPopup.alert({
        //         title: title,
        //         template: body
        //     });
        //     alertPopup.then();
        // };


        // confirm - using cordova navigator
        service.showConfirm = function(title, body) {
            var defer = $q.defer();
            var confirmCallback = function(buttonIndex) {
                if (buttonIndex === 1) {
                    defer.resolve(true);
                }
                else {
                    defer.resolve(false);
                }
            };
            navigator.notification.confirm(body, confirmCallback, title);
            return defer.promise;
        };

        // confirm - using ionic popup
        // service.showConfirm = function(title, body) {
        //     var confirmPopup = $ionicPopup.confirm({
        //         title: title,
        //         template: body
        //     });
        //     return confirmPopup;
        // };



    }]);