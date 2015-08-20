/// <reference path="../../../../.tmp/typings/tsd.d.ts" />

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
    public searchConfig: any;
    public searchRsp: any;
    public facets: Array<any>;

    private animationsEnabled: boolean;

    private $log: ng.ILogService;
    private $http: ng.IHttpService;
    private $filter: ng.IFilterService;
    private $modal: ng.ui.bootstrap.IModalService;


    /** @ngInject */
    constructor($log: ng.ILogService, $http: ng.IHttpService, $filter: ng.IFilterService, $modal: ng.ui.bootstrap.IModalService) {
      this.$log = $log;
      this.$http = $http;
      this.$filter = $filter;
      this.$modal = $modal;

      this.animationsEnabled = true; // for the popup
      this.searchConfig = {
        'url': 'http://voyagerdemo.com/daily/solr/v0/select',
        'json': {   // end user can *not* change this
          'params': {
            'fl': 'name:[name],path:[absolute],format,properties,keywords'
          },
          'facet': {
            'Open In Application': {
              'terms': {
                'field': 'format_app',
                'limit': 5
              }
            },
            'Properties': {
              'terms': {
                'field': 'properties',
                'limit': 5
              }
            },
            'Keywords': {
              'terms': {
                'field': 'keywords',
                'limit': 5
              }
            }
          }
        },
        'req': {  // end user can change this
          start: 0,
          rows: 50,
          q: '*:*',
          fq: []
        },
        'view': [
          {'field': 'name', 'display': 'Name'},
          {'field': 'path', 'display': 'Path'}
        ]
      };

      this.doSearch(); // initalize the response
    }

    doSearch() {

      var queryString = this.searchConfig.url;
      queryString += '?json=' + JSON.stringify(this.searchConfig.json);
      queryString += '&' + jQuery.param(this.searchConfig.req, true); // the user configs
      queryString += '&wt=json&json.wrf=JSON_CALLBACK';  // jsonp

      // this.$log.info('QUERY', queryString);

      this.$http.jsonp(queryString)
        .then((response: any) => {
          this.searchRsp = response.data;

          var theLog = this.$log;
          var facets = [];
          angular.forEach(this.searchRsp.facets, function(value, key) {
            //theLog.info('check', key, value);
            if (key !== 'count' && key.length > 0) {
              facets.push( { name: key, value: value} );
            }
          });
          this.facets = facets;
        })
        .catch((error: any) => {
          alert( status + ' ' + queryString );
         // this.$log.error('XHR To make query.\n', error.data);
        });
    }
  }
}
