entityEditor.directive('entityCollection', ['$compile','EntityService','ActionSetService', function ($compile,EntityService,ActionSetService) {
    return {
        restrict: 'EA',
        scope: {
            //the def of collection items
            element: '=',
            entity: '=',
            entityDef: '=',
            rootScope: '=',
            elementScope:'='
        },
        link: function (scope, element, attr) {

            //Collection Defintiton

            scope.collection = _.find(scope.entityDef.Collections, function (o) {
                return o.Id.toUpperCase() == scope.element.EntityCollectionId.toUpperCase();
            });
            if (ZASOUL.isEmpty(scope.collection))
            {
                return;
            }
            scope.CollectionEntityDefinition = null;
            scope.CollectionDef = "";
            scope.CollectionReferenceField = null;
            scope.PresenterField = null;
            scope.CollectionSourceMappingField = null;
            scope.EntityField = null;
            scope.Title = "";
            scope.TitleEN = "";
            scope.collectionTitle = "";
            scope.GetFieldName = function (FieldId) {
                if (scope.CollectionEntityDefinition == undefined || scope.CollectionEntityDefinition == null)
                    return "";
                var f = _.find(scope.CollectionEntityDefinition.Fields, function (o) {
                    return o.Id.toUpperCase() == FieldId.toUpperCase();

                });
                if (f != undefined) {
                    return f.Name;
                }
                else {
                    return "";
                }
            };
            scope.IsFieldVisible = function (viewField) {
                var visiblity = viewField.Visibility;
                if (visiblity == undefined)
                { visiblity = 1; }
                var isVisible = true;
                switch (visiblity) {
                    case 1:
                        isVisible = true;
                        break;
                    case 2:
                        isVisible = false;
                        break;

                    case 3:
                        if (viewField.VisibleCondition == undefined || viewField.VisibleCondition == null) {
                            return isVisible;
                        }
                        var cp = new conditionJsEvaluator(scope.rootScope,
                                                    viewField.VisibleCondition,
                                                    scope.entityDef,
                                                    scope.entity,
                                                     scope.entityDef,
                                                    scope.entity,
                                                    null,
                                                    null,
                                                    null);
                        isVisible = cp.parse();
                        break;
                }
                return isVisible;

            };

            scope.getCollectionItems = function () {
                return scope.entity[scope.collection.Name];
            };
            scope.SelectedItem = null;
            scope.SelectItem = function (item) {
                scope.SelectedItem = item;
                scope.entity[scope.collection.Name].__SelectedItem__ = scope.SelectedItem;
            };
            scope.checkBoxClicked = function (option) {

                var item = _.find(scope.entity[scope.CollectionDef.Name], function (o) {
                    return o[scope.CollectionSourceMappingField.Name].toUpperCase() == option.Id.toUpperCase() && o.__objectstatus__ != "Deleted";

                });

                if (item == undefined) {
                    var colItem = {};
                    colItem.Id = createGuid();
                    colItem[scope.CollectionReferenceField.Name]= scope.entity[scope.EntityField.Name];
                    colItem[scope.CollectionSourceMappingField.Name]= option.Id;
                    colItem["__objectstatus__"] = "Created";
                    if (scope.entity[scope.CollectionDef.Name] == undefined || scope.entity[scope.CollectionDef.Name] == null) {
                        scope.entity[scope.CollectionDef.Name] = [];
                    }
                    scope.entity[scope.CollectionDef.Name].push(colItem);
                    scope.elementScope.OnCollectionItemAdded(colItem, scope.CollectionEntityDefinition);
                }
                else {
                    item["__objectstatus__"] = "Deleted";
                    scope.elementScope.OnCollectionItemDeleted(item, scope.CollectionEntityDefinition);
                    //var idx = scope.entity[scope.CollectionDef.Name].indexOf(item);
                    //if (idx > -1)
                    //scope.entity[scope.CollectionDef.Name].splice(idx, 1);
                }

            };
            scope.isCheckboxChecked = function (option) {
                
                var item = _.find(scope.entity[scope.CollectionDef.Name], function (o) {

                    return o[scope.CollectionSourceMappingField.Name].toUpperCase() == option.Id.toUpperCase() && o["__objectstatus__"] != "Deleted";
                });


                return item != undefined;
            };
            scope.getDisplayRule = function () {
                var retVal = 0;
                switch (scope.element.DisplayRule) {
                    case 1: // None;
                        retVal = 1;
                        break;
                    case 2: // Read Only;
                        retVal = 2;
                        break;
                    case 3: // Read Write;
                        retVal = 3;
                        break;

                    case 4: // Expression;
                        var result = 0;
                        var entity = scope.entity;
                        try{
                        eval(scope.element.DisplayRuleExpression);
                        retVal = result;
						
						}
						catch (ex) {
						console.debug("Entity Collection Directive Get Display Rule");
						console.debug(scope.element.DisplayRuleExpression);
						}
						
						
                        break;
                    case 5: // default is read
                        retVal = 2;
                        if (ZASOUL.isNotEmpty(scope.element.DisplayRuleCondition)) {
                            var cp = new conditionJsEvaluator(scope.rootScope,
                                                scope.element.DisplayRuleCondition,
                                                scope.entityDef,
                                                scope.entity,
                                                 scope.rootScope.formScope.entityDef,
                                                scope.rootScope.formScope.entity,
                                                null,
                                                scope.entity,
                                                scope.entityDef);
                            var xres = cp.parse();
                            if (xres) {
                                retVal = 3
                            }
                        }

                        break;
                    case 6: // default is write
                        retVal = 3;
                        if (ZASOUL.isNotEmpty(scope.element.DisplayRuleCondition)) {
                            var cp = new conditionJsEvaluator(scope.rootScope,
                                                scope.DisplayRuleCondition,
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
            
            EntityService.GetDefById(scope.collection.EntityDefinitionId).then(function (response) {
                
                scope.CollectionEntityDefinition = response;
                scope.CollectionDef = _.find(scope.entityDef.Collections, function (o) {
                    return o.Id.toUpperCase() == scope.element.EntityCollectionId.toUpperCase();
                });
                if (ZASOUL.isNotEmpty(scope.element.Title)) {
                    scope.Title = scope.element.Title;
                }
                else {
                    scope.Title = scope.CollectionDef.Title;
                }
                if (ZASOUL.isNotEmpty(scope.element.TitleEN)) {
                    scope.TitleEN = scope.element.TitleEN;
                }
                else {
                    scope.TitleEN = scope.CollectionDef.TitleEN;
                }
                if (ZASOUL.isNotEmpty(scope.element.CollectionItemsFilter)) {
                    var filter = angular.fromJson(scope.element.CollectionItemsFilter);
                    filter.__objectstatus__ = "!Deleted";
                    scope.collectionFilter = filter;
                   
                }

                else {
                    scope.collectionFilter = { __objectstatus__: "!Deleted" };
                }
                
                scope.CollectionReferenceField = ZASOUL.getFieldById(scope.CollectionDef.ReferenceFieldId, scope.CollectionEntityDefinition);
 
                scope.EntityField = ZASOUL.getFieldById(scope.CollectionDef.EntityFieldId, scope.entityDef);
 

                scope.CollectionSourceMappingField = ZASOUL.getFieldById(scope.element.CollectionMappingField,
                       scope.CollectionEntityDefinition);
                if (ZASOUL.isNotEmpty(scope.CollectionEntityDefinition.PresenterField))
                    {
                    scope.PresenterField = ZASOUL.getFieldById(scope.CollectionEntityDefinition.PresenterField, scope.CollectionEntityDefinition);

                    }
                scope.ViewFields = [];
                $.each(scope.element.CollectionFields, function (index, vf) {
                    

                    var field = null;
                    if (vf.FieldType == 0) {
                       field = ZASOUL.getFieldById(vf.FieldId, scope.CollectionEntityDefinition);
                    }
                    if (vf.FieldType == 1)
                    {
                        field = ZASOUL.getCollectionById(vf.FieldId, scope.CollectionEntityDefinition);
                    }
                    if (ZASOUL.isNotEmpty( field)) {

                        vf.Field = field;
                        scope.ViewFields.push(vf);
                    }

                });
                if (ZASOUL.isNotEmpty(scope.entity)) {
                    if (scope.entity[scope.collection.Name] == undefined || scope.entity[scope.collection.Name] == null) {
                        scope.entity[scope.collection.Name] = [];
                    }
                }

                scope.AddCollectionItem = function () {
                    scope.onEntityEditorLoad = function (windowActions) {
                        windowActions.SetEntity(null, scope.element.CollectionEditorForm,scope.CollectionReferenceField.Name,scope.entity[scope.EntityField.Name]);
                    };
                    scope.editorEntityDef = scope.CollectionEntityDefinition;
                    scope.formId = scope.element.CollectionEditorForm;
                    var editorHtml = $("#EntityEditorWindowTemplate").html();
                    var editorHtmlObj = $(editorHtml);
                    
                    editorHtmlObj.attr("data-zasoulid" , createGuid() );
                    var comiled = $compile(editorHtmlObj)(scope);
                    angular.element($("#POPUPS")).append(comiled);
                };

                scope.getEntitySelector = function () {
                    scope.entitySelector = {};
                    scope.entitySelector.selectorEntityDefId = scope.element.CollectionEntitySource;
                    scope.entitySelector.referenceEntityViewId = scope.element.CollectionEntitySourceDataView;
                    scope.entitySelector.multiSelect = scope.element.InsertMultipleItems;
                    scope.entitySelector.conditionStr = "";
                    var selectorHtml = $("#EntitySelectorTemplate").html();
                    scope.entitySelector.onEntitySelectorOk = function (selectedItems) {
                        $.each(selectedItems, function (index, o) {
                            var itemExist = _.find(scope.entity[scope.CollectionDef.Name], function (ci) {
                                return ci[scope.CollectionSourceMappingField.Name].toUpperCase() == o.Id.toUpperCase();
                            });
                            if (itemExist == undefined) {
                                var nItem = {};
                                nItem.Id = createGuid();
                                nItem[scope.CollectionSourceMappingField.Name] = o.Id;
                                nItem["__" + scope.CollectionSourceMappingField.Name + "_PresenterString"] = o._PresenterString_;
                                nItem[scope.CollectionReferenceField.Name] = scope.entity[scope.EntityField.Name];
                                nItem.__objectstatus__ = "Created";

                                if (ZASOUL.isNotEmpty(scope.element.OnSelectorItemAdded)) {
                                    if (scope.element.OnSelectorItemAdded.Enabled) {
                                        try {
                                            var context = new executerContext(scope, scope.entityDef, scope.entity, scope.CollectionEntityDefinition, nItem);
                                            context.SelectorEntity = o;

                                            ActionSetService.ExecuteActionSet(scope.element.OnSelectorItemAdded, context);
                                        }
                                        catch (ex) { }

                                    }
                                }

                                if (ZASOUL.isEmpty(scope.entity[scope.collection.Name])) {
                                    scope.entity[scope.collection.Name] = [];
                                }

                                scope.entity[scope.CollectionDef.Name].push(nItem);

                            }
                        });

                    };
                    if (scope.element.SelectorCondition != undefined && scope.element.SelectorCondition != null) {
                        EntityService.GetDefById(scope.element.CollectionEntitySource).then(function (DefObject) {
                            var css = new conditionCSParser2(scope.element.SelectorCondition, DefObject, scope.entityDef, scope.entity);
                            var dd = css.parse();
                            var parsedQuery = angular.toJson(dd);
                            scope.entitySelector.conditionStr = parsedQuery;

                            var compiled = $compile(selectorHtml)(scope);
                            /*  angular.element($("#POPUPS", $(window.parent.document))).append(compiled);*/
                            angular.element($("#POPUPS")).append(compiled);
                        });
                    }
                    else {

                        var compiled = $compile(selectorHtml)(scope);
                        /*  angular.element($("#POPUPS", $(window.parent.document))).append(compiled);*/
                        angular.element($("#POPUPS")).append(compiled);
                    }
                };
                scope.getSystemUserSelector = function () {
                 
                    ZASOUL.userSelector.open(scope, $compile, function (selectedItems) {
                        $.each(selectedItems, function (index, o) {
                            var itemExist = _.find(scope.entity[scope.CollectionDef.Name], function (ci) {
                                return ci[scope.CollectionSourceMappingField.Name].toUpperCase() == o.Id.toUpperCase();
                            });
                            if (itemExist == undefined) {
                                var nItem = {};
                                nItem.Id = createGuid();
                                nItem[scope.CollectionSourceMappingField.Name] = o.Id;
                                nItem["__" + scope.CollectionSourceMappingField.Name + "_PresenterString"] = o.DisplayName;
                                nItem[scope.CollectionReferenceField.Name] = scope.entity[scope.EntityField.Name];
                                if(ZASOUL.isNotEmpty( scope.PresenterField))
                                {
                                    if (scope.PresenterField.IsReference || scope.PresenterField.DataType == 17) {
                                        nItem._PresenterString_ = nItem["__" + scope.PresenterField.Name + "_PresenterString"];
                                    }
                                    else
                                        nItem._PresenterString_ = nItem[scope.PresenterField.Name];
                                }
                                nItem.__objectstatus__ = "Created";
                                scope.entity[scope.CollectionDef.Name].push(nItem);

                            }
                        });
                    });
                };
                scope.getSystemGroupSelector = function () { };

                scope.EntityEditorCallBack = function (obj) {
                    if (ZASOUL.isEmpty(scope.entity[scope.collection.Name]))
                    {
                        scope.entity[scope.collection.Name] = [];
                    }
                    

                    if (obj.Id == undefined)
                        obj.Id = createGuid();

                    if (scope.EntityField == undefined || scope.EntityField == null) {
                        obj[scope.EntityField.Name] = scope.entity.Id;
                    }
                    else {
                        obj[scope.CollectionReferenceField.Name] = scope.entity[scope.EntityField.Name];
                    }
                    var eventArgs = { Canceled: false };
                    if (obj.__objectstatus__ == undefined || obj.__objectstatus__ == "Created") {
                        obj.__objectstatus__ = "Created";
                        scope.elementScope.OnCollectionItemAdding(obj, scope.CollectionEntityDefinition, eventArgs, function () {
                            if (eventArgs.Canceled == false) {
                            var existingItem = _.find(scope.entity[scope.collection.Name],function(oo){
                                        return ZASOUL.toUpper(oo.Id) == ZASOUL.toUpper(obj.Id);
                                });
                            if(existingItem != undefined)
                                {
                                        var idx = scope.entity[scope.collection.Name].indexOf(existingItem);
                                        if(idx > -1 )
                                        {
                                              scope.entity[scope.collection.Name][idx] = obj;
                                        }
                                        else
                                        {
                                              scope.entity[scope.collection.Name].push(obj);
                                        }
                                    }
                                    else
                                    {
                                                                scope.entity[scope.collection.Name].push(obj);
                                    }
                            scope.elementScope.OnCollectionItemAdded(obj, scope.CollectionEntityDefinition);
                        }});
                       
                    }
                    else {
                        obj.__objectstatus__ = "Updated";
                        scope.elementScope.OnCollectionItemUpdating(obj, scope.CollectionEntityDefinition, eventArgs, function () {

                            if (eventArgs.Canceled == false) {
                                var origObj = _.find(scope.entity[scope.collection.Name], function (o) { return o.Id == obj.Id });
                                var idx = scope.entity[scope.collection.Name].indexOf(origObj);
                                if (idx > -1) {
                                    scope.entity[scope.collection.Name][idx] = obj;
                                    scope.elementScope.OnCollectionItemUpdated(obj, scope.CollectionEntityDefinition);
                                }
                            }
                        });
                        
                    }
                    if (!scope.rootScope.formScope.$$phase && !scope.$root.$phase) {
                          angular.element(element).scope().$apply();
                    }
                  
                };
                scope.getColumnDisplayValue = function (row, field) {

                    if (field.IsReference) {
                        return row["__" + field.Name + "_PresenterString"];
                    }
                    else {
                        if (field.DataType == "10") {
                            return row[field.Name + "__FileName"];
                        }
                        return row[field.Name];
                    }
                };
                scope.deleteCollectionElement = function () {

                    if (scope.SelectedItem == undefined || scope.SelectedItem == null) {
                      alert( scope.rootScope.Localize("من فضلك اختار أحد العناصر","Please select one of the items") );
					//   alert("من فضلك اختار أحد العناصر");
                        return;
                    }
                    if (confirm(scope.rootScope.Localize("هل تريد بالتأكيد حذف هذا العنصر ؟","Are you sure you want to delete this item? "))) {
                        var idx = scope.entity[scope.collection.Name].indexOf(scope.SelectedItem);
                        if (idx > -1) {
                            var eventArgs = { Canceled: false };


                            scope.elementScope.OnCollectionItemDeleting(scope.SelectedItem, scope.CollectionEntityDefinition, eventArgs, function () {

                                if (eventArgs.Canceled == false) {
                                    if (scope.SelectedItem.__objectstatus__ == "Created") {
                                        scope.entity[scope.collection.Name].splice(idx, 1);
                                    }
                                    else {
                                        scope.entity[scope.collection.Name][idx].__objectstatus__ = "Deleted";
                                    }
                                    scope.elementScope.OnCollectionItemDeleted(scope.SelectedItem, scope.CollectionEntityDefinition);
                                }
                            });
                         
                        }
                    }

                };
                scope.editCollectionElement = function () {
                    if (scope.SelectedItem == undefined || scope.SelectedItem == null) {
                        alert( scope.rootScope.Localize("من فضلك اختار أحد العناصر","Please select one of the items") );
                        return;
                    }
                    scope.onEntityEditorLoad = function (windowActions) {
                        windowActions.SetEntity(angular.copy(scope.SelectedItem), scope.element.CollectionEditorForm);
                    };
                    scope.editorEntityDef = scope.CollectionEntityDefinition;
                    var editorHtml = $("#EntityEditorWindowTemplate").html();
                    var comiled = $compile(editorHtml)(scope);
                    angular.element($("#POPUPS", $(window.parent.document))).append(comiled);
                };

                switch (scope.element.CollectionViewType) {

                    case undefined:
                    case null:
                    case 0:
                    case 1: // Tabular View
                        {
                            var templateName = "";

                            switch (scope.getDisplayRule() ) {

                                case 2:
                                    templateName = '#SectionElementCollection_R_Template';
                                    break;
                                case 3:
                                    {
                                        if (scope.element.ShowCollectionBorder) {
                                            templateName = '#SectionElementCollection_RWB_Template';
                                        }
                                        else {
                                            templateName = '#SectionElementCollection_RW_Template';

                                        }
                                    }
                            }

                            var html = $(templateName).html();
                            var compiled = $compile(html)(scope);
                            angular.element(element).append(compiled);
                            /*if (!scope.rootScope.formScope.$$phase && !scope.$root.$phase) {
                                 angular.element(element).scope().$apply();
                            }
                          */
                        }
                        break;
                    case 2: // Dropdown List
                        {
                            html = $("#SectionElementCollection_DropdownList_Template").html();
                            var compiled = $compile(html)(scope);
                            angular.element(element).append(compiled);
                            /*if (!scope.rootScope.formScope.$$phase && !scope.$root.$phase) {
                                 angular.element(element).scope().$apply();
                            }*/
                        }
                        break;
                    case 3: // Radio Buttons List
                    case 4: // Checkbox List
                        {
                            var viewId = scope.element.CollectionEntitySourceDataView;
                            var loaderId = ZASOUL.AddAjaxLoader(scope.rootScope);
                              z.Debug("GetLookupEntityId ECD 491: " + scope.element.CollectionEntitySource);
                                

                                var requestData = {} ;
                            if(scope.element.SelectorCondition != undefined &&  scope.element.SelectorCondition != null)
                                {
                                    EntityService.GetDefById(scope.element.CollectionEntitySource).then(function(DefObject){
                                    var css = new conditionCSParser2(scope.element.SelectorCondition,DefObject, scope.entityDef, scope.entity);
                                     var dd = css.parse();
                                    var parsedQuery = angular.toJson(dd);
                                  
                                        requestData.ConditionStr = parsedQuery;
                                     EntityService.LoadServerData( "APIS/GetLookupEntityId?EntityDefId=" + scope.element.CollectionEntitySource + "&ViewId=" + viewId,requestData).then(
                                     function (response) {
                                        if (response.HasError) {
                                            alert(response.ErrorMessage);
                                            return;
                                        }
                                        scope.Options = response.Result;
                                        var html = "";
                                        switch (scope.element.CollectionViewType) {
                                            case 3:
                                                html = $("#SectionElementCollection_RadioButtonsList_Template").html();
                                                break;
                                            case 4:
                                                switch (scope.getDisplayRule()) {
                                                    case 2:
                                                        html = $("#SectionElementCollection_CheckBoxList_R_Template").html();
                                                        break;
                                                    case 3:
                                                        html = $("#SectionElementCollection_CheckBoxList_RW_Template").html();
                                                        break;

                                                }
                                                break;
                                        }
                                        var compiled = $compile(html)(scope);
                                        angular.element(element).append(compiled);
                                        ZASOUL.RemoveAjaxLoader(loaderId,scope.rootScope);
                               
                                    });
                                    });
                                    
                                }          
                            else
                            {
                                  EntityService.LoadServerData( "APIS/GetLookupEntityId?EntityDefId=" + scope.element.CollectionEntitySource + "&ViewId=" + viewId).then(
                                     function (response) {
                                        if (response.HasError) {
                                            alert(response.ErrorMessage);
                                            return;
                                        }
                                        scope.Options = response.Result;
                                        var html = "";
                                        switch (scope.element.CollectionViewType) {
                                            case 3:
                                                html = $("#SectionElementCollection_RadioButtonsList_Template").html();
                                                break;
                                            case 4:
                                                switch (scope.getDisplayRule()) {
                                                    case 2:
                                                        html = $("#SectionElementCollection_CheckBoxList_R_Template").html();
                                                        break;
                                                    case 3:
                                                        html = $("#SectionElementCollection_CheckBoxList_RW_Template").html();
                                                        break;

                                                }
                                                break;
                                        }
                                        var compiled = $compile(html)(scope);
                                        angular.element(element).append(compiled);
                                        ZASOUL.RemoveAjaxLoader(loaderId,scope.rootScope);
                               
                                    });
                            }                                     
                           
                        }
                        break;
                }

            });

            scope.ShowCreateItemButton = function () {
                var _res = scope.element.AllowCreateNewCollectionItem;
                if(_res == true)
                {
                    if(ZASOUL.isNotEmpty(scope.element.AllowCreateNewCollectionItemCondition))
                    {
                        var cp = new conditionJsEvaluator(scope.rootScope,
                                                  scope.element.AllowCreateNewCollectionItemCondition,
                                                   scope.entityDef,
                                                   scope.entity,
                                                    scope.entityDef,
                                                   scope.entity,
                                                   null,
                                                   null,
                                                   null);
                        _res = cp.parse();
                    }
                }
                return _res;
            };
            scope.ShowEditItemButton = function () {
                var _res = scope.element.AllowEditCollectionItem;
                if (_res == true) {
                    if (ZASOUL.isNotEmpty(scope.element.AllowEditCollectionItemCondition)) {
                        var cp = new conditionJsEvaluator(scope.rootScope,
                                                  scope.element.AllowEditCollectionItemCondition,
                                                   scope.entityDef,
                                                   scope.entity,
                                                    scope.entityDef,
                                                   scope.entity,
                                                   null,
                                                   null,
                                                   null);
                        _res = cp.parse();
                    }
                }
                return _res;
            };
            scope.ShowDeleteItemButton = function () {
                var _res = scope.element.AllowDeleteCollectionItem;
                if (_res == true) {
                    if (ZASOUL.isNotEmpty(scope.element.AllowDeleteCollectionItemCondition)) {
                        var cp = new conditionJsEvaluator(scope.rootScope,
                                                  scope.element.AllowDeleteCollectionItemCondition,
                                                   scope.entityDef,
                                                   scope.entity,
                                                    scope.entityDef,
                                                   scope.entity,
                                                   null,
                                                   null,
                                                   null);
                        _res = cp.parse();
                    }
                }
                return _res;
            };
        },
    };
}]);