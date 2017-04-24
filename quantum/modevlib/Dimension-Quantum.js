/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

importScript("Dimension.js");
importScript("qb/ESQuery.js");

if (!Mozilla) var Mozilla = {"name": "Mozilla", "edges": []};

(function(){

  Dimension.addEdges(true, Mozilla, [
    {
      "name": "Quantum",
      "esfilter": {"match_all": {}},
      "edges": [
        {
          "name": "Project", "index": "bugs", "isFacet": true,
          "partitions": [
            {
              "name": "Quantum",
              "start_date": "Jan 1, 2017",
              "targetDate": "Nov 28, 2017",
              "dateMarks": [],
              "style": {"color": "#ff7f0e"},
              "esfilter": {"prefix": {"status_whiteboard.tokenized": "qf"}}
            }
          ]
        },

        {"name": "Nominations", "index": "bugs", "esfilter": {"term": {"status_whiteboard.tokenized": "qf"}}},
        {"name": "AllNominations", "index": "bugs", "esfilter": {"terms": {"status_whiteboard.tokenized": ["qf:investigate:p1", "qf", "qf:investigate"]}}},
        {"name": "Blockers", "index": "bugs", "esfilter": {"term": {"status_whiteboard.tokenized": "qf:p1"}}},
        {"name": "Regressions", "index": "bugs", "esfilter": {"term": {"keywords": "regression"}}},
        {"name": "Unassigned", "index": "bugs", "esfilter": {"term": {"assigned_to": "nobody@mozilla.org"}}},

        //AN UNFORTUNATE DISTINCTION BETWEEN DIMENSIONS (ABOVE, THAT OVERLAP), AND PARTITIONS THAT DO NOT OVERLAP
        {
          "name": "State", "index": "bugs", "isFacet": true,
          "partitions": [
            {
              "name": "Nominated", "esfilter": {
              "and": [
                {"term": {"status_whiteboard.tokenized": "qf"}},
                {"not": {"term": {"keywords": "regression"}}}
              ]
            }
            },
            {
              "name": "Blocker", "esfilter": {
              "and": [
                {"term": {"status_whiteboard.tokenized": "qf:p1"}},
                {"not": {"term": {"keywords": "regression"}}}
              ]
            }
            },
            {"name": "Regression", "esfilter": {"term": {"keywords": "regression"}}}
          ]
        },


        {
          "name": "Component",
          "field": "component",
          "type": "set",
          "esfilter": ESQuery.TrueFilter,
          "index": "bugs",
          "limit": 200,
          "end": function(p){
            return p.name;
          }
        },

        {
          "name": "Team", "isFacet": true, "esfilter": {"match_all": {}},
          "partitions": [
            {
              "name": "Desktop", "style": {"color": "#5DA5DA"}, "esfilter": {
              "or": [
                {
                  "and": [
                    {"term": {"product": "firefox"}},
                    {"not": {"prefix": {"component": "dev"}}} //Anything not starting with "Developer Tools" (this is not 100% correct but should be a place to start)
                  ]
                },
                {"term": {"product": "toolkit"}}
              ]
            }
            },
            {
              "name": "Dev Tools", "style": {"color": "#FAA43A"}, "esfilter": {
              "and": [
                {"term": {"product": "firefox"}},
                {"prefix": {"component": "dev"}} // Component: Anything starting with "Developer Tools"
              ]
            }
            },
            {
              "name": "Mobile", "style": {"color": "#60BD68"}, "esfilter": {
              "and": [
                {"term": {"product": "firefox for android"}},
                {"not": {"prefix": {"component": "graphics"}}}  //All except "Graphics, Panning and Zooming"
              ]
            }
            },
            {
              "name": "JS", "style": {"color": "#F17CB0"}, "esfilter": {
              "and": [
                {"term": {"product": "core"}},
                {
                  "or": [
                    {"prefix": {"component": "javascript"}},  //starts with "JavaScript" or "js", "MFBT", "Nanojit"
                    {"prefix": {"component": "js"}},
                    {"prefix": {"component": "mfbt"}},
                    {"prefix": {"component": "nanojit"}}
                  ]
                }
              ]
            }
            },
            {
              "name": "Layout", "style": {"color": "#B2912F"}, "esfilter": {
              "and": [
                {"term": {"product": "core"}},
                {
                  "or": [
                    {"prefix": {"component": "css parsing"}},  // Component: "CSS Parsing and Computation", starts with "HTML", starts with "Image", starts with "Layout", "Selection"
                    {"prefix": {"component": "html"}},
                    {"prefix": {"component": "image"}},
                    {"prefix": {"component": "layout"}},
                    {"prefix": {"component": "selection"}}
                  ]
                }
              ]
            }
            },
            {
              "name": "Graphics", "style": {"color": "#B276B2"}, "esfilter": {
              "or": [
                //FROM MILAN: Jan 30th, 2015
                //In Core: Canvas: 2D, Canvas: WebGL, GFX: Color Management, Graphics, Graphics: Layers, Graphics: Text, ImageLib, Panning and Zooming
                //In Firefox for Android: Graphics, Panning and Zooming

                {
                  "and": [
                    {"term": {"product": "firefox for android"}},
                    {
                      "or": [
                        {"prefix": {"component": "graphics"}},
                        {"term": {"component": "panning and zooming"}}
                      ]
                    }
                  ]
                },
                {
                  "and": [
                    {"term": {"product": "core"}},
                    {
                      "or": [
                        {"prefix": {"component": "canvas"}},  // Anything starting with "Canvas", "Graphics", "Panning and Zooming", "SVG"
                        {"prefix": {"component": "graphics"}},
                        {"prefix": {"component": "panning"}},
                        {"prefix": {"component": "svg"}},
                        {"prefix": {"component": "gfx: color"}},
                        {"terms": {"component": ["color management", "imagelib", "panning and zooming"]}}
                      ]
                    }
                  ]
                }
              ]
            }
            },
            {
              "name": "Necko", "style": {"color": "#DECF3F"}, "description": "Network", "esfilter": {
              "and": [
                {"term": {"product": "core"}},
                {"prefix": {"component": "network"}}  // Product: Core, Component: starts with "Networking"
              ]
            }
            },
            {
              "name": "Security", "style": {"color": "#F15854"}, "esfilter": {
              "and": [
                {"term": {"product": "core"}},
                {"prefix": {"component": "security"}}  // Product: Core, Component: starts with "Security"
              ]
            }
            },
            {
              "name": "DOM", "style": {"color": "#4D4D4D"}, "esfilter": {
              "and": [
                //From Andrew  Jan30 2015
                //
                //DOM
                //DOM: Content Processes
                //DOM: Core & HTML
                //DOM: Device Interfaces (but this category is very messy)
                //DOM: Events
                //DOM: IndexedDB
                //DOM: Push Notifications
                //DOM: Workers
                //HTML: Parser
                //IPC

                {"term": {"product": "core"}},
                {
                  "or": [
                    {"prefix": {"component": "dom"}},  // Lawrence, Nov 11, 2014: Anything starting with "DOM", "Document Navigation", "IPC", "XBL", "XForms"
                    {"prefix": {"component": "document"}},
                    {"prefix": {"component": "ipc"}},
                    {"prefix": {"component": "xbl"}},
                    {"prefix": {"component": "xform"}},
                    {"term": {"component": "html: parser"}}
                  ]
                }
              ]
            }
            },
            {
              "name": "Media", "style": {"color": "#60BDB1"}, "esfilter": {
              "and": [
                {"term": {"product": "core"}},
                {
                  "or": [
                    {"prefix": {"component": "video"}},  // starts with "Video/Audio", "Web Audio", starts with "WebRTC"
                    {"prefix": {"component": "web audio"}},
                    {"prefix": {"component": "webrtc"}}
                  ]
                }
              ]
            }
            },
            {
              "name": "AllY", "style": {"color": "#BA7659"}, "description": "Accessibility", "esfilter": {
              "and": [
                {"term": {"product": "core"}},
                {"prefix": {"component": "disability"}}  // "Disability Access APIs"
              ]
            }
            },
            {
              "name": "Platform Integration", "style": {"color": "#757EBA"}, "esfilter": {
              "and": [
                {"term": {"product": "core"}},
                {"prefix": {"component": "widget"}}  // Component: starts with "Widget"
              ]
            }
            },
            {
              "name": "Other",
              "style": {"color": "#CCCCCC"},
              "esfilter": {"match_all": {}} // Any tracked bug not in one of the product/component combinations above.
            }
          ]
        }
      ]
    }


  ]);
})();

