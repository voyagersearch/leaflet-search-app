/// <reference path="../../../../.tmp/typings/angularjs/angular.d.ts" />

module mapSearch {
  'use strict';

  /** @ngInject */
  export function searchArea(): ng.IDirective {

    return {
      restrict: 'E',
      scope: {
        creationDate: '='
      },
      templateUrl: 'app/components/searchArea/searchArea.html',
      controller: SearchAreaController,
      controllerAs: 'vm',
      bindToController: true
    };

  }

  /** @ngInject */
  class SearchAreaController {
    public relativeDate: string;

    constructor(moment: moment.MomentStatic) {
      this.relativeDate = moment(1440016488687).fromNow();
    }
  }
}
