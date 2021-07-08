
/*******************************************************************************/

var getEntityCollection = function (collectionId,entity,entityDef) {
    var col = _.find(entityDef.Collections, function (o) {
        return o.Id == collectionId;
    });
    return entity[col.Name];
 };

var iteratorItemExecuter = function (action,item, executerContext,iteratorContext) {
    var self = {};
    self.execute = function () {
        var variable = executerContext.getVariable(action.ItemVariableName);
        variable.Value = item;
        var acExecuter = new actionSetExecuter(action.ActionSet, executerContext, function(){
            iteratorContext.nextIterator(self);
        } );
        acExecuter.execute();
    };
    return self;

};

var executerContext = function (scope,entityDef,entity,collectionEntityDef,collectionEntity) {
    var self = {};
    self.Scope = scope;
    self.EntityDef = entityDef;
    self.Entity = entity;
    self.CollectionEntityDef = collectionEntityDef;
    self.CollectionEntity = collectionEntity;
    self.Variables = null;
    self.getVariable = function (Name) {
        var vari = _.find(self.Variables, function (o) {return o.Name == Name });
        return vari;
    };
    self.getVariableValue = function (Name) {
        var vari = _.find(self.Variables, function (o) { return o.Name == Name });
        if (vari != undefined && vari != null)
            return vari.Value;
        return null;
    };
    self.setVariableValue = function (Name,Value) {
        var vari = _.find(self.Variables, function (o) { return o.Name == Name });
        if (vari != undefined) {
            vari.Value = Value;
        }
    };
    self.getVariableProperty = function (VariableName, PropertyName) {
        var vari = _.find(self.Variables, function (o) { return o.Name == VariableName });
        if (vari != undefined) {
            if (ZASOUL.isNotEmpty(vari.Value)) {
                return vari.Value[PropertyName] ;
            }
            else
                return null;
        }
        else
        {
            return null;
        }
    };

    self.setVariableProperty = function (VariableName,PropertyName, Value) {
        var vari = _.find(self.Variables, function (o) { return o.Name == VariableName });
        if (vari != undefined) {
            if (ZASOUL.isEmpty(vari.Value))
            {
                vari.Value = {};
              
            }
            vari.Value[PropertyName] = Value;
        }
    };

    self.getEntityFieldById = function (Id) {
        var field = _.find(self.EntityDef.Fields, function (o) {
            return ZASOUL.toUpper(o.Id) == ZASOUL.toUpper(Id);
        });
        return field;
    };
    self.getEntityFieldByName = function (Name) {
        var field = _.find(self.EntityDef.Fields, function (o) {
            return ZASOUL.toUpper(o.Name) == ZASOUL.toUpper( Name);
        });
        return field;
    };
    self.getCollectionEntityFieldById = function (Id) {
        var field = _.find(self.CollectionEntityDef, function (o) {
            return ZASOUL.toUpper(o.Id) == ZASOUL.toUpper(Id);
        });
        return field;
    };
    self.getCollectionEntityFieldByName = function (Name) {
        var field = _.find(self.CollectionEntityDef, function (o) {
            return ZASOUL.toUpper(o.Name) == ZASOUL.toUpper(Name);
        });
        return field;
    };
    return self;
};

function getPropValue(obj, path) {
  var paths = path.split('.')
    , current = obj
    , i;

  for (i = 0; i < paths.length; ++i) {
    if (current[paths[i]] == undefined) {
      return undefined;
    } else {
      current = current[paths[i]];
    }
  }
  return current;
}

function evaluateValue(ValueSource, Value, VariableProperty, UserProperty, executerContext)
{
    var resultValue = {Value:"",PresenterValue:""};
    switch (ValueSource)
    {
        case 1://Fields
            {
                var f = "";
                switch (Value) {
                    case "4798E915-AE24-47CF-92CE-50A53894CC71":
                        f = "Id";
                        break;
                    case "F6EF932E-F871-4F58-A9D5-3FD4412F93F4":
                        f = "CreationDate";
                        break;
                    case "C0AFBD62-BB72-480B-89D9-AF5E4CB4C6FD":
                        f = "CreatedBy";
                        break;
                    case "2FC97B5A-AFAC-4C96-8603-F5D19B8C086A":
                        f = "LastUpdate";
                        break;
                    case "3D96EF90-6058-4991-ABAC-207E1C07F54C":
                        f = "UpdatedBy";
                        break;
                    case "0EB597FD-4A78-4174-9169-AC910E9BF5E1":
                        f = "Serial";
                        break;
                    default:
                        var vtc = _.find(executerContext.EntityDef.Fields, function (o) {
                            return o.Id.toUpperCase() == Value.toUpperCase();
                        });
                        if (vtc != undefined) {
                            f = vtc.Name;
                        }
                        break;
                }

                if (f != "") {
                    resultValue.Value = executerContext.Entity[f];
                    resultValue.PresenterValue = executerContext.Entity["__" + f + "_PresenterString"];
                }
            }
            break;
        case 2://Entity Fields

            break;
        case 3://Variables
            var vari = executerContext.getVariable(Value);
            resultValue.Value = vari == undefined ? "" : vari.Value;
            resultValue.PresenterValue = "";
            break;
        case 4://Variable Property
            var vari = executerContext.getVariable(Value);
            if (vari != undefined && vari != null) {
                if (VariableProperty != undefined && VariableProperty != null && VariableProperty !="") {
                    if (VariableProperty.Value.indexOf('.') > -1) {
                        resultValue.Value = getPropValue(vari.Value, VariableProperty);
                        resultValue.PresenterValue = "";
                    }
                    else {
                        resultValue.Value = vari.Value[VariableProperty];
                        resultValue.PresenterValue = vari.Value["__" + VariableProperty + "_PresenterString"];
                    }
                }

            }
            break;
        case 5://Text
            resultValue.Value = Value;
            resultValue.PresenterValue = "";
            break;
        case 6://Expression


            break;
        case 7://Colletion Entity Fields
            {
                var f = "";
                switch (entValue.Value) {
                    case "4798E915-AE24-47CF-92CE-50A53894CC71":
                        f = "Id";
                        break;
                    case "F6EF932E-F871-4F58-A9D5-3FD4412F93F4":
                        f = "CreationDate";
                        break;
                    case "C0AFBD62-BB72-480B-89D9-AF5E4CB4C6FD":
                        f = "CreatedBy";
                        break;
                    case "2FC97B5A-AFAC-4C96-8603-F5D19B8C086A":
                        f = "LastUpdate";
                        break;
                    case "3D96EF90-6058-4991-ABAC-207E1C07F54C":
                        f = "UpdatedBy";
                        break;
                    case "0EB597FD-4A78-4174-9169-AC910E9BF5E1":
                        f = "Serial";
                        break;
                    default:
                        var vtc = _.find(executerContext.CollectionEntityDef.Fields, function (o) {
                            return o.Id.toUpperCase() == Value.toUpperCase();
                        });
                        if (vtc != undefined) {
                            f = vtc.Name;
                        }
                        break;
                }
                if (f != "") {
                    resultValue.Value = collectionEntity[f];
                    resultValue.PresenterValue = collectionEntity["__" + f + "_PresenterString"];
                }
            }
            break;

    }
    return resultValue;
}