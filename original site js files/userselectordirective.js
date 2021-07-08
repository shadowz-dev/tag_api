entityEditor.directive('userSelector', ['$compile', function ($compile) {
return {
    restrict: 'EA',
    scope: {
        onOkCallback :'=',
        multiSelect:'='
    },
    link: function (scope, element, attr) {

                                 scope.searchText = "";
                                 scope.search = function () {
                                     $.getJSON(appPath + "entities/UserSelectorSearch", { SearchText: scope.searchText }, function (response) {
                                         if(response.HasError)
                                         {
                                             alert(response.ErrorMessage);
                                             return;
                                         }
                                         scope.searchResult = response.Result;
                                         scope.$apply();
                                     });
                                 };
                                 scope.searchResult = [];
                                 scope.okClick = function () {
                                   if(scope.multiSelect)
                                   {
                                       if (scope.selectedUsers.length == 0)
                                       {
                                           alert("من فضلك اختار على الأقل مستخدم واحد");
                                           return;
                                       }
                                       scope.onOkCallback(scope.selectedUsers);
                                   }
                                   else
                                   {
                                       if (scope.selectedResultItem == null)
                                       {
                                           alert("من فضلك اختار على الأقل مستخدم واحد");
                                           return;
                                       }
                                       scope.onOkCallback(scope.selectedResultItem);
                                   }
                                     
                                     element.remove();
                                 };
                                 scope.cancelClick = function () {
                                     element.remove();
                                 };
                                 scope.selectResultItem = function (item) {
                                     scope.selectedResultItem = item;
                                     
                                 };
                                 scope.selectedUsers = [];
                                 scope.addCheckedUsers = function () {
                                     var users = $linq(scope.searchResult).where("x=> x.__selected == true").toArray();
                                     if (users != undefined && users != null) {
                                         $.each(users, function (index, obj) {

                                             var exists = _.find(scope.selectedUsers, function (o) {
                                                 return o.Id.toUpperCase() == obj.Id.toUpperCase();
                                             });
                                             if (exists == undefined) {
                                                 scope.selectedUsers.push(obj);
                                             }

                                         })
                                     }
                                 };
                                 scope.selectedResultItem = null;
                                 var html = $("#UserSelectorContentTemplate").html();
                                 var compiled = $compile(html)(scope);
                                 angular.element(element).append(compiled);
        }
    }
}]);