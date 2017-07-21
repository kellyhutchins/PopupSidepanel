{
  "displayType": "tabs",
    "configurationSettings": [
      {
        "category": "App",
        "fields": [
          {
            "type": "webmap"
          },
          {
            "placeHolder": "Defaults to web map title",
            "label": "Title:",
            "fieldName": "title",
            "type": "string",
            "tooltip": "Defaults to web map title"
          },
          {
            "label": "Title logo:",
            "fieldName": "logo",
            "type": "string",
            "sharedThemeProperty": "logo.small",
            "tooltip": "Defaults to sample logo"
          }, {
            "type": "paragraph",
            "value": "Select layer and field for the search capability"
          }, {
            "type": "string",
            "fieldName": "searchPlaceholder",
            "label": "Placeholder text"
          }, {
            "type": "layerAndFieldSelector",
            "fieldName": "searchLayer",
            "label": "Search layer",
            "fields": [{
              "multipleSelection": false,
              "fieldName": "searchField",
              "label": "Search fields"
            }],
            "layerOptions": {
              "supportedTypes": [
                "FeatureLayer"
              ],
              "geometryTypes": [
                "esriGeometryPoint"
              ]
            }
          }
        ]
      },
      {
        "category": "Theme",
        "fields": [
          {
            "type": "color",
            "fieldName": "headerBackgroundColor",
            "tooltip": "Title background color",
            "label": "Title background:",
            "sharedThemeProperty": "header.background"
          },
          {
            "type": "color",
            "fieldName": "headerTextColor",
            "tooltip": "Title text color",
            "label": "Title Color:",
            "sharedThemeProperty": "header.text"
          }, {
            "type": "color",
            "fieldName": "panelBackgroundColor",
            "tooltip": "Panel background color",
            "sharedThemeProperty": "body.background"
          }, {
            "type": "color",
            "fieldName": "panelTextColor",
            "tooltip": "Panel text color",
            "sharedThemeProperty": "body.text"
          }
        ]
      }],
      "values": {
    "headerBackgroundColor": "#f8f8f8",
      "headerTextColor": "#5c5c5c",
        "panelBackgroundColor": "#f8f8f8",
          "panelTextColor": "#5c5c5c"
  }
}