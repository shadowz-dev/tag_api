entityEditor.directive('choiceControl', ['$compile','EntityService', function ($compile,EntityService) {
  
    return {
        restrict: 'EA',
        scope: {
            element: '=',
            entity: '=',
            rootScope:'=',
            field:'=',
        entityDef: '='
        },

        link: function (scope, element, attr) {
scope.ZASOULID = createGuid();
          scope.ChoiceItemsArray = [];
            if (scope.field == undefined) {
                return;
            }
            var controlTemplateName = "";
            var valueBindingString = "";
         //   var validatorString = "";
            var fieldPresenterString = "";
           scope.lookupId = "";
//scope.ChoiceItems = [];
scope.ChoiceItemsType = 1 ;
scope.ChoiceItems = function(){
if(scope.ChoiceItemsType == 1)
{
    if( EntityService.FormScope[scope.lookupId] != undefined)
        {
            return EntityService.FormScope[scope.lookupId];
        }
    else
        {
           return [];   
        }
}
else
{
    return scope.ChoiceItemsArray ;
}
};
            valueBindingString = "entity." + scope.field.Name;

            switch (scope.field.ChoiceSettings.ItemsSourceType) {
                case 1: // ChoiceList
                     scope.ChoiceItemsType = 2 ;
                    if (scope.field.ChoiceSettings.ChoiceList != '') {
                        if (scope.field.ChoiceSettings.ChoiceList.indexOf('\n')==-1) {
                        if(scope.ChoiceItemsArray != undefined)
                        {
                            scope.ChoiceItemsArray.push(scope.field.ChoiceSettings.ChoiceList);
                        }
                        }
                        else
                        {
                            var list = scope.field.ChoiceSettings.ChoiceList.split('\n');
                            $.each(list, function (index, item) {
 if(scope.ChoiceItemsArray != undefined)
{
                                scope.ChoiceItemsArray.push({Id:item,Text:item});
}
                            });
                            
                        }
                    }
                    
                    break; 
                case 2: // Global Data Source
                    break;
                case 3: // Entity

                    var entityDefId = scope.field.ChoiceSettings.ItemsSourceId;
                 z.Debug("GetLookupEntityId CCD 49: " + entityDefId);
    scope.lookupId = z.GetLookupId(entityDefId,"");
    EntityService.LoadLookup(entityDefId,"").then(function (response) {
                       // EntityService.GetJson('APIS/GetLookupEntityId?EntityDefId=' + entityDefId).then(function(response){
  //if (response.HasError) {
    //                        alert(response.ErrorMessage);
      //                      return;
        //                }
                        //scope.ChoiceItems = response.Result;
                      
                                });                   
 /*$.getJSON(appPath + 'APIS/GetLookupEntityId?EntityDefId=' + entityDefId, {}, function (response) {
                        if (response.HasError) {
                            alert(response.ErrorMessage);
                            return;
                        }
                        scope.ChoiceItems = response.Result;
                        if (!scope.rootScope.$$phase) {
                            scope.$apply();
                        }
                      
                    });
                   */
                    break;
            }
            if (scope.field.IsMultiSelect) {
                //checkbox list

            }
            else {
                DropdownList = 1,
       List = 2,
       RadioButtonsList = 3,
       CheckboxList = 4
                switch (scope.field.ChoiceSettings.FormControlType) {
                    case 1: // dropdownList
                        controlTemplateName = "DropdownList_RW_Template";
                        break;
                    case 2: //  listBox
                        controlTemplateName = "ListBox_RW_Template";
                        break;
                    case 3: //  RadioButtonList
                        controlTemplateName = "RadioButtonList_RW_Template";
                        break;
                    case 4: //  CheckBoxList
                        controlTemplateName = "CheckBoxList_RW_Template";
                        break;

                }
            }

           
            var ctrlHtml = $("#" + controlTemplateName).html();
        
            if (ctrlHtml != undefined) {
                ctrlHtml = ctrlHtml.replace('ValueBindingString', valueBindingString);
            //    ctrlHtml = ctrlHtml.replace('validatorstring', validatorString);
                ctrlHtml = ctrlHtml.replace('FieldPresenterString', fieldPresenterString);
            
                var output = $compile(ctrlHtml)(scope);
                angular.element(element).append(output);
                //   $("#frmWorkflowForm").kiwiValidator('recreate');
            }
        },
    };
}]);