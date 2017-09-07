/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

importScript("Dimension.js");
importScript("qb/ESQuery.js");

if (!Mozilla) var Mozilla = {"name": "Mozilla", "edges": []};

(function () {

  Dimension.addEdges(true, Mozilla, [
    {
      "name": "Quantum",
      "esfilter": {"match_all": {}},
      "edges": [
        {
          "name": "Project", "index": "bugs", "isFacet": true,
          "partitions": [
            // {
            //   "name": "Photon",
            //   "start_date": "Jan 1, 2017",
            //   "targetDate": "Nov 28, 2017",
            //   "dateMarks": [],
            //   "style": {"color": "#ff7f0e"},
            //   "esfilter": {"prefix": {"status_whiteboard.tokenized": "photon"}}
            // },
            {
              "name": "QF",
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
          "end": function (p) {
            return p.name;
          }
        },

        {
          "name": "Team",
          "isFacet": true,
          "esfilter": {"match_all": {}},
          "partitions": [
            {
              "name": "DevTools",
              "manager": "Patrick Brosset",
              "style": {"color": "#FAA43A"},
              "esfilter": {
                "and": [
                  {
                    "or": [
                      {"prefix": {"component": "dev"}}, // Component: Anything starting with "Developer Tools"
                      {"term": {"component": "gecko profiler"}}
                    ]
                  }
                ]
              }
            },
            {
              "name": "DOM",
              "manager": "Andrew Overholt",
              "style": {"color": "#4D4D4D"},
              "esfilter": {
                "and": [
                  {"term": {"product": "core"}},
                  {"not": {"prefix": {"component": "dom: css"}}},
                  {
                    "or": [
                      {"prefix": {"component": "dom"}},  // Lawrence, Nov 11, 2014: Anything starting with "DOM", "Document Navigation", "IPC", "XBL", "XForms"
                      {"prefix": {"component": "document"}},
                      {"prefix": {"component": "ipc"}},
                      {"prefix": {"component": "xbl"}},
                      {"prefix": {"component": "xform"}},
                      {
                        "terms": {
                          "component": [
                            "html: parser",
                            "html: form submission",
                            "keyboard: navigation",
                            "serializers",
                            "xbl",
                            "xml",
                            "xpconnect",
                            "xslt"
                          ]
                        }
                      }
                    ]
                  }
                ]
              }
            },
            {
              "name": "Layout",
              "manager": "Jet Villegas",
              "style": {"color": "#B2912F"},
              "esfilter": {
                "and": [
                  {"term": {"product": "core"}},
                  {
                    "or": [
                      {"prefix": {"component": "dom: css"}},
                      {"prefix": {"component": "css parsing"}},  // Component: "CSS Parsing and Computation", starts with "HTML", starts with "Image", starts with "Layout", "Selection"
                      {"prefix": {"component": "html"}},
                      {"prefix": {"component": "image"}},
                      {"prefix": {"component": "layout"}},
                      {"prefix": {"component": "selection"}},
                      {"terms": {"component": ["svg"]}}
                    ]
                  }
                ]
              }
            },
            {
              "name": "Graphics",
              "manager": "Milan Sreckovic",
              "style": {"color": "#B276B2"},
              "esfilter": {
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
            },
            {
              "name": "Javascript",
              "manager": "Naveed Ihsanullah",
              "style": {"color": "#F17CB0"},
              "esfilter": {
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
              "name": "Networking",
              "manager": "Patrick McManus",
              "style": {"color": "#DECF3F"},
              "description": "Network",
              "esfilter": {
                "and": [
                  {"term": {"product": "core"}},
                  {"prefix": {"component": "network"}}  // Product: Core, Component: starts with "Networking"
                ]
              }
            },
            {
              "name": "WebExtensions",
              "manager": "Andy McKay",
              "style": {"color": "#757EBA"},
              "esfilter": {
                "and": [
                  {"prefix": {"component": "webextensions"}}
                ]
              }
            },
            {
              "name": "Runtime",
              "manager": "Selena Deckelmann",
              "style": {"color": "#757EBA"},
              "esfilter": {
                "and": [
                  {"prefix": {"product": "core"}}
                ]
              }
            },
            {
              "name": "Front End",
              "manager": "Justin Dolske",
              "style": {"color": "#757EBA"},
              "esfilter": {
                "or": [
                  {"prefix": {"product": "toolkit"}},
                  {"prefix": {"product": "firefox"}}
                ]
              }
            },
            {
              "name": "Webtools",
              "manager": "",
              "style": {"color": "#757EBA"},
              "esfilter": {
                "and": [
                  {"prefix": {"product": "webtools"}}
                ]
              }
            },
            {
              "name": "Other",
              "manager": "",
              "style": {"color": "#CCCCCC"},
              "esfilter": {"match_all": {}} // Any tracked bug not in one of the product/component combinations above.
            }
          ]
        }
      ]
    }


  ]);
})();

