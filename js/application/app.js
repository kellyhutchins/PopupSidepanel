/*
 | Copyright 2016 Esri
 |
 | Licensed under the Apache License, Version 2.0 (the "License");
 | you may not use this file except in compliance with the License.
 | You may obtain a copy of the License at
 |
 |    http://www.apache.org/licenses/LICENSE-2.0
 |
 | Unless required by applicable law or agreed to in writing, software
 | distributed under the License is distributed on an "AS IS" BASIS,
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 | See the License for the specific language governing permissions and
 | limitations under the License.
 */
define([

  "boilerplate/ItemHelper",

  "boilerplate/UrlParamHelper",

  "dojo/i18n!./nls/resources",

  "dojo/_base/declare",
  "dojo/_base/lang",

  "esri/Graphic",
  "esri/symbols/PictureMarkerSymbol",
  "esri/widgets/Search",
  "esri/widgets/Home",
  "esri/widgets/BasemapToggle",
  "esri/widgets/Popup",

  "dojo/_base/lang",
  "dojo/on",
  "dojo/query",
  "dojo/string",

  "dojo/dom",
  "dojo/dom-construct",
  "dojo/dom-attr",
  "dojo/dom-class",

  "dojo/domReady!"

], function (
  ItemHelper, UrlParamHelper,
  i18n,
  declare, lang,
  Graphic, PictureMarkerSymbol,
  Search, Home, BasemapToggle, Popup,
  lang, on, query, string,
  dom, domConstruct, domAttr, domClass
) {

    //--------------------------------------------------------------------------
    //
    //  Static Variables
    //
    //--------------------------------------------------------------------------

    var CSS = {
      loading: "boilerplate--loading",
      error: "boilerplate--error",
      errorIcon: "esri-icon-notice-round"
    };

    return declare(null, {

      //--------------------------------------------------------------------------
      //
      //  Lifecycle
      //
      //--------------------------------------------------------------------------

      constructor: function () { },

      //--------------------------------------------------------------------------
      //
      //  Variables
      //
      //--------------------------------------------------------------------------

      config: null,

      direction: null,

      //--------------------------------------------------------------------------
      //
      //  Public Methods
      //
      //--------------------------------------------------------------------------

      init: function (boilerplateResponse) {
        if (boilerplateResponse) {
          this.direction = boilerplateResponse.direction;
          this.config = boilerplateResponse.config;
          this.settings = boilerplateResponse.settings;
          var boilerplateResults = boilerplateResponse.results;
          var webMapItem = boilerplateResults.webMapItem;

          var webSceneItem = boilerplateResults.webSceneItem;
          var groupData = boilerplateResults.group;

          document.documentElement.lang = boilerplateResponse.locale;

          this.urlParamHelper = new UrlParamHelper();
          this.itemHelper = new ItemHelper();

          this._setDirection();

          if (webMapItem) {
            this._createWebMap(webMapItem);
          }
          else if (webSceneItem) {
            this._createWebScene(webSceneItem);
          }
          else if (groupData) {
            this._createGroupGallery(groupData);
          }
          else {
            this.reportError(new Error("app:: Could not load an item to display"));
          }
        }
        else {
          this.reportError(new Error("app:: Boilerplate is not defined"));
        }
      },

      reportError: function (error) {
        // remove loading class from body
        domClass.remove(document.body, CSS.loading);
        domClass.add(document.body, CSS.error);
        // an error occurred - notify the user. In this example we pull the string from the
        // resource.js file located in the nls folder because we've set the application up
        // for localization. If you don't need to support multiple languages you can hardcode the
        // strings here and comment out the call in index.html to get the localization strings.
        // set message
        var node = dom.byId("loading_message");
        if (node) {
          node.innerHTML = "<h1><span class=\"" + CSS.errorIcon + "\"></span> " + i18n.error + "</h1><p>" + error.message + "</p>";
        }
        return error;
      },

      //--------------------------------------------------------------------------
      //
      //  Private Methods
      //
      //--------------------------------------------------------------------------

      _setDirection: function () {
        var direction = this.direction;
        var dirNode = document.getElementsByTagName("html")[0];
        domAttr.set(dirNode, "dir", direction);
      },

      _ready: function () {
        domClass.remove(document.body, CSS.loading);
        document.title = this.config.title;
      },

      _createWebMap: function (webMapItem) {
        this._updateTheme();
        this.itemHelper.createWebMap(webMapItem).then(function (map) {

          var viewProperties = {
            map: map,
            container: this.settings.webmap.containerId,
            popup: new Popup({
              container: "detailsContainer",
              autoPanEnabled: false,
              dockEnabled: false,
              dockOptions: {
                buttonEnabled: false
              },
              messageEnabled: false
            }),
            padding: {
              left: 300
            }
          };

          if (!this.config.title && map.portalItem && map.portalItem.title) {
            this.config.title = map.portalItem.title;
            dom.byId("title").innerHTML = map.portalItem.title;
          }
          if (this.config.subtitle) {
            dom.byId("subtitle").innerHTML = this.config.subtitle;
          }
          if (this.config.logo) {
            domConstruct.create("img", {
              src: this.config.logo,
              alt: "Logo Image"
            }, "logo");
          }
          lang.mixin(viewProperties, this.urlParamHelper.getViewProperties(this.config));

          require(["esri/views/MapView"], function (MapView) {

            var view = new MapView(viewProperties);
            // Add the home widget to the View UI

            var home = new Home({
              view: view
            });
            var basemapToggle = new BasemapToggle({
              view: view,
              nextBasemap: "hybrid"
            });
            view.ui.add(home, "top-left");
            view.ui.add(basemapToggle, "top-right");
            view.then(function (response) {
              this.updateUI(view);
              view.watch("widthBreakpoint", lang.hitch(this, function () {
				  console.log("THIs", this);
                this.updateUI(view);
              }));
              this.setupPopupBehavor(view);
              var layer = map.layers.getItemAt(0);
              if (this.config.searchLayer && this.config.searchLayer.id) {
                layer = map.findLayerById(this.config.searchLayer.id);
              }

              view.whenLayerView(layer).then(lang.hitch(this, function (layerView) {
                var fields = [];

                if (this.config.searchLayer.fields && this.config.searchLayer.fields.length && this.config.searchLayer.fields.length > 0) {
                  fields = this.config.searchLayer.fields[0].fields;
                } else {
                  var names = [];
                  layerView.layer.fields.forEach(function (field) {
                    names.push(field.name);
                  });
                  fields = names;
                }
                var search = new Search({
                  view: view,
                  container: "searchContainer",
                  sources: [{
                    featureLayer: layerView.layer,
                    placeholder: this.config.searchPlaceholder,
                    searchFields: fields,
                    suggestionsEnabled: true
                  }]
                });

              }));
              this.urlParamHelper.addToView(view, this.config);

              this._ready();

            }.bind(this), this.reportError);

          }.bind(this));

        }.bind(this), this.reportError);
      },
      updateUI: function (view) {
        var breakpoint = view.widthBreakpoint;
        if (breakpoint === "xsmall" || breakpoint === "small") {
          domClass.add("sidebar", "bottom-panel");
          view.padding = {
            left: 0,
            bottom: 300
          };
        } else {
          domClass.remove("sidebar", "bottom-panel");
          view.padding = {
            left: 350,
            bottom: 0
          };
        }
      },
      setupPopupBehavor: function (view) {
        // Add custom action if a field is defined that contains a url 

        view.popup.actions.push({
          title: "Info",
          id: "details",
          className: "esri-icon-launch-link-external"
        });

        view.popup.on("trigger-action", function () {
          if (event.action.id === "details") {
            window.open(view.popup.selectedFeature.attributes.AKA);
          }
        });
        // end custom action logic 

        view.popup.watch("visible", function () {
          if (!view.popup.visible) {
            view.graphics.removeAll();
          }
        });
        // Add selection symbol when popup features clicked 
        var selectedSymbol = new PictureMarkerSymbol({
          url: "http://static.arcgis.com/images/Symbols/Basic1/Blue_1_Tear_Pin2.png",
          size: 9,
          width: 21.75,
          height: 21.75,
          xoffset: 0,
          yoffset: 11.25
        });
        view.popup.watch("selectedFeature", function () {
          view.graphics.removeAll();
          var feature = view.popup.selectedFeature;
          if (feature) {
            var graphic = new Graphic({
              geometry: feature.geometry,
              symbol: selectedSymbol
            });
            view.graphics.add(graphic);
          }
        });
      },
      _updateTheme: function () {
        var theme = {
          panelBackground: this.config.panelBackgroundColor,
          panelColor: this.config.panelTextColor,
          headerBackground: this.config.headerBackgroundColor,
          headerColor: this.config.headerTextColor
        };

        var themeCss = string.substitute("#detailsContainer{background-color:${panelBackground};color:${panelColor};} .panel-header{background-color:${headerBackground};color:${headerColor};}", theme);
        var style = document.createElement("style");
        style.appendChild(document.createTextNode(themeCss));
        document.head.appendChild(style);
      },
      _createWebScene: function (webSceneItem) {
        this.itemHelper.createWebScene(webSceneItem).then(function (map) {

          var viewProperties = {
            map: map,
            container: this.settings.webscene.containerId
          };

          if (!this.config.title && map.portalItem && map.portalItem.title) {
            this.config.title = map.portalItem.title;
          }


          lang.mixin(viewProperties, this.urlParamHelper.getViewProperties(this.config));

          require(["esri/views/SceneView"], function (SceneView) {

            var view = new SceneView(viewProperties);

            view.then(function (response) {

              this.urlParamHelper.addToView(view, this.config);

              this._ready();

            }.bind(this), this.reportError);

          }.bind(this));

        }.bind(this), this.reportError);
      },

      _createGroupGallery: function (groupData) {
        var groupInfoData = groupData.infoData;
        var groupItemsData = groupData.itemsData;

        if (!groupInfoData || !groupItemsData || groupInfoData.total === 0 || groupInfoData instanceof Error) {
          this.reportError(new Error("app:: group data does not exist."));
          return;
        }

        var info = groupInfoData.results[0];
        var items = groupItemsData.results;

        this._ready();

        if (info && items) {
          var html = "";

          html += "<h1>" + info.title + "</h1>";

          html += "<ol>";

          items.forEach(function (item) {
            html += "<li>" + item.title + "</li>";
          });

          html += "</ol>";

          document.body.innerHTML = html;
        }

      }

    });
  });
