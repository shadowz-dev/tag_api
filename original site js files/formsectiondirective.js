entityEditor.directive('formSection', ['$compile', '$sce','EntityService','ActionSetService', function ($compile,$sce,EntityService,ActionSetService) {
    return {
        restrict: 'EA',
        scope: {
           
            sectionObject:'=',
            rootScope: '=',
            entityDef: '=',
            entity: '=',
            containerScope:'=',
            form:'='
        },
        link: function (scope, element, attr) {

            scope.ZASOULID = createGuid();
            scope.sectionScope = scope;
            scope.selfScope = scope;
            scope.formScope = ZASOUL.isEmpty(scope.rootScope.parentScope) ? scope.rootScope : scope.rootScope.parentScope.formScope;
            var templateAdded = false;
            scope.IsVisible = function () {
                var visiblity = scope.sectionObject.Visibility;
                var visible = false;
                if (visiblity == undefined)
                    visiblity = 1;

                switch (visiblity) {
                    case 1:
                        visible = true;
                        break;
                    case 2:
                        visible = false;
                        break;

                    case 3:
                        if (scope.sectionObject.VisibleCondition == undefined || scope.sectionObject.VisibleCondition == null) {
                            return visible;
                        }
                        var cp = new conditionJsEvaluator(scope.rootScope,
                                            scope.sectionObject.VisibleCondition,
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

                if (ZASOUL.isEmpty(scope.containerScope))
                    {
                            if(scope.rootScope.Form.MultipleTabs)
                                {
                                            return visible && scope.rootScope.SectionInCurrentTab(scope.sectionObject);
                                }
                                else
                            {
                            return visible;
                            }
                    }
                else
                    {
                    return visible && scope.containerScope.IsVisible();
                    }
            };
            scope.ValidationErrors = [];
            scope.section = {};
            scope.errors = scope.rootScope.errors;
            var entity = scope.entity;
            scope.ShowTitle = scope.sectionObject.HideTitle == false;
            var html = "";
            scope.getUserHit = function () {
                return $sce.trustAsHtml(scope.rootScope.Localize(scope.section.UserHint, scope.section.UserHintEN));
            };
            scope.userFormHint = function () {
                return scope.rootScope.Localize(scope.section.UserHint, scope.section.UserHintEN);
            };
            if (scope.sectionObject.UseSharedSection && ZASOUL.isNotEmpty(scope.sectionObject.SharedSection))
            {
                var section = _.find(scope.entityDef.SharedSections,function(o){
                    return o.Id.toUpperCase() == scope.sectionObject.SharedSection.toUpperCase();
                });
                if (section != undefined)
                { scope.section = section; }
                else
                { scope.section = scope.sectionObject; }
                 html = $('#SectionTemplate').html();
            }
           else 
            {
                switch (scope.sectionObject.SectionType) {
                    //custom
                    case 0:
                        scope.section = scope.sectionObject;
                        html = $('#SectionTemplate').html();
                        break;
                        // Shared Section
                    case 1:
                        switch (scope.sectionObject.SharedSectionSelectionMethod) {
                            // List
                            case undefined:
                            case 0:
                                {
                                    var section = _.find(scope.entityDef.SharedSections, function (o) {
                                        return o.Id.toUpperCase() == scope.sectionObject.SharedSection.toUpperCase();
                                    });
                                    if (section != undefined) {
                                        scope.section = section;
                                        scope.section.parentSection = scope.sectionObject;
                                        scope.section.HideTitle = scope.sectionObject.HideTitle;
                                    }
                                }
                                break;
                            case 1: // Javascript expression
                                {
                                    var result = "";
                                    eval(scope.sectionObject.SharedSectionSelectionExpression);
                                    var section = _.find(scope.entityDef.SharedSections, function (o) {
                                        return o.Id.toUpperCase() == result.toUpperCase();
                                    });
                                    if (section != undefined) {
                                        scope.section = section;
                                        scope.section.parentSection = scope.sectionObject;
                                        scope.section.HideTitle = scope.sectionObject.HideTitle;
                                    }
                                }
                        }


                        html = $('#SharedSectionTemplate').html();
                        break;
                        // Reference Section
                    case 2:
                        scope.section = scope.sectionObject;
                        /*    if (ZASOUL.isEmpty(scope.rootScope.Entity[field.Name]))
                                break;*/
                        scope.refSectionScope = {};
                        scope.refSectionScope.rootScope = scope.rootScope;
                        scope.refSectionScope.formScope = scope.formScope;
                        scope.refSectionScope.sectionObject = scope.sectionObject;
                        scope.refSectionScope.ParentEntity = scope.entity;
                        scope.refSectionScope.parentSectionScope = scope;
                        scope.refSectionScope.containerScope = scope;
                        html = $('#ReferenceSectionTemplate').html();

                        //ReferenceEntityDefId
                        //RefernceFieldId
                        //Local Field
                        //ReferenceSectionId
                        //External Field
                        var ref_refEntityDefId = "";
                        var ref_refFieldId = "";
                        var ref_refSectionId = "";
                        var ref_externalFieldId = "";
                        switch (scope.sectionObject.ReferenceEntityDefSelectionMethod) {
                            case 0:
                                ref_refEntityDefId = scope.sectionObject.ReferenceEntityDefId;
                                break;
                            case 1:
                                {
                                    var result = "";
                                    eval(scope.sectionObject.ReferenceEntityDefSelectionExpression);
                                    ref_refEntityDefId = result;
                                }
                                break;
                        }
                        switch (scope.sectionObject.ReferenceFieldSelectionMethod) {
                            case 0:
                                ref_refFieldId = scope.sectionObject.ReferenceFieldId;
                                break;
                            case 1:
                                {
                                    ref_refFieldId = scope.sectionObject.LocalFieldId;
                                }
                                break;
                        }
                        switch (scope.sectionObject.ReferenceSectionSelectionMethod) {
                            case 0:
                                ref_refSectionId = scope.sectionObject.ReferenceSectionId;
                                break;
                            case 1:
                                {
                                    var result = "";
                                    eval(scope.sectionObject.ReferenceSectionSelectionExpression);
                                    ref_refSectionId = result;
                                }
                                break;
                        }
                        switch (scope.sectionObject.ExternalFieldSelectionMethod) {
                            case 0:
                                ref_externalFieldId = scope.sectionObject.ExternalEntityFieldId;
                                break;
                            case 1:
                                {
                                    var result = "";
                                    eval(scope.sectionObject.ExternalFieldSelectionExpression);
                                    ref_externalFieldId = result;
                                }
                                break;
                        }
                        var field = _.find(scope.rootScope.EntityDefinition.Fields, function (o) {
                            // return o.Id.toUpperCase() == scope.sectionObject.ReferenceFieldId.toUpperCase();
                            return o.Id.toUpperCase() == ref_refFieldId.toUpperCase();
                        });
                        var refDef = null;
                        var defPromise = EntityService.GetDefById(ref_refEntityDefId).then
                             ( function (_DEF) {
                                 
                                 refDef = _DEF;
                            scope.refSectionScope.EntityDefinition = refDef;
                            scope.refSectionScope.ParentEntityDefinition = scope.rootScope.EntityDefinition;
                          

                            if (scope.rootScope.Entity[field.Name] == undefined) {
                                scope.rootScope.Entity[field.Name] = createGuid();
                            }

                            var entityPromise = EntityService.GetEntityWCById(scope.rootScope.Entity[field.Name], ref_refEntityDefId)
                                    .then(function (_Entity) {
                                        if (ZASOUL.isNotEmpty(_Entity)) {
                                            scope.__ExternalEntity = _Entity;
                                            scope.__ExternalEntity.__EntityDefinitionId__ = ref_refEntityDefId;
                                            scope.rootScope.Entity["__" + field.Name + "_Object"] = scope.__ExternalEntity;
                                           
                                        }
                                        else
                                        {
                                            if (ZASOUL.isEmpty(scope.rootScope.Entity["__" + field.Name + "_Object"])) {
                                                scope.rootScope.Entity["__" + field.Name + "_Object"] = { Id: scope.rootScope.Entity[field.Name] };
                                            }
                                        }

                                        scope.refSectionScope.Entity = scope.rootScope.Entity["__" + field.Name + "_Object"];
                                        scope.refSectionScope.Entity.__ValidationErrors__ = [];
                                        scope.refSectionScope.entity = scope.refSectionScope.Entity;
                                        scope.refSectionScope.parentSectionScope = scope;
                                        scope.refSectionScope.containerScope = scope;
                                    });

                            if (ZASOUL.isEmpty(scope.rootScope.Entity["__" + field.Name + "_Object"])) {
                                scope.rootScope.Entity["__" + field.Name + "_Object"] = { Id: scope.rootScope.Entity[field.Name] };
                            }

                            scope.refSectionScope.Entity = scope.rootScope.Entity["__" + field.Name + "_Object"];
                            scope.refSectionScope.Entity.__ValidationErrors__ = [];
                            scope.refSectionScope.entity = scope.refSectionScope.Entity;
                            scope.refSectionScope.parentSectionScope = scope;
                            scope.refSectionScope.containerScope = scope;
                            if (ZASOUL.isNotEmpty(refDef)) {
                                scope.refSectionScope.section = _.find(refDef.SharedSections, function (o) {
                                    // return o.Id.toUpperCase() == scope.sectionObject.ReferenceSectionId.toUpperCase();
                                    return o.Id.toUpperCase() == ZASOUL.toUpper(ref_refSectionId);
                                });
                            }
                                 
                            var compiled = $compile(html)(scope);
                            angular.element(element).empty();
                            angular.element(element).append(compiled);
                            templateAdded = true;
                             });
                        //////////////////////////////// Start Watch Scope //////////////////////////////////////////////////////////
                        scope.$watch("__" + field.Name + "_Object", function () {
                            scope.refSectionScope.Entity = scope.rootScope.Entity["__" + field.Name + "_Object"];
                            if (ZASOUL.isNotEmpty(scope.refSectionScope.Entity)) {
                                scope.refSectionScope.Entity.__ValidationErrors__ = [];
                            }
                            scope.refSectionScope.entity = scope.refSectionScope.Entity;
                            scope.refSectionScope.parentSectionScope = scope;
                            scope.refSectionScope.containerScope = scope;
                            if (ZASOUL.isNotEmpty(refDef)) {
                                scope.refSectionScope.section = _.find(refDef.SharedSections, function (o) {
                                    return o.Id.toUpperCase() == ZASOUL.toUpper(ref_refSectionId);
                                });
                            }
                        });
                        //////////////////////////////// End Watch Scope //////////////////////////////////////////////////////////
                        if (ZASOUL.isNotEmpty(refDef)) {
                            scope.refSectionScope.section = _.find(refDef.SharedSections, function (o) {
                                return o.Id.toUpperCase() == ZASOUL.toUpper(ref_refSectionId);
                            });
                        }
                        break;
                        // Reference Form
                    case 3:
                        break;
                    case 4: // Custom HTML
                        html = $('#CustomHTMLSectionTemplate').html();
                        html = html.replace("##CUSTOMHTML##", scope.sectionObject.CustomHTML);
                        break;

                }
                
            }
            
            if (ZASOUL.isNotEmpty(scope.section.ValidationRules) && scope.section.ValidationRules.length > 0) {
                scope.$watch(function () {
                    scope.ValidationErrors = [];
                    $.each(scope.section.ValidationRules, function (index, rule) {

                        var _key = scope.section.Id + "_" + rule.Id;
                        var val = _.find(scope.errors, function (o) { return o.key == _key });
                        if (val != undefined) {
                            var idx = scope.errors.indexOf(val);
                            if (idx > -1) {
                                scope.errors.splice(idx, 1);
                            }
                        }

                        var res = false;
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
                                    null);
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
                                    null);
                                res = ev.parse();

                                
                            }

                        }
                        if (res == true) {
                            scope.ValidationErrors.push(scope.rootScope.Localize(rule.Message, rule.MessageEN));
                            scope.errors.push({ key: _key, message: scope.rootScope.Localize(rule.Message, rule.MessageEN), type: rule.RuleType });
                        }


                    });
                });

            }

            scope.GetCustomHTML = function () {
                return $sce.trustAsHtml(scope.sectionObject.CustomHTML);
            };
          //  var html = $('#SectionTemplate').html();
            scope.scopeType = "Section";
            if (templateAdded == false) {
                var compiled = $compile(html)(scope);
                angular.element(element).append(compiled);
            }
        },
    };
}]);