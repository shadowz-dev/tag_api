entityEditor.directive('formButton', ['$compile', 'EntityService', 'ActionSetService','$q', function ($compile, EntityService, ActionSetService,$q) {
    return {
        restrict: 'EA',
        scope: {
            //the def of collection items
            rootScope: '=',
            entityDef: '=',
            entity: '=',
            button: '=',
            buttonType:'=',
            taskAction:'='

        },
        link: function (scope, element, attr) {
            scope.Visible = true;
            scope.IsVisible = function () {
                var visiblity = scope.button.Visibility;
                if (visiblity == undefined)
                    visiblity = 1;
             
                switch (visiblity) {
                    case 1:
                        scope.Visible = true;
                        break;
                    case 2:
                        scope.Visible = false;
                        break;

                    case 3:
                         if (scope.button.VisibleCondition != undefined && scope.button.VisibleCondition != null)
                                {
                                    var cp = new conditionJsEvaluator(scope.rootScope,
                                                                        scope.button.VisibleCondition,
                                                                        scope.entityDef,
                                                                        scope.entity,
                                                                         scope.entityDef,
                                                                        scope.entity,
                                                                        null,
                                                                        null,
                                                                        null);
                                    scope.Visible = cp.parse();
                                                                                      
                                }
                        break;
                }
               
                scope.button._Visible = scope.Visible;

               
                return scope.Visible;
            };
            scope.IsEnabled = function () {
                var enabled = scope.button.Enabled;
                if (enabled == undefined)
                    enabled = 1;

                switch (enabled) {
                    case 1:
                        scope.Enabled = true;
                        break;
                    case 2:
                        scope.Enabled = false;
                        break;

                    case 3:
                        if (scope.button.EnableCondition != undefined && scope.button.EnableCondition != null) {
                            var cp = new conditionJsEvaluator(scope.rootScope,
                                                                scope.button.EnableCondition,
                                                                scope.entityDef,
                                                                scope.entity,
                                                                 scope.entityDef,
                                                                scope.entity,
                                                                null,
                                                                null,
                                                                null);
                            scope.Enabled = cp.parse();
                            
                        }
                        break;
                }


               
                return scope.Enabled;
            };
            scope.captchaValidationMessage = scope.rootScope.formScope.Localize("من فضلك اختار أنا لست روبوت", "Please select I'm not robot");
            scope.buttonValidationMessage = scope.rootScope.formScope.Localize("من فضلك قم بتصحيح الأخطاء ثم أعد المحاولة مرة أخرى", "Please correct highlighted fields and try again");

            scope.ExecuteFormButton = function () {

                if (scope.button.ValidateForm) {
                    if (scope.rootScope.EntityIsValid(scope.button.ValidationGroups) == false) {

                        alert(scope.buttonValidationMessage);
                        return;
                    }
                }
                ZASOUL.showLoader();
                window.setTimeout(function () {
                    var showRecaptcha = $("#__ShowRecaptcha__").val();
                    if (showRecaptcha == "true") {
                        var recaptchaRes = "";
                        try {
                            recaptchaRes = grecaptcha.getResponse();
                            $("#__RecaptchaResponse__").val(recaptchaRes);
                        }
                        catch (ex) {

                        };
                        if (ZASOUL.isEmpty(recaptchaRes)) {

                            alert(scope.captchaValidationMessage);
                            ZASOUL.hideLoader();
                            return;
                        }
                    }
                    if (scope.buttonType == "form" || scope.buttonType == "element") {
                        switch (scope.button.ButtonActionType) {
                            case 1:// Call Action Set
                                {
                                    var context = new executerContext(scope, scope.entityDef, scope.entity, null, null);
                                    context.EntityService = EntityService;
                                    var actionset = _.find(scope.entityDef.ActionSets, function (o) {
                                        return o.Name == scope.button.FormAction;
                                    });
                                    if (actionset != undefined) {
                                        ActionSetService.ExecuteActionSet(actionset.ActionSet, context).then(function(_Result_){
                                                if(_Result_.Result == true)
                                                {
                                                scope.PostActionExecute();
                                                }
                                                else
                                                {
                                                  ZASOUL.hideLoader();
                                                }
                                            });
                                    }
                                    else
                                    {
                                        scope.PostActionExecute();
                                    }

                                }
                                break;
                            case 2: // Print Report
                                getButtonReportInfo(scope.button);
                                break;
                            case 3: // JavaScript
                                break;
                            case 4: // Start Workflow
                                scope.StartWorkflow();
                                break;
                            case 5://Execute Server Action
                                scope.ExecuteServerAction();
                                break;
                            case 6: //Execute Server Action and print
                                scope.ExecuteServerAction(function () {
                                    getButtonReportInfo(scope.button);
                                });
                                break;
                            case 7: //Execute Server Action and start Workflow
                                scope.ExecuteServerActionAndStartWorkflow();
                                break;
                            case 8: //Execute Server Action and start Workflow
                                scope.StartWorkflowAndClose();
                                break;
                            case 9: //ButtonActionSet
                                {
                                    if (ZASOUL.isNotEmpty(scope.button.ButtonActionSet)) {
                                        var context = new executerContext(scope, scope.entityDef, scope.entity, null, null);
                                        context.EntityService = EntityService;
                                        ActionSetService.ExecuteActionSet(scope.button.ButtonActionSet, context).then(function (_Result_) {
                                        if(_Result_.Result == true)
                                        {
                                           scope.PostActionExecute();
                                        }
                                            else
                                            {
                                                ZASOUL.hideLoader();
                                            }
                                        });
                                        
                                    }
                                }
                                break;
                        }
                    }
                    if (scope.buttonType == "task") {
                        scope.ExecuteTaskAction();
                    }
                }, 500);
                
            };
            function getButtonReportInfo() {
                var path = scope.button.ReportPath;
                var fname = scope.button.ReportPathFieldName;
                var pathSource = scope.button.ReportPathSource;
                var reportType = scope.button.ReportType;
                var reportPath = "";
                var entity = scope.entity;
                if(z.isEmpty(reportType))
                    {
                        reportType = 0 ;
                    }
                switch (pathSource) {
                    case 0:
                        {
                            if (path == undefined || path == null || path == "") {
                                if (fname != undefined && fname != null && fname != "") {
                                    reportPath = scope.rootScope.Entity[fname];
                                }
                            }
                            else {
                                reportPath = path;
                            }

                        }
                        break;
                    case 1:
                        if (ZASOUL.isNotEmpty(scope.button.ReportPathFieldName)) {
                            reportPath = entity[scope.button.ReportPathFieldName];
                        }
                        break;
                    case 2:
                        var result = "";
                        try {
                            eval(scope.button.ReportPathExpression);
                        }
                        catch (ex) {
                            console.debug(ex);
                        }
                        reportPath = result;
                        break;
                }
                if (reportPath == undefined || reportPath == null || reportPath == "") {
                    alert("لايوجد ملف للطباعة ... من فضلك اتصل بمدير النظام");
                    ZASOUL.hideLoader();
                    return;
                }
                var params = [];
                var hasError = false;
                $.each(scope.button.ReportParameters, function (index, obj) {
                    var prm = {};
                    prm.Key = obj.Name;
                    var fname = "";
                  
                    switch (obj.ValueSource) {
                        case 1:
                            {
                                switch (obj.Value.toUpperCase()) {
                                    case "4798E915-AE24-47CF-92CE-50A53894CC71":
                                        fname = 'Id';
                                        break;
                                    default:
                                        var f = _.find(scope.rootScope.EntityDefinition.Fields, function (o) {
                                            return o.Id == obj.Value;
                                        });

                                        fname = f.Name;
                                        break;
                                }
                                prm.Value = scope.rootScope.Entity[fname];
                            }
                            break;
                        case 5:
                            prm.Value = obj.Value;
                            break;
                        case 8:
                            {
                                var result = "";
                                try {
                                  
                                    eval(obj.JavaScriptCode);
                                }
                                catch (ex) {
                                    console.debug(ex);
                                    hasError = true;
                                }
                                if (ZASOUL.isEmpty(result)) {
                                    hasError = true;
                                }
                                prm.Value = result;
                            }
                            break;
                    }


                    params.push(prm);
                });

                if (hasError) {
                    ZASOUL.hideLoader();
                    return;
                }
                $('#ReportForm input[name="ReportPath"]').val(reportPath);
                $('#ReportForm input[name="ReportType"]').val(reportType);
                $('#ReportParameters').empty();
                $.each(params, function (index, obj) {
                    var input = $('<input type="hidden"/>');
                    input.attr("name", "Parameter_" + obj.Key);
                    input.val(obj.Value);
                    $('#ReportParameters').append(input);
                });

           //     $("#ReportForm").submit();    
// The Hide loader moved to IFrame_ReportForom  load event           
// ZASOUL.hideLoader();

/*
 $("#ReportForm").ajaxForm({
                    url: appPath + 'ReportRender/Render',
                   success: function (response, statusText, xhr, $form) {
                        if (response.HasError) {
                            alert(response.ErrorMessage);
                            ZASOUL.hideLoader();
                            return;
                        }
               
 var blob = new Blob(response, {type: xhr.getResponseHeader('content-type')});
            window.saveAs(blob, "File.pdf");
                    }
                });
$("#ReportForm").submit();    
*/

var oReq = new XMLHttpRequest();
oReq.open("POST", appPath + "ReportRender/Render", true);
oReq.responseType = "arraybuffer";
oReq.setRequestHeader("Content-type","application/x-www-form-urlencoded");
ZASOUL.showLoader();
oReq.onload = function(oEvent) {
  var arrayBuffer = oReq.response;
 var blob = new Blob([arrayBuffer], {type: "application/pdf"});
           window.saveAs(blob, "File.pdf");
ZASOUL.hideLoader();
};
var formData = $('#ReportForm').serialize();
oReq.send(formData);

            };

            scope.submitForm = function (formAction, callBack) {
                return $q(function(resolve,reject) {
               if (scope.button.ValidateForm) {
                    if (scope.rootScope.EntityIsValid(scope.button.ValidationGroups) == false) {
                        alert(scope.buttonValidationMessage);
                         ZASOUL.hideLoader();
                        return;
                    }
                }
                var entity = angular.toJson(scope.rootScope.Entity);
                var defId = scope.rootScope.EntityDefinition.Id;
                $("#__EntityJson__").val(entity);
                $("#__EntityDefId__").val(defId);
                $("#__EntityId__").val(scope.entity.Id);
                $("#__ActionName__").val(scope.button.FormAction);
                $("#__FormName__").val(scope.rootScope.Form.Name);
                if (ZASOUL.toUpper(scope.entity.Id) != ZASOUL.toUpper(scope.rootScope.formScope.Entity.Id)) {
                    $("#__FormEntityJson__").val(angular.toJson(scope.rootScope.formScope.Entity));
                    $("#__FormEntityDefId__").val(scope.rootScope.formScope.EntityDefinition.Id);
                    $("#__FormEntityId__").val(scope.rootScope.formScope.Entity.Id);
                }
                var showRecaptcha = $("#__ShowRecaptcha__").val();
                if (showRecaptcha == "true") {
                    var recaptchaRes = "";
                    try {
                        recaptchaRes = grecaptcha.getResponse();
                        $("#__RecaptchaResponse__").val(recaptchaRes);
                    }
                    catch (ex) {
                    };
                    if (ZASOUL.isEmpty(recaptchaRes)) {
                        alert(scope.captchaValidationMessage);
                        ZASOUL.hideLoader();
                        return;
                    }
                }
                $("#ServerForm").ajaxForm({
                    url: formAction,
                    dataType: 'json', success: function (response) {
                        if (response.HasError) {
                            alert(response.ErrorMessage);
                            ZASOUL.hideLoader();
                            return;
                        }
                        resolve(response.Result);
                    }
                });
                $("#ServerForm").submit();
                    });
                
            };
            scope.ExecuteServerAction = function (callBack) {
                scope.submitForm(appPath + 'APIS/ExecuteServerAction?SaveForm=' + scope.button.SaveForm).then(function(Result){
                        if( scope.button.SaveForm &&  ZASOUL.isNotEmpty(Result))
                        {
                            scope.rootScope.SetEntity(Result);
                            if(callBack != undefined)
                                {
                                    callBack();
 
                                }
                        }
if (callBack == undefined)
{
                        scope.PostActionExecute();
}
                    });

            }
            scope.ExecuteServerActionAndStartWorkflow = function () {
                scope.submitForm(appPath + 'APIS/StartWorkflow').then(function (Result){
                    if( scope.button.SaveForm &&  ZASOUL.isNotEmpty(Result))
                        {
                            scope.rootScope.SetEntity(Result);
                        }
                        scope.PostActionExecute();
                    });

            }
            scope.StartWorkflowAndClose = function (callBack) {
                scope.submitForm(appPath + 'APIS/StartWorkflow').then(function (Result) {
                    if( scope.button.SaveForm &&  ZASOUL.isNotEmpty(Result))
                        {
                            scope.rootScope.SetEntity(Result);
                        }
                    window.location.href = appPath + "resultpages/success?EntityId=" + scope.entity.Id + "&DefId=" + scope.rootScope.EntityDefinition.Id + "&serial=" + scope.rootScope.Entity.RequestSerial;
                });


            }
            scope.ExecuteTaskAction = function () {

                switch (scope.taskAction.ActionType) {
                    case 1:
                        //     scope.executeCommand(scope.button.Id);

                        scope.executeCommand(scope.taskAction.Id);
                        break;
                    case 2:

                        window.location.href = appPath + "Tasks/PrintHtmlTemplate?InstanceId=" + sscope.WorkflowInstanceId + "&TemplateId=" + scope.button.HtmlTemplateId;
                        break;
                }

            };
            scope.executeCommand = function (ActionId) {
                $("#__ActionId__").val(ActionId);
                scope.submitForm(appPath + 'Tasks/ExecuteTask').then(function (Result) {
                    $(".ZS-Toolbar-Button").hide();
                    window.location.href = appPath + "resultpages/success?EntityId=" + scope.entity.Id + "&DefId=" + scope.rootScope.EntityDefinition.Id + "&serial=" + scope.rootScope.Entity.RequestSerial;
                });

               
            };
            scope.StartWorkflow = function () {

                scope.submitForm(appPath + 'Tasks/ExecuteTask').then(function (Result) {
                    $(".ZS-Toolbar-Button").hide();
                    window.location.href = appPath + "resultpages/success?EntityId=" + scope.entity.Id + "&DefId=" + scope.rootScope.EntityDefinition.Id + "&serial=" + scope.rootScope.Entity.RequestSerial;
                });
                
            };
            scope.PostActionExecute = function (HideLoader) {

if(HideLoader == undefined || HideLoader == true)
{	
ZASOUL.hideLoader();
 }              
 if (ZASOUL.isNotEmpty( scope.button.NotificationMessage)) {
		                alert(scope.button.NotificationMessage);
	                }

                switch (scope.button.PostActionExecute) {
                    case 0:
                        {
                            if (scope.button.RefreshForm) {
                                $(".lbtn").hide();
                                ZASOUL.showLoader();
                                window.location.reload(true);
                            }
                            else {
                                ZASOUL.hideLoader();
                            }
                        }
                        break;
                    case 1:
                        {
                            $(".lbtn").hide();
                            ZASOUL.showLoader();
                            window.location.reload(true);
                        }

                        break;
                    case 2:
                        {
                            $(".lbtn").hide();
                            ZASOUL.showLoader();
                            window.location.href = scope.rootScope.ReturnUrl;
                        }
                        break;
                    case 3:
                        {
                            ZASOUL.hideLoader();
                            var context = new executerContext(scope, scope.entityDef, scope.entity, null, null);
                            var actionset = _.find(scope.entityDef.ActionSets, function (o) {
                                return o.Name == scope.button.PostExecuteActionSet;
                            });
                            if (actionset != undefined) {
                                ActionSetService.ExecuteActionSet(actionset.ActionSet, context);
                            }
                        }
                    case 4:
                        {
                            if (ZASOUL.isNotEmpty(scope.button.ButtonPostActionSet)) {
                                var context = new executerContext(scope, scope.entityDef, scope.entity, null, null);
                                context.EntityService = EntityService;
                                ActionSetService.ExecuteActionSet(scope.button.ButtonPostActionSet, context);
                               
                            }
                        }
                        break;
                    default:
                        {
                            ZASOUL.hideLoader();
                            break;
                        }
                }
            };
            var html = "";
            if (scope.buttonType == "form" || scope.buttonType == "task") {
                //element.off("click");
                //  element.children('span').text(scope.button.Title);
                html = $('#FormButtonTemplate').html();
                element.click(function () { scope.ExecuteFormButton(scope.button) });
                //html = $('#FormButtonTemplate').html();

                var compiled = $compile(html)(scope);
                angular.element(element).append(compiled);


            }
            else {
                html = $('#ElementButtonTemplate').html();
                var compiled = $compile(html)(scope);
                angular.element(element).append(compiled);


            }
            if (scope.IsEnabled() == false) {
                element.prop("disabled", true);
                $('input[type="button"]', element).addClass("disabled");
            }
            else {
                element.prop("disabled", false);
                $('input[type="button"]', element).removeClass("disabled");
            }
            scope.$watch("Enabled", function () {
                if (scope.Enabled) {
                    element.prop("disabled", false);
                    element.removeClass("disabled");
                }
                else {
                    element.prop("disabled", true);
                    element.addClass("disabled");
                }
            });
            scope.$watch("Visible", function () {
                if (scope.Visible) {
                    element.show();
                }
                else {
                    element.hide();
                }
            });

        },
    };
}]);