entityEditor.directive('sectionRowElement', ['$compile', '$sce', 'EntityService', 'ActionSetService', function ($compile, $sce, EntityService, ActionSetService) {
    return {
        restrict: 'EA',
        scope: {
            //the def of collection items
            element: '=',
            rootScope: '=',
            rowScope:'=',
            entityDef:'=',
            entity:'=',
            form: '=',
            section:'=',
            containerScope:'=',
        },
        link: function (scope, element, attr) {
            scope.selfScope = scope;
            scope.elementScope = scope;
            if (scope.element == undefined)
                return;

          
            var htmlTemplateName = "";
            var html = "";
            scope.propertyName = "";
            scope.Title = "";
            scope.fieldTitle = "";
            scope.formScope = scope.containerScope.formScope;
            scope.errors = scope.rootScope.errors;
            scope.elementScope = scope;
            scope.DisplayRule = 0;
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
                        eval(scope.element.DisplayRuleExpression);
                        retVal = result;
                        break;
                    case 5: // default is read
                        retVal = 2;
                        if (ZASOUL.isNotEmpty(scope.element.DisplayRuleCondition)) {
                            var cp = new conditionJsEvaluator(scope.rootScope,
                                                scope.element.DisplayRuleCondition,
                                                scope.entityDef,
                                                scope.entity,
                                               scope.rootScope.entityDef,
                                                scope.rootScope.entity,
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
                                                scope.element.DisplayRuleCondition,
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
                scope.__DisplayRule = retVal;
                return retVal;
            };
            if (scope.element.Title != undefined && scope.element.Title != null && scope.element.Title != "") {
                scope.Title = scope.element.Title;
            }
            else {
                scope.Title = scope.fieldTitle;
            }
            scope.FullId = function()
            {
                if(ZASOUL.isNotEmpty(scope.containerScope))
                {
                    return scope.containerScope.FullId() + "_" + scope.element.Id;
                }
                else
                {
                    return scope.element.Id;
                }
            }
            scope.LoadElementImage = function () {

                var id = scope.entity[scope.propertyName];
                if (ZASOUL.isEmpty(id)) {
                    return;
                }
                $.ajax({
                    url: appPath + "APIS/GetImageElementById?Id=" + id,
                    type: 'GET',

                    dataType: 'JSON',
                    success: function (response) {
                        if (response.HasError) {
                            console.debug(response.ErrorMessage);
                            return;
                        }
                        //     console.debug(response.Result);
                        scope.entity[scope.propertyName + "__FileName"] = response.Result.FileName;
                        scope.entity[scope.propertyName + "__FileContent"] = response.Result.FileContent;
                        if (!scope.rootScope.formScope.$$phase && !scope.$root.$phase) {
                            scope.$apply();
                        }

                    }
                });
            };
            switch (scope.element.ElementType) {
                case 1: // field
                    scope.field = null;
                    if (ZASOUL.isNotEmpty(scope.element.EntityFieldId)) {
                        scope.field = _.find(scope.entityDef.Fields, function (o) {
                        return o.Id.toUpperCase() == scope.element.EntityFieldId.toUpperCase();
                    });
                    }
                    
                    if (ZASOUL.isNotEmpty(scope.field))
                    {
                        scope.propertyName = scope.field.Name;
                        scope.fieldTitle = scope.formScope.Localize(scope.field.Title,scope.field.TitleEN);
                    }
                    if (ZASOUL.isNotEmpty(scope.field) && scope.field.DataType == 16) {
                        scope.LoadElementImage();
                    }
                    html = $("#SectionRowElementTemplate").html();
                    break;
                case 2: // collection
                    scope.collection = _.find(scope.entityDef.Collections, function (o) {
                        return o.Id == scope.element.EntityCollectionId;
                    });
                    if (scope.collection != undefined && scope.collection != null) {
                        scope.propertyName = scope.collection.Name;
                        scope.fieldTitle = scope.rootScope.Localize( scope.collection.Title,scope.collection.Title);
                    }
                    html = $("#SectionRowCollectionTemplate").html();
                    break;
                case 3: // button
                    html = $("#SectionRowButtonTemplate").html();
                    break;
                case 4: // Reference Field
                   var _field = _.find(scope.entityDef.Fields, function (o) {
                        return o.Id == scope.element.ReferenceFieldId;
                    });
                    var objectFieldId = scope.element.ReferenceObjectFieldId;
                    $.ajax(
                        {
                            method: "GET",
                            url: "/APIS/GetEntityFieldDef",
                            data: { DefinitionId: _field.MasterEntityDefId, FieldId: objectFieldId },
                            cache: false,
                            async: false,
                            dataType: "JSON",
                            error: function () { },
                            success: function (response) {
                                if (response.HasError) {
                                    alert(response.ErrorMessage);
                                    return;
                                }
                                scope.field = response.Result;
                                if (scope.field != undefined && scope.field != null) {
                                    scope.propertyName = "__" + _field.Name + "_Object." + scope.field.Name;
                                    scope.fieldTitle = scope.rootScope.Localize(scope.field.Title,scope.field.TitleEN);
                                }
                            }
                            
                        });
                    html = $("#SectionRowElementTemplate").html();
                    break;
                case 5: //ReferenceCollection 
                    break;
                case 6: //SharedSection 
                    {
                        var section = _.find(scope.entityDef.SharedSections, function (o) {
                            return o.Id.toUpperCase() == scope.element.SharedSectionId.toUpperCase();
                        });
                        if (section != undefined)
                            scope.section = section;

                        html = $('#SharedSectionTemplate').html();
                    }
                    break;
                case 7: //ExternalSection 
                    {

                        /*    if (ZASOUL.isEmpty(scope.rootScope.Entity[field.Name]))
                                break;*/
                        scope.refSectionScope = {};
                        scope.refSectionScope.rootScope = scope.rootScope;
                        scope.refSectionScope.formScope = scope.formScope;
                        scope.refSectionScope.sectionObject = scope.sectionObject;
                        scope.refSectionScope.ParentEntity = scope.entity;
                        scope.refSectionScope.parentSectionScope = scope;
                        var isInitialized = false;
                        var refDef = null;
                        html = $('#ExternalSectionElementTemplate').html();
                        var field = _.find(scope.rootScope.EntityDefinition.Fields, function (o) {
                            return o.Id.toUpperCase() == scope.element.ReferenceFieldId.toUpperCase();
                        });
                        var defPromise = EntityService.GetDefById(scope.element.ReferenceEntityDefId).then
                            (function (_DEF) {

                                refDef = _DEF;
                                scope.section = scope.sectionObject;
                                scope.refSectionScope.EntityDefinition = refDef;
                                scope.refSectionScope.parentSectionScope = scope;
                                scope.refSectionScope.ParentEntityDefinition = scope.rootScope.EntityDefinition;
                                scope.refSectionScope.containerScope = scope;

                                var _newObject = false;
                                if (ZASOUL.isNotEmpty(scope.rootScope.Entity)) {
                                    if (z.isEmpty(scope.rootScope.Entity[field.Name])) {
                                        if (field.ReferenceFieldAutoInitObject == 1) {
                                            scope.rootScope.Entity[field.Name] = createGuid();
                                            scope.rootScope.Entity["__" + field.Name + "_Object"] = { Id: scope.rootScope.Entity[field.Name] };
                                            _newObject = true;

                                        }
                                    }
                                }
                                //////////Start Entity Promise//////////////////////////////

                                if (ZASOUL.isNotEmpty(scope.rootScope.Entity) && ZASOUL.isNotEmpty(scope.rootScope.Entity[field.Name]) && (ZASOUL.isEmpty(scope.rootScope.Entity["$$$" + field.Name + "$$$Loading"]) || scope.rootScope.Entity["$$$" + field.Name + "$$$Loading"] == false)) {
                                    z.Debug("GetEntityWCById SRED 245: " + scope.rootScope.Entity[field.Name]);
                                    scope.rootScope.Entity["$$$" + field.Name + "$$$Loading"] = true;
                                    var entityPromise = EntityService.GetEntityWCById(scope.rootScope.Entity[field.Name], refDef.Id)
                                        .then(function (_Entity) {

                                            if (_Entity != null) {
                                                if (z.isNotEmpty(scope.rootScope.Entity)) {
                                                    scope.rootScope.Entity["__" + field.Name + "_Object"] = _Entity;
                                                }
                                            }
                                            else {
                                                if (field.ReferenceFieldAutoInitObject == 1) {
                                                    if (z.isNotEmpty(scope.rootScope.Entity)) {
                                                        scope.rootScope.Entity["__" + field.Name + "_Object"] = { Id: scope.rootScope.Entity[field.Name] };
                                                    }
                                                }
                                            }
                                            isInitialized = true;
                                            scope.rootScope.Entity["$$$" + field.Name + "$$$Loading"] = false;
                                        }
                                        );
                                }
                                else {
                                    if (ZASOUL.isNotEmpty(scope.rootScope.Entity) && field.ReferenceFieldAutoInitObject == 1) {
                                        scope.rootScope.Entity[field.Name] = createGuid();
                                        scope.rootScope.Entity["__" + field.Name + "_Object"] = {
                                            Id: scope.rootScope.Entity[field.Name]
                                        };
                                        isInitialized = true;
                                    }
                                }
                                //////////////////////End Entity Promise/////////////////////////
                                scope.refSectionScope.section = _.find(refDef.SharedSections, function (o) {
                                    return o.Id.toUpperCase() == scope.element.ExternalSectionId.toUpperCase();
                                });
                                scope.Render("ExternalSectionElementTemplate");

                                scope.$watch("entity." + field.Name, function () {
                                    if (isInitialized == false) {
                                        return;
                                    }
                                    if (ZASOUL.isNotEmpty(scope.rootScope.Entity)) {
                                        scope.refSectionScope.Entity = scope.rootScope.Entity["__" + field.Name + "_Object"];
                                        if (ZASOUL.isEmpty(scope.refSectionScope.Entity) && ZASOUL.isNotEmpty(scope.rootScope.Entity[field.Name])) {
                                            if (ZASOUL.isNotEmpty(refDef)) {
                                                z.Debug("GetEntityWCById SRED 281: " + scope.rootScope.Entity[field.Name]);
                                                var entityPromise2 = EntityService.GetEntityWCById(scope.rootScope.Entity[field.Name], refDef.Id)
                                                    .then(function (_Entity) {
                                                        if (_Entity != null) {
                                                            scope.rootScope.Entity["__" + field.Name + "_Object"] = _Entity;
                                                            scope.refSectionScope.Entity = scope.rootScope.Entity["__" + field.Name + "_Object"];
                                                            scope.refSectionScope.Entity.__ValidationErrors__ = [];
                                                            scope.refSectionScope.entity = scope.refSectionScope.Entity;
                                                            scope.refSectionScope.parentSectionScope = scope;
                                                            scope.refSectionScope.containerScope = scope;
                                                        }

                                                    }
                                                    );
                                            }
                                        }
                                        else if (ZASOUL.isNotEmpty(scope.refSectionScope.Entity)) {

                                            scope.refSectionScope.Entity.__ValidationErrors__ = [];
                                            scope.refSectionScope.entity = scope.refSectionScope.Entity;
                                            scope.refSectionScope.parentSectionScope = scope;
                                            scope.refSectionScope.containerScope = scope;
                                        }
                                    }
                                });
                                scope.$watch("entity.__" + field.Name + "_Object", function () {
                                    if (isInitialized == false) {
                                        return;
                                    }
                                    if (ZASOUL.isNotEmpty(scope.rootScope.Entity)) {
                                        scope.refSectionScope.Entity = scope.rootScope.Entity["__" + field.Name + "_Object"];
                                        if (ZASOUL.isEmpty(scope.refSectionScope.Entity) && ZASOUL.isNotEmpty(scope.rootScope.Entity[field.Name])) {
                                            if (ZASOUL.isNotEmpty(refDef)) {
                                                z.Debug("GetEntityWCById SRED 311: " + scope.rootScope.Entity[field.Name]);
                                                var entityPromise2 = EntityService.GetEntityWCById(scope.rootScope.Entity[field.Name], refDef.Id)
                                                    .then(function (_Entity) {
                                                        if (_Entity != null) {
                                                            scope.rootScope.Entity["__" + field.Name + "_Object"] = _Entity;
                                                            scope.refSectionScope.Entity = scope.rootScope.Entity["__" + field.Name + "_Object"];
                                                            scope.refSectionScope.Entity.__ValidationErrors__ = [];
                                                            scope.refSectionScope.entity = scope.refSectionScope.Entity;
                                                            scope.refSectionScope.parentSectionScope = scope;
                                                            scope.refSectionScope.containerScope = scope;
                                                        }

                                                    }
                                                    );
                                            }
                                        }
                                        else if (ZASOUL.isNotEmpty(scope.refSectionScope.Entity)) {

                                            scope.refSectionScope.Entity.__ValidationErrors__ = [];
                                            scope.refSectionScope.entity = scope.refSectionScope.Entity;
                                            scope.refSectionScope.parentSectionScope = scope;
                                            scope.refSectionScope.containerScope = scope;
                                        }
                                    }
                                });

                            });
                        ////////////////////End Def Promise///////////////////////////////////////////   

                        scope.refSectionScope.parentSectionScope = scope;
                        if (ZASOUL.isNotEmpty(scope.rootScope.Entity)) {
                            scope.refSectionScope.Entity = scope.rootScope.Entity["__" + field.Name + "_Object"];
                            if (ZASOUL.isNotEmpty(scope.refSectionScope.Entity)) {
                                scope.refSectionScope.Entity.__ValidationErrors__ = [];
                                scope.refSectionScope.entity = scope.refSectionScope.Entity;

                            }
                        }
                        scope.refSectionScope.containerScope = scope;


                    }
                    break;
                case 8: //ExternalForm
                    break;
                case 9: //Custom 
                    html = $('#CustomHTMLElementTemplate').html();
                    html = html.replace("##CUSTOMHTML##", scope.element.CustomHTML);
                    
                    break;
            }
            if (scope.element.Title != undefined && scope.element.Title != null && scope.element.Title != "" )
            {
                scope.Title = scope.rootScope.Localize(scope.element.Title,scope.element.TitleEN) ;
            }
            else
            {
                scope.Title = scope.fieldTitle;
            }
            scope.ButtonClick = function () {

                var context = new executerContext(scope, scope.entityDef, scope.entity, null, null);
                context.EntityService = EntityService;
                var act = _.find(scope.rootScope.EntityDefinition.ActionSets, function (o) {
                    return o.Name == scope.element.ButtonAction;
                });
                if (act != undefined) {
                    ActionSetService.ExecuteActionSet(act.ActionSet, context);
                  
                }
            };
            scope.IsVisible = function () {

                var visiblity = scope.element.Visibility;
                var visible = false;
                if (visiblity == undefined)
                { visiblity = 1; }

                switch (visiblity) {
                    case 1:
                        visible = true;
                        break;
                    case 2:
                        visible = false;
                        break;

                    case 3:
                        if (scope.element.VisibleCondition == undefined || scope.element.VisibleCondition == null) {
                            return visible;
                        }
                        var cp = new conditionJsEvaluator(scope.rootScope,
                                                    scope.element.VisibleCondition,
                                                    scope.entityDef,
                                                    scope.entity,
                                                     scope.entityDef,
                                                    scope.entity,
                                                    null,
                                                    null,
                                                    null);
                        visible = cp.parse();
                        break;
                }
                return visible && scope.containerScope.IsVisible();
            };
            scope.ValidationErrors = [];
            scope._Warnings = [];
            scope.element.scope = scope;
            scope.getCustomContent = function () {
                return $sce.trustAsHtml( scope.element.CustomContent);
            };

            scope.ShowAsterisk = function () {
                var rule = _.find(element.ValidationRules, function (r) {
                    return r.RuleType == 1;
                });
                return rule != undefined;
            };

            if (scope.element.ValidationRules.length > 0) {

                scope.$watch(function () {
                    scope.ValidationErrors = [];
                    scope._Warnings = [];
                    $.each(scope.element.ValidationRules, function (index, rule) {

                        var res = false;
                        var _key = scope.element.Id + "_" + rule.Id;
                        var val = _.find(scope.errors, function (o) { return o.key.toLowerCase() == _key.toLowerCase() });
                        if (val != undefined) {
                            var idx = scope.errors.indexOf(val);
                            if (idx > -1) {
                                scope.containerScope.errors.splice(idx, 1);
                            }
                        }

                        if (scope.IsVisible() && rule.Enabled == true) {

                            var ruleEnableCondition = false;
                            if (ZASOUL.isNotEmpty(rule.EnableCondition)) {
                                var evRuleEnable = new conditionJsEvaluator(scope.rootScope,
                                          rule.EnableCondition,
                                              scope.entityDef,
                                              scope.entity,
                                              scope.entityDef,
                                              scope.entity,
                                              null,
                                              null,
                                            null, { form: scope.form, section: scope.section, element: scope.element, displayRule: scope.getDisplayRule() });
                                if (ZASOUL.isNotEmpty(scope.entity)) {
                                    ruleEnableCondition = evRuleEnable.parse();
                                }
                            }
                            else {
                                ruleEnableCondition = true;

                            }

                            if (ruleEnableCondition) {
                                var ev = new conditionJsEvaluator(scope.rootScope,
                                                                         rule.Condition,
                                                                             scope.entityDef,
                                                                             scope.entity,
                                                                             scope.entityDef,
                                                                             scope.entity,
                                                                             null,
                                                                             null,
                                                                           null, { form: scope.form, section: scope.section, element: scope.element, displayRule: scope.getDisplayRule() });
                                if (ZASOUL.isNotEmpty(scope.entity)) {
                                    res = ev.parse();
                                }
                            }

                            if (ruleEnableCondition == true) {
                                if (res == true) {
                                    if (rule.RuleType == 1) {
                                        scope.ValidationErrors.push(scope.rootScope.Localize(rule.Message, rule.MessageEN));
                                    }
                                    else if (rule.RuleType == 2) {
                                        scope._Warnings.push(scope.rootScope.Localize(rule.Message,rule.MessageEN));
                                    }
                                    
                                    scope.errors.push({ key: _key, message: scope.rootScope.Localize(rule.Message, rule.MessageEN), groups: rule.ValidationGroups, type: rule.RuleType
                            });
                                }
                            }

                        }
                        
                       
                    });
                });

            }

            if (scope.element.ElementType == 1)
            {
               
                if (scope.element.OnClientChange != undefined && scope.element.OnClientChange != null) {
                    if (scope.element.OnClientChange.Enabled) {
                        scope.$watch("entity." + scope.propertyName, function (oldValue, newValue) {
                            if (scope.IsVisible()) {

                                try {
                                    if (scope.rootScope.FormLoadCompleted) {
                                        var context = new executerContext(scope, scope.entityDef, scope.entity, null, null);
                                        context.EntityService = EntityService;
                                        context.ElementScope = scope;
                                        if (scope.field.IsReference == true)
                                        {
                                            context.SelectorEntity = scope.entity["__" + scope.field.Name + "_Object"];
                                        }
                                        ActionSetService.ExecuteActionSet(scope.element.OnClientChange, context);
                                  
                                    }
                                }
                                catch (ex) { }
                            }

                        });
                    }
                }
            }
            
           scope.OnCollectionItemAdding = function (CollectionItem, CollectionEntityDefinition, eventArgs,callback) {
                if (scope.element.OnCollectionItemAdding != undefined && scope.element.OnCollectionItemAdding != null) {
                    if (scope.element.OnCollectionItemAdding.Enabled) {
                        if (scope.IsVisible()) {
                            try {
                                var context = new executerContext(scope, scope.entityDef, scope.entity, CollectionEntityDefinition, CollectionItem);
                                context.EventArgs = eventArgs;
                                ActionSetService.ExecuteActionSet(scope.element.OnCollectionItemAdding, context).then(function() {
                                     if (callback != undefined) {
                                    callback();
                    }
                        });
                            }
                            catch (ex) { }
                        }
                    }
                    else {
                     if(callback != undefined) {
                                    callback();
                     }
                }
                }
            else {
                     if (callback != undefined) {
                                    callback();
                                    }
        }
            };
            scope.OnCollectionItemAdded = function (CollectionItem, CollectionEntityDefinition) {
                if (scope.element.OnCollectionItemAdded != undefined && scope.element.OnCollectionItemAdded != null) {
                    if (scope.element.OnCollectionItemAdded.Enabled) {
                        try {
                            var context = new executerContext(scope, scope.entityDef, scope.entity, CollectionEntityDefinition, CollectionItem);
                            ActionSetService.ExecuteActionSet(scope.element.OnCollectionItemAdded, context);

                        }
                        catch (ex) { }

                    }
                }
            };
            scope.OnCollectionItemUpdating = function (CollectionItem, CollectionEntityDefinition, eventArgs,callback) {
                if (scope.element.OnCollectionItemUpdating != undefined && scope.element.OnCollectionItemUpdating != null) {
                    if (scope.element.OnCollectionItemUpdating.Enabled) {
                        try {
                            var context = new executerContext(scope, scope.entityDef, scope.entity, CollectionEntityDefinition, CollectionItem);
                            context.EventArgs = eventArgs
                            ActionSetService.ExecuteActionSet(scope.element.OnCollectionItemUpdating, context).then(function () {
                                if (callback != undefined) {
                                    callback();
                                }
                            });
                        }
                        catch (ex) { }

                    }
                else {
                     if (callback != undefined) {
                                    callback();
                                    }
        }
        }
            else
            {
             if (callback != undefined) {
                                    callback();
                                }
            }
            };
            scope.OnCollectionItemUpdated = function (CollectionItem, CollectionEntityDefinition) {
                if (scope.element.OnCollectionItemUpdated != undefined && scope.element.OnCollectionItemUpdated != null) {
                    if (scope.element.OnCollectionItemUpdated.Enabled) {
                        try {
                            var context = new executerContext(scope, scope.entityDef, scope.entity, CollectionEntityDefinition, CollectionItem);
                            ActionSetService.ExecuteActionSet(scope.element.OnCollectionItemUpdated, context);
                        }
                        catch (ex) { }

                    }
                }
            };
            scope.OnCollectionItemDeleting = function (CollectionItem, CollectionEntityDefinition, eventArgs, callback) {
                if (scope.element.OnCollectionItemDeleting != undefined && scope.element.OnCollectionItemDeleting != null) {
                    if (scope.element.OnCollectionItemDeleting.Enabled) {
                        try {
                            var context = new executerContext(scope, scope.entityDef, scope.entity, CollectionEntityDefinition, CollectionItem);
                            context.EventArgs = eventArgs
                            ActionSetService.ExecuteActionSet(scope.element.OnCollectionItemDeleting, context).then(function () {
                                if (callback != undefined) {
                                    callback();
                                }
                            });

                        }
                        catch (ex) { }

                    }
                    else  {
                        if (callback != undefined) {
                            callback();
                        }
                    }
                }
                else {
                    if (callback != undefined) {
                        callback();
                    }
                }
            };
            scope.OnCollectionItemDeleted = function (CollectionItem, CollectionEntityDefinition, callback) {
                if (scope.element.OnCollectionItemDeleted != undefined && scope.element.OnCollectionItemDeleted != null) {
                    if (scope.element.OnCollectionItemDeleted.Enabled) {
                        try {
                            var context = new executerContext(scope, scope.entityDef, scope.entity, CollectionEntityDefinition, CollectionItem);
                            ActionSetService.ExecuteActionSet(scope.element.OnCollectionItemDeleted, context).then(function () {
                                if (callback != undefined) {
                                    callback();
                                }
                            });
                        }
                        catch (ex) {
                        }

                    }
                else
            {
                                      if (callback != undefined) {
                                    callback();
                                }
                    }
        }
        else
                {
                      if (callback != undefined) {
                                    callback();
                                }
            }
        };


            scope.scopeType = "Element";

            scope.Render = function (htmlTemplate) {

                var compiled;
                if (htmlTemplate != undefined) {
                    html = $('#' + htmlTemplate).html();
                }

                compiled = $compile(html)(scope);
                angular.element(element).empty().append(compiled);
            };
            var compiled = $compile(html)(scope);
            angular.element(element).append(compiled);
        },
    };
}]);