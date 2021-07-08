/*{ Id: "4798E915-AE24-47CF-92CE-50A53894CC71", Name: "Id", Title: "Id" },
{ Id: "F6EF932E-F871-4F58-A9D5-3FD4412F93F4", Name: "CreationDate", Title: "Creation Date" },
{ Id: "C0AFBD62-BB72-480B-89D9-AF5E4CB4C6FD", Name: "CreatedBy", Title: "Created By" },
{ Id: "2FC97B5A-AFAC-4C96-8603-F5D19B8C086A", Name: "LastUpdate", Title: "Last Update" },
{ Id: "3D96EF90-6058-4991-ABAC-207E1C07F54C", Name: "UpdatedBy", Title: "Updated By" }*/
var conditionJsEvaluator = function (
    rootScope,
    condition,
    entityDef,
    entity,
    rootEntityDef,
    rootEntity,
    variables,
    collectionEntity,
    collectionEntityDef,containers) {

    var self = this;

    function parseGroup(group) {
        var resultList = [];
        var result = true;
        if (group != undefined && group != null) {

            $.each(group.Conditions, function (index, cond) {

                switch (cond.ConditionItemType) {
                    case 1:
                        resultList.push(parseCondition(cond));
                        break;
                    case 2:
                        resultList.push(parseGroup(cond));
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
        expr = trim(expr,"&|");
        result = eval(expr);
        return result;

    };
    function getValueToCompare(value, cond) {
        var valueToCompare = "";
        if (value == 1) {
            switch (cond.ValueToCompareSource1) {
                case 1://fields (Root)
                    try{
                        var field = _.find(rootEntityDef.Fields, function (o) { return o.Id.toUpperCase() == cond.ValueToCompare1.toUpperCase(); });
                        if (field != undefined) {
                            valueToCompare = rootEntity[field.Name];
                        }
                    }catch(ex)
                    {
                        console.debug(cond);
                    }
                    break;
                case 2:// Entity Fields
                    var field = _.find(entityDef.Fields, function (o) {
                        return o.Id.toUpperCase() == cocondndition.ValueToCompare1.toUpperCase();
                    });
                    if (field != undefined) {
                        
                            valueToCompare = entity[field.Name];
                        }
                    break;
                case 3://variables
                    var vari = _.find(variables, function (o) { return o.Name == cond.ValueToCompare1; });
                    valueToCompare = vari.Value;
                    break
                    break;
                case 4: // variable property
                    var vari = _.find(variables, function (o) { return o.Name == cond.ValueToCompare1; });
                    valueToCompare = vari.Value[cond.ValueVariableProperty1];
                    break;
                case 5: // Text

                    valueToCompare = cond.ValueToCompare1;

                    break;
                case 6: // expression
                    switch(cond.ValueToCompare1)
                    {
                        case "Today":
                         var date = new Date();
                         valueToCompare = date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate();
                         break;
                    }
                    break;
                case 7:// collection entity fields
                    var field = _.find(collectionEntityDef.Fields, function (o) {
                        return o.Id == cond.ValueToCompare1;
                    });
                    valueToCompare = collectionEntity[field.Name];
                    break;
            }
        }
        else {
            switch (cond.ValueToCompareSource2) {
                case 1://fields (Root)
                    var field = _.find(rootEntityDef.Fields, function (o) { return o.Id.toUpperCase() == cond.ValueToCompare2.toUpperCase(); });
                    valueToCompare = rootEntity[field.Name];
                    break;
                case 2:// Entity Fields
                    var field = _.find(entityDef.Fields, function (o) {
                        return o.Id.toUpperCase() == cond.ValueToCompare2.toUpperCase();
                    });
                    valueToCompare = entity[field.Name];
                    break;
                case 3://variables
                    var vari = _.find(variables, function (o) { return o.Name == cond.ValueToCompare2; });
                    valueToCompare = vari.Value;
                    break
                    break;
                case 4: // variable property
                    var vari = _.find(variables, function (o) { return o.Name == cond.ValueToCompare2; });
                    valueToCompare = vari.Value[cond.ValueVariableProperty2];
                    break;
                case 5: // Text
                    valueToCompare = cond.ValueToCompare2;
                    break;
                case 6: // expression
                    break;
                case 7:// collection entity fields
                    var field = _.find(collectionEntityDef.Fields, function (o) {
                        return o.Id == cond.ValueToCompare2;
                    });
                    valueToCompare = collectionEntity[field.Name];
                    break;
            }
        }
        return valueToCompare;
    };
    function parseCondition(condition) {

        var result = true;
        var conditionValue = "";
        switch (condition.ConditionValueSource) {
            case 1://fields (root)
                {
                    var ffname = "";
                    switch (condition.ConditionValue.toLowerCase()) {
                        case "4798e915-ae24-47cf-92ce-50a53894cc71":
                            ffname = "Id";
                            break;
                        case "f6ef932e-f871-4f58-a9d5-3fd4412f93f4":
                            ffname = "CreationDate";
                            break;
                        case "c0afbd62-bb72-480b-89d9-af5e4cb4c6fd":
                            ffname = "CreatedBy";
                            break;
                        case "2fc97b5a-afac-4c96-8603-f5d19b8c086a":
                            ffname = "LastUpdate";
                            break;
                        case "3d96ef90-6058-4991-abac-207e1c07f54c":
                            ffname = "UpdatedBy";
                            break;
                        case "0eb597fd-4a78-4174-9169-ac910e9bf5e1":
                            ffname = "Serial";
                            break;
                        default:
                            {
                                var field = _.find(rootEntityDef.Fields, function (o) { return o.Id.toUpperCase() == condition.ConditionValue.toUpperCase(); });
                                if (field != undefined) {
                                    ffname = field.Name;
                                }
                            }
                            break;
                    }
                    if (ffname != undefined && ffname != null && ffname != "") {
                        if (ZASOUL.isNotEmpty(rootEntity)) {
                            conditionValue = rootEntity[ffname];
                        }
                    }
                }
                break;
            case 2:// entity fields
                {
                    var field = _.find(entityDef.Fields, function (o) {
                        return o.Id.toUpperCase() == condition.ConditionValue.toUpperCase();
                    });
                    if (field != undefined) {
                        conditionValue = entity[field.Name];
                    }
                }
                break;
            case 3:// variables
                if (condition.ConditionValue != undefined && condition.ConditionValue != null) {
                    var vari = _.find(variables, function (o) { return o.Name == condition.ConditionValue; });
                    if (vari != undefined) {
                        conditionValue = vari.Value;
                    }
                }
                break;
            case 4:// variable property
                if (condition.ConditionValue != undefined && condition.ConditionValue != null) {
                    var vari = _.find(variables, function (o) { return o.Name == condition.ConditionValue; });
                    if (vari != undefined) {
                        conditionValue = vari.Value[condition.VariableProperty];
                    }
                }
                break;
            case 5: // Javascript
                try
                {
                    eval(condition.ConditionValue);
                }
                catch(ex)
                {
                    result = false;
                    console.debug(ex);
                    console.debug(condition.ConditionValue);
                }
                return result;
                break;
            case 6:
                switch(condition.UserProperty)
                {
                    case 1: //Groups
                        conditionValue = rootScope.CurrentUser.Groups;
                        break;
                    case 2: // Username
                        conditionValue = rootScope.CurrentUser.Username;
                        break;
                    case 3: // Email
                        conditionValue = rootScope.CurrentUser.Email;
                        break;
                    case 4: //Not In Group
                        conditionValue = rootScope.CurrentUser.Groups;

                        break;
                }

                break;


        }
        if (condition.ConditionValueSource == 6 && condition.UserProperty == 1)
        {
            result = false;
            var vals = [];
            if (condition.ValueToCompare1 != '' && condition.ValueToCompare1.indexOf(',') > -1) {
                vals = condition.ValueToCompare1.split(',');
            }
            else
            {
                vals.push(condition.ValueToCompare1);
            }

            $.each(vals, function (index, val) {
                var gexists = _.find(conditionValue, function (o) {
                    return o.toUpperCase().trim() == val.toUpperCase().trim();
                }) != undefined;
                if(gexists)
                {
                    result = true;
                    return false;
                }
            });

            return result;
            
        }
        if (condition.ConditionValueSource == 6 && condition.UserProperty == 4) {
            result = true;
            if (ZASOUL.isNotEmpty(conditionValue)) {
                $.each(conditionValue, function (index, val) {
                    var gexists = _.find(conditionValue, function (o) {
                        return o.toUpperCase().trim() == condition.ValueToCompare1.toUpperCase().trim();
                    }) != undefined;
                    if (gexists) {
                        result = false;
                        return false;
                    }
                });
            }
            return result;

        }


        var valueToCompare1 = getValueToCompare(1, condition);

        switch (condition.Operator) {
            case 1://Equal
                conditionValue =  (conditionValue == undefined || conditionValue == null) ? "" : conditionValue.toString().toUpperCase();
                valueToCompare1 = (valueToCompare1  == undefined || valueToCompare1 == null) ? "" : valueToCompare1.toString().toUpperCase();
                result = conditionValue == valueToCompare1;
                break;
            case 2://NotEquals
                conditionValue = (conditionValue == undefined || conditionValue == null) ? "" : conditionValue.toString().toUpperCase();
                valueToCompare1 = (valueToCompare1 == undefined || valueToCompare1 == null) ? "" : valueToCompare1.toString().toUpperCase();
                result = conditionValue != valueToCompare1;
                break;
            case 3://StartWith
                conditionValue = (conditionValue == undefined || conditionValue == null) ? "" : conditionValue.toString().toUpperCase();
                valueToCompare1 = (valueToCompare1 == undefined || valueToCompare1 == null) ? "" : valueToCompare1.toString().toUpperCase();
                result = conditionValue.toUpperCase().indexOf(valueToCompare1.toUpperCase()) == 0;
                break;
            case 4://NotStartWith
                conditionValue = (conditionValue == undefined || conditionValue == null) ? "" : conditionValue.toString().toUpperCase();
                valueToCompare1 = (valueToCompare1 == undefined || valueToCompare1 == null) ? "" : valueToCompare1.toString().toUpperCase();
                result = conditionValue.indexOf(valueToCompare1) == -1 || conditionValue.indexOf(valueToCompare1) > 0;
                break;
            case 5://EndWith
                break;
            case 6://NotEndWith
                break;
            case 7://Contain
                conditionValue = (conditionValue == undefined || conditionValue == null) ? "" : conditionValue.toString().toUpperCase();
                valueToCompare1 = (valueToCompare1 == undefined || valueToCompare1 == null) ? "" : valueToCompare1.toString().toUpperCase();
                result = conditionValue.indexOf(valueToCompare1) > -1;
                break;
            case 8://NotContain
                conditionValue = (conditionValue == undefined || conditionValue == null) ? "" : conditionValue.toString().toUpperCase();
                valueToCompare1 = (valueToCompare1 == undefined || valueToCompare1 == null) ? "" : valueToCompare1.toString().toUpperCase();
                result = conditionValue.indexOf(valueToCompare1) == -1;
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
                {
                    if (valueToCompare1 != undefined && valueToCompare1 != null & valueToCompare1 != "") {
                        if (valueToCompare1.indexOf != undefined && (valueToCompare1.indexOf('-') > -1 || valueToCompare1.indexOf('/') > -1)) {
                            var d1 = new Date(conditionValue);
                            var d2 = new Date(valueToCompare1);
                            result = d1 > d2;
                        }
                        else {
                            var v1 = parseFloat(conditionValue);
                            var v2 = parseFloat(valueToCompare1);
                            result = v1 > v2;
                        }
                    }
                }
                break;
            case 14://GreaterThanEqual
                {
                    if ( valueToCompare1 != undefined && valueToCompare1 != null & valueToCompare1 != "") {
                        if (valueToCompare1.indexOf != undefined && (valueToCompare1.indexOf('-') > -1 || valueToCompare1.indexOf('/') > -1)) {
                            var d1 = new Date(conditionValue);
                            var d2 = new Date(valueToCompare1);
                            result = d1 >= d2;
                        }
                        else {
                            var v1 = parseFloat(conditionValue) ;
                            var v2 = parseFloat(valueToCompare1) ;
                            result = v1 >= v2;
                        }
                    }
                }
                break;
            case 15://LessThan
                {
                    if (valueToCompare1 != undefined && valueToCompare1 != null & valueToCompare1 != "") {
                        if (valueToCompare1.indexOf != undefined && (valueToCompare1.indexOf('-') > -1 || valueToCompare1.indexOf('/') > -1)) {
                            var d1 = new Date(conditionValue);
                            var d2 = new Date(valueToCompare1);
                            result = d1 < d2;
                        }
                        else {
                            var v1 = parseFloat(conditionValue) ;
                            var v2 = parseFloat(valueToCompare1) ;
                            result = v1 < v2;
                        }
                    }
                }
                break;
            case 16://LessThanEqual
                {
                    if (valueToCompare1 != undefined && valueToCompare1 != null & valueToCompare1 != "") {
                        if (valueToCompare1.indexOf != undefined && (valueToCompare1.indexOf('-') > -1 || valueToCompare1.indexOf('/') > -1)) {
                            var d1 = new Date(conditionValue);
                            var d2 = new Date(valueToCompare1);
                            result = d1 <= d2;
                        }
                        else {
                            var v1 = parseFloat(conditionValue) ;
                            var v2 = parseFloat(valueToCompare1) ;
                            result = v1 <= v2;
                        }
                    }
                }
                break;
            case 17://IsEmpty
                result = conditionValue == undefined || conditionValue == null || conditionValue.toString() == "";
                break;
            case 18://IsNotEmpty
                result = conditionValue != undefined && conditionValue != null && conditionValue.toString() != "";
                break;
            case 19://Is Null
                result = conditionValue == null;
                break;
            case 20://IsNotNull
                result = conditionValue != null;
                break;
            case 21://Is Undefined
                result = conditionValue == undefined;
                break;
            case 22://IsNot undefined
                result = conditionValue != undefined;
                break;
            case 23://Custom
                break;
        }
        return result;
    };
    function Variables(vname)
    {
        var vari = _.find(variables, function (o) {

            return o.Name == vname;
        });
        if (vari == undefined) {
            return {Name:vname,Value:""};
        }
        return vari;

    }
    self.parse = function () {
      /*  if (rootScope.FormLoadCompleted == false) {
            return false;
        }*/
        return parseGroup(condition);
    };
    return self;
};