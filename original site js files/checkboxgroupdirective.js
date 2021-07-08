entityEditor.directive('checkBoxGroup', ['$compile', function ($compile) {
  
    return {
        restrict: 'EA',
        scope: {
            element: '=',
            entity: '=',
            rootScope:'=',
            field:'=',
            checkItems:'=',
            checkItem:'='
        },

        link: function (scope, element, attr) {
         
            if(Array.isArray( scope.entity[scope.field.Name]) == false)
            {
                scope.entity[scope.field.Name] =[] ;
            }
         

            element.bind('click', function () {
                var val = element.val();
                if(element.is(":checked"))
                {
                    var idx = scope.entity[scope.field.Name].indexOf(val);
                    if (idx == -1) {
                        scope.entity[scope.field.Name].push(val);
                        }
                }
                else
                {
                    var idx = scope.entity[scope.field.Name].indexOf(val);
                    if (idx > -1) {
                        scope.entity[scope.field.Name].splice(idx, 1);
                    }
                }
                var presenterStr = "";
                $.each(scope.entity[scope.field.Name], function (index, value) {
                    var it = _.find(scope.checkItems, function (o) {return o.Id == value });
                    presenterStr += (presenterStr == "") ? it.Text : ", " + it.Text;
                });
                scope.entity["__" + scope.field.Name + "_PresenterString"] = presenterStr;
                scope.$apply();
            });
        }
    }
}]);