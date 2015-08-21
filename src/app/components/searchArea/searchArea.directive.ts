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
    public bounds: any;
    public layers: any;
    public markers: any;
    public events: any;

    private searchWithinMapView: boolean = true;
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
            name: 'World Topographic',
            type: 'agsBase',
            layer: 'Topographic',
            visible: false
          },
          national: {
            name: 'National Geographic',
            type: 'agsBase',
            layer: 'NationalGeographic',
            visible: false
          },
          oceans: {
            name: 'Oceans',
            type: 'agsBase',
            layer: 'Oceans',
            visible: false
          },
          gray: {
            name: 'Gray',
            type: 'agsBase',
            layer: 'Gray',
            visible: false
          },
          googleTerrain: {
            name: 'Google Terrain',
            layerType: 'TERRAIN',
            type: 'google'
          },
          googleHybrid: {
            name: 'Google Hybrid',
            layerType: 'HYBRID',
            type: 'google'
          },
          googleRoadmap: {
            name: 'Google Streets',
            layerType: 'ROADMAP',
            type: 'google'
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
          //
        },
        overlays: {
          searchlayer: {
            name: 'Search Results',
            type: 'markercluster',
            visible: true
          },
          irrcap: {
            name: "USA Soil Survey",
            type: "agsTiled",
            url: "http://server.arcgisonline.com/ArcGIS/rest/services/Specialty/Soil_Survey_Map/MapServer",
            visible: false,
            layerOptions: {
              layers: [0],
              opacity: 0.9,
              attribution: "USDA/NRCS SSURGO"
            }
          },
          wtdepth: {
            name: "Water Table Depth",
            type: "agsDynamic",
            url: "http://soils.esri.com/ArcGIS/rest/services/soils/WaterTableDepth-Annual-Minimum/MapServer",
            visible: false,
            layerOptions: {
              layers: [0],
              opacity: 0.9
            }
          },
          huc12: {
            name: "HUC (NHD)",
            type: "agsDynamic",
            url: "http://services.nationalmap.gov/ArcGIS/rest/services/nhd/MapServer",
            visible: false,
            //layerOptions: {
            //  layers: [0],
            //  opacity: 0.9
            //}
          },
          whydro: {
            name: "World Hydro",
            type: "agsTiled",
            url: "http://hydrology.esri.com/arcgis/rest/services/WorldHydroReferenceOverlay/MapServer",
            visible: false,
            layerOptions: {
              layers: [0],
              opacity: 0.9,
              attribution: "Copyright:© 2014 Esri, FAO, NOAA"
            }
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
        else {
          console.log('click', args);//, e, args);
        }
      });


      $scope.$on('leafletDirectiveMap.viewreset', (e, args) => {
        console.log('viewreset', this.bounds, e, args);//, e, args);
        if(this.searchWithinMapView) {
          this.doSearch();
        }
      });

      $scope.$on('leafletDirectiveMap.dragend', (e, args) => {
        console.log('dragend', this.bounds, e, args);//, e, args);
        if(this.searchWithinMapView) {
          this.doSearch();
        }
      });

      this.events = {
        markers: {
          enable: this.$leafletEvents.getAvailableMarkerEvents(),
        },
        map: {
          enable: ['dragend', 'viewreset'],
          logic: 'emit'
        }
      };

      //this.eventDetected = "No events yet...";
      //var markerEvents = this.$leafletEvents.getAvailableMarkerEvents();
      //for (var k in markerEvents){
      //  var eventName = 'leafletDirectiveMarker.' + markerEvents[k];
      //  this.$scope.$on(eventName, (event, args) => {
      //    this.eventDetected = event.name;
      //    console.log( "EVENT", event.name, event, args);
      //  });
      //}

      // https://www.planet.com/docs/v0/tutorials/leaflet-mosaic-tiles.html

      this.animationsEnabled = true; // for the popup
      this.searchConfig = {};

      this.$http.get('app/components/searchArea/config-drop3.json')
        .then((response: any) => {
          this.searchConfig = response.data;
          this.doSearch(); // initalize the response
        })
        .catch((error: any) => {
          this.$log.error('Get Config ERROR!', error);
          this.searchConfig = {};
        });
    }

    private clampIN( abs:number, val:number ) {
      if( val > abs ) {
        return abs;
      }
      if( val < -abs ) {
        return -abs;
      }
      return val;
    }

    getResultCountString() {
      if(!this.searchRsp.response) {
        return "...";
      }

      var start = this.searchConfig.req.start;
      var end = start + this.searchRsp.response.docs.length;
      var count = this.searchRsp.response.numFound;
      if(count>this.searchRsp.response.docs.length) {
        return start + ' to ' + end + ' of ' + count;
      }
      return ''+count;
    }

    getBBoxFQ() {
      if(this.bounds && this.searchWithinMapView) {
        console.log( "BOUNDS", this.bounds );
        // clamp the request...
        var xmin = this.clampIN(  90, this.bounds.southWest.lat);
        var ymin = this.clampIN( 180, this.bounds.southWest.lng);
        var xmax = this.clampIN(  90, this.bounds.northEast.lat);
        var ymax = this.clampIN( 180, this.bounds.northEast.lng);
        var fq = "&fq=geo:["+xmin+","+ymin+" TO "+xmax+","+ymax+"]";

        console.log( "BOUNDS", this.bounds, fq );
        return fq;
      }
      return "";
    }

    doSearch() {

      var queryString = this.searchConfig.url;
      queryString += '?json=' + JSON.stringify(this.searchConfig.json);
      queryString += '&' + jQuery.param(this.searchConfig.req, true); // the user configs
      queryString += this.getBBoxFQ() + '&wt=json&json.wrf=JSON_CALLBACK';  // jsonp

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


          this.$log.info( 'before update markers...', this.markers.length );

          var allmarkers = [];
          angular.forEach( this.searchRsp.response.docs, (doc:any) => {
            if( doc.lat ) {
              allmarkers.push( {
                doc: doc,
                lat: doc.lat,
                lng: doc.lng,
                layer: 'searchlayer',
              });
            }
            else {
              console.log("no lat", doc);
            }
          });
          this.markers = allmarkers;

          this.$log.info( 'after update markers...', this.markers.length );

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

    showOnMap(doc: any) {
      console.log("show", doc);

      this.center.lat = doc.lat;
      this.center.lng = doc.lng;
      if( 12 > this.center.zoom ) {
        this.center.zoom = 12;
      }
      console.log("center", this.center);
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
