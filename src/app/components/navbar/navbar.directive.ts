/// <reference path="../../../../.tmp/typings/angularjs/angular.d.ts" />
/// <reference path="../../../../.tmp/typings/moment/moment.d.ts" />

module mapSearch {
  'use strict';

  /** @ngInject */
  export function acmeNavbar(): ng.IDirective {

    return {
      restrict: 'E',
      scope: {
        creationDate: '='
      },
      templateUrl: 'app/components/navbar/navbar.html',
      controller: NavbarController,
      controllerAs: 'vm',
      bindToController: true
    };

  }

  /** @ngInject */
  class NavbarController {
    public relativeDate: string;

    constructor(moment: moment.MomentStatic) {
      this.relativeDate = moment(1440016488687).fromNow();
    }
  }
}
