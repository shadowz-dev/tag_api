var conditionCSParser2 = function (condition, entityDef, rootEntityDef, rootEntity, variables, collectionEntity, collectionEntityDef) {

    var self = this;
    function parseGroup(group) {

        if (group != undefined && group != null) {
            var cs = {};
            cs.ItemType = 2;
            cs.IsRootGroup = group.IsRootGroup;
            cs.Queries = [];
            $.each(group.Conditions, function (index, cond) {

                switch (cond.ConditionItemType) {
                    case 1:
                        cs.Queries.push(parseCondition(cond));
                        break;
                    case 2:
                        cs.Queries.push(parseGroup(cond));
                        break;
                    case 3:
                        var ccs = {};
                        ccs.ItemType = cond.ConditionItemType;
                        ccs.LogicalOperator = cond.LogicalOperator;
                        cs.Queries.push(ccs);
                        break;
                }
            });
            return cs;
        }
        else {
            return undefined;
        }

    };
    function parseCondition(condition) {

        var cs = {};
        cs.ItemType = condition.ConditionItemType;
        cs.Operator = condition.Operator;
        cs.ColumnName = "";
        cs.Value1 = "";
        cs.Value2 = "";
        switch (condition.ConditionValueSource) {
            case 1://fields (root)
                {
                    var fName = getFieldName(rootEntityDef, condition.ConditionValue);
                    cs.ColumnName = fName;

                }
                break
            case 2:// entity fields
                var fName = getFieldName(entityDef, condition.ConditionValue);
                cs.ColumnName = fName;
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
                    var fName = getFieldName(rootEntityDef, condition.ValueToCompare1);
                    valueToCompare1 = rootEntity[fName];
                }
                break;
            case 2:// Entity Fields
                {
                    var fName = getFieldName(entityDef, condition.ValueToCompare1);

                    valueToCompare1 = fName;
                }
                break;
            case 3://variables
                var vari = _.find(variables,function(o){return o.Name == condition.ValueToCompare1});
                if (vari != undefined)
                    valueToCompare1 = vari.Value;
                
                break;
            case 4: // variable property
                var vari = _.find(variables, function (o) { return o.Name == condition.ValueToCompare1 });
                if (vari != undefined)
                    valueToCompare1 = vari.Value[condition.ValueVariableProperty1];
                break;
            case 5: // Text

                valueToCompare1 = condition.ValueToCompare1;

                break;
            case 6: // expression
                switch (condition.ValueToCompare1) {
                    case "Today":
                        var date = new Date();
                        valueToCompare1 = date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate();
                        break;
                }
                break;
            case 7:// collection entity fields
                var fName = getFieldName(collectionEntityDef, condition.ValueToCompare1);
                valueToCompare1 = collectionEntity[fName];
                break;
        }
        if (valueToCompare1 == undefined)
            valueToCompare1 = "";
        cs.Value1 = valueToCompare1;
        return cs;
    };
    function getFieldName(Def,FieldId)
    {
        var retVal = "";
        switch (FieldId.toUpperCase())
        {
            case "4798E915-AE24-47CF-92CE-50A53894CC71":
                retVal = "Id";
                break;
            case "F6EF932E-F871-4F58-A9D5-3FD4412F93F4":
                retVal = "CreationDate";
                break;
            case "C0AFBD62-BB72-480B-89D9-AF5E4CB4C6FD":
                retVal = "CreatedBy";
                break;
            case "2FC97B5A-AFAC-4C96-8603-F5D19B8C086A":
                retVal = "LastUpdate";
                break;
            case "3D96EF90-6058-4991-ABAC-207E1C07F54C":
                retVal = "UpdatedBy";
                break;
            case "0EB597FD-4A78-4174-9169-AC910E9BF5E1":
                retVal = "Serial";
                break;
        }
        if (retVal != "")
            return retVal;
        var field = _.find(Def.Fields, function (o) {
            return o.Id == FieldId;
        });
        if(field != undefined)
        {
            retVal = field.Name;
        }
        return retVal;
    }
    self.parse = function () {
        var res = parseGroup(condition);
        return res;
    };
    return self;
};