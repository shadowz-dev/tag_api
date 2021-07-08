entityEditor.factory('ActionSetService', function ($q,EntityService) {
    function ActionSetService() {
        var service = this;
        service.EnableTracing = false;
        //1
        service.Execute_AddColletionItem = function (action, executerContext) {
            var deferred = $q.defer();
            {
                var entity;
                var entityDef;
                switch (action.EntitySource) {
                    case 1:// entity ?
                        entity = executerContext.Entity;
                        entityDef = executerContext.EntityDef;

                        break;
                    case 2:// Root Entity 
                        entity = executerContext.Entity;
                        entityDef = executerContext.EntityDef;
                        break;
                    case 3:
                        break
                }

                var col = _.find(entityDef.Collections, function (o) {
                    return o.Id == action.CollectionId;
                });

                if (col != undefined) {
                    var vari = executerContext.getVariable(action.VariableName);
                    if (ZASOUL.isNotEmpty(vari)) {
                        if (ZASOUL.isNotEmpty(vari.Value)) {
                            vari.Value.__objectstatus__ = "Created";
                        }
                        if (entity[col.Name] == undefined || entity[col.Name] == null) {
                            entity[col.Name] = [];
                        }
                        if (ZASOUL.isNotEmpty(vari.Value)) {
                            entity[col.Name].push(vari.Value);
                        }
                    }
                }
                deferred.resolve({Result : true,Action:action});
            }
            return deferred.promise;

        };
        //2
        service.Execute_BreakLoop = function (action, executerContext) {
            var deferred = $q.defer();
            {
                executerContext.___collectionForEach_Loopers[executerContext.___collectionForEach_Loopers.length - 1].Break = true;
                deferred.resolve({Result : true,Action:action});
            }
            return deferred.promise;

        };
        //3
        service.Execute_CallDataSource = function (action, executerContext) {
            if (service.EnableTracing)
            {
                console.debug("Start Call Execute_CallDataSource");
            }
            var deferred = $q.defer();
            {
                var parameters = service._buildDataSourceParameters(action,executerContext);
                $.ajax({
                    url: appPath + "APIS/ExecuteDataSource",
                    type: "POST",
                    
                    dataType: "JSON",
                    data: { DataSourceId: action.DataSourceId, Parameters: angular.toJson(parameters) },
                    success: function (response) {
                        
                        if (response.HasError) {
                            alert(response.ErrorMessage);
                            deferred.resolve({Result : false,Action:action});
                            return;
                        }
                        executerContext.setVariableValue(action.ReturnVariableName, response.Result.Result);
                        if (service.EnableTracing) {
                            console.debug("Resolving Execute_CallDataSource");
                        }
                        deferred.resolve({Result : true,Action:action});
                    }


                });
            }
            return deferred.promise;

        };
        //4
        service.Execute_CallEntityAction = function (action, executerContext) {
            var deferred = $q.defer();
            {
                if (action.CallType == 0) {
                    var ac = _.find(executerContext.EntityDef.ActionSets, function (o) { return o.Name == action.ActionSetName });
                    service.ExecuteActionSet(ac.ActionSet, executerContext).then(function (_Result_) {
                        deferred.resolve({Result:_Result_.Result,Action:action});
                    })
                }
                if (action.CallType == 1) {
                    executerContext.Scope.rootScope.formScope.FormLoadCompleted = false;

                    var entity = angular.toJson(executerContext.Entity);
                    var defId = executerContext.EntityDef.Id;
                    $("#__EntityJson__").val(entity);
                    $("#__EntityDefId__").val(defId);
                    $("#__EntityId__").val(executerContext.Entity.Id);
                    $("#__ActionName__").val(action.ActionSetName);
                    if (ZASOUL.toUpper(executerContext.Entity.Id) != ZASOUL.toUpper(executerContext.Scope.rootScope.formScope.Entity.Id)) {
                        $("#__FormEntityJson__").val(angular.toJson(executerContext.Scope.rootScope.formScope.Entity));
                        $("#__FormEntityDefId__").val(executerContext.Scope.rootScope.formScope.EntityDefinition.Id);
                        $("#__FormEntityId__").val(executerContext.Scope.rootScope.formScope.Entity.Id);
                    }
                    $("#ServerForm").ajaxForm({
                        url: appPath + 'APIS/ExecuteServerAction?SaveForm=true',
                        
                        dataType: 'json', success: function (response) {
                            if (response.HasError) {
                                alert(response.ErrorMessage);
                               deferred.resolve({Result:false,Action:action});
                                return;
                            }
                            $(".loader-overlay").show();
                            executerContext.Scope.rootScope.formScope.FormLoadCompleted = false;
                            executerContext.Scope.rootScope.formScope.SetEntity(response.Result);
                             if (ZASOUL.strEqual(executerContext.Entity.Id,executerContext.Scope.rootScope.formScope.Entity.Id))
                                    {
                                        executerContext.Entity = response.Result;
                                    }
                            executerContext.Scope.rootScope.formScope.FormLoadCompleted = true;
                            if (!executerContext.Scope.rootScope.formScope.$$phase) {
                                executerContext.Scope.rootScope.formScope.$apply();
                            }
                            $(".loader-overlay").hide();
                            deferred.resolve({Result:true,Action:action});

                        }
                    });

                    $("#ServerForm").submit();

                }
            }
            return deferred.promise;

        };
        //5
        service.Execute_CallServerFunction = function (action, executerContext) {
                    return $q(function(resolve,reject) {
                             var parameters = service._buildServerFunctionParameters(action,executerContext);
                                if (action.ServerFunctionId != undefined && action.ServerFunctionId != null) {
                                    $.ajax({
                                        type: "POST",
                                        url: appPath + "APIS/ExecuteServerFunction",
                                        data: { ServerFunctionId: action.ServerFunctionId, Parameters: angular.toJson(parameters) },
                                        dataType: "json",
                                        success: function (response) {
                                            if (response.HasError) {
                                                alert(response.ErrorMessage);
                                                resolve({Result:false,Action:action});
                                                return;
                                            }
                                            executerContext.setVariableValue(action.ReturnVariableName, response.Result);
                                            resolve({Result:true,Action:action});
                                        }

                                    });
                                }
                                else {
                                    resolve({Result:true,Action:action});
                                }
                    });
/*
            var deferred = $q.defer();
            {
                var parameters = service._buildServerFunctionParameters(action,executerContext);
                if (action.ServerFunctionId != undefined && action.ServerFunctionId != null) {
                    $.ajax({
                        type: "POST",
                        url: appPath + "APIS/ExecuteServerFunction",
                        data: { ServerFunctionId: action.ServerFunctionId, Parameters: angular.toJson(parameters) },
                        dataType: "json",
                        
                        success: function (response) {
                            if (response.HasError) {
                                alert(response.ErrorMessage);
                                deferred.resolve({Result:false,Action:action});
                                return;
                            }

                            executerContext.setVariableValue(action.ReturnVariableName, response.Result);
                            deferred.resolve({Result:true,Action:action});
                        }

                    });

                }
                else {
                    deferred.resolve({Result:true,Action:action});
                }
            }
            return deferred.promise;

            */

        };
        //6
        service.Execute_CallWebService = function (action, executerContext) {
            var deferred = $q.defer();
            {
                var parameters = service._buildWebServiceParameters();

                $.ajax({
                    url: appPath + "APIS/CallWebMethod",
                    type: "POST",
                    
                    dataType: "JSON",
                    data: {
                        WebServiceId: action.WebServiceId,
                        WebMethod: action.WebMethod, Parameters: angular.toJson(parameters)
                    },
                    success: function (response) {
                        if (response.HasError) {
                            alert(response.ErrorMessage);
                            deferred.resolve({Result:false,Action:action});
                            return;
                        }
                        console.debug(response.Result);
                        executerContext.setVariableValue(action.ReturnVariableName, response.Result);
                        deferred.resolve({Result:true,Action:action});
                    }
                });
            }
            return deferred.promise;
        };
        //7
        service.Execute_ClearCollection = function (action, executerContext) {
            var deferred = $q.defer();
            {
                var col = getEntityCollection(action.CollectionId, executerContext.Entity, executerContext.EntityDef);
                if (ZASOUL.isNotEmpty(col)) {
                    $.each(col, function (index, obj) {
                        obj.__objectstatus__ = "Deleted";
                    });
                    /*  col.splice(0, col.length);*/
                    deferred.resolve({Result:true,Action:action});
                }
                else
                {
                    deferred.resolve({Result:true,Action:action});
                }
            }
            return deferred.promise;

        };
        //8
        service.Execute_CollectionForEach = function (action, executerContext) {
            var deferred = $q.defer();
            {
                
                if (executerContext.___collectionForEach_Loopers == undefined) {
                    executerContext.___collectionForEach_Loopers = [];
                }
                executerContext.___collectionForEach_Loopers.push(self);

                var col = null;
                if (action.CollectionSource == 1) {
                    var vari = _.find(executerContext.Variables, function (o) {
                        return o.Name == action.CollectionVariable;
                    });
                    if (vari != undefined) {
                        col = vari.Value;
                    }
                }
                else if (action.CollectionSource == 2) {
                    col = getEntityCollection(action.CollectionId, executerContext.Entity, executerContext.EntityDef);
                }
                if (col != undefined && col != null && col.length >0) {
                    var iteratorIndex = 0;
                    var iteratorPromise = service.Execute_ForeachIterator(action, col, iteratorIndex, executerContext,deferred).then(function () {
                       // deferred.resolve({});
                    });
/*
                   iteratorPromise.then(function () {
                        deferred.resolve({});
                    });
                   */
                }
                else
                {
                    deferred.resolve({Result:true,Action:action});
                }
                

            }
            return deferred.promise;
        };
        //9
        service.Execute_CreateEntity = function (action, executerContext) {
            var deferred = $q.defer();
            {
                EntityService.GetDefById(action.EntityDefinitionId).then( function (DefObject) { 
                
                    
                    var entityDef = DefObject;
                    var nEntity = { Id: createGuid() };
                    var rootEntity = executerContext.Entity;
                    var rootEntityDef = executerContext.EntityDef;
                    var collectionEntityDef = executerContext.CollectionEntityDef;
                    var collectionEntity = executerContext.CollectionEntity;
                    $.each(action.EntityValues, function (index, entValue) {
                        var value = "";
                        var presValue = "";
                        switch (entValue.ValueSource) {
                            case 1: // root entity

                                var f = "";
                                switch (entValue.Value.toUpperCase()) {
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
                                    default:
                                        var vtc = _.find(rootEntityDef.Fields, function (o) {
                                            return o.Id.toUpperCase() == entValue.Value.toUpperCase();
                                        });
                                        if (vtc != undefined) {
                                            f = vtc.Name;
                                        }
                                        break;
                                }

                                if (f != "") {
                                    value = rootEntity[f];
                                    presValue = rootEntity["__" + f + "_PresenterString"];
                                }
                                break;
                            case 2: // new Entity
                                break;
                            case 3: //Variables
                                var vari = executerContext.getVariable(entValue.VariableName);
                                value = vari == undefined ? "" : vari.Value;
                                break;
                            case 4:  // Variable Property
                                var vari = executerContext.getVariable(entValue.VariableName);
                                if (vari != undefined && vari != null) {
                                    if (vari.Value != undefined && vari.Value != null) {
                                        if (entValue != undefined && entValue != null) {
                                            if (entValue.Value != undefined && entValue.Value != null) {
                                                if (entValue.Value.indexOf('.') > -1) {
                                                    value = getPropValue(vari.Value, entValue.Value);
                                                }
                                                else {
                                                    value = vari.Value[entValue.Value];
                                                    presValue = vari.Value["__" + entValue.Value + "_PresenterString"];
                                                }

                                            }
                                        }
                                    }

                                }

                                break;
                            case 5://text

                                value = entValue.Value;
                                break;
                            case 6: // expression
                                break;
                            case 7: // Collection Entity
                                var f = "";
                                switch (entValue.Value.toUpperCase()) {
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
                                    default:
                                        var vtc = _.find(collectionEntityDef.Fields, function (o) {
                                            return o.Id.toUpperCase() == entValue.Value.toUpperCase();
                                        });
                                        if (vtc != undefined) {
                                            f = vtc.Name;
                                        }
                                        break;
                                }
                                if (f != "") {
                                    value = collectionEntity[f];
                                    presValue = collectionEntity["__" + f + "_PresenterString"];
                                }

                                break;
                        }
                        var field = _.find(entityDef.Fields, function (o) { return ZASOUL.strEqual(entValue.FieldId , o.Id); });
                        if(field != undefined)
{
                        nEntity[field.Name] = value;
                        if (field.Name == "Id") {
                            nEntity["__" + field.Name + "_PresenterString"] = presValue;
                        }
                        else {
                            nEntity["__" + field.Name + "_PresenterString"] = presValue;
                        }
}
                    });
                    var vari = executerContext.getVariable(action.VariableName);
                    if (vari != undefined) {
                        vari.Value = nEntity;
                    }
                    deferred.resolve({Result:true,Action:action});
                });

            }
            return deferred.promise;
        };
        //10
        service.Execute_DeleteCollectionItem = function (action, executerContext) {
            var deferred = $q.defer();
            {
                var entity;
                var entityDef;
                var rootEntityDef;
                var collectionEntityDef = executerContext.CollectionEntityDef;
                var collectionEntity = executerContext.CollectionEntity;
                switch (action.EntitySource) {
                    case 1:// entity ?
                        break;
                    case 2:// Root Entity 
                        entity = executerContext.Entity;
                        entityDef = executerContext.EntityDef;
                        break;
                    case 3:
                        break
                }
                var col = _.find(entityDef.Collections, function (o) {
                    return o.Id == action.CollectionId;
                });
                if (col != undefined) {
                    var items = entity[col.Name];
                    EntityService.GetDefById(col.EntityDefinitionId).then( function (DefObject) { 
                        var colEntityDef = DefObject;
                        var cond = new conditionJsParser(action.Condition, colEntityDef, rootEntityDef, executerContext.Variables, collectionEntity, collectionEntityDef);
                        var pString = cond.parse();

                        //   var cond = new conditionJsEvaluator(action.Condition, entityDef, entity, rootEntityDef, rootEntity, executerContext.Variables, collectionEntity, collectionEntityDef);
                        // var pString = cond.parse();
                        var metItems = _.filter(items, function (Item) {
                            var result = false;
                            eval(pString);
                            return result;
                        });
                        $.each(metItems, function (index, item) {
                            var idx = entity[col.Name].indexOf(item);
                            if (idx > -1) {
                                if (item.__objectstatus__ == "Created")
                                    entity[col.Name].splice(idx, 1);
                                else {
                                    item.__objectstatus__ = "Deleted"

                                }

                            }
                        });
                
                        deferred.resolve({Result:true,Action:action});
                    });

                }
            }
            return deferred.promise;
        };
        //11
        service.Execute_GetEntities = function (action, executerContext) {
            var deferred = $q.defer();
            {
                EntityService.GetDefById(action.EntityDefinitionId).then(
                    function (response) {
                        var def = response;
                        var css = new conditionCSParser2(action.Condition, def, executerContext.EntityDef, executerContext.Entity, executerContext.Variables, executerContext.CollectionEntity, executerContext.CollectionEntityDef);
                        var dd = css.parse();

                        var parsedQuery = angular.toJson(dd);
                        if (parsedQuery != "") {
                            service.Post(appPath + "APIS/GetEntities",{ EntityDefId: action.EntityDefinitionId, ConditionStr: parsedQuery }).then(function(response2){
                                var vari = executerContext.getVariable(action.VariableName);
                                vari.Value = response2.Result;
                                deferred.resolve({Result:true,Action:action});
                            });
                        }
                        else {
                            deferred.resolve({Result:true,Action:action});
                        }
                    }
                    );
              
            }
            return deferred.promise;
        };
        //12
        service.Execute_GetEntity = function (action, executerContext) {
            if (service.EnableTracing) {
                console.debug("Start Execute_GetEntity");
            }
            var deferred = $q.defer();
            {
                EntityService.GetDefById(action.EntityDefinitionId).then( function (DefObject) {
                    var def = DefObject;
                    var css = new conditionCSParser2(action.Condition, def, executerContext.EntityDef, executerContext.Entity, executerContext.Variables, executerContext.CollectionEntity, executerContext.CollectionEntityDef);
                    var dd = css.parse();
                    var parsedQuery = angular.toJson(dd);

                    if (parsedQuery != "") {
                        $.ajax({
                            url: appPath + "APIS/GetEntity",
                            type: "POST",
                            data: { EntityDefId: action.EntityDefinitionId, ConditionStr: parsedQuery },
                                
                            success: function (response) {
                                if (response.HasError) {
                                    alert(response.ErrorMessage);
                                    deferred.resolve({Result:false,Action:action});
                                    return;
                                }
                                var vari = executerContext.getVariable(action.VariableName);
                                vari.Value = response.Result;
                                if (service.EnableTracing) {
                                    console.debug("Resolving Execute_GetEntity");
                                }
                                deferred.resolve({Result:true,Action:action});
                                    
                            },
                            dataType: "JSON"
                        });
                            
                    }
                    else {
                        if (service.EnableTracing) {
                            console.debug("Resolving Execute_GetEntity");
                        }
                        deferred.resolve({Result:true,Action:action});

                    }
                });
              }
            return deferred.promise;
        };
        //13
        service.Execute_IfElseAction = function (action, executerContext) {
            if (service.EnableTracing) {
                console.debug("Start Execute_IfElseAction");
            }
            var deferred = $q.defer();
            {
                var entity = executerContext.Entity;
                var entityDef = executerContext.EntityDef;
                var collectionEntityDef = executerContext.CollectionEntityDef;
                var collectionEntity = executerContext.CollectionEntity;

                var conditionEval = new conditionJsEvaluator(executerContext.Scope, action.Condition, executerContext.EntityDef,
                executerContext.Entity, executerContext.EntityDef,
                    executerContext.Entity, executerContext.Variables, executerContext.CollectionEntity,
                    executerContext.CollectionEntityDef
                    );
                var conditionResult = conditionEval.parse();

                if (conditionResult == true) {
                    if (service.EnableTracing) {
                        console.debug("Start Execute_IfElseAction True Branch");
                    }
                    service.ExecuteActionSet(action.TrueActionSet, executerContext).then(
                        function () {
                            if (service.EnableTracing) {
                                console.debug("Resolve Execute_IfElseAction True Branch");
                            }
                            deferred.resolve({Result:true,Action:action});
                        });
                }
                else {
                    if (service.EnableTracing) {
                        console.debug("Start Execute_IfElseAction False Branch");
                    }
                    service.ExecuteActionSet(action.FalseActionSet, executerContext).then(
                        function () {
                            if (service.EnableTracing) {
                                console.debug("Resolve Execute_IfElseAction False Branch");
                            }
                            deferred.resolve({Result:true,Action:action});
                        });
                }

            }
            return deferred.promise;
        };
        //14
        service.Execute_JavaScript = function (action, executerContext) {
            var deferred = $q.defer();
            {
                var rootEntity = executerContext.Entity;
                var entity = executerContext.Entity;
                var entityDef = executerContext.EntityDef;
                var rootScope = executerContext.Scope.rootScope;
                var collectionEntityDef = executerContext.CollectionEntityDef;
                var collectionEntity = executerContext.CollectionEntity;
                var variables = {};
                $.each(executerContext.Variables, function (index, vari) {
                    variables[vari.Name] = vari;
                });
                var res = (function (executerContext) {
                    try{
                        eval(action.Code);
                        deferred.resolve({Result:true,Action:action});
                    }
                    catch(ex)
                    {
                        console.debug(ex);
                        console.debug(action.Code);
                        deferred.resolve({Result:false,Action:action});
                    }
                })(executerContext);
       
                //   executerContext.Scope.$apply();
                  
            }
            return deferred.promise;
        };
        //15
        service.Execute_SaveEntity = function (action, executerContext) {
            var deferred = $q.defer();
            {
/*
                var entityjson = angular.toJson(executerContext.Entity);
              $.post(appPath + "APIS/SaveEntity", { EntityId: executerContext.Entity.Id, 
EntityDefId: executerContext.EntityDef.Id, EntityJson: entityjson }, function (response) {
                    if (response.HasError) {
                        alert(response.ErrorMessage);
                        return;
                    }
                    deferred.resolve({});
                    
                }, "json");
*/

   var entity = angular.toJson(EntityService.FormScope.Entity);
            var defId = EntityService.FormScope.EntityDefinition.Id;
            $("#__EntityJson__").val(entity);
            $("#__EntityDefId__").val(defId);
            $("#__EntityId__").val(EntityService.FormScope.Entity.Id);
            $("#ServerForm").ajaxForm({
                url: appPath + 'APIS/SaveEntity',
                dataType: 'json', success: function (response) {
                        if(response.HasError == true)
                        {
                            alert(response.ErrorMessage);
                             deferred.resolve({Result:false,Action:action});
                            return;
                        }
                       deferred.resolve({Result:true,Action:action});
                }
            });
            $("#ServerForm").submit();

            }
            return deferred.promise;
        };
        //16
        service.Execute_Sequence = function (action, executerContext) {
            var deferred = $q.defer();
            {
                service.ExecuteActionSet(action.ActionSet, executerContext).then(function () {
                    deferred.resolve({Result:true,Action:action});
                });
                
            }
            return deferred.promise;
        };
        //17
        service.Execute_SetVariable = function (action, executerContext) {
            var deferred = $q.defer();
            {

                var val = evaluateValue(action.ValueSource, action.Value, action.VariableProperty, action.UserProperty, executerContext)
                executerContext.setVariableValue(action.VariableName, val.Value);
                deferred.resolve({Result:true,Action:action});
            }
            return deferred.promise;
        };
        //18
        service.Execute_SwitchAction = function (action, executerContext) {
            var deferred = $q.defer();
            {
                var rootEntity = executerContext.Entity;
                var rootEntityDef = executerContext.EntityDef;
                var collectionEntityDef = executerContext.CollectionEntityDef;
                var collectionEntity = executerContext.CollectionEntity;
                var switchValue = "";
                switch (action.ValueSource) {
                    case 1:
                        var f = executerContext.getEntityFieldById(action.Value);
                        switchValue = rootEntity[f.Name];
                        break;
                    case 2:
                        var f = executerContext.getEntityFieldById(action.Value);
                        switchValue = rootEntity[f.Name];
                        break;
                    case 3:
                        var v = executerContext.getVariable(action.VariableName);
                        switchValue = v.Value;
                        break;
                    case 4:
                        var v = executerContext.getVariable(action.VariableName);
                        switchValue = v.Value[action.Value];
                        break;
                    case 5:
                        switchValue = action.Value;
                        break;
                    case 6:
                        break;
                    case 7:

                        {
                            var f = _.find(executerContext.CollectionEntityDef.Fields, function (o) { return o.Id == action.Value; })
                            if (f != undefined) {
                                switchValue = executerContext.CollectionEntity[f.Name];
                            }
                        }
                        break;
                }

                var cases = [];
                $.each(action.Cases, function (index, caseObj) {
                    var caseValue = "";
                    switch (caseObj.ValueSource) {
                        case 1:
                            var f = executerContext.getEntityFieldById(caseObj.Value);
                            caseValue = rootEntity[f.Name];
                            break;
                        case 2:

                            var f = executerContext.getEntityFieldById(caseObj.Value);
                            caseValue = rootEntity[f.Name];
                            break;
                        case 3:
                            var v = executerContext.getVariable(caseObj.VariableName);
                            caseValue = v.Value;
                            break;
                        case 4:
                            var v = executerContext.getVariable(caseObj.VariableName);
                            caseValue = v.Value[caseObj.Value];
                            break;
                        case 5:
                            caseValue = caseObj.Value;
                            break;
                        case 6:
                            break;
                        case 7:
                            break;
                    }
                    cases.push({ CaseValue: caseValue, ActionSet: caseObj.ActionSet });
                });

                var selectedCase = _.find(cases, function (o) { return o.CaseValue == switchValue });

                if (selectedCase != undefined) {
                    service.ExecuteActionSet(selectedCase.ActionSet, executerContext).then(function () {
                        deferred.resolve({Result:true,Action:action});

                    });
                 
                }
                else {
                    deferred.resolve({Result:true,Action:action});
                }

            }
            return deferred.promise;
        };
        //19
        service.Execute_UpdateEntity = function (action, executerContext) {
            var deferred = $q.defer();
            {
                EntityService.GetDefById(action.EntityDefinitionId).then( function (DefObject) {
                    var entityDef = DefObject;
                    var nEntity = {};
                    if (action.EntitySource == 1) {
                        nEntity = executerContext.Entity;
                    }
                    else {
                        nEntity = executerContext.getVariable(action.VariableName);
                    }
                    var rootEntity = executerContext.Entity;
                    var rootEntityDef = executerContext.EntityDef;
                    var collectionEntityDef = executerContext.CollectionEntityDef;
                    var collectionEntity = executerContext.CollectionEntity;
                    $.each(action.EntityValues, function (index, entValue) {
                        var value = "";
                        var presValue = "";
                        switch (entValue.ValueSource) {
                            case 1: // root entity
                                var f = _.find(rootEntityDef.Fields, function (o) { return o.Id == entValue.Value });
                                if (f != undefined) {
                                    value = rootEntity[f.Name];
                                    presValue = rootEntity["__" + f.Name + "_PresenterString"];
                                }
                                break;
                            case 2: // new Entity
                                break;
                            case 3: //Variables
                                var vari = executerContext.getVariable(entValue.VariableName);
                                value = vari == undefined ? "" : vari.Value;
                                break;
                            case 4:  // Variable Property
                                var vari = executerContext.getVariable(entValue.VariableName);
                                if (vari != undefined) {
                                    value = vari.Value[entValue.Value];
                                    presValue = vari.Value["__" + entValue.Value + "_PresenterString"];
                                }

                                break;
                            case 5://text
                                value = entValue.Value;
                                break;
                            case 6: // expression
                                break;
                            case 7: // Collection Entity
                                var f = _.find(collectionEntityDef.Fields, function (o) { return o.Id == entValue.Value });
                                if (f != undefined) {
                                    value = collectionEntity[f.Name];
                                    presValue = collectionEntity["__" + f.Name + "_PresenterString"];
                                }

                                break;
                        }
                        var field = _.find(entityDef.Fields, function (o) { return entValue.FieldId == o.Id });
                        nEntity[field.Name] = value;
                        if (field.Name == "Id") {
                            nEntity["__" + field.Name + "_PresenterString"] = presValue;
                        }
                        else {
                            nEntity["__" + field.Name + "_PresenterString"] = presValue;
                        }

                    });
                    var vari = executerContext.getVariable(action.VariableName);
                    if (vari != undefined) {
                        vari.Value = nEntity;
                    }

                    deferred.resolve({Result:true,Action:action});


                });
              
                    
            }
            return deferred.promise;
        };
        service.Execute_ForeachIterator = function (action, col,iteratorIndex, executerContext,forEachDefeered) {

            var deferred = $q.defer();
            {
                var _iteratorIndex = iteratorIndex;
                if (col.length > _iteratorIndex) {
                    var variable = executerContext.getVariable(action.ItemVariableName);
                    variable.Value = col[_iteratorIndex];
                    service.ExecuteActionSet(action.ActionSet, executerContext).then(
                        function () {

                            service.Execute_ForeachIterator(action, col, _iteratorIndex + 1, executerContext, forEachDefeered).then(function (result) {

                            });
                        }
                        );
                }
                else
                {
                    deferred.resolve({Result:true,Action:action});
                    forEachDefeered.resolve({Result:true,Action:action});
                }

            }
            return deferred.promise;
        };
        service.OnIteraotorComplete = function (action, col, iteratorIndex, executerContext,deferred) {
            var _iteratorIndex = iteratorIndex;
            _iteratorIndex++;
            var Break = executerContext.___collectionForEach_Loopers[executerContext.___collectionForEach_Loopers.length - 1].Break;
            if (col.length > _iteratorIndex && (Break == undefined || Break == false)) {
                service.Execute_ForeachIterator(action, col, _iteratorIndex, executerContext);
               /* iteratorDeferred.then(function () {
                 
                    if (col.length == _iteratorIndex) {
                        deferred.resolve();
                    }
                    else {
                        service.OnIteraotorComplete(action, col, _iteratorIndex, executerContext, deferred);
                    }
                });*/
            }
            else
            {
               deferred.resolve({Result:true,Action:action});
            }
        };
        service.ExecuteAction = function (actionSet, index, executerContext) {
            var action = actionSet.Actions[index];
            var deferred = $q.defer();
            var actionPromise;
            var actionIndex = index;
            switch (action.ActionType) {
                case 1://Get Entity
                    actionPromise = service.Execute_GetEntity(action, executerContext);
                    break;
                case 2://Update Entity
                    actionPromise = service.Execute_UpdateEntity(action, executerContext);
                    break;
                case 3:// Delete Entity
                    break;
                case 4:// Create Entity
                    actionPromise = service.Execute_CreateEntity(action, executerContext);
                    break;
                case 5:// Create Entity Collection
                    break;
                case 6:// Add Collection Item
                    actionPromise = service.Execute_AddColletionItem(action, executerContext);
                    break;
                case 7: // Delete Collection Item
                    actionPromise = service.Execute_DeleteCollectionItem(action, executerContext);
                    break;
                case 8: // If
                    actionPromise = service.Execute_IfElseAction(action, executerContext);
                    break;
                case 9: // Switch
                    actionPromise = service.Execute_SwitchAction(action, executerContext);
                    break;
                case 10: // while
                    break;
                case 11: // Collection Foreach
                    actionPromise = service.Execute_CollectionForEach(action, executerContext);
                    break;
                case 12:
                    actionPromise = service.Execute_JavaScript(action, executerContext);
                    break;
                case 13:
                    actionPromise = service.Execute_CallEntityAction(action, executerContext);
                    break;
                case 14:
                    actionPromise = service.Execute_BreakLoop(action, executerContext);
                    break;
                case 15:
                    // Set Variable
                    actionPromise = service.Execute_SetVariable(action, executerContext);
                    break;
                case 16:
                    actionPromise = service.Execute_ClearCollection(action, executerContext);
                    // Clear Collection
                    break;
                case 17:
                    // Get Entities
                    actionPromise = service.Execute_GetEntities(action, executerContext);
                    break;
                case 18:
                    actionPromise = service.Execute_Sequence(action, executerContext);
                    break;
                case 19:
                    actionPromise = service.Execute_CallDataSource(action, executerContext);
                    break;
                case 20:
                    actionPromise = service.Execute_CallWebService(action, executerContext);
                    break;
                case 21:
                    actionPromise = service.Execute_CallServerFunction(action, executerContext);
                    break;
                case 22:
                    actionPromise = service.Execute_SaveEntity(action, executerContext);
                    break;
            }
            if (actionPromise != undefined) {
                actionPromise.then(function (_Result_) {
                if(_Result_.Result == false)
                        {
                         deferred.resolve({Result:false});
                        return;
                        }        
                
                    actionIndex++;
                    if (actionSet.Actions.length > actionIndex) {
                        service.ExecuteAction(actionSet, actionIndex, executerContext).then(function (_Result2_) {
                            deferred.resolve(_Result2_);
                        });
                    }
                    else {
                        deferred.resolve(_Result_);
                    }

                });
            }
            return deferred.promise;

        };
        service.OnActionExecuteCompleted = function (actionSet, index, executerContext,deffered) {
            var _actionIndex = index;
            _actionIndex++;
            if (actionSet.Actions.length > _actionIndex) {
                var actionDeferred = service.ExecuteAction(actionSet, index, executerContext);
                actionDeferred.then(function (_Result_) {
                    if (!_Result_.Completed) {
                        service.OnActionExecuteCompleted(actionSet, index, executerContext, actionDeferred)
                    }
                    else
                    {
                        deferred.resolve({ Completed: true });
                    }
                });
            }
            else {
                deferred.resolve({Completed:true});
            }
        };
        service.ExecuteActionSet = function (actionSet, executerContext, callback) {
            if (service.EnableTracing) {
                console.debug("Start ExecuteActionSet");
            }

            if (executerContext.Variables == undefined || executerContext.Variables == null) {
                executerContext.Variables = [];
            }
            if (actionSet.Variables != undefined && actionSet.Variables != null) {
                $.each(actionSet.Variables, function (index, obj) {
                    var exist = _.find(executerContext.Variables, function (o) {
                        return o.Name == obj.Name;
                    });
                    if (exist == undefined) {
                        executerContext.Variables.push({ Name: obj.Name, Value: "" });
                    }

                });
            }
            var deferred = $q.defer();
            if(actionSet.Actions.length >0)
            {
                service.ExecuteAction(actionSet, 0, executerContext).then(
                    function (_Result_) {
                        if (service.EnableTracing) {
                            console.debug("Calling ExecuteActionSet Callback");
                        }

                        if (callback)
                    {
                        callback();
                        }
                        if (service.EnableTracing) {
                            console.debug("Resolving ExecuteActionSet");
                        }
                    deferred.resolve(_Result_);
                });

                
            }
            else
            {
                deferred.resolve({Result:true});
            }
            return deferred.promise;


        };
        service.GetJson = function (Url,data) {
            var deferred = $q.defer();
            if(data == undefined)
            {
                data = {};
            }
            
 var loaderId = ZASOUL.AddAjaxLoader(EntityService.FormScope);
 z.Debug("GetJSON ActionSet Service :" + Url);
            $.getJSON(appPath + Url,
              data, function (response) {
                  
 ZASOUL.RemoveAjaxLoader(loaderId,EntityService.FormScope);
                  deferred.resolve(response);

              });


            return deferred.promise;
        };
        service.Post = function (Url, data) {
            var deferred = $q.defer();
            if(data == undefined)
            {
                data  = {};
            }
            $.ajax({
                type: "POST",
                dataType: "JSON",
                url: Url,
                data: data,
                success: function (response) {
                    if (response.HasError) {
                        alert(response.ErrorMessage);
                        return;
                    }
                   
                    deferred.resolve(response);
                }
            });
            return deferred.promise;
        };
        service._buildDataSourceParameters = function (action, executerContext) {

            var parameters = [];
            if (action.Parameters != undefined && action.Parameters != null) {
                $.each(action.Parameters, function (index, prm) {
                    var value = "";
                    var presValue = "";
                    switch (prm.ValueSource) {
                        case 1: // root entity
                        case 2: // new Entity
                            switch (prm.FieldId.toUpperCase()) {
                                case "4798E915-AE24-47CF-92CE-50A53894CC71":
                                    value = executerContext.Entity["Id"];
                                    break;
                                case "F6EF932E-F871-4F58-A9D5-3FD4412F93F4":
                                    value = executerContext.Entity["CreationDate"];
                                    break;
                                case "C0AFBD62-BB72-480B-89D9-AF5E4CB4C6FD":
                                    value = executerContext.Entity["CreatedBy"];
                                    break;
                                case "2FC97B5A-AFAC-4C96-8603-F5D19B8C086A":
                                    value = executerContext.Entity["LastUpdate"];
                                    break;
                                case "3D96EF90-6058-4991-ABAC-207E1C07F54C":
                                    value = executerContext.Entity["UpdatedBy"];
                                    break;
                                case "0EB597FD-4A78-4174-9169-AC910E9BF5E1":
                                    value = executerContext.Entity["Serial"];
                                    break;

                            }
                            if (value == undefined || value == null || value == "") {
                                var f = _.find(executerContext.EntityDef.Fields, function (o) { return o.Id.toUpperCase() == prm.FieldId.toUpperCase() });
                                if (f != undefined) {
                                    value = executerContext.Entity[f.Name];
                                }
                            }

                            break;
                        case 3: //Variables
                            var vari = executerContext.getVariable(prm.VariableName);
                            value = vari == undefined ? "" : vari.Value;
                            break;
                        case 4:  // Variable Property
                            var vari = executerContext.getVariable(prm.VariableName);
                            if (vari != undefined) {
                                value = vari.Value[prm.VariableName];

                            }

                            break;
                        case 5://text
                            value = prm.TextValue;
                            break;
                        case 6: // expression
                            break;
                        case 7: // Collection Entity
                            var f = _.find(executerContext.CollectionEntityDef.Fields, function (o) { return o.Id == prm.FieldId });
                            if (f != undefined) {
                                value = executerContext.CollectionEntity[f.Name];

                            }

                            break;
                    }
                    var _prm = { Key: prm.Name, Value: value };
                    //_prm[prm.Name] = value;
                    parameters.push(_prm);

                });
            }
            return parameters;
        };
        service._buildServerFunctionParameters = function (action,executerContext) {

            var parameters = [];
            if (action.Parameters != undefined && action.Parameters != null) {
                $.each(action.Parameters, function (index, prm) {
                    var value = "";
                    var presValue = "";
                    switch (prm.ValueSource) {
                        case 1: // root entity
                        case 2: // new Entity
                            switch (prm.FieldId.toUpperCase()) {
                                case "4798E915-AE24-47CF-92CE-50A53894CC71":
                                    value = executerContext.Entity["Id"];
                                    break;
                                case "F6EF932E-F871-4F58-A9D5-3FD4412F93F4":
                                    value = executerContext.Entity["CreationDate"];
                                    break;
                                case "C0AFBD62-BB72-480B-89D9-AF5E4CB4C6FD":
                                    value = executerContext.Entity["CreatedBy"];
                                    break;
                                case "2FC97B5A-AFAC-4C96-8603-F5D19B8C086A":
                                    value = executerContext.Entity["LastUpdate"];
                                    break;
                                case "3D96EF90-6058-4991-ABAC-207E1C07F54C":
                                    value = executerContext.Entity["UpdatedBy"];
                                    break;
                                case "0EB597FD-4A78-4174-9169-AC910E9BF5E1":
                                    value = executerContext.Entity["Serial"];
                                    break;

                            }
                            if (value == undefined || value == null || value == "") {
                                var f = _.find(executerContext.EntityDef.Fields, function (o) { return o.Id.toUpperCase() == prm.FieldId.toUpperCase() });
                                if (f != undefined) {
                                    value = executerContext.Entity[f.Name];
                                }
                            }

                            break;
                        case 3: //Variables
                            var vari = executerContext.getVariable(prm.VariableName);
                            value = vari == undefined ? "" : vari.Value;
                            break;
                        case 4:  // Variable Property
                            var vari = executerContext.getVariable(prm.VariableName);
                            if (vari != undefined) {
                                value = vari.Value[prm.VariableProperty];
                            }

                            break;
                        case 5://text
                            value = prm.TextValue;
                            break;
                        case 6: // expression
                            break;
                        case 7: // Collection Entity
                            var f = _.find(executerContext.CollectionEntityDef.Fields, function (o) { return o.Id == prm.FieldId });
                            if (f != undefined) {
                                value = executerContext.CollectionEntity[f.Name];

                            }

                            break;
                    }
                    var _prm = { Key: prm.Name, Value: value };
                    //_prm[prm.Name] = value;
                    parameters.push(_prm);

                });
            }
            return parameters;
        };
      
    };

    return new ActionSetService();
});