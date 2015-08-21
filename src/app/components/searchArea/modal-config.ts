/// <reference path="../../../../.tmp/typings/tsd.d.ts" />

module mapSearch {
  'use strict';

  export class ModalShowConfigCtrl {
    public json : string;
    public configs: Array<any>;

    private $log: ng.ILogService;
    private $http: ng.IHttpService;
    private $modalInstance: ng.ui.bootstrap.IModalServiceInstance;

    /* @ngInject */
    constructor($log: ng.ILogService,
                $http: ng.IHttpService,
                $modalInstance: ng.ui.bootstrap.IModalServiceInstance,
                config: any
    ) {
      this.$log = $log;
      this.$http = $http;
      this.$modalInstance = $modalInstance;

      this.configs = [
        {name: 'USGS', path: 'config-usgs.json' },
        {name: 'Fulcrum', path: 'config-drop3.json' },
      ];

      this.json = JSON.stringify(config, null, 2);

      this.$log.info('CONFIG', this.json);
    }

    load(cfg:any) {
      this.$http.get('app/components/searchArea/'+cfg.path)
        .then((response: any) => {
          this.$log.info( 'GOT', response.data );
          this.json = JSON.stringify(response.data, null, 2);
        })
        .catch((error: any) => {
          alert( status + ' ' + error );
          // this.$log.error('XHR To make query.\n', error.data);
        });

    }

    /* dismiss modal instance */
    ok() {
      try {
        this.$log.info('reading', this.json);
        var config = JSON.parse(this.json);
        this.$modalInstance.close(config);
      }
      catch ( ex )
      {
        alert( 'error reading config: ' + ex );
      }
    }

    /* dismiss modal instance */
    cancel() {
      this.$modalInstance.dismiss('cancel');
    }
  }
}
