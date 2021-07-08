var conditionCSParser = function (condition, entityDef, rootEntityDef, rootEntity, variables, collectionEntity, collectionEntityDef) {

    var self = this;
    function parseGroup(group) {
        var resultList = [];
        if (group != undefined && group != null) {

            $.each(group.Conditions, function (index, cond) {

                switch (cond.ConditionItemType) {
                    case 1:
                        resultList.push(parseCondition(cond));
                        break;
                    case 2:
                        resultList.push(parseCondition(cond));
                        break;
                    case 3:
                        resultList.push(cond.LogicalOperator == 1 ? '&&' : '||');
                        break;
                }

            });

        }
        var expr = "";
        $.each(resultList, function (index, res) {
            expr += res + " ";
        });

        return expr;

    };
    function parseCondition(condition) {

        var result = true;
        conditionValueName = "";
        switch (condition.ConditionValueSource) {
            case 1://fields (root)
                {
                    var field = _.find(rootEntityDef.Fields, function (o) {
                        return o.Id == condition.ConditionValue;
                    });
                    conditionValueName = rootEntity[field.Name];

                }
                break
            case 2:// entity fields
                var field = _.find(entityDef.Fields, function (o) {
                    return o.Id == condition.ConditionValue;
                });
                conditionValueName = field.Name;
                break;
            case 3:// variables
                break;
            case 4:// variable property
                break;
        }


        var valueToCompare1 = "";

        switch (condition.ValueToCompareSource1) {
            case 1://fields (Root)
                {
                    var vtc = _.find(rootEntityDef.Fields, function (o) {
                        return o.Id == condition.ValueToCompare1;
                    });
                    valueToCompare1 = rootEntity[vtc.Name];
                }
                break;
            case 2:// Entity Fields
                var vtc = _.find(entityDef.Fields, function (o) {
                    return o.Id == condition.ValueToCompare1;
                });
                valueToCompare1 = vtc.Name;
                break;
            case 3://variables
                break;
            case 4: // variable property
                break;
            case 5: // Text

                valueToCompare1 = condition.ValueToCompare1;

                break;
            case 6: // expression
                break;
            case 7:// collection entity fields
                var vtc = _.find(collectionEntityDef.Fields, function (o) {
                    return o.Id == condition.ValueToCompare1;
                });
                valueToCompare1 = collectionEntity[vtc.Name];
                break;
        }
        if (valueToCompare1 == undefined)
            valueToCompare1 = "";

        switch (condition.Operator) {
            case 1://Equal
                result = 'Entity["' + conditionValueName + '"] == "' + valueToCompare1 + '"';
                break;
            case 2://NotEquals
                result = 'Entity["' + conditionValueName + '"] != "' + valueToCompare1 + '"';
                break;
            case 3: //expression
                break;
            case 3://StartWith
                break;
            case 4://NotStartWith
                break;
            case 5://EndWith
                break;
            case 6://NotEndWith
                break;
            case 7://Contain
                break;
            case 8://NotContain
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
                break;
            case 18://IsNotEmpty
                break;
            case 19://Custom
                break;
        }
        return result;
    };
    self.parse = function () {

        return parseGroup(condition);
    };
    return self;
};