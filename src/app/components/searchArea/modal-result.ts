/// <reference path="../../../../.tmp/typings/tsd.d.ts" />

module mapSearch {
  'use strict';

  export class ModalShowDocCtrl {
    public doc : any;

    private $log: ng.ILogService;
    private $http: ng.IHttpService;
    private $modalInstance: ng.ui.bootstrap.IModalServiceInstance;

    /* @ngInject */
    constructor($log: ng.ILogService,
                $http: ng.IHttpService,
                $modalInstance: ng.ui.bootstrap.IModalServiceInstance,
                doc: any
    ) {
      this.$log = $log;
      this.$http = $http;
      this.$modalInstance = $modalInstance;

      this.doc = doc;
    }

    /* dismiss modal instance */
    ok() {
      this.$log.info('closed document', this.doc);
      this.$modalInstance.dismiss();
    }
  }
}
