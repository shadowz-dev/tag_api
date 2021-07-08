/*{ Id: "4798E915-AE24-47CF-92CE-50A53894CC71", Name: "Id", Title: "Id" },
{ Id: "F6EF932E-F871-4F58-A9D5-3FD4412F93F4", Name: "CreationDate", Title: "Creation Date" },
{ Id: "C0AFBD62-BB72-480B-89D9-AF5E4CB4C6FD", Name: "CreatedBy", Title: "Created By" },
{ Id: "2FC97B5A-AFAC-4C96-8603-F5D19B8C086A", Name: "LastUpdate", Title: "Last Update" },
{ Id: "3D96EF90-6058-4991-ABAC-207E1C07F54C", Name: "UpdatedBy", Title: "Updated By" }*/

var conditionJsParser = function (
    condition,
    entityDef,
    rootEntityDef,
    variables,
    collectionEntity,
    collectionEntityDef,
    scope) {

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

        return trim(expr, "&|");

    };

    function parseCondition(condition) {

        var result = true;
        conditionValueName = "";
        switch (condition.ConditionValueSource) {
            case 1://fields (root)
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
            case 5: // Javascript
                var entity = scope.entity;
                 eval(condition.ConditionValue);
               
                return result;
                break;

        }


        var valueToCompare1 = "";

        switch (condition.ValueToCompareSource1) {
            case 1://fields (Root)
            case 2:// Entity Fields
                {
                    var fName = "";
                    switch (condition.ValueToCompare1) {
                        case "4798E915-AE24-47CF-92CE-50A53894CC71":
                            fName = "Id";
                            break;
                        case "F6EF932E-F871-4F58-A9D5-3FD4412F93F4":
                            fName = "CreationDate";
                            break;
                        case "C0AFBD62-BB72-480B-89D9-AF5E4CB4C6FD":
                            fName = "CreatedBy";
                            break;
                        case "2FC97B5A-AFAC-4C96-8603-F5D19B8C086A":
                            fName = "LastUpdate";
                            break;
                        case "3D96EF90-6058-4991-ABAC-207E1C07F54C":
                            fName = "UpdatedBy";
                            break;
                        default:
                            var vtc = _.find(entityDef.Fields, function (o) {
                                return o.Id == condition.ValueToCompare1;
                            });
                            if (vtc != undefined) {
                                fName = vtc.Name;
                            }
                            break;
                    }
                    if (fName != "") {
                        valueToCompare1 = entityDef[fName];
                    }
                }
               
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
                {
                var fName = "";
                switch (condition.ValueToCompare1) {
                    case "4798E915-AE24-47CF-92CE-50A53894CC71":
                        fName = "Id";
                        break;
                    case "F6EF932E-F871-4F58-A9D5-3FD4412F93F4":
                        fName = "CreationDate";
                        break;
                    case "C0AFBD62-BB72-480B-89D9-AF5E4CB4C6FD":
                        fName = "CreatedBy";
                        break;
                    case "2FC97B5A-AFAC-4C96-8603-F5D19B8C086A":
                        fName = "LastUpdate";
                        break;
                    case "3D96EF90-6058-4991-ABAC-207E1C07F54C":
                        fName = "UpdatedBy";
                        break;
                    default:
                        var vtc = _.find(collectionEntityDef.Fields, function (o) {
                            return o.Id == condition.ValueToCompare1;
                        });
                        if (vtc != undefined)
                        {
                            fName = vtc.Name;
                        }
                        break;
                }
                if (fName !="") {
                    valueToCompare1 = collectionEntity[fName];
                }
        }
                break;
        }
        if (valueToCompare1 == undefined)
            valueToCompare1 = "";

        switch (condition.Operator) {
            case 1://Equal
                result = 'Item["' + conditionValueName + '"] == "' + valueToCompare1 + '"';
                break;
            case 2://NotEquals
                result = 'Item["' + conditionValueName + '"] != "' + valueToCompare1 + '"';
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
            case 19://Is Null
                break;
            case 20://IsNotNull
                break;
            case 21://Is Undefined
                break;
            case 22://IsNot undefined
                break;
            case 23://Custom
                break;
        }
        return result;
    };
    self.parse = function () {
        var ress = parseGroup(condition);
        ress = "result = " + ress + ";" ;
        //var result = false;
       // eval(ress);
        return ress;
    };
    return self;
};