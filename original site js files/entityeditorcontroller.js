 entityEditor.controller('entityEditorCtrl', ['$scope','$sce','EntityService','ActionSetService', function ($scope,$sce,EntityService,ActionSetService) {
    $scope.rootScope = $scope;
    EntityService.FormScope = $scope;
    $scope.EntityService = EntityService;
    $scope.EntityDefinition = {};
    $scope.Form = {};
    $scope.Entity = {};
    $scope.FormValidationErrors = [];
    $scope.errors = [];
    $scope.CurrentUser = {};
    $scope.Variables = [];
    $scope.Storage = {};
    $scope.formScope = $scope;
    $scope.Lookups = [];
    $scope.LookupsStatus = [] ;
    $scope.AjaxLoaders = [];
    $scope.FormVariables = {};
  $scope.CurrentTab = null;
 $scope.Lang = "ar";
    $scope.IsEn = function () {
        return $scope.Lang == "en";
    };
    $scope.EntityIsValid =function(validationGroups)
    {
        $scope.FormValidationErrors = [];
        /*
        var validationErrors = $.grep($scope.Entity.__ValidationErrors__, function (o) {
            return o.type == 1;
        });*/
        var validationErrors = $.grep($scope.errors, function (o) {
            return o.type == 1;
        });
        var result = false;
        if (validationErrors == undefined || validationErrors == null)
        {
            result =  true;
        }
        if (validationErrors.length == 0) {
            result =  true;
        }
        if (result == false) {
            if ((validationGroups == undefined || validationGroups == null || validationGroups.trim() == "") && validationErrors.length > 0) {
                $.each(validationErrors, function (erIndex, verror) {
                   
                    $scope.FormValidationErrors.push(verror.message);
                });

                result = false;

            }
            else {
                var varGroups = [];
                validationGroups = validationGroups.trim();
                if (validationGroups.indexOf(',') > 1) {
                    varGroups = validationGroups.split(',');
                }
                else {
                    if (validationGroups != "") {
                        varGroups.push(validationGroups);
                    }
                }
                var errors = 0;
                $.each(varGroups, function (vindex, group) {

                    $.each(validationErrors, function (erIndex, verror) {
                        if (verror.groups != undefined && verror.groups != null && verror.groups != "") {
                            var gr = verror.groups.trim();
                            var grs = [];
                            if (gr.indexOf(',') > -1) {
                                grs = gr.split(',');
                            }
                            else {
                                grs.push(gr);
                            }

                            $.each(grs, function (gidx, gobj) {
                                if (gobj.indexOf(group) > -1) {
                                    errors += 1;
                                    $scope.FormValidationErrors.push(verror.message);
                                }
                                if (errors > 0) {
                                    result = false;
                                }
                            });

                        }
                        if (errors > 0) {
                            result = false;
                        }
                    });


                });
                result = errors == 0;
             
            }
        }
        
        return result;
    }
$scope.AjaxLoaderVisible = function(){
return $scope.AjaxLoaders.length > 0 ;
};
    $scope.FormLoadCompleted = false;
    $scope.FormLoaded = function () {
      if($scope.Form.MultipleTabs)
        {
                    $scope.CurrentTab = $scope.Form.Tabs[0];
        }
        if ($scope.Form.OnFormLoad != undefined && $scope.Form.OnFormLoad != null) 
        {
            if($scope.Form.OnFormLoad.Enabled)
           {
                    var context = new executerContext($scope, $scope.EntityDefinition, $scope.Entity, null, null);
                        ActionSetService.ExecuteActionSet($scope.Form.OnFormLoad, context).then(function(){
                        $scope.FormLoadCompleted = true;
                    });
            }
            else
            {
                $scope.FormLoadCompleted = true;
            }
        }
        else
        {
            $scope.FormLoadCompleted = true;
        }
     };
  
    $scope.SetEntity = function (entity) {
        $scope.Entity = entity;
        if (ZASOUL.isNotEmpty($scope.Entity)) {
            $scope.Entity.__ValidationErrors__ = [];
        }
    };
    //Redirect : 0 Nothing, 1 CloseForm, 2 Create New
    
    $scope.SaveForm = function (redirect) {
        if ($scope.EntityIsValid()) {
            var entity = angular.toJson($scope.Entity);
            var defId = $scope.EntityDefinition.Id;
            $("#__EntityJson__").val(entity);
            $("#__EntityDefId__").val(defId);
            $("#__EntityId__").val($scope.Entity.Id);
            try {
                $("#__RecaptchaResponse__").val(grecaptcha.getResponse());
            }
            catch (ex)
            { }
            $("#ServerForm").ajaxForm({
                url: appPath + 'Entities/CreateEntity',
                dataType: 'json', success: function (response) {
                    if (response.HasError) {
                        alert(response.ErrorMessage);
                        return;
                    }
                    //   alert("لقد تم حفظ النموذج");

                    switch (ZSFormType) {
                        case "Create":
                        case "Edit":
                            switch (redirect) {
                                case 1:
                                    window.location.href = appPath + "entities/edit?EntityId=" + $scope.Entity.Id + "&Defid=" + defId;
                                    break;
                                case 2:
                                    window.location.href = appPath;
                                    break;
                                case 3:
                                    window.location.href = appPath + "entities/create?defid=" + defId;
                                    break;
                            }

                            break;
                        case "TaskForm":
                            window.location.href = appPath + "tasks/opentask?TaskId=" + __TaskId;
                            break;
                    }
                }
            });

            $("#ServerForm").submit();
        }
        else {
            alert(scope.rootScope.Localize("من فضلك قم بتصحيح الأخطاء ثم أعد المحاولة مرة أخرى","Please correct the hoghlighted fields and try again"));
        }
    }
    $scope.ExecuteServerAction = function (actionName, callBack, validateForm) {


        var entity = angular.toJson($scope.Entity);
        var defId = $scope.EntityDefinition.Id;
        $("#__EntityJson__").val(entity);
        $("#__EntityDefId__").val(defId);
        $("#__EntityId__").val($scope.Entity.Id);
        $("#__ActionName__").val(actionName);
        try {
            $("#__RecaptchaResponse__").val(grecaptcha.getResponse());
        }
        catch (ex)
        { }
        $("#ServerForm").ajaxForm({
            url: appPath + 'entities/ExecuteServerAction?SaveForm=true',
            dataType: 'json', success: function (response) {
                if (response.HasError) {
                    alert(response.ErrorMessage);
                    return;
                }
                $(".loader-overlay").show();
                $scope.FormLoadCompleted = false;
                $scope.SetEntity({});
                $scope.$apply();
                $scope.SetEntity(response.Result);
                $scope.$apply();
                $scope.FormLoadCompleted = true;
                if (callBack != undefined && callBack != null) {

                    callBack();
                }
                $(".loader-overlay").hide();
            }
        });

        $("#ServerForm").submit();

    };
    $scope.SaveCloseForm = function () {
        var scope = angular.element($("#entityForm")).scope();

        if (scope.EntityIsValid()) {
            var entity = angular.toJson(scope.Entity);
            var defId = scope.EntityDefinition.Id;
            $("#__EntityJson__").val(entity);
            $("#__EntityDefId__").val(defId);
            $("#__EntityId__").val(scope.Entity.Id);
            try {
                $("#__RecaptchaResponse__").val(grecaptcha.getResponse());
            }
            catch (ex)
            { }
            $("#ServerForm").ajaxForm({
                url: appPath + 'Entities/CreateEntity',
                dataType: 'json', success: function (response) {
                    if (response.HasError) {
                        alert(response.ErrorMessage);
                        return;
                    }

                    alert("Form has been saved");
                    window.location.href = appPath + "entities/list?defid=" + defId;
                }
            });

            $("#ServerForm").submit();
        }
        else {
           alert(scope.rootScope.Localize("من فضلك قم بتصحيح الأخطاء ثم أعد المحاولة مرة أخرى","Please correct the highlighted fields and try again"));
        }
    };
    $scope.SaveNewForm = function () {
        var scope = angular.element($("#entityForm")).scope();

        if (scope.EntityIsValid()) {
            var entity = angular.toJson(scope.Entity);
            var defId = scope.EntityDefinition.Id;
            $("#__EntityJson__").val(entity);
            $("#__EntityDefId__").val(defId);
            $("#__EntityId__").val(scope.Entity.Id);
            try {
                $("#__RecaptchaResponse__").val(grecaptcha.getResponse());
            }
            catch (ex)
            { }
            $("#ServerForm").ajaxForm({
                url: appPath + 'Entities/CreateEntity',
                dataType: 'json', success: function (response) {
                    if (response.HasError) {
                        alert(response.ErrorMessage);
                        return;
                    }

                    alert("Form has been saved");
                    window.location.href = appPath + "entities/create?defid=" + defId;
                }
            });

            $("#ServerForm").submit();
        }
        else {
            alert(scope.rootScope.Localize("من فضلك قم بتصحيح الأخطاء ثم أعد المحاولة مرة أخرى","Please correct the highlighted fields and try again"));
        }
    };
 /////////////////////////////////////////////////////////////////////////
    $scope.Localize = function (ar, en) {
        var result = ar;
        if($scope.IsEn())
        {
            if(ZASOUL.isNotEmpty(en))
            {
                result = en;
            }
        }
        return result;
    };
 $scope.Initialize = function (DefId, DefName, Entity, FormType, FormName, returnUrl,lang) {
        $("#__FormName__").val(FormName);
        var storeName = "DEF_" + DefName;
        if (lang != undefined) {
            $scope.Lang = lang;
        }
        $.ajax({
            url: appPath + "Entities/GetEntityDefById?Id=" + DefId,

            type: "GET",
            dataType: "json",
            async: false,
            success: function (response) {
                if (response.HasError) {
                    alert(response.ErrorMessage);
                    return;
                }
                
                $scope.EntityDefinition = response.Result;
            }
        });
  
        $scope.Entity = Entity;
        $scope.Entity.__ValidationErrors__ = [];

        var form = null;
        switch (FormType) {
            case "Create":
                form = _.find($scope.EntityDefinition.Forms, function (f) {
                    return f.Id.toUpperCase() == $scope.EntityDefinition.CreateItemFormId.toUpperCase();
                });
                break;
            case "Edit":
                form = _.find($scope.EntityDefinition.Forms, function (f) {
                    return f.Id.toUpperCase() == $scope.EntityDefinition.EditItemFormId.toUpperCase();
                });
                break;
            case "View":
                form = _.find($scope.EntityDefinition.Forms, function (f) {
                    return f.Id.toUpperCase() == $scope.EntityDefinition.ViewItemFormId.toUpperCase();
                });
                break;
            case "Custom":
                form = _.find($scope.EntityDefinition.Forms, function (f) {
                    return f.Name.toUpperCase() == FormName.toUpperCase();
                });
                break;
        }
        $scope.Form = form;
        $("#__ShowRecaptcha__").val($scope.Form.ShowRecaptcha);

       $scope.ReturnUrl = returnUrl;
        $scope.$apply();
        $scope.FormLoaded();
        $("#loadingDiv").hide();
        $("#entityForm").show();

    };
    $scope.Initialize2 = function (Def, Entity, FormType, FormName, returnUrl, lang) {
        $("#__FormName__").val(FormName);
       
        if (lang != undefined) {
            $scope.Lang = lang;
        }
        $scope.EntityDefinition = Def;

        $scope.Entity = Entity;
        $scope.Entity.__ValidationErrors__ = [];

        var form = null;
        switch (FormType) {
            case "Create":
                form = _.find($scope.EntityDefinition.Forms, function (f) {
                    return f.Id.toUpperCase() == $scope.EntityDefinition.CreateItemFormId.toUpperCase();
                });
                break;
            case "Edit":
                form = _.find($scope.EntityDefinition.Forms, function (f) {
                    return f.Id.toUpperCase() == $scope.EntityDefinition.EditItemFormId.toUpperCase();
                });
                break;
            case "View":
                form = _.find($scope.EntityDefinition.Forms, function (f) {
                    return f.Id.toUpperCase() == $scope.EntityDefinition.ViewItemFormId.toUpperCase();
                });
                break;
            case "Custom":
                form = _.find($scope.EntityDefinition.Forms, function (f) {
                    return f.Name.toUpperCase() == FormName.toUpperCase();
                });
                break;
        }
        $scope.Form = form;
        $("#__ShowRecaptcha__").val($scope.Form.ShowRecaptcha);
        $scope.CurrentUser = __CurrentUser;
        $scope.ReturnUrl = returnUrl;
        $scope.$apply();
        $scope.FormLoaded();
        $("#loadingDiv").hide();
        $("#entityForm").show();

    };
 
    $scope.NextTab = function () {
        if (ZASOUL.isNotEmpty($scope.CurrentTab)) {
if ($scope.EntityIsValid())
{
            var idx = $scope.Form.Tabs.indexOf($scope.CurrentTab);
            if (idx < $scope.Form.Tabs.length - 1) {
                $scope.CurrentTab = $scope.Form.Tabs[idx + 1];
            }
}
else{
            var msg = $scope.Localize("من فضلك قم بتصحيح الأخطاء ثم أعد المحاولة مرة أخرى","Please correct errors and try again");
            alert(msg);

}
        }

    };
    $scope.PrevTab = function () {
        if (ZASOUL.isNotEmpty($scope.CurrentTab)) {
            var idx = $scope.Form.Tabs.indexOf($scope.CurrentTab);
            if (idx > 0) {
                $scope.CurrentTab = $scope.Form.Tabs[idx - 1];
            }
        }

    };
  $scope.ShowNextTab = function () {
        if (ZASOUL.isNotEmpty($scope.CurrentTab)) {

            var idx = $scope.Form.Tabs.indexOf($scope.CurrentTab);
            if (idx < $scope.Form.Tabs.length - 1) {
                return true;
            }
        }
        return false;
    };
    $scope.ShowPrevTab = function () {
        if (ZASOUL.isNotEmpty($scope.CurrentTab)) {
            var idx = $scope.Form.Tabs.indexOf($scope.CurrentTab);
            if (idx > 0) {
                return true;
            }
        }
        return false;
    };
   $scope.ButtonInCurrentTab = function (Button) {
        var result = true;
        if (!$scope.Form.MultipleTabs) {
            return result;
        }
        if (ZASOUL.isEmpty($scope.CurrentTab)) {
            result = false;
            return result;
        }
        var sec = _.find($scope.CurrentTab.Buttons, function (tabButton) {
            return tabButton.toUpperCase() == Button.Id.toUpperCase();
        });
        result = sec != undefined;
        return result;
    };

    $scope.SectionInCurrentTab = function (Section) {
        var result = true;
        if (!$scope.Form.MultipleTabs)
        {
            return result;
        }
        if (ZASOUL.isEmpty($scope.CurrentTab))
        {
            result = false;
            return result;
        }
        var sec = _.find($scope.CurrentTab.Sections, function (tabSection) {
            return tabSection.toUpperCase() == Section.Id.toUpperCase();
        });
        result = sec != undefined;
        return result;
    };
 $scope.TaskActionInCurrentTab = function (TaskAction) {
        var result = true;
        if (!$scope.Form.MultipleTabs) {
            return result;
        }
        if (ZASOUL.isEmpty($scope.CurrentTab)) {
            result = false;
            return result;
        }
         var tIndex =  $scope.Form.Tabs.indexOf($scope.CurrentTab);
        if(tIndex ==  $scope.Form.Tabs.length -1)
        {
            result = true;
        }
else
{
result = false;
}
        return result;
    };
    $scope.FormUserHintVisible = function()
        {
            return ZASOUL.isNotEmpty($scope.Form) && $scope.Form.ShowUserHint == true;
        };
 $scope.WindowActions = {
        OKCallBack : null,
     OKClick: function () {
         try {
             $(window.parent.document.body).css('overflow', "scroll");
         } catch (ex){ }
            if($scope.EntityIsValid())
            {
                if(this.OKCallBack != null)
                {
                    this.OKCallBack($scope.Entity);
                }
            }
            else
            {
                alert("من فضلك قم بتصحيح الأخطاء ثم أعد المحاولة مرة أخرى");
            }

        },
        CancelCallBack: null,
     CancelClick: function () {
         try {
             $(window.parent.document.body).css('overflow', "scroll");
         } catch (ex){}
            if(this.CancelCallBack != null)
            {
                this.CancelCallBack();
            }
        },
     SetEntity: function (oentity, EditorFormId, ReferencePropery, RefPorpertyValue) {
         try {
             $(window.parent.document.body).css('overflow', "hidden");
         } catch (ex){ }
            var form = null ;
            if(ZASOUL.isNotEmpty(EditorFormId))
            {
                form = _.find($scope.EntityDefinition.Forms,function(f){
                    return f.Id.toUpperCase() == EditorFormId.toUpperCase();
                });
            }
            if (form != undefined) {
                $scope.Form = form;
                $scope.FormName = form.Name;
            }
            if(oentity != null)
            {
                if(z.isEmpty(oentity.__ObjectCollectionsInitialized__) || oentity.__ObjectCollectionsInitialized__)
                    {
                        EntityService.LoadEntityCollections(oentity,$scope.EntityDefinition.Id).then(function(RESULT){
                                        $scope.SetEntity(RESULT);
                        //  $scope.FormLoaded();                       
                         });
                     }
                else
                {
                 $scope.FormLoaded();
                }
            }
            else
            {
			if(ReferencePropery != undefined && ReferencePropery != null)
				{
                    $scope.Entity[ReferencePropery] = RefPorpertyValue;
				}
                  $scope.FormLoaded();
            }
          
            $scope.$apply();
        }
    } ;

}]);


