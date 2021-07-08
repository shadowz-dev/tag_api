entityEditor.directive("fileInput", [function () {
    return {
        link: function (scope, element, attributes) {
         
            element.bind("change", function (changeEvent) {
                var file = this.files[0];
                var reader = new FileReader();
                reader.onload = function (loadEvent) {
                 
                    scope.entity[scope.field.Name + "__FileContent"] = loadEvent.target.result;
                    scope.entity[scope.field.Name + "__FileName"] = file.name;
                    var status = scope.entity[scope.field.Name + "__Status"];
                    if (status == undefined ) {
                        scope.entity[scope.field.Name + "__Status"] = "Created";
                    }
                    else
                    {
                        scope.entity[scope.field.Name + "__Status"] = "Updated";
                    }
                    scope.entity[scope.field.Name] = file.name;
                    scope.$apply();
                };
                reader.readAsDataURL(file);
            });
        }
    }
}]);