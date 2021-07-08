var entityEditor = angular.module('entityEditor', []);

entityEditor.factory('EntityService', function ($q) {

    //  Create a class that represents our name service.
    function EntityService() {

        var self = {};
        self.FormScope = {};
        //  getName returns a promise which when 
        //  fulfilled returns the name.
self.DefinitionCache = [] ;
self.DefinitionLoaders = [] ;
self.LookupChache = [] ;
//////////////////////////////////////////////////////////////

self.GetDefById =  function (Id) {
return $q(function(resolve,reject) {
    var cachedDef = _.find(self.DefinitionCache,function(o){
            return z.toLower(o.Id) == z.toLower(Id);
        });                      
    if(cachedDef != null)
    {
        resolve(cachedDef);
        return;
    }
        var defLoader = _.find(self.DefinitionLoaders,function(o){
            return z.toLower(o.Id) == z.toLower(Id);
        });
        if(defLoader == undefined)
        {
            defLoader = {Id:Id,Defferds:[resolve]};
            self.DefinitionLoaders.push(defLoader);

        var loaderId = ZASOUL.AddAjaxLoader(self.FormScope,"EntityService.GetDefById:" + Id);
            $.ajax(
                {
                    url: appPath + "APIS/GetEntityDefById?Id=" + Id,
                    method:'GET',
                    data: {},
                    cache:true,
                    dataType: 'json',
                    success: function (response) {
                        console.debug("GetDEF: " + Id);
                        ZASOUL.RemoveAjaxLoader(loaderId, self.FormScope);
                        if (response.HasError) {
                            alert(response.ErrorMessage);
                            return;
                        }
                        var def = ZASOUL.Decompress(response.Result, true);
                        self.DefinitionCache.push(def);
                        //deferred.resolve(def);
						/*
						for(var i=0;i<defLoader.Defferds.length;i++)
						{
							defLoader.Defferds[i](def);
						}*/
                        $.each(defLoader.Defferds, function (idx, obj) {
                            obj(def);

                        });
                    }
                      
         });
        }
        else
        {
             defLoader.Defferds.push(resolve);
        }

});
      
};
self.GetEntityWCById = function (Id, DefId) {
return $q(function(resolve,reject) {
if(ZASOUL.isEmpty(Id) || ZASOUL.isEmpty(DefId))
        {
        resolve(null);
        return;
        }
var loaderId = ZASOUL.AddAjaxLoader(self.FormScope);           
 $.ajax(
                           {
                               method: "POST",
                               url: appPath + "APIS/GetEntityWCById",
                               //data: { Id: scope.sectionObject.ReferenceEntityDefId},
                               data: { EntityId: Id, EntityDefId: DefId },
                               cache: false,
                               dataType: "JSON",
                               error: function () { },
                               success: function (response) {
                                   ZASOUL.RemoveAjaxLoader(loaderId,self.FormScope);
                                   if (response.HasError) {
                                       alert(response.ErrorMessage);
                                       reject(response);
                                       return;
                                   }
                                   var mObj = ZASOUL.Decompress(response.Result, true);
                                   if (mObj.Id == undefined) {
                                       resolve(null);
                                   }
                                   else {
                                       resolve(mObj);
                                   
                                   }
                                   
                               } 
                           });



});
        };
self.LoadEntityCollections =  function (Entity,DefinitionId) {
return $q(function(resolve,reject) {
    
        var loaderId = ZASOUL.AddAjaxLoader(self.FormScope,"EntityService.LoadEntityCollections:" + Entity.Id);
              $.getJSON(appPath+ "APIS/GetEntityCollections?EntityDefId=" + DefinitionId + "&EntityId=" + Entity.Id, {}, function (response) {
				ZASOUL.RemoveAjaxLoader(loaderId,self.FormScope);
                    if (response.HasError) {
                        alert(response.ErrorMessage);
                        return;
                    }
                    for(var i=0; i < response.Result.Names.length;i++)
                    {
                        var name = response.Result.Names[i];
                        Entity[name] = response.Result.Collections[name];
                    }
Entity.__ObjectCollectionsInitialized__ = true;
                resolve(Entity);
         });
});
};


        self.ExecuteServerFunction = function (FunctionId, Parameters) {
            var deferred = $q.defer();
            $.ajax({
                type: "POST",
                url: appPath + "APIS/ExecuteServerFunction",
                data: { ServerFunctionId: FunctionId, Parameters: angular.toJson(Parameters) },
                dataType: "json",
               
                success: function (response) {
                    if (response.HasError) {
                        alert(response.ErrorMessage);
                        return;
                    }

                    deferred.resolve(response.Result);
                }

            });
            return deferred.promise;
        };
        self.ExecuteAction = function (Func) {
            var deferred = $q.defer();

            return deferred.promise;
        };
        self.CallActionSet = function (executerContext, action) {
            var deferred = $q.defer();

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
                url: appPath + 'tasks/ExecuteServerAction?SaveForm=true',
                
                dataType: 'json', success: function (response) {
                    if (response.HasError) {
                        alert(response.ErrorMessage);
                        return;
                    }
                    $(".loader-overlay").show();
                    executerContext.Scope.rootScope.formScope.FormLoadCompleted = false;
                    executerContext.Scope.rootScope.formScope.SetEntity(response.Result);
                    executerContext.Scope.rootScope.formScope.FormLoadCompleted = true;
                    if (!executerContext.Scope.rootScope.formScope.$$phase) {
                        executerContext.Scope.rootScope.formScope.$apply();
                    }
                    $(".loader-overlay").hide(response.Result);
                    deferred.resolve();




                }
            });

            $("#ServerForm").submit();
            return deferred.promise;

        };
self.CallDataSource = function (DataSource, action) {
            var deferred = $q.defer();
 var parameters = self.buildParameters(DataSource.Parameters,self.FormScope);
        var result = null;
        $.ajax(
            {
                url: appPath + "APIS/ExecuteDataSource",
                type: "POST",
                dataType: "JSON",
                data: { DataSourceId: DataSource.DataSourceId, Parameters: angular.toJson(parameters) },
                success: function (response) {
                    if (response.HasError) {
                        alert(response.ErrorMessage);
                        deferred.resolve(null);
                    }
                    else
                    {
                             deferred.resolve( response.Result.Result);
                    }
                }
            });
      
            
            return deferred.promise;

        };
        self.SetError = function (_key, Message,Groups, scope) {

            var exist = _.find(scope.rootScope.errors, function (e) {
                return e.key == _key;
            });
            if (exist != undefined)
            {
                var idx = scope.rootScope.errors.indexOf(exist);
                scope.rootScope.errors.splice(idx, 1);
            }
            scope.rootScope.errors.push({key:_key,message:Message,groups:Groups,type:1});
        };
        self.RemoveError = function (_key, scope) {

            var exist = _.find(scope.rootScope.errors, function (e) {
                return e.key == _key;
            });
            if (exist != undefined) {

                var idx = scope.rootScope.errors.indexOf(exist);
                if (idx > -1) {
                    scope.rootScope.errors.splice(idx, 1);
                }
            }
           
        };
        self.GetJson = function (Url,Data) {
            var deferred = $q.defer();
                 var loaderId = ZASOUL.AddAjaxLoader(self.FormScope);
                 var _data = {} ;
                if(Data != undefined)
                {
                    _data = Data;
                }            
                z.Debug("GetJSON :" + Url);
                $.getJSON(appPath + Url,
              _data, function (response) {
              ZASOUL.RemoveAjaxLoader(loaderId,self.FormScope);
                  deferred.resolve(response);
              });
            return deferred.promise;
        };
        self.LoadServerData = function (Url,Data) {
            return $q(function(resolve,reject) {
                        var loaderId = ZASOUL.AddAjaxLoader(self.FormScope);
                         var _data = {} ;
                        if(Data != undefined)
                        {
                            _data = Data;
                        }            
                        z.Debug("GetJSON :" + Url);
                      $.ajax({
                        type:"POST",
                        url: appPath + Url,
                        data:_data,
                        dataType:"json",
                      success: function (response) {
                        ZASOUL.RemoveAjaxLoader(loaderId,self.FormScope);
                            if (response.HasError) {
                                alert(response.ErrorMessage);
                                return;
                            }
                             resolve(response);
                          }
                    });

                    });
            };

      self.LoadLookup = function(DefId,ViewId,Type)
            {
    var deferred = $q.defer();
                    var lookupId = z.GetLookupId(DefId,ViewId);
                    if(self.FormScope[lookupId]==undefined)
                    {
                        self.FormScope[lookupId] = [] ;
                        var cachedLookup = _.find(self.LookupChache,function(o){
                                                           return z.toLower(o.Id) == z.toLower(lookupId); 
                                                    });
                                    if(cachedLookup != undefined)
                                    {
                                     self.FormScope[lookupId] = cachedLookup.Lookup;
                                        deferred.resolve({});
                                    }
                                    else
                                    {
                                                    var reqUrl =  'APIS/GetLookupEntityId?EntityDefId=' + DefId;
                                                    if (z.isNotEmpty(ViewId) && ViewId != '00000000-0000-0000-0000-000000000000') {
                                                    reqUrl = reqUrl + "&ViewId=" +ViewId;
                                                     }
                                                    self.GetJson(reqUrl).then(function (response) {
                                                     for(var i = 0 ; i < response.Result.length;i++)
                                                    {
                                                                      response.Result[i].Id = response.Result[i].Id.toUpperCase();            
                                                    }
                                                    self.FormScope[lookupId] = response.Result;
                                                    var lookupObj = {Id:lookupId,Type:Type,ViewId:ViewId,Lookup:response.Result,DefinitionName:response.ExtraData.DefName,Name:response.ExtraData.DefName};
                                                     self.LookupChache.push(lookupObj);
   self.FormScope.Lookups.push(lookupObj);
                                                     deferred.resolve({});
                                                });
                                             }
                            }
                   else
                        {
                                 deferred.resolve({});   
                        }
                return deferred.promise;
            };
        self.AddLookup = function (id, name, lookupData) {
            var lookup = _.find(self.FormScope.Lookups, function (o) {
                return ZASOUL.toLower(o.Name) == ZASOUL.toLower(name);
            });
            if (lookup == undefined) {
                lookup = { Id: id, Name: name, Lookup: lookupData };
                self.FormScope.Lookups.push(lookup);
            }
        };
        self.GetLookupByName = function (name) {
            var lookup = _.find(self.FormScope.Lookups, function (o) {
                return ZASOUL.toLower(o.Name) == ZASOUL.toLower(name);
            });
            if (lookup != undefined) {
                return lookup.Lookup;
            }
            else {
                return undefined;
            }
        };
        self.GetLookupById = function (id) {
            var lookup = _.find(self.FormScope.Lookups, function (o) {
                return ZASOUL.toLower(o.Id) == ZASOUL.toLower(id);
            });
            if (lookup != undefined) {
                return lookup.Lookup;
            }
            else {
                return undefined;
            }
        };
        self.GetLookupItemByText = function (LookupName, Text) {
            var lookup = _.find(self.FormScope.Lookups, function (o) {
                return ZASOUL.toLower(o.Name) == ZASOUL.toLower(LookupName);
            });
            if (lookup == undefined) {
                return undefined;
            }
            var lookupItem = _.find(lookup.Lookup, function (o) {
                return ZASOUL.toLower(o.Text) == ZASOUL.toLower(Text);
            });
            return lookupItem;
        };
        self.GetLookupItemById = function (LookupName, Id) {
            var lookup = _.find(self.FormScope.Lookups, function (o) {
                return ZASOUL.toLower(o.Name) == ZASOUL.toLower(LookupName);
            });
            if (lookup == undefined) {
                return undefined;
            }
            var lookupItem = _.find(lookup.Lookup, function (o) {
                return ZASOUL.toLower(o.Id) == ZASOUL.toLower(Id);
            });
            return lookupItem;
        };
self.buildParameters = function (Parameters, scope) {
        var parameters = [];
        if (z.isNotEmpty(Parameters)) {
            $.each(Parameters, function (index, prm) {
                var value = "";
                var presValue = "";
                switch (prm.ValueSource) {
                    case 1: // root entity
                    case 2: // new Entity
                        switch (prm.FieldId.toUpperCase()) {
                            case "4798E915-AE24-47CF-92CE-50A53894CC71":
                                value = scope.Entity["Id"];
                                break;
                            case "F6EF932E-F871-4F58-A9D5-3FD4412F93F4":
                                value = scope.Entity["CreationDate"];
                                break;
                            case "C0AFBD62-BB72-480B-89D9-AF5E4CB4C6FD":
                                value = scope.Entity["CreatedBy"];
                                break;
                            case "2FC97B5A-AFAC-4C96-8603-F5D19B8C086A":
                                value = scope.Entity["LastUpdate"];
                                break;
                            case "3D96EF90-6058-4991-ABAC-207E1C07F54C":
                                value = scope.Entity["UpdatedBy"];
                                break;
                            case "0EB597FD-4A78-4174-9169-AC910E9BF5E1":
                                value = scope.Entity["Serial"];
                                break;

                        }
                        if (value == undefined || value == null || value == "") {
                            var f = _.find(scope.EntityDefinition.Fields, function (o) { return o.Id.toUpperCase() == prm.FieldId.toUpperCase() });
                            if (f != undefined) {
                                value = scope.Entity[f.Name];
                            }
                        }

                        break;
                    case 3: //Variables
                        var vari = localStorage.getItem(prm.VariableName);
                        value = vari;
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

                        break;
                    case 8:
                        switch (prm.UserProperty) {
                            case 1:
                                if (scope.CurrentUser.IsOnlineUser)
                                    value = scope.CurrentUser.OnlineUserId;
                                else
                                    value = scope.CurrentUser.Id;
                                break;
                            case 2:
                                value = scope.CurrentUser.Username;
                                break;
                            case 3:
                                value = scope.CurrentUser.Email;
                                break;
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
        return self;
    }

    return new EntityService();
});
entityEditor.directive('caseinsensitiveOptions', function () {
    return {
        restrict: 'A',
        require: ['ngModel', 'select'],
        link: function (scope, el, attrs, ctrls) {
            var ngModel = ctrls[0];

            ngModel.$formatters.push(function (value) {
              /*  var option = [].filter.call(el.children(), function (option) {
                    return z.toUpper( option.value) === z.toUpper(value);
                })[0]; //find option using case insensitive search.
*/
/*
            var option = _.find(el.children(),function(opt){
                return z.toUpper( opt.value) === z.toUpper(value);
                });*/
				 var option = _.find(scope.ChoiceItems(),function(opt){
                return z.toUpper( opt.Id) === z.toUpper(value);
                });
                return option ? z.toUpper(option.Id) : z.toUpper( value);
            });
        }
    }
});
entityEditor.directive('caseinsensitive', function () {
    return {
        restrict: 'A',
        require: ['ngModel'],
        link: function (scope, el, attrs, ctrls) {
            var ngModel = ctrls[0];

            ngModel.$formatters.push(function (value) {
           
                return  z.toUpper( value);
            });
        }
    }
});
entityEditor.directive('formHint', ['$compile', function ($compile) {

    return {
        restrict: 'EA',
        scope: {
            hint: '=',
           rootScope: '=',
           
        },

        link: function (scope, element, attr) {

            var output = $compile(scope.hint)(scope);
            angular.element(element).empty().append(output);
        }
    }
}]);