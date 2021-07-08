entityEditor.directive('validationSummary', ['$compile', function ($compile) {

    return {
        restrict: 'EA',
        scope: {
            rootScope: '=',
            entity: '=',
            entityDef: '='

        },

        link: function (scope, element, attr) {
            scope.FormValidationErrors = [];
            /*
            scope.$watch('entity.__ValidationErrors__.length', function () {
                 if (scope.entity.__ValidationErrors__ == undefined || scope.entity.__ValidationErrors__ == null)
                {
                    return;
                }
                scope.FormValidationErrors = [];
                if (scope.entity.__ValidationErrors__.length > 0)
                {
                    $.each(scope.entity.__ValidationErrors__, function (erIndex, verror) {
                        if (verror.type == 1) {
                            scope.FormValidationErrors.push(verror.message);
                        }
                    });
                }
            });
            */
            scope.$watch('rootScope.errors.length', function () {
                if (scope.rootScope.errors == undefined || scope.rootScope.errors == null) {
                    return;
                }
                scope.FormValidationErrors = [];
                if (scope.rootScope.errors.length > 0) {
                    $.each(scope.rootScope.errors, function (erIndex, verror) {
                        if (verror.type == 1) {
                            scope.FormValidationErrors.push(verror.message);
                        }
                    });
                }
            },true);
            var ctrlHtml = $("#FormValidationSummaryTemplate").html();
            var output = $compile(ctrlHtml)(scope);
            angular.element(element).append(output);
        },
    };
}]);