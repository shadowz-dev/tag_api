entityEditor.directive('referenceFormSection', ['$compile', '$sce', 'EntityService', function ($compile, $sce, EntityService) {
    return {
        restrict: 'EA',
        scope: {
            //the def of collection items
            refSectionScope: '=',
                     
        },
        
        link: function (scope, element, attr) {
        
scope.ZASOULID = createGuid();
            scope.rootScope = scope;
            scope.EntityService = EntityService;
            scope.selfScope = scope;
            scope.formScope = scope.refSectionScope.formScope;
            scope.Localize = function (ar, en) {
                return scope.refSectionScope.rootScope.Localize(ar,en); 
            };
            scope.errors = scope.refSectionScope.rootScope.errors;
            scope.sectionScope = scope;
            scope.parentScope = scope.refSectionScope.parentScope;
            scope.parentEntity = scope.refSectionScope.ParentEntity;
            scope.CurrentUser = scope.refSectionScope.rootScope.CurrentUser;
            scope.entity = scope.refSectionScope.Entity;
            scope.entityDef = scope.refSectionScope.EntityDefinition;
            scope.Entity = scope.refSectionScope.Entity;
            scope.EntityDefinition = scope.refSectionScope.EntityDefinition;
            scope.section = scope.refSectionScope.section;
            scope.EntityIsValid = scope.refSectionScope.rootScope.EntityIsValid;
            scope.SetEntity = scope.refSectionScope.rootScope.SetEntity;
            scope.ValidationErrors = scope.refSectionScope.parentSectionScope.ValidationErrors;
            scope.FullId = function () {

                return scope.refSectionScope.parentSectionScope.FullId() + scope.refSectionScope.section.Id;

            }
            scope.Visible = false;
            scope.$watch("refSectionScope.Entity", function () {
                scope.Entity = scope.refSectionScope.Entity;
                scope.entity = scope.refSectionScope.Entity;

            });
            scope.IsVisible = function () {
                scope.Visible = scope.refSectionScope.containerScope.IsVisible();
                return scope.Visible;
            };
            if (ZASOUL.isEmpty(scope.section)) {
                return;
            }
            scope.scopeType = "ReferenceSection";
            var html = $('#formSectionContent').html();
            scope.FormLoadCompleted = true;
            var compiled = $compile(html)(scope);
            angular.element(element).append(compiled);

        },
    };}]);