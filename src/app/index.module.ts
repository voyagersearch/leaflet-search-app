/// <reference path="../../.tmp/typings/tsd.d.ts" />


/// <reference path="index.route.ts" />

/// <reference path="index.config.ts" />
/// <reference path="index.run.ts" />
/// <reference path="main/main.controller.ts" />
/// <reference path="../app/components/navbar/navbar.directive.ts" />
/// <reference path="../app/components/malarkey/malarkey.directive.ts" />
/// <reference path="../app/components/webDevTec/webDevTec.service.ts" />
/// <reference path="../app/components/githubContributor/githubContributor.service.ts" />

/// <reference path="../app/components/searchArea/searchArea.directive.ts" />
/// <reference path="../app/components/searchArea/modal-config.ts" />
/// <reference path="../app/components/searchArea/modal-facet.ts" />
/// <reference path="../app/components/searchArea/modal-result.ts" />

declare var malarkey: any;
declare var toastr: Toastr;
declare var moment: moment.MomentStatic;

module mapSearch {
  'use strict';

  angular.module('mapSearch', ['restangular', 'ui.router', 'ui.bootstrap', 'leaflet-directive'])
    .constant('malarkey', malarkey)
    .constant('toastr', toastr)
    .constant('moment', moment)
    .config(Config)

    .config(RouterConfig)

    .run(RunBlock)
    .service('githubContributor', GithubContributor)
    .service('webDevTec', WebDevTecService)
    .controller('MainController', MainController)
    .directive('acmeNavbar', acmeNavbar)
    .directive('searchArea', searchArea)
    .directive('acmeMalarkey', acmeMalarkey)

    .controller('ModalShowConfigCtrl', ModalShowConfigCtrl)
    .controller('ModalFacetCtrl', ModalFacetCtrl)
    .controller('ModalShowDocCtrl', ModalShowDocCtrl)
  ;
}
