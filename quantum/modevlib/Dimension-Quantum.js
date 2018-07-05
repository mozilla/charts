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
        {"name": "Blockers", "index": "bugs", "esfilter": {"term": {"status_whiteboard.tokenized": "qf:p1:f64"}}},
        {"name": "Regressions", "index": "bugs", "esfilter": {"term": {"keywords": "regression"}}},
        {"name": "Unassigned", "index": "bugs", "esfilter": {"term": {"assigned_to": "nobody@mozilla.org"}}},
        {"name": "NeedsAnalysis", "index": "bugs", "esfilter": {"term": {"status_whiteboard.tokenized": "qf:needs-analysis"}}},

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
              "burndown": "https://cpeterso.github.io/burndown/?whiteboard=%5Bqf:p1:f64%5D&since=2018-01-01&component=developer%20tools:%20debugger,gecko%20profiler,Inspector,netmonitor",
              "esfilter": {
                "and": [
                  {
                    "or": [
                      {"prefix": {"component": "dev"}}, // Component: Anything starting with "Developer Tools"
                      {"term": {"component": "gecko profiler"}},
                      {"term": {"component": "inspector"}}
                    ]
                  }
                ]
              }
            },
            {
              "name": "DOM",
              "manager": "Andrew Overholt",
              "style": {"color": "#4D4D4D"},
              "burndown":"https://cpeterso.github.io/burndown/?whiteboard=%5Bqf:p1:f64%5D&since=2018-01-01&component=Document%20Navigation,DOM,DOM:%20Core%20%26%20HTML,DOM:%20Device%20Interfaces,DOM:%20Events,DOM:%20IndexedDB,DOM:%20Push%20Notifications,DOM:%20Quota%20Manager,DOM:%20Service%20Workers,DOM:%20Workers,Event%20Handling,HTML:%20Form%20Submission,HTML:%20Parser,Keyboard:%20Navigation,Serializers,XBL,XML,XPConnect,XSLT",
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
                            "event handling",
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
              "name": "Graphics",
              "manager": "David Bolter",
              "style": {"color": "#B276B2"},
              "burndown":"https://cpeterso.github.io/burndown/?whiteboard=%5Bqf:p1:f64%5D&since=2018-01-01&component=Canvas:%20webGL,Graphics,Graphics:%20Layers,Panning%20and%20Zooming,SVG,Canvas:%202D,GFX:%20Color%20Management,Graphics:%20Text,Image%20Blocking,ImageLib,Layout%20Web%20Painting",
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
                      {"terms": {"component": [
                        "color management",
                        "imagelib",
                        "panning and zooming",
                        "image blocking",
                        "layout: web painting",
                        "layout: Web painting components"
                      ]}}
                    ]
                  }
                ]
              }
            },
            {
              "name": "Layout",
              "manager": "Bobby Holley",
              "style": {"color": "#B2912F"},
              "burndown":"https://cpeterso.github.io/burndown/?whiteboard=%5Bqf:p1:f64%5D&since=2018-01-01&component=Layout:%20Block%20and%20Inline,CSS%20Parsing%20and%20Computation,Layout,Layout:%20Form%20Controls,Layout:%20Web%20Painting,DOM:%20CSS%20Object%20Model",
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
              "name": "Javascript",
              "manager": "Steven DeTar",
              "style": {"color": "#F17CB0"},
              "burndown":"https://cpeterso.github.io/burndown/?whiteboard=%5Bqf:p1:f64%5D&since=2018-01-01&component=JavaScript%20Engine,Javascript%20Engine:%20Jit,JavaScript:%20GE,JavaScript:%20GC",
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
              "manager": "Jason Duell",
              "style": {"color": "#DECF3F"},
              "description": "Network",
              "burndown":"https://cpeterso.github.io/burndown/?whiteboard=%5Bqf:p1:f64%5D&since=2018-01-01&component=Networking,Networking:%20Jar,Networking:%20Cookies",
              "esfilter": {
                "and": [
                  {"term": {"product": "core"}},
                  {"prefix": {"component": "network"}}  // Product: Core, Component: starts with "Networking"
                ]
              }
            },
            {
              "name": "WebExtensions",
              "manager": "David Durst",
              "style": {"color": "#757EBA"},
              "burndown":"",
              "esfilter": {
                "and": [
                  {"term": {"product": "webextensions"}},
                  {"not":{"term":{"component":"general"}}}
                ]
              }
            },
            {
              "name": "Runtime",
              "manager": "Jim Mathies",
              "style": {"color": "#757EBA"},
              "burndown":"https://cpeterso.github.io/burndown/?whiteboard=%5Bqf:p1:f64%5D&since=2018-01-01&component=Audio/Video:%20Playback,General",
              "esfilter": {
                "and": [
                  {"prefix": {"component": "audio/video:"}}
                ]
              }
            },
            {
              "name": "GeckoView",
              "manager": "David Bolter",
              "style": {"color": "#757EBA"},
              "burndown":"",
              "esfilter": {
                "and": [
                  {"prefix": {"product": "firefox for android"}},
                  {"prefix": {"component": "geckoview"}}
                ]
              }
            },
            {
              "name": "Android Front End",
              "manager": "David Bolter",
              "style": {"color": "#757EBA"},
              "burndown":"",
              "esfilter": {
                "and": [
                  {"prefix": {"product": "firefox for android"}}
                ]
              }
            },
            {
              "name": "Front End",
              "manager": "Justin Dolske",
              "style": {"color": "#757EBA"},
              "burndown":"",
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
              "burndown":"",
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
              "burndown":"",
              "esfilter": {"match_all": {}} // Any tracked bug not in one of the product/component combinations above.
            }
          ]
        }
      ]
    }


  ]);
})();

