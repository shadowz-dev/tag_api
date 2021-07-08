entityEditor.directive('entitySelector', ['$compile', 'EntityService',  'ActionSetService', function ($compile, EntityService, ActionSetService) {
return {
    restrict: 'EA',
    scope: {
        selectorEntityDefId: '=',
        referenceEntityViewId: '=',
        multiSelect:'=',
        onOkCallback: '=',
        caller:'=',
        referenceEntityViewIsName: '=',
        conditionStr: '=',
        entitySelectorObjectInfo:'='

    },
        link: function (scope, element, attr) {
         
            var defPromise = EntityService.GetDefById(scope.selectorEntityDefId).then
                     (function (_DEF) {

                         scope.ViewId = "";
                         scope.entityDef = _DEF;
                         scope.searchFields = [];
                         scope.resultFields = [];
                         $.each(scope.entityDef.SelectorFields, function (index, field) {
                             var _field = _.find(scope.entityDef.Fields, function (o) {
                                 return o.Id == field;
                             });
                             if (_field != null) {
                                 scope.searchFields.push(_field);
                             }
                         });
                         scope.selectedSearchField = scope.entityDef.DefualtSelectorSearchField;
                         var fieldsInit = false;
                         if (scope.referenceEntityViewId != undefined && scope.referenceEntityViewId != null) {
                             var view;
                             if (ZASOUL.isEmpty(scope.referenceEntityViewIsName) || scope.referenceEntityViewIsName == false) {
                                 view = _.find(scope.entityDef.Views, function (v) {
                                     return v.Id.toUpperCase() == scope.referenceEntityViewId.toUpperCase();
                                 });
                             }
                             else {
                                 view = _.find(scope.entityDef.Views, function (v) {
                                     return v.Name.toUpperCase() == scope.referenceEntityViewId.toUpperCase();
                                 });
                             }
                             if (view != undefined && view != null) {
                                 scope.ViewId = view.Id;
                                 $.each(view.Fields, function (index, field) {
                                     var _field = _.find(scope.entityDef.Fields, function (o) {
                                         return o.Id.toUpperCase() == field.Field.toUpperCase() && field.Selected == true;
                                     });
                                     if (_field != null) {
                                         scope.resultFields.push(_field);
                                     }
                                 });
                                 fieldsInit = true;
                             }
                         }

                         if (fieldsInit == false) {
                             if (scope.entityDef.SelectorUseView == false) {
                                 $.each(scope.entityDef.SelectorResultFields, function (index, field) {
                                     var _field = _.find(scope.entityDef.Fields, function (o) {
                                         return o.Id == field;
                                     });
                                     if (_field != null) {
                                         scope.resultFields.push(_field);
                                     }
                                 });
                             }
                             else {
                                 if (scope.entityDef.SelectorViewId == undefined || scope.entityDef.SelectorViewId == null) {
                                     alert("There is no View defined for Selector in Entity Definition, Please contact System Administrator");
                                     return;
                                 }
                                 var view = _.find(scope.entityDef.Views, function (v) {
                                     return v.Id.toUpperCase() == scope.entityDef.SelectorViewId.toUpperCase();
                                 });
                                 if (view == undefined) {
                                     alert("View Not found, please contact System Administrator");
                                     return;
                                 }
                                 $.each(view.Fields, function (index, field) {
                                     var _field = _.find(scope.entityDef.Fields, function (o) {
                                         return o.Id.toUpperCase() == field.Field.toUpperCase() && field.Selected == true;
                                     });
                                     if (_field != null) {
                                         scope.resultFields.push(_field);
                                     }
                                 });
                             }
                             scope.search();
                         }
                         else
                         {
                             scope.search();
                         }

                     });
            
            scope.searchText = "";
            scope.allItemsCheck = {};
            scope.allItemsCheck.checked = false;

            
            scope.allItemsChecked_Change = function (mm) {
                if (mm == true) {
                    $.each(scope.searchResult.Entities, function (index, obj) {
                        obj.__selected = true;
                    });
                }
                else
                {
                    $.each(scope.searchResult.Entities, function (index, obj) {
                        obj.__selected = false;
                    });
                }
                scope.addRemoveCheckedItems();
            };

            scope.selectedItems = [];
            scope.addCheckedItems = function () {
                var items = $linq(scope.searchResult.Entities).where("x=> x.__selected == true").toArray();
                if(items != undefined && items != null)
                {
                    $.each(items, function (index, obj) {

                        var exists =_.find(scope.selectedItems,function(o){ 
                            return o.Id.toUpperCase() == obj.Id.toUpperCase();
                        });
                        if(exists == undefined)
                        {
                            scope.selectedItems.push(obj);
                        }

                    })
                }
            };

            scope.addRemoveCheckedItems = function () {
                $.each(scope.searchResult.Entities, function (index, obj) {

                    var exists = _.find(scope.selectedItems, function (o) {
                        return o.Id.toUpperCase() == obj.Id.toUpperCase();
                    });

                    if (obj.__selected == false) {
                        if (exists != undefined) {
                            var idx = scope.selectedItems.indexOf(exists);
                            scope.selectedItems.splice(idx);
                        }
                    }
                    else if (obj.__selected && exists == undefined) {
                        scope.selectedItems.push(obj);
                    }

                });

            };
            scope.addRemoveCheckedItem = function (item) {
                if (item.__selected) {
                    var exists = _.find(scope.selectedItems, function (o) {
                        return o.Id.toUpperCase() == item.Id.toUpperCase();
                    });
                    if (exists == undefined) {
                        scope.selectedItems.push(item);
                    }
                }
                else {
                    var exists = _.find(scope.selectedItems, function (o) {
                        return o.Id.toUpperCase() == item.Id.toUpperCase();
                    });
                    if (exists != undefined) {
                        var idx = scope.selectedItems.indexOf(exists);
                        scope.selectedItems.splice(idx, 1);
                    }
                }

            };



                                 scope.search = function (page) {
                                 var _page = 1 ;
                                 if(page !=undefined)
                                 {
                                        _page = page;
                                 }
                                 var parsedQuery = "";
                                 if (ZASOUL.isNotEmpty(scope.caller)) {
                                     if (ZASOUL.isNotEmpty(scope.caller.query)) {
                                         var css = new conditionCSParser2(scope.caller.query,
                                                scope.entityDef,
                                             scope.caller.entityDef,
                                             scope.caller.entity);
                                         parsedQuery = angular.toJson(css.parse());
                                     }
                                 }
                                     if (scope.entitySelectorObjectInfo.conditionStr != undefined && scope.entitySelectorObjectInfo.conditionStr != null) {
                                         parsedQuery = scope.entitySelectorObjectInfo.conditionStr;
                                     }
                                     $.getJSON(appPath + "APIS/EntitySelectorSearch", {
                                         DefId: scope.selectorEntityDefId,Page :_page,
                                         FieldId: scope.selectedSearchField, SearchText: scope.searchText,
                                         ViewId: scope.ViewId,
                                         Query: parsedQuery
                                     }, function (response) {
                                         if(response.HasError)
                                         {
                                             alert(response.ErrorMessage);
                                             return;
                                         }
                                         scope.searchResult = response.Result;
                                         if(!scope.$$phase)
                                         {
                                             scope.$apply();
                                         }
                                     });
                                 };
                                 scope.searchResult = {};
                                 scope.okClick = function () {
                                     
                                     if (scope.multiSelect == true) {
                                         scope.onOkCallback(scope.selectedItems);
                                     }
                                     else {
                                         var presenter = scope.selectedResultItem._PresenterString_;
                                         scope.onOkCallback(scope.selectedResultItem, scope.entityDef, presenter);
                                     }
                                     element.remove();
                                 };
                                 scope.cancelClick = function () {
                                     element.remove();
                                 };
                                 scope.selectResultItem = function (item) {
                                     scope.selectedResultItem = item;
                                     
                                 };
                                 scope.selectedResultItem = null;
                                 scope.GoToNextPage = function () {
                                     if (scope.searchResult.CurrentPage == undefined)
                                         return;
                                     if (scope.searchResult.CurrentPage < scope.searchResult.TotalPages) {
                                         var page = scope.searchResult.CurrentPage + 1;
                                         scope.search(page);
                                     }
                                     else {
                                         alert("لا يوجد صفحات أخرى . هذه هى الصفحة الأخيرة");
                                     }

                                 };
                                 scope.GoToPrevPage = function () {
                                     if (scope.searchResult.CurrentPage == undefined)
                                         return;
                                     if (scope.searchResult.CurrentPage > 1) {
                                         var page = scope.searchResult.CurrentPage - 1;
                                         scope.search(page);
                                     }
                                     else {
                                         alert("لا يوجد صفحات أخرى . هذه هى الصفحة الأولى");
                                     }
                                 };
                                 scope.GoToFirstPage = function () {
                                     if (scope.searchResult.CurrentPage == undefined)
                                         return;
                                     scope.search(1);
                                 };
                                 scope.GoToLastPage = function () {
                                     if (scope.searchResult.CurrentPage == undefined)
                                         return;
                                     var page = scope.searchResult.TotalPages;
                                     scope.search(page);
                                 };
                                 scope.GoToPage = function (page) {
                                     if (scope.searchResult.CurrentPage == undefined)
                                         return;
                                     scope.Search(page);
                                 };

                                 var html = $("#EntitySelectorContentTemplate").html();
                                 var compiled = $compile(html)(scope);
            angular.element(element).append(compiled);
            $(window).css("overflow", "hidden");
            var resizeHeight = setInterval(function () {
                //  var windowHeight = $(window).height();
                var windowHeight = window.innerHeight;
                var popupContentHeight = windowHeight - 260;
                $(".popup-content", element).css("height", popupContentHeight + "px");
                var selectorH = $(".zs-selector-searchresult").height();
                var selectorNH = popupContentHeight - 40;
                if (selectorH > selectorNH) {
                    $(".zs-selector-searchresult", element).css("height", (selectorNH) + "px");
                }
                $(".popup-body", element).css("height", (windowHeight) + "px");
            }, 200);
        }
    }
}]);