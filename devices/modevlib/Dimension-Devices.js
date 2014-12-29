/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

importScript("Dimension.js");
importScript("qb/ESQuery.js");

if (!Mozilla) var Mozilla = {"name": "Mozilla", "edges": []};

(function(){

	var PROJECTS = ["2.0m", "2.1s"];
	var NOM_PROJECTS = PROJECTS.map(function(p){
		return p + "?";
	});
	var BLOCKER_PROJECTS = PROJECTS.map(function(p){
		return p + "+";
	});

	Dimension.addEdges(true, Mozilla, [
		{"name": "Devices", "index":"bugs",
			"edges": [
				{"name": "Nominations", "esfilter": {"and": [
					{"terms": {"cf_blocking_b2g": NOM_PROJECTS}}
				]}},
				{"name": "Blockers", "index": "bugs", "esfilter": {"or": [
					{"terms": {"cf_blocking_b2g": BLOCKER_PROJECTS}}
				]}},
				{"name": "Unassigned", "index": "bugs", "esfilter": {"term": {"assigned_to": "nobody@mozilla.org"}}},
				{"name": "Responsibility", "index": "bugs", "isFacet": true, "partitions": [
					{"name": "FxOS Team", "esfilter": {"not": {"terms": {"status_whiteboard.tokenized": ["NPOTB", "POVB"]}}}},
					{"name": "Vendor (POVB)", "esfilter": {"term": {"status_whiteboard.tokenized": "POVB"}}},
					{"name": "Not Part of the Build (NPOTB)", "esfilter": {"term": {"status_whiteboard.tokenized": "NPOTB"}}}
				]},
				{"name": "Release",
					"edges":PROJECTS.map(function(v){
						return {"name": v, "value":v, "esfilter": {"terms": {"cf_blocking_b2g": [v + "+", v + "?"]}}}
					})
				},
				{"name": "Partners",
					"edges": [
						{"name": "P1", "value":"P1", "esfilter": {"term": {"blocked_by": 1107999}}},
						{"name": "P2", "value":"P2", "esfilter": {"term": {"blocked_by": 1080337}}},
						{"name": "Woodduck", "value":"Woodduck", "esfilter": {"term": {"blocked_by": 1054172}}}
					]
				}
			]
		}
	]);
})();

