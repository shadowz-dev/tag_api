entityEditor.directive('entityControl', ['$compile', '$sce', 'EntityService', function ($compile, $sce, EntityService) {
    return {
        restrict: 'EA',
        scope: {
            element: '=',
            field:'=',
            entityDef: '=',
            entity: '=',
            rootScope:'=',
            displayRule: '=',
            displayRuleCondition :'=',
            elementContainer:'=',
            elementScope:'='
        },

        link: function (scope, element, attr) {
            if (scope.element == undefined) {
                return;
            }
            scope.ZASOULID = createGuid();
            scope.elementScope.controlScope = scope;
            var controlTemplateName = "";
            scope.valueBindingString = "";
            scope.fieldPresenterString = "";
            scope.referenceField = null;
            scope.valuePath = "";
            scope.presnterPath = "";
            scope.oldDisplayRule = 0;
            scope.lookupId = "";
            //scope.ChoiceItems = [];
            scope.ChoiceItemsType = 1 ;
            scope.ChoiceItemsArray = [];
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
       scope.isInitialized = false;

            if (scope.field == undefined || scope.field == null)
            {
                return;
            }

            if (scope.element.ElementType == 4) {

                if (zs_isNotEmpty(scope.element.ReferenceFieldId)) {
                    scope.referenceField = _.find(scope.rootScope.EntityDefinition.Fields, function (o) {
                        return o.Id.toUpperCase() == scope.element.ReferenceFieldId.toUpperCase();
                    });
                    scope.valueBindingString = "entity.__" + scope.referenceField.Name + "_Object." + scope.field.Name;
                    scope.valuePath = "__" + scope.referenceField.Name + "_Object." + scope.field.Name;
                    scope.fieldPresenterString = "entity.__" + scope.referenceField.Name + "_Object.__" + scope.field.Name + "_PresenterString";
                    scope.presnterPath = "__" + scope.referenceField.Name + "_Object.__" + scope.field.Name + "_PresenterString";
                }
            }
            else {
                scope.valueBindingString = "entity." + scope.field.Name;
                scope.valuePath = scope.field.Name;
                scope.fieldPresenterString = "entity.__" + scope.field.Name + "_PresenterString";
                scope.presnterPath = "__" + scope.field.Name + "_PresenterString";
            }
            scope.getDisplayRule = function() {
                var retVal = 0;
                switch (scope.displayRule)
                {
                    case 1: // None;
                        retVal =  1;
                        break;
                    case 2: // Read Only;
                        retVal =  2;
                        break;
                    case 3: // Read Write;
                            retVal =  3;
                            break;
                        
                    case 4: // Expression;
                        var result = 0;
                        var entity = scope.entity;
                        eval(scope.element.DisplayRuleExpression);
                        retVal = result;
                        break;
                    case 5: // default is read
                        retVal = 2;
                        if (ZASOUL.isNotEmpty(scope.displayRuleCondition))
                        {
                            var cp = new conditionJsEvaluator(scope.rootScope,
                                                scope.displayRuleCondition,
                                                scope.entityDef,
                                                scope.entity,
                                                 scope.rootScope.formScope.entityDef,
                                                scope.rootScope.formScope.entity,
                                                null,
                                                scope.entity,
                                                scope.entityDef);
                            var xres = cp.parse();
                            if(xres)
                            {
                                retVal = 3
                            }
                        }

                        break;
                    case 6: // default is write
                        retVal = 3;
                        if (ZASOUL.isNotEmpty(scope.displayRuleCondition)) {
                            var cp = new conditionJsEvaluator(scope.rootScope,
                                                scope.displayRuleCondition,
                                                scope.entityDef,
                                                scope.entity,
                                                 scope.rootScope.entityDef,
                                                scope.rootScope.entity,
                                                null,
                                                scope.entity,
                                                scope.entityDef);
                            var xres = cp.parse();
                            if (xres) {
                                retVal = 2
                            }
                        }
                        break;

            }
                return retVal;
                 };
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ///////////////////// Reference Field Implementation
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

            scope.renderReferenceField = function(){
                var masterEntityId = scope.field.MasterEntityDefId;
                var _displayRule = scope.getDisplayRule();
             
                    switch (_displayRule) {
                        case 1: // None
                            {
                                scope.Render();
                            }
                            break;
                        case 2: // Read 
                            {
                                controlTemplateName = "EntityReferenceField_R_Template";
                                scope.Render();

                            }
                            break;
                        case 3: //  Write
                            if (scope.element.ReferenceFieldEditor == 0 || scope.element.ReferenceFieldEditor == 4) // Use Field Editor
                            {
                               
                                switch (scope.field.ReferenceFieldEditor) {

                                    case 0: // none;
                                        break;
                                    case 1: // Entity Selector;
                                        controlTemplateName = "EntityReferenceField_Selector_RW_Template";
                                        scope.getEntitySelector = function () {
                                            scope.entitySelector = {};
                                            scope.entitySelector.selectorEntityDefId = masterEntityId;
                                            scope.entitySelector.referenceEntityViewId = scope.field.ReferenceEntityViewId;
                                            scope.entitySelector.multiSelect = false;

                                            switch (scope.element.CollectionEntitySourceDataViewType) {
                                                case 0:
                                                    {
                                                        scope.entitySelector.referenceEntityViewId = scope.field.ReferenceEntityViewId;
                                                        scope.entitySelector.referenceEntityViewIsName = false;
                                                    }
                                                    break;
                                                case 1:
                                                    {
                                                        var result = "";
                                                        try {
                                                            eval(scope.element.CollectionEntitySourceDataViewExpression);
                                                        }
                                                        catch (ex) {

                                                        }
                                                        scope.entitySelector.referenceEntityViewId = result;
                                                        scope.entitySelector.referenceEntityViewIsName = true;
                                                    }
                                                    break;
                                            }



                                            if (ZASOUL.isNotEmpty(scope.field.ReferenceFieldSelectorQuery)) {
                                                scope.entitySelector.caller = {};
                                                scope.entitySelector.caller.query = scope.field.ReferenceFieldSelectorQuery;

                                                scope.entitySelector.caller.entityDef = scope.entityDef;
                                                scope.entitySelector.caller.entity = scope.entity;
                                            }

                                            var selectorHtml = $("#EntitySelectorTemplate").html();
                                            scope.entitySelector.onEntitySelectorOk = function (entity, entityDef, presenter) {

                                                zs_setValue(scope.entity, entity.Id, scope.valuePath);
                                                zs_setValue(scope.entity, presenter, scope.presnterPath);
                                                scope.entity["__" + scope.field.Name + "_Object"] = entity;
                                            };
                                            var compiled = $compile(selectorHtml)(scope);
                                            angular.element($("#POPUPS")).append(compiled);

                                        };
                                        scope.Render();
                                        break;
                                    case 2: // Dropdown List;
                                           controlTemplateName = "DropdownList_RW_Template";
                                           scope.ChoiceItemsType  = 1;
                                           scope.lookupId = z.GetLookupId(masterEntityId,scope.field.ReferenceEntityViewId);
   
                                       var curVal = null;
                                        if (ZASOUL.isNotEmpty(scope.entity) )
                                            {
                                           curVal = scope.entity[scope.field.Name];
                                        }
                                        if(scope.isInitialized == false)
                                         {
                                           EntityService.LoadLookup(masterEntityId,scope.field.ReferenceEntityViewId).then(function (response) {
                                           z.Debug("Binding Dropdown:" + masterEntityId);
                                            scope.isInitialized = true;
                                             });
                                        }
                                        scope.Render();
                                        break;
                                    case 3: // Radio Buttons List;
                                        controlTemplateName = "RadioButtonList_RW_Template";
                                        scope.lookupId = z.GetLookupId(masterEntityId,scope.field.ReferenceEntityViewId);
                                        var curVal = scope.entity[scope.field.Name];
                                            EntityService.LoadLookup(masterEntityId,scope.field.ReferenceEntityViewId).then(function (response) {
                                            var ffname = scope.valueBindingString;
                                            scope.isInitialized = true;
                                            scope.$watch(ffname, function (newValue, oldValue) {
                                            if(scope.isInitialized == false)
                                                {
                                                    return;
                                                 }
                                                var selectedChoice = _.find(scope.ChoiceItems(), function (o) { return o.Id == newValue });
                                                if (selectedChoice != undefined) {
                                                    zs_setValue(scope.entity, selectedChoice.Text, scope.presnterPath);
                                                }
                                            });
                                            scope.Render();
                                            if (ZASOUL.isNotEmpty(scope.entity) && ZASOUL.isNotEmpty(curVal)) {
                                                scope.entity[scope.field.Name] = curVal;
                                            }
                                        });
                                        break;


                                }
                            }
                            else  // Use Element Editor
                            {
                                switch (scope.element.ReferenceFieldEditor)
                                {
                                    case 1: // Entity Selector;
                                        controlTemplateName = "EntityReferenceField_Selector_RW_Template";
                                        scope.getEntitySelector = function () {
                                            scope.entitySelector = {};
                                            scope.entitySelector.selectorEntityDefId = masterEntityId;
                                            scope.entitySelector.referenceEntityViewId = scope.field.ReferenceEntityViewId;
                                            scope.entitySelector.multiSelect = false;

                                            if (ZASOUL.isNotEmpty(scope.field.ReferenceFieldSelectorQuery)) {
                                                scope.entitySelector.caller = {};
                                                scope.entitySelector.caller.query = scope.field.ReferenceFieldSelectorQuery;

                                                scope.entitySelector.caller.entityDef = scope.entityDef;
                                                scope.entitySelector.caller.entity = scope.entity;
                                            }

                                            var selectorHtml = $("#EntitySelectorTemplate").html();
                                            scope.entitySelector.onEntitySelectorOk = function (entity, entityDef, presenter) {

                                                zs_setValue(scope.entity, entity.Id, scope.valuePath);
                                                zs_setValue(scope.entity, presenter, scope.presnterPath);
                                                scope.entity["__" + scope.field.Name + "_Object"] = entity;
                                            };
                                            var compiled = $compile(selectorHtml)(scope);
                                            angular.element($("#POPUPS")).append(compiled);

                                        };
                                        scope.Render();
                                        break;
                                    case 2: // Dropdown List;
                                        controlTemplateName = "DropdownList_RW_Template";
                                        switch (scope.element.ReferenceFieldFillMethod) {
                                            case 0://Default Selector
                                                break;
                                            case 1://Entity View
                                                 scope.ChoiceItemsType = 1 ;
                                                var __viewId = scope.element.ReferenceEntityViewId ;
                                                if(z.isEmpty(__viewId))
                                                {
                                                     __viewId = scope.field.ReferenceEntityViewId ;
                                                }
                                                  scope.lookupId = z.GetLookupId(masterEntityId,__viewId);
                                                  EntityService.LoadLookup(masterEntityId,__viewId).then(function (response) {
                                                  scope.Render();
                                                });
                                                break;
                                            case 2://Data Source
                                                scope.ChoiceItemsType = 2;
                                                EntityService.CallDataSource(scope.element.ReferenceFieldDataSource).then(function(response){
                                                scope.ChoiceItemsArray = response;
                                                
                                                if (ZASOUL.isNotEmpty(scope.entity) && ZASOUL.isNotEmpty(curVal)) {
                                                    scope.entity[scope.field.Name] = curVal;
                                                }
                                                    scope.Render();
                                                });                                                
                                                break;
                                            case 3:// Server Function
                                                break;
                                            case 4: // Java Script
scope.ChoiceItemsType = 4 ;
                                                var result = [];
console.debug("Java Script DDl source:");

                                                var entity = scope.entity;
                                                var curVal = scope.entity[scope.field.Name];
                                                eval(scope.element.ReferenceFieldJSFillCode);
                                                scope.ChoiceItemsArray = result;
                                                if (ZASOUL.isNotEmpty(scope.element.ReferenceFieldRefillTriggers)) {
                                                    scope.$watch(scope.element.ReferenceFieldRefillTriggers, function () {
                                                        entity = scope.entity;
                                                        eval(scope.element.ReferenceFieldJSFillCode);
                                                        scope.ChoiceItemsArray = result;

                                                    });
                                                    scope.$watchCollection(scope.element.ReferenceFieldRefillTriggers, function () {
                                                        entity = scope.entity;
                                                        eval(scope.element.ReferenceFieldJSFillCode);
                                                        scope.ChoiceItemsArray = result;

                                                    });
 
console.debug (scope.ChoiceItemsArray);
                                                }
                                                scope.Render();
                                                if (ZASOUL.isNotEmpty(scope.entity) && ZASOUL.isNotEmpty(curVal)) {
                                                    scope.entity[scope.field.Name] = curVal;
                                                }
                                                break;
                                        }

                                        break;

                                }
                            }
                            break;
                    }


                
               
            
            };
            scope.renderUserField = function () {
                if (scope.getDisplayRule() == 2) {
                    controlTemplateName = "User_R_Template";
                    //       valueBindingString = 'entity.' + scope.field.Name;
                }
                else {
                    switch (scope.element.UserFieldFillMethod) {
                        case 0:
                            {
                                controlTemplateName = "User_RW_Template";
                                // valueBindingString = 'entity.' + scope.field.Name;
                                scope.getUserSelector = function () {
                                    var selectorHtml = $("#UserSelectorTemplate").html();
                                    scope.UserSelector = {};
                                    scope.UserSelector.onOkClick = function (user) {
                                        //  scope.entity[scope.valuePath] = user.Id;
                                        //scope.entity[scope.presnterPath] = user.DisplayName;
                                        ZASOUL.setFieldValue(scope.entity, user.Id, scope.valuePath);
                                        ZASOUL.setFieldValue(scope.entity, user.DisplayName, scope.presnterPath);

                                    };
                                    var compiled = $compile(selectorHtml)(scope);
                                    angular.element($("#POPUPS")).append(compiled);

                                };
                            }
                            break;
                        case 1:// Data Source
                            {
scope.ChoiceItemsType  = 2;
                                controlTemplateName = "DropdownList_RW_Template";

EntityService.CallDataSource(scope.element.ReferenceFieldDataSource).then(function(response){
scope.ChoiceItemsArray = response;
            });
                              
                            }
                            break;
                        case 2:
                            break;
                    }

                }
            };
    scope.renderGroupField = function () {
                if (scope.getDisplayRule() == 2) {
                    controlTemplateName = "Group_R_Template";
                    //       valueBindingString = 'entity.' + scope.field.Name;
                }
                else {
                    switch (scope.element.GroupFieldFillMethod) {
                        case 0:
                            {
                                controlTemplateName = "Group_RW_Template";
                                // valueBindingString = 'entity.' + scope.field.Name;
                                scope.getGroupSelector = function () {
                                    var selectorHtml = $("#GroupSelectorTemplate").html();
                                    scope.GroupSelector = {};
                                    scope.GroupSelector.onOkClick = function (group) {
                                        //  scope.entity[scope.valuePath] = user.Id;
                                        //scope.entity[scope.presnterPath] = user.DisplayName;
                                        ZASOUL.setFieldValue(scope.entity, group.Id, scope.valuePath);
                                        ZASOUL.setFieldValue(scope.entity, group.Name, scope.presnterPath);

                                    };
                                    var compiled = $compile(selectorHtml)(scope);
                                    angular.element($("#POPUPS")).append(compiled);

                                };
                            }
                            break;
                        case 1:// Data Source
                            {
                                scope.ChoiceItemsType  = 2;
                                controlTemplateName = "DropdownList_RW_Template";
                                EntityService.CallDataSource(scope.element.ReferenceFieldDataSource).then(function(response){
                                scope.ChoiceItemsArray = response;
                             });
                            }
                            break;
                        case 2:
                            break;
                    }

                }
            };
            scope.$watch( function () {
                var displayRule = scope.getDisplayRule();
                if ( displayRule != scope.oldDisplayRule)
                {
                    scope.oldDisplayRule = displayRule;
                    if (scope.field.IsReference) {
                        scope.renderReferenceField();
                    }
                /////////////////////////// End Of Reference Field ////////////////////////////////////////////////////////////////////////////////
                        else // is not reference field
                        {


                            switch (scope.field.DataType) {

                                case 17:// user
                                    {
                                        scope.renderUserField();

                                    }
                                    break;
                                    case 18: // Group
                                    {
                                         scope.renderGroupField();    
                                    }
                                    break;
                                default:
                                    {
                                        if (scope.getDisplayRule() == 2) {
                                            controlTemplateName = ZASOUL.getControlTemplateName(scope.field.DataType, 'read');
                                        }
                                        else if (scope.getDisplayRule() == 3) {
                                            controlTemplateName = ZASOUL.getControlTemplateName(scope.field.DataType, 'edit');
                                        }

                                    }
                                    break;
                            }
                            scope.Render();
                    }
                    
                }

            });
            

            if (scope.getDisplayRule() == 3) {
                scope.createNewRefEntity = function () {
                    var entityDef = {};
                    EntityService.GetDefById(scope.field.MasterEntityDefId).then(
                   function (DefObject) {
                     
                       entityDef = DefObject;
                       scope.editorEntityDef = entityDef;
                       scope.EntityEditorCallBack = function (obj) {
                           if (obj.Id == undefined)
                               obj.Id = createGuid();
                           var f = _.find(entityDef.Fields, function (o) { return o.Id == entityDef.PresenterField });
                           scope.entity["__" + scope.field.Name + "_PresenterString"] = obj[f.Name];
                           scope.entity["__" + scope.field.Name + "_Object"] = obj;
                           scope.entity["__" + scope.field.Name + "_RefId"] = obj.Id;
                           scope.entity[scope.field.Name] = obj.Id;
                           if (!scope.rootScope.formScope.$$phase && !scope.$root.$phase) {
                               angular.element(element).scope().$apply();
                           }
                           
                       };
                       scope.onEntityEditorLoad = function (windowActions) {
                           windowActions.SetEntity(null);
                       };
                       var editorHtml = $("#EntityEditorWindowTemplate").html();

                       var comiled = $compile(editorHtml)(scope);

                       angular.element($("#POPUPS")).append(comiled);
                      
                   });


                };
                scope.deleteFile = function () {
                    scope.entity[scope.field.Name + "__FileName"] = "";
                    scope.entity[scope.field.Name + "__FileContent"] = "";
                    scope.entity[scope.field.Name + "__Status"] = "Deleted";
                    scope.entity[scope.field.Name] = "";

                };
                scope.addFile = function () {
                 //   var fileElem = $('<input type="file" style="display:none;" accept="image/*" capture>');
   var fileElem = $('<input type="file" style="display:none;" accept="application/msword, application/vnd.ms-excel, application/vnd.ms-powerpoint,text/plain, application/pdf, image/*" capture>');
                    $("#dialogs").append(fileElem);

                    fileElem.bind("change", function (changeEvent) {
                        var file = this.files[0];
                        var reader = new FileReader();
                        reader.onload = function (loadEvent) {
                                    if(file.size > 3145728)
                                    {
                                    alert(EntityService.FormScope.Localize("من فضلك اختار ملف وحتى 3 ميجا بايت","Please select a file up to 3 MB"));
                                    return;
                                    }
                                    if(file.name.indexOf(".") == -1)
                                    {
                                    alert(EntityService.FormScope.Localize("يجب أن يكون الملف صورة أو مستند\n (jpg, jpeg, png, tif, gif, doc, docx, pdf, xls, xlsx, ppt, pptx)","Attachment must be images or documents\n (jpg, jpeg, png, tif, gif, doc, docx, pdf, xls, xlsx, ppt, pptx)"));
                                    return;
                                    }
                                    var supportedTypes = "jpg,jpeg,png,tif,gif,doc,docx,pdf,xls,xlsx,ppt,pptx".split(',');
                                    var fileSegments = file.name.split('.');
                                    var fileExt = fileSegments[fileSegments.length-1].toLowerCase();
                                    var supported = false;
                                    for(var i = 0 ; i <supportedTypes.length ; i++ )
                                    {
                                    if(supportedTypes[i] == fileExt)
                                    {
                                    supported = true;
                                    break;
                                    }
                                    }
                                    if(supported == false)
                                    {
                                    alert(EntityService.FormScope.Localize("يجب أن يطون الملف صورة أو مستند\n (jpg, jpeg, png, tif, gif, doc, docx, pdf, xls, xlsx, ppt, pptx)","Attachment must be images or documents\n (jpg, jpeg, png, tif, gif, doc, docx, pdf, xls, xlsx, ppt, pptx)"));
                                    return;
                                    }
                            scope.entity[scope.field.Name + "__FileContent"] = loadEvent.target.result;
                            // console.debug(loadEvent.target.result);
                            scope.entity[scope.field.Name + "__FileName"] = file.name;
                            var status = scope.entity[scope.field.Name + "__Status"];
                            if (status == undefined) {
                                scope.entity[scope.field.Name + "__Status"] = "Created";
                            }
                            else {
                                scope.entity[scope.field.Name + "__Status"] = "Updated";
                            }
                            scope.entity[scope.field.Name] = ".";
                            if (!scope.rootScope.formScope.$$phase && !scope.$root.$phase) {
                                scope.$apply();
                            }
                        };
                        reader.readAsDataURL(file);
                        fileElem.remove();
                    });
                    fileElem.click();
                };
                scope.FileData = function () {
                    return scope.entity[scope.field.Name + "__FileContent"];
                };
                scope.Height = function () {
                    if (ZASOUL.isNotEmpty(scope.field.Height)) {
                        return scope.field.Height + "px";
                    }
                    return "100px;"

                };
                scope.Width = function () {
                    if (ZASOUL.isNotEmpty(scope.field.Width)) {
                        return scope.field.Width + "px";
                    }
                    return "100px;"

                };

                //   createValidationString();

            }
             scope.OnDropDownList_Change = function(){
                if(z.isNotEmpty(scope.entity))
                    {
                        var item = _.find(scope.ChoiceItems(),function(f){
                            return z.toLower(f.Id) == z.toLower(scope.entity[scope.valuePath]);
                         });
                        if(item != null)
                         {
                            scope.entity[scope.presnterPath] = item.Text;
                         }
                    }
                };
            if (scope.elementContainer == "Grid")
            {
                scope.$watch(scope.valueBindingString, function (newValue, oldValue) {
                    if(newValue != oldValue)
                    {
                        if (scope.entity.__objectstatus__ == "UnChanged")
                            scope.entity.__objectstatus__ = "Updated";
                        
                    }
                });
            }
          
            var ctrlHtml = $("#" + controlTemplateName).html();
           
            scope.Render = function () {
                var ctrlHtml = $("#" + controlTemplateName).html();
                if (ctrlHtml != undefined) {
                    ctrlHtml = ctrlHtml.replace(/ValueBindingString/g, scope.valueBindingString);
                    ctrlHtml = ctrlHtml.replace(/FieldPresenterString/g, scope.fieldPresenterString);
                    var output = $compile(ctrlHtml)(scope);
                    angular.element(element).empty().append(output);
     _initControls();
                }
            };

            scope.Render();
        },
    };
}]);