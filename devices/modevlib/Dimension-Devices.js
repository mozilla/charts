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
							"name": "WD",
							"value": "WD",
							"esfilter": {"and": [
								{"terms": {"cf_blocking_b2g": BLOCKER_PROJECTS}},
								{"or": [
									{"term": {"blocked_by": 1054172}},
									{"term": {"blocked": 1054172}}
								]}
							]},
							"columnName": "wd",
							"partitions": [
								{
									"name": "WD?",
									"columnValue": "?",
									"esfilter": {"terms": {"cf_blocking_b2g": NOM_PROJECTS}}
								},
								{
									"name": "WD+",
									"columnValue": "+",
									"esfilter": {"terms": {"cf_blocking_b2g": BLOCKER_PROJECTS}}
								}
							]
						},
						{
							"name": "P1",
							"value": "P1",
							"esfilter": {"and": [
								{"terms": {"cf_blocking_b2g": BLOCKER_PROJECTS}},
								{"or": [
									{"term": {"blocked_by": 1080337}},
									{"term": {"blocked": 1080337}}
								]}
							]},
							"columnName": "p1",
							"partitions": [
								{
									"name": "P1?",
									"columnValue": "?",
									"esfilter": {"terms": {"cf_blocking_b2g": NOM_PROJECTS}}
								},
								{
									"name": "P1+",
									"columnValue": "+",
									"esfilter": {"terms": {"cf_blocking_b2g": BLOCKER_PROJECTS}}
								}
							]
						},
						{
							"name": "P2",
							"value": "P2",
							"columnName": "p2",
							"esfilter": {"and": [
								{"terms": {"cf_blocking_b2g": BLOCKER_PROJECTS}},
								{"or": [
									{"term": {"blocked_by": 1107999}},
									{"term": {"blocked": 1107999}}
								]}
							]},
							"partitions": [
								{
									"name": "P2?",
									"columnValue": "?",
									"esfilter": {"terms": {"cf_blocking_b2g": NOM_PROJECTS}}
								},
								{
									"name": "P2+",
									"columnValue": "+",
									"esfilter": {"terms": {"cf_blocking_b2g": BLOCKER_PROJECTS}}
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

