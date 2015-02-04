/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

importScript("Dimension.js");
importScript("qb/ESQuery.js");

if (!Mozilla) var Mozilla = {"name": "Mozilla", "edges": []};

(function(){

	var RELEASE = ["2.0m", "2.1s"];
	var PROJECT = ["Woodduck", "Dolphin"];

	var NOM_PROJECTS = RELEASE.map(function(p){
		return p + "?";
	});
	var BLOCKER_PROJECTS = RELEASE.map(function(p){
		return p + "+";
	});

	Dimension.addEdges(true, Mozilla, [
		{"name": "Devices", "index": "bugs",
			"edges": [
				{"name": "Categories",
					"extraColumns": [
						{
							"name": "FxOS",
							"value": "cf_blocking_b2g"
						}
					],
					"edges": [
						{
							"name": "Woodduck",
							"value": "Woodduck",
							"esfilter": {"and": [
								{"term": {"blocked": 1054172}},
								{"or": [
									{"term": {"cf_blocking_b2g": "2.0m?"}},
									{"term": {"cf_blocking_b2g": "2.0m+"}}
								]}
							]},
							"columnName": "Woodduck",
							"partitions": [
								{
									"name": "2.0m?",
									"columnValue": "?",
									"esfilter": {"term": {"cf_blocking_b2g": "2.0m?"}}
								},
								{
									"name": "2.0m+",
									"columnValue": "+",
									"esfilter": {"term": {"cf_blocking_b2g": "2.0m+"}}
								}
							]
						},
						{
							"name": "Woodduck_Blocker",
							"value": "P1",
							"esfilter": {"and": [
								{"term": {"blocked": 1054172}},
								{"term": {"blocked": 1080337}}
							]},
							"columnName": "p1",
							"partitions": [
								{
									"name": "2.0m?",
									"columnValue": "?",
									"esfilter": {"terms": {"cf_blocking_b2g": "2.0m?"}}
								},
								{
									"name": "2.0m+",
									"columnValue": "+",
									"esfilter": {"terms": {"cf_blocking_b2g": "2.0m+"}}
								}
							]
						},
						{
							"name": "Dolphin",
							"value": "Dolphin",
							"columnName": "Dolphin",
							"esfilter": {"and": [
								{"term": {"blocked": 1123554}},
								{"or": [
									{"term": {"cf_blocking_b2g": "2.1s?"}},
									{"term": {"cf_blocking_b2g": "2.1s+"}}
								]}
							]},
							"partitions": [
								{
									"name": "2.1s?",
									"columnValue": "?",
									"esfilter": {"terms": {"cf_blocking_b2g": "2.1s?"}}
								},
								{
									"name": "2.1s+",
									"columnValue": "+",
									"esfilter": {"terms": {"cf_blocking_b2g": "2.1s+"}}
								}
							]
						}
					]
				},
				{
					"name": "Teams",
					"edges": [

					]
				}

			]
		}
	]);
})();

