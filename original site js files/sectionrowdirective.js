entityEditor.directive('sectionRow', ['$compile', function ($compile) {
    return {
        restrict: 'EA',
        scope: {
            //the def of collection items
            row: '=',
            sectionScope:'=',
            rootScope: '=',
            entityDef: '=',
            entity: '=',
            form: '=',
            section:'=',
            containerScope:'='

        },
        link: function (scope, element, attr) {
            scope.rowScope = scope;
            scope.selfScope = scope;
            scope.formScope = scope.containerScope.formScope;
            scope.Cells = 6;
            scope.errors = scope.rootScope.errors;
            if (scope.row.Elements.length > 0)
            {
                scope.Cells = 12 / scope.row.Elements.length;
                if(12 % scope.row.Elements.length > 0)
                {
                    scope.Cells = scope.Cells + 1;
                }
            }
            scope.FullId = function () {
                if (ZASOUL.isNotEmpty(scope.containerScope)) {
                    return scope.containerScope.FullId() + "_" + scope.row.Id;
                }
                else {
                    return scope.row.Id;
                }
            }
            scope.IsVisible = function () {
                var visiblity = scope.row.Visibility;
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
                        if (scope.row.VisibleCondition == undefined || scope.row.VisibleCondition == null) {
                            return visible;
                        }
                        var cp = new conditionJsEvaluator(scope.rootScope,
                                                        scope.row.VisibleCondition,
                                                        scope.entityDef,
                                                        scope.entity,
                                                         scope.entityDef,
                                                        scope.entity,
                                                        null,
                                                        null,
                                                        null);

                        //new conditionJsParser(scope.row.VisibleCondition, scope.entityDef, scope.rootEntityDef, [], null, null, scope);
                        visible = cp.parse();
                        break;
                }


                if (scope.sectionScope != scope)
                    return visible && scope.containerScope.IsVisible();
                else
                    return visible && scope.containerScope.IsVisible();
            };

            scope.ValidationErrors = [];
            scope._Warnings = [];
            if (scope.row.ValidationRules.length > 0) {
                scope.$watch(function () {
                    scope.ValidationErrors = [];
                    scope._Warnings = [];
                    $.each(scope.row.ValidationRules, function (index, rule) {

                        var _key = scope.row.Id + "_" + rule.Id;
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
                            if (ruleEnableCondition && ZASOUL.isNotEmpty(scope.entity)) {

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

                                if (res == true) {
                                    if (rule.RuleType == 1) {
                                        scope.ValidationErrors.push(rule.Message);
                                    }
                                    else if (rule.RuleType == 2) {
                                        scope._Warnings.push(rule.Message);
                                    }

                                    scope.rootScope.errors.push({ key: _key, message: scope.rootScope.Localize(rule.Message, rule.MessageEN), groups: rule.ValidationGroups, type: rule.RuleType });
                                }
                            }
                        }
                       


                    });
                });

            }
            scope.scopeType = "row";
            var html = $('#SectionRowTemplate').html();

            var compiled = $compile(html)(scope);
            angular.element(element).append(compiled);
        },
    };
}]);