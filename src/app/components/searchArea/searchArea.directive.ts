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

    // for leaflet
    public center: any;
    public layers: any;
    public markers: any;
    public events: any;
    public eventDetected: any;

    private animationsEnabled: boolean;

    private $log: ng.ILogService;
    private $http: ng.IHttpService;
    private $filter: ng.IFilterService;
    private $modal: ng.ui.bootstrap.IModalService;
    private $scope: ng.IScope;
    private $compile: ng.ICompileService;
    private $leafletEvents: any;


    /** @ngInject */
    constructor($log: ng.ILogService,
                $http: ng.IHttpService,
                $filter: ng.IFilterService,
                $modal: ng.ui.bootstrap.IModalService,
                $scope: ng.IScope,
                $compile: ng.ICompileService,
                leafletEvents: any) {
      this.$log = $log;
      this.$http = $http;
      this.$filter = $filter;
      this.$modal = $modal;
      this.$scope = $scope;
      this.$compile = $compile;
      this.$leafletEvents = leafletEvents;

      console.log( '>>> ', leafletEvents );

      this.layers = {
        baselayers: {
          //xyz: {
          //  name: 'OpenStreetMap (XYZ)',
          //  url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          //  type: 'xyz'
          //},
          //streets: {
          //  name: "Streets",
          //  type: "agsBase",
          //  layer: "Streets",
          //  visible: false
          //},
          topo: {
            name: "World Topographic",
            type: "agsBase",
            layer: "Topographic",
            visible: false
          },
          national: {
            name: "National Geographic",
            type: "agsBase",
            layer: "NationalGeographic",
            visible: false
          },
          oceans: {
            name: "Oceans",
            type: "agsBase",
            layer: "Oceans",
            visible: false
          },
          gray: {
            name: "Gray",
            type: "agsBase",
            layer: "Gray",
            visible: false
          }
          //  darkgray: {
          //    name: "DarkGray",
          //    type: "agsBase",
          //    layer: "DarkGray",
          //    visible: false
          //  },
          //  imagery: {
          //    name: "Imagery",
          //    type: "agsBase",
          //    layer: "Imagery",
          //    visible: false
          //  },
          //  shadedrelief: {
          //    name: "ShadedRelief",
          //    type: "agsBase",
          //    layer: "ShadedRelief",
          //    visible: false
          //  },
          //  terrain: {
          //    name: "Terrain",
          //    type: "agsBase",
          //    layer: "Terrain",
          //    visible: false
          //  },
          //  worlddny: {
          //    name: "Imagery (dynamic)",
          //    type: "agsDynamic",
          //    url: "http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer",
          //    visible: false,
          //    layerOptions: {
          //      layers: [0, 1, 2, 3],
          //      opacity: 1,
          //      attribution: "Copyright:© 2014 Esri, DeLorme, HERE, TomTom"
          //    }
          //  },
          //  topodny: {
          //    name: "World Topographic (dynamic)",
          //    type: "agsDynamic",
          //    url: "http://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer",
          //    visible: false,
          //    layerOptions: {
          //      layers: [0],
          //      opacity: 0.9,
          //      attribution: "Copyright:© 2014 Esri, FAO, NOAA"
          //    }
          //  }
          //},
        },
        overlays: {
          searchlayer: {
            name: 'Search Results',
            type: 'markercluster',
            visible: true
          },
          wms: {
            name: 'EEUU States (WMS)',
            type: 'wms',
            visible: false,
            url: 'http://suite.opengeo.org/geoserver/usa/wms',
            layerParams: {
              layers: 'usa:states',
              format: 'image/png',
              transparent: true
            }
          }
        }
      };



      this.markers = {
        london: {
          layer: 'searchlayer',
          lat: 51.505,
          lng: -0.09
        }
      };

      this.markers = [
        {
          "name": "point",
          "lat": -36.8660352,
          "lng": -72.3820874,
          "layer": "searchlayer"
        }
      ];

      this.center = {
        lat: this.markers[0].lat,
        lng: this.markers[0].lng,
        zoom: 6
      };


      $scope.$on('leafletDirectiveMarker.mouseover', (e, args) => {
        var markerName = args.modelName;
        console.log('OVER', markerName);//, e, args);
      });

      $scope.$on('leafletDirectiveMarker.mouseout', (e, args) => {
        var markerName = args.modelName;
        console.log('OUT', markerName);//, e, args);
      });

      $scope.$on('leafletDirectiveMarker.click', (e, args) => {
        if(args.model.doc) {
          this.showResult(args.model.doc);
        }
      });


      this.events = {
        markers: {
          enable: this.$leafletEvents.getAvailableMarkerEvents(),
        }
      };

      this.eventDetected = "No events yet...";
      var markerEvents = this.$leafletEvents.getAvailableMarkerEvents();
      for (var k in markerEvents){
        var eventName = 'leafletDirectiveMarker.' + markerEvents[k];
        this.$scope.$on(eventName, (event, args) => {
          this.eventDetected = event.name;
          console.log( "EVENT", event.name, event, args);
        });
      }



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
          fq: []
        },
        'view': [
          {'field': 'name', 'display': 'Name'},
          {'field': 'path', 'display': 'Path'}
        ]
      };



      if(true) {
        this.searchConfig = {
          'url': 'http://localhost:8080/solr/drop3/select',
          'json': {   // end user can *not* change this
            'params': {
              'fl': '*',
              'sort': 'fu_head_measurement_m_from_water_surface_to_water_surface desc'
            },
            'facet': {
              'Site Type': {
                'terms': {
                  'field': 'type',
                  'limit': 5
                }
              },
              'Project': {
                'terms': {
                  'field': 'fs_project',
                  'limit': 5
                }
              },
              'Head Type': {
                'terms': {
                  'field': 'fss_head_type',
                  'limit': 5
                }
              },
              'Terrain Type': {
                'terms': {
                  'field': 'fss_terrain',
                  'limit': 5
                }
              },
              'Road Access': {
                'terms': {
                  'field': 'fs_road_access',
                  'limit': 5
                }
              }
            }
          },
          'req': {  // end user can change this
            start: 0,
            rows: 50,
            fq: []
          },
          'view': [
            {'field': 'name', 'display': 'Name'},
            {'field': 'fu_head_measurement_m_from_water_surface_to_water_surface', 'display': 'Head'} ,
            {'field': 'fu_average_flow_cms', 'display': 'Flow'},
            {'field': 'fs_road_access', 'display': 'Road'}
          ]
        };
      }


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

          this.$log.info( 'facets...', this.searchRsp );
          // var theLog = this.$log;
          var facets = [];
          angular.forEach(this.searchRsp.facets, function(value, key) {
            // theLog.info('check', key, value);
            if (key !== 'count' && key.length > 0) {
              facets.push( { name: key, value: value} );
            }
          });
          this.facets = facets;


          this.$log.info( 'update markers...', this.markers );

          this.markers.length = 0;
          angular.forEach(this.searchRsp.response.docs, (doc:any) => {

            if(doc.lat) {
              this.markers.push( {
                doc: doc,
                lat: doc.lat,
                lng: doc.lng,
                layer: 'searchlayer'
              });
            }
          });
       //   this.markers = newmarkers;
          //this.markers = angular.extend(this.$scope, {
          //  markers: newmarkers
          //});

        })
        .catch((error: any) => {
          alert( status + ' ' + queryString );
         // this.$log.error('XHR To make query.\n', error.data);
        });
    }

    filterResults(field: string, val: string) {
      // get the term from the field
      var facet = this.searchConfig.json.facet[field];
      var fname = facet.terms.field;

      this.searchConfig.req.fq.push( fname + ':' + val );
      this.doSearch();
    }

    removeFilter(fff: string) {
      // remove the facet
      this.searchConfig.req.fq = this.$filter('filter')(this.searchConfig.req.fq, function(item) {
        return !(item === fff);
      });

      this.doSearch();
    }

    showConfig() {

      var modalInstance = this.$modal.open({
        animation: this.animationsEnabled,
        templateUrl: 'app/components/searchArea/modal-config.html',
        controller: 'ModalShowConfigCtrl',
        controllerAs: 'vm',
        bindToController: true,
        resolve: {
          config: () => this.searchConfig
        }
      });

      var xthis = this;
      modalInstance.result.then(function (config) {
        xthis.searchConfig = config;
        xthis.$log.info( '>>>', xthis.searchConfig );
        xthis.doSearch();
      });
    }

    showResult(doc: any) {

      var modalInstance = this.$modal.open({
        animation: this.animationsEnabled,
        templateUrl: 'app/components/searchArea/modal-result.html',
        controller: 'ModalShowDocCtrl',
        controllerAs: 'vm',
        bindToController: true,
        resolve: {
          doc: () => doc,
          parent: () => this
        }
      });
    }

    showAllFacetValues(facet: any) {
      var modalInstance = this.$modal.open({
        animation: this.animationsEnabled,
        templateUrl: 'app/components/searchArea/modal-facet.html',
        controller: 'ModalFacetCtrl',
        controllerAs: 'vm',
        bindToController: true,
        resolve: {
          facet: () => facet,
          parent: () => this
        }
      });
    }
  }
}
