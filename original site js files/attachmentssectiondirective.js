entityEditor.directive("attachmentsSection", ['$compile',function ($compile) {
    return {
        restrict: 'EA',
        scope: {
            entity: '=',
        },
        link: function (scope, element, attributes) {
       
         
            scope.$watch('entity', function () {
                if (scope.entity.Attachments == undefined) {
                    scope.entity.Attachments = [];
                    
                }

            });
            scope.attachmentItem = null;
            scope.AddAttachment = function () {
                scope.attachmentItem = { Id: createGuid(), Name: "", EntityItemId: scope.entity.Id, 
                    FileItemId: "", FileContent : "", Notes: "", __Status: "Created" };
            };

            scope.DeleteAttachment = function (attachment) {
                if(attachment.__Status == "Created" )
                {
                    var idx = scope.entity.Attachments.indexOf(attachment);
                    if(idx > -1)
                    {
                        scope.entity.Attachments.splice(idx, 1);
                    }
                }
                else
                {
                    attachment.__Status = "Deleted";
                }
            };
            scope.AddFile = function () {
                var fileElem = $('<input type="file" style="display:none;">');
                element.append(fileElem);

                fileElem.bind("change", function (changeEvent) {
                    var file = this.files[0];
                    var reader = new FileReader();
                    reader.onload = function (loadEvent) {
                        scope.attachmentItem.FileContent = loadEvent.target.result;
                        scope.attachmentItem.FileName = file.name;
                        var status = scope.attachmentItem.__Status = "Created";
                        scope.$apply();
                    };
                    reader.readAsDataURL(file);
                    fileElem.remove();
                });
                fileElem.click();
            };
            scope.OkClick = function () {
                if (scope.attachmentItemNameIsValid() == false || scope.attachmentItemContentIsValid() == false)
                {
                    return;
                }

                scope.entity.Attachments.push(angular.copy(scope.attachmentItem));
                scope.attachmentItem = null;
            
            };
            scope.CancelClick = function () {
                scope.attachmentItem = null;
            };
            scope.attachmentItemNameIsValid = function () {
                if (scope.attachmentItem == undefined || scope.attachmentItem == null)
                {
                    return true;
                }
                if (scope.attachmentItem.Name == undefined || scope.attachmentItem.Name == null || scope.attachmentItem.Name == "")
                {
                    return false;
                }
                return true;
            };
            scope.attachmentItemContentIsValid = function () {
                if (scope.attachmentItem == undefined || scope.attachmentItem == null) {
                    return true;
                }
                if (scope.attachmentItem.FileContent == undefined || scope.attachmentItem.FileContent == null || scope.attachmentItem.FileContent == "") {
                    return false;
                }
                return true;
            };
            scope.filterNotDeleted = function (att) {
                return att.__Status != "Deleted";
            };
            /*
            var file = this.files[0];
            var reader = new FileReader();
            reader.onload = function (loadEvent) {
                console.debug(file);
                scope.entity[scope.field.Name + "__FileContent"] = loadEvent.target.result;
                scope.entity[scope.field.Name + "__FileName"] = file.name;
                var status = scope.entity[scope.field.Name + "__Status"];
                if (status == undefined) {
                    scope.entity[scope.field.Name + "__Status"] = "Created";
                }
                else {
                    scope.entity[scope.field.Name + "__Status"] = "Updated";
                }
                scope.entity[scope.field.Name] = file.name;
                scope.$apply();
            };
            reader.readAsDataURL(file);*/
            var html = $('#EntityAttachments_RW_Template').html();
            var compiled = $compile(html)(scope);
            angular.element(element).append(compiled);
        }
    }
}]);