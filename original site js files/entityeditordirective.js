entityEditor.directive('entityEditor', ['$compile', function ($compile) {
    return {
        restrict: 'EA',
        scope: {
          
            entityDef: '=',
            entityEditorMode: '=',
            onOkClickCallback: '=',
            onLoad: '=',
            formId:'='
        },

        link: function (scope, element, attr) {
            scope.closeClick = function () {
                clearInterval(resizeHeight);
                element.remove();
            };
            if (scope.entity == undefined) {
                scope.entity = {};
            }
            scope.okClick = function (Entity) {
                if (ZASOUL.isNotEmpty(scope.entityDef.PresenterField)) {
                    var presField = _.find(scope.entityDef.Fields, function (o) {
                        return o.Id.toUpperCase() == scope.entityDef.PresenterField.toUpperCase();
                    });
                    if(presField != undefined)
                    {
                        if (presField.IsReference) {
                            Entity._PresenterString_ = Entity[presField.Name + "_PresenterString"];
                        }
                        else {
                            Entity._PresenterString_ = Entity[presField.Name];
                        }
                    }
                }
                scope.onOkClickCallback(Entity);
                clearInterval(resizeHeight);
                element.remove();

            };
            
            var html = $('#EntityEditorTemplate').html();
            
            var compiled = $compile(html)(scope);
           
            angular.element(element).append(compiled);
            var iframe = $('#editorIframe', element);
            var src = appPath + "entities/EntityEditorWindow?DefId=" + scope.entityDef.Id;
            iframe.bind('load',
                function () {
                    this.style.height = this.contentWindow.document.body.scrollHeight + 'px';
                    this.contentWindow.WindowActions.OKCallBack = scope.okClick;
                    this.contentWindow.WindowActions.CancelCallBack = scope.closeClick;
                    if(scope.onLoad != undefined)
                    {
                        scope.onLoad(this.contentWindow.WindowActions,scope.formId);
                    }
                 
                });

            iframe.attr('src', src);
            var xframe = iframe[0],lastheight;
            var resizeHeight = setInterval(function () {
                //  var windowHeight = $(window).height();
                var windowHeight = window.innerHeight;
                var popupContentHeight = windowHeight - 60;
                $(".popup-body", element).css("height", (windowHeight - 4) + "px");

                $(".popup-content", element).css("height", popupContentHeight + "px");
                xframe = iframe[0];
                var body = xframe.contentDocument.getElementsByTagName("body")[0];
                if (body == undefined || body == null)
                    return;

                // iframe.css("height", (body.scrollHeight) + "px");
                if (body.scrollHeight < popupContentHeight) {
                    iframe.css("height", popupContentHeight + "px");
                }
                else {
                    iframe.css("height", body.scrollHeight + "px");
                }

            }, 200);


        },
    };
}]);