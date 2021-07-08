entityEditor.directive('radioButtonsListControl', ['$compile', function ($compile) {
    return {
        restrict: 'EA',
        scope: {
            entityField: '=',
            entityDef: '=',
            entity: '='
        },

        link: function (scope, element, attr) {
            if (scope.entityField == undefined) {
                return;
            }
            

            /*


            var ctrlHtml = $("#" + controlTemplateName).html();
            if (ctrlHtml != undefined) {
                ctrlHtml = ctrlHtml.replace('ValueBindingString', valueBindingString);
                ctrlHtml = ctrlHtml.replace('validatorstring', validatorString);
                ctrlHtml = ctrlHtml.replace('FieldPresenterString', fieldPresenterString);
                // console.debug(valueBindingString);
                // console.debug("PresenterString :" +fieldPresenterString);
                //   console.debug(ctrlHtml);
                // console.debug( scope.validatorString);
                // console.debug(scope.instanceversion);
                var output = $compile(ctrlHtml)(scope);
                angular.element(element).append(output);
                //   $("#frmWorkflowForm").kiwiValidator('recreate');
            }
            */
        },
    };
}]);