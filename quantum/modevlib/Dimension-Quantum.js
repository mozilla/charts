/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

importScript("Dimension.js");
importScript("qb/ESQuery.js");

if (!Mozilla) var Mozilla = {"name": "Mozilla", "edges": []};

(function(){

  Dimension.addEdges(false, Mozilla, [
    {
      "name": "Quantum",
      "esfilter": {"match_all": {}},
      "edges": [
        {
          "name": "CategoryES", "index": "bugs", //REMOVE ME
          "partitions": [
            {
              "name": "Pageload", "index": "bugs", "esfilter":
                {"term": {"status_whiteboard(tokenized)": "qf:p1:pageload"}}
            },
            {
              "name": "P2", "index": "bugs", "esfilter":
                {"terms": {"status_whiteboard(tokenized)": ["qf:p2:responsiveness", "qf:p2:resource bugs"]}}
            },
            {
              "name": "P3", "index": "bugs", "esfilter":
                {"terms": {"status_whiteboard(tokenized)": ["qf:p3:responsiveness", "qf:p3:resource bugs"]}}
            },
            {
              "name": "Investigate", "index": "bugs", "esfilter":
                {"term": {"status_whiteboard(tokenized)": "qf:investigate"}}
            }
          ]
        },
        {
          "name": "Category", "index": "bugs", "isFacet": true,
          "partitions": [
            {
              "name": "Pageload", "index": "bugs", "esfilter":
                {"term": {"status_whiteboard.tokenized": "qf:p1:pageload"}}
            },
            {
              "name": "P2", "index": "bugs", "esfilter":
                {"terms": {"status_whiteboard.tokenized": ["qf:p2:responsiveness", "qf:p2:resource bugs"]}}
            },
            {
              "name": "P3", "index": "bugs", "esfilter":
                {"terms": {"status_whiteboard.tokenized": ["qf:p3:responsiveness", "qf:p3:resource bugs"]}}
            },
            {
              "name": "Investigate", "index": "bugs", "esfilter":
                {"term": {"status_whiteboard.tokenized": "qf:investigate"}}
            }
          ]
        },
        {"name": "Unassigned", "index": "bugs", "esfilter": {"term": {"assigned_to": "nobody@mozilla.org"}}},
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
          "name": "Team",
          "isFacet": true,
          "esfilter": {"match_all": {}},
          "partitions": [
            {
              "name": "Investigate",
              "manager": "",
              "style": {"color": "#CCCCCC"},
              "esfilter": {"term": {"status_whiteboard.tokenized": "qf:investigate:p1"}}
            },
            {
              "name": "DevTools",
              "manager": "Panos",
              "style": {"color": "#FAA43A"},
              "esfilter":
                {
                  "or": [
                    {
                      "and": [
                        {
                          "term":
                            {
                              "component": "tech evangelism"
                            }
                        },
                        {
                          "terms": {
                            "component": ["desktop", "mobile"]
                          }
                        }
                      ]
                    },
                    {
                      "terms": {
                        "component": [
                          "developer tools: debugger",
                          "gecko profiler",
                          "inspector",
                          "netmonitor"

                        ]
                      }
                    }


                  ]
                }
            },

            {
              "name": "DOM: Fission",
              "manager": "Neha Kochar",
              "esfilter": {
                "terms": {
                  "component": [

                    "document navigation",
                    "xbl",
                    "xml",
                    "xpconnect",
                    "xslt"
                  ]
                }
              }
            },
            {
              "name": "DOM: Core",
              "manager": "Hsin-Yi Tsai\n",
              "esfilter": {
                "terms": {
                  "component": [
                    "dom",
                    "dom: core & html",
                    "dom: events",
                    "drag and drop",
                    "event handling",
                    "html: form submission",
                    "html: parser",
                    "keyboard: navigation",
                    "serializers",
                    "ipc"
                  ]
                }
              }
            },
            {
              "name": "DOM: Workers & Storage",
              "manager": "Andrew Overholt",
              "style": {"color": "#4D4D4D"},
              "esfilter": {
                "terms": {
                  "component": [
                    "dom: indexeddb",
                    "dom: push notifications",
                    "dom: quota manager",
                    "dom: service workers",
                    "dom: web payments",
                    "dom: web storage",
                    "dom: workers"

                  ]
                }
              }
            },
            {
              "name": "Graphics",
              "manager": "Jessie Bonisteel",
              "style": {"color": "#B276B2"},
              "esfilter": {
                "terms": {
                  "component": [
                    "canvas: webgl",
                    "graphics",
                    "graphics: layers",
                    "panning and Zooming",
                    "svg",
                    "canvas: 2d",
                    "gfx: color management",
                    "graphics: text",
                    "image blocking",
                    "imagelib",
                    "layout web painting"
                  ]
                }
              }
            },
            {
              "name": "Javascript",
              "manager": "Steven DeTar",
              "style": {"color": "#F17CB0"},
              "esfilter": {
                "terms": {
                  "component": [
                    "javascript engine",
                    "javascript engine: jit",
                    "javascript: gc"]
                }
              }
            },
            {
              "name": "Layout",
              "manager": "Sean Voisen",
              "style": {"color": "#B2912F"},
              "esfilter": {
                "terms": {
                  "component": [
                    "layout: block and inline",
                    "css parsing and computation",
                    "css transitions and animations",
                    "dom: css object model",
                    "layout",
                    "layout: block and Inline",
                    "layout: columns",
                    "layout: flexbox",
                    "layout: floats",
                    "layout: form controls",
                    "layout: generated content, lists, and counters",
                    "layout: grid",
                    "layout: images, video, and html frames",
                    "layout: positioned",
                    "layout: ruby",
                    "layout: scrolling and overflow",
                    "layout: tables",
                    "layout: text and fonts",
                    "print preview",
                    "printing: output",
                    "printing: setup, svg"

                  ]
                }
              }
            },
            {
              "name": "Networking",
              "manager": "Selena Deckelmann",
              "style": {"color": "#DECF3F"},
              "description": "Network",
              "esfilter": {
                "terms": {
                  "component": [
                    "networking",
                    "networking: cookies"
                  ]
                }
              }
            },
            {
              "name": "WebExtensions",
              "manager": "David Durst",
              "style": {"color": "#757EBA"},
              "burndown": "",
              "esfilter": {
                "and": [
                  {"term": {"product": "webextensions"}},
                  {"term": {"component": "frontend"}}
                ]
              }
            },

            {
              "name": "Performance",
              "manager": "Vicky Chin",
              "style": {"color": "#757EBA"},
              "esfilter": {
                "and": [
                  {"term": {"product": "core"}},
                  {"term": {"component": "performance"}}
                ]
              }
            },
            {
              "name": "GeckoView",
              "manager": "Chris Peterson",
              "style": {"color": "#757EBA"},
              "burndown": "",
              "esfilter": {
                "and": [
                  {"term": {"product": "geckoview"}},
                  {"term": {"component": "general"}}
                ]
              }
            },
            {
              "name": "Firefox for Android",
              "manager": "Susheel Daswani",
              "style": {"color": "#757EBA"},
              "esfilter": {
                "and": [
                  {"term": {"product": "firefox for android"}}
                ]
              }
            },
            {
              "name": "Other",
              "manager": "",
              "style": {"color": "#CCCCCC"},
              "burndown": "",
              "esfilter": {"match_all": {}} // Any tracked bug not in one of the product/component combinations above.
            }
          ]
        }
      ]
    }


  ]);
})();