function getControlTemplateName(dataType, mode) {
    var ctrlName = "";
    switch (dataType) {
        case 1:// SingleLine = 1,
            ctrlName = "SingleLine";
            break;
        case 2: //      MultiLine = 2,
            ctrlName = "MultiLine";
            break;

        case 3: //Integer = 3,
            ctrlName = "Integer";

            break;

        case 4: //Decimal = 4,
            ctrlName = "Decimal";

            break;

        case 5: //Date = 5,
            ctrlName = "Date";

            break;

        case 6: //Time = 6,
            ctrlName = "Time";

            break;

        case 7://DateTime = 7,
            ctrlName = "DateTime";

            break;

        case 8: //Boolean = 8,
            ctrlName = "Boolean";
            break
        case 9://   Choice = 9,
            ctrlName = "Choice";

            break;
        case 10://File = 10,
            ctrlName = "File";

            break;

        case 11://Email = 11,
            ctrlName = "Email";

            break;
        case 12: //Phone = 12,
            ctrlName = "Phone";

            break;
        case 13://Mobile = 13,
            ctrlName = "Mobile";

            break;
        case 14://Dynamic = 14,
            ctrlName = "Dynamic";

            break;
        case 15: //Url = 15,
            ctrlName = "Url";

            break;
        case 16://Image = 16,
            ctrlName = "Image";

            break;
        case 19://Password
            ctrlName = "Password";
            break;
    }
    if (mode == 'read') {
        
        ctrlName += "_R_Template";

    }
    if (mode == "edit") {
        ctrlName += "_RW_Template";
    }
    return ctrlName;
}
function getValidationString(element, dataType) {
    var valString = "";
    if (element.Required) {
        valString = 'kiwi-validate=\'[{validator:"required",message:"' + element.RequiredValidationMessage + '"}]\'';
    }
    return valString;
}

