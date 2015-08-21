/// <reference path="../../../../.tmp/typings/tsd.d.ts" />

module mapSearch {
  'use strict';

  export class ModalFacetCtrl {
    public loaded: boolean = false;
    public facet: string;
    public response: any;
    public buckets: Array<any>;

    private $log: ng.ILogService;
    private $http: ng.IHttpService;
    private $modalInstance: ng.ui.bootstrap.IModalServiceInstance;
    private parent: any;

    /* @ngInject */
    constructor($log: ng.ILogService,
                $http: ng.IHttpService,
                $modalInstance: ng.ui.bootstrap.IModalServiceInstance,
                facet: any,
                parent: any
    ) {
      this.$log = $log;
      this.$http = $http;
      this.$modalInstance = $modalInstance;
      this.parent = parent;

      var smallQuery = jQuery.extend(true, {}, parent.searchConfig);
      smallQuery.req.rows = 0;

      // remove all the facets except one
      var finfo = smallQuery.json.facet[facet];
      finfo.terms.limit = 5000;
      this.facet = finfo.terms.field;
      smallQuery.json.facet = {facet:finfo};

      var queryString = smallQuery.url;
      queryString += '?json=' + JSON.stringify(smallQuery.json);
      queryString += '&' + $.param(smallQuery.req, true); // the user configs
      queryString += parent.getBBoxFQ() + '&wt=json&json.wrf=JSON_CALLBACK';  //jsonp

      this.$http.jsonp(queryString)
        .then((response: any) => {
          this.response = response.data;
          this.buckets = this.response.facets.facet.buckets;
          this.loaded = true;
        })
        .catch((error: any) => {
          alert( status + ' ' + queryString );
          // this.$log.error('XHR To make query.\n', error.data);
          this.loaded = true;
        });
    }

    /* dismiss modal instance */
    select( field: string) {
      this.parent.searchConfig.req.fq.push(this.facet + ':' + field);
      this.parent.doSearch();
      this.$modalInstance.dismiss();
    }

    /* dismiss modal instance */
    ok() {
      this.$log.info('closed facet', this.facet);
      this.$modalInstance.dismiss();
    }
  }
}

