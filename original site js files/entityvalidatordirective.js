entityEditor.directive('entityValidator', ['$compile', function ($compile) {
    return {
        restrict: 'EA',
        scope: {
            field: '=',
            entityDef: '=',
            entity: '=',
            rootScope: '=',
            validator:'='
        },
        link: function (scope, element, attr) {

            if (scope.validator == undefined)
                return;
            
            scope.isValid = function () {
                var key = scope.field.Name + "_Validator_" + scope.validator.Operator;
                var isValid = false;
                if (scope.validator.Condition != undefined && scope.validator.Condition != null) {
                    var condRes = evalConditionGroup(scope.validator.Condition);
                    if (condRes == false) {
                        setEntityError(key, true);
                        return true;
                    }
                 }

                switch (scope.validator.Operator) {
                    case 1: //Required
                        if (scope.entity[scope.field.Name] == undefined || scope.entity[scope.field.Name]== null || scope.entity[scope.field.Name]== "") {
                            isValid = false;
                    }
                        else {
                            if (Array.isArray(scope.entity[scope.field.Name])) {
                              
                                if (scope.entity[scope.field.Name].length == 0) {
                                    isValid = false;
                            }
                                else {
                                    isValid = true;
                        }

                        }
                        else {
                            isValid = true;
                        }
                    }
                       
                            break;
                        case 2://MinLength
                            break;
                        case 3://MaxLength
                            break;
                        case 4://RangeLength
                            break;
                        case 5://Equal
                            break;
                        case 6://NotEquals
                            break;
                        case 7://StartWith
                            break;
                        case 8://NotStartWith
                            break;
                        case 9://EndWith
                            break;
                        case 10://NotEndWith
                            break;
                        case 11://Contain
                            break;
                        case 12://NotContain
                            break;
                        case 13://Min
                            break;
                        case 14://Max
                            break;
                    case 15://Range
                        {
                            var val = parseFloat(  scope.entity[scope.field.Name]);
                            var value1 = parseFloat(scope.validator.Value);
                            var value2 = parseFloat(scope.validator.Value2);
                            isValid = val >= value1 && val <= value2;

                        }
                            break;
                        case 16://IsDigit
                            break;
                        case 17://Regex
                            break;
                        case 18://GreaterThan
                            break;
                        case 19://GreaterThanEqual
                            break;
                        case 20://LessThan
                            break;
                        case 21://LessThanEqual
                            break;
                        case 22://IsEmpty
                            break;
                        case 23://IsNotEmpty
                            break;
                        case 24://Custom
                        break;

                }
           
                

                               
                
              if (isValid == false) {
                  setEntityError(key, false);

        }
            else {
                  setEntityError(key, true);
                }
                return isValid;
            };
            function setEntityError(key,isValid)
            {
                if (isValid == false) {
                    var vItem = _.find(scope.entity.__ValidationErrors__, function (o) {
                        return o.key == key;
                    });
                    if (vItem == undefined) {
                        scope.entity.__ValidationErrors__.push({
                            key: key, message: scope.validator.ValidationMessage
                        });
                    }
                }
                else
                {
                    var vItem = _.find(scope.entity.__ValidationErrors__, function (o) {
                        return o.key == key;
                    });
                    if (vItem != undefined) {
                        var idx = scope.entity.__ValidationErrors__.indexOf(vItem);
                        scope.entity.__ValidationErrors__.splice(idx, 1);
                    }
                }
            }

            function evalConditionGroup(group) {
    var result = true;
    var resultList =[];
    if (group != undefined && group != null) {

        $.each(group.Conditions, function (index, cond) {

            switch (cond.ConditionItemType) {
                case 1:
                    resultList.push(evalCondition(cond));
                    break;
                case 2:
                    resultList.push(evalConditionGroup(cond));
                    break;
                case 3:
                    resultList.push(cond.LogicalOperator == 1 ? '&&': '||');
                    break;
        }

            });

            }
                var expr = "";
        $.each(resultList, function (index, res) {
            expr += res + " ";
            });
    result = eval(expr);
                    return result;
    }

    function evalCondition(condition) {

        var result = true;
        var conditionValue = "";
        switch (condition.ConditionValueSource)
        {
            case 1:
            case 2:
                var field = _.find(scope.entityDef.Fields, function (o) {
                    return o.Id == condition.ConditionValue;
                });
                conditionValue = scope.entity[field.Name];;
                break;
            case 3:
                break;
            case 4 :
                break;
        }

        if (conditionValue == undefined || conditionValue ==null)
    {
            conditionValue = "";
        }

        var valueToCompare1 = "";
     
        switch (condition.ValueToCompareSource1) {
            case 1://field
            case 2:
                var vtc = _.find(scope.entityDef.Fields, function (o) {
                    return o.Id == condition.ValueToCompare1;
                });
                 valueToCompare1 =   scope.entity[vtc.Name];
                break;
            case 3://variables
                break;
                case 4:
                break;
            case 5:
          
            valueToCompare1 = condition.ValueToCompare1;
                break;
            case 6:
                break;
               
        }
        if (valueToCompare1 == undefined)
        valueToCompare1 = "";
        switch (condition.Operator) {
            case 1://Equal
                result = valueToCompare1.toUpperCase() == conditionValue.toUpperCase();
            break;
            case 2://NotEquals
                 result = valueToCompare1.toUpperCase() != conditionValue.toUpperCase();
            break;
            case 3: //expression
            break;
            case 3://StartWith
                result = valueToCompare1.toUpperCase().indexOf(conditionValue.toUpperCase()) == 0;
             break;
            case 4://NotStartWith
                result = valueToCompare1.toUpperCase().indexOf(conditionValue.toUpperCase()) != 0;
            break;
            case 5://EndWith
            break;
            case 6://NotEndWith
            break;
            case 7://Contain
                result = valueToCompare1.toUpperCase().indexOf(conditionValue.toUpperCase()) > -1;
            break;
            case 8://NotContain
                result = valueToCompare1.toUpperCase().indexOf(conditionValue.toUpperCase()) == -1;
            break;
            case 9://Min
            break;
            case 10://Max
            break;
            case 11://Range
            break;
            case 12://IsDigit
            break;
            case 13://GreaterThan
            break;
            case 14://GreaterThanEqual
            break;
            case 15://LessThan
            break;
            case 16://LessThanEqual
            break;

            case 17://IsEmpty
                result = valueToCompare1 == undefined || valueToCompare1 == null || valueToCompare1 == "";
            break;

        case 18://IsNotEmpty
                result = valueToCompare1 != undefined && valueToCompare1 != null && valueToCompare1 != "";
            break;
            case 19://Custom
                break;

    }

            return result;
    }


            var html = '<div ng-show="isValid() == false">' +scope.validator.ValidationMessage + '</div>';
            var compiled = $compile(html) (scope);
            angular.element(element).empty().append(compiled);

        },
    };
}]);
