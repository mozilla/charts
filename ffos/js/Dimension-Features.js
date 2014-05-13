/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

importScript("Dimension.js");
importScript("qb/ESQuery.js");

if (!Mozilla) var Mozilla = {"name": "Mozilla", "edges": []};

Dimension.addEdges(true, Mozilla, [

	{"name": "Feature", "index": "bugs", "needed_fields":["status_whiteboard"], "esfilter": {"match_all": {}}, "edges": [
		{"name": "UCID 2.0", "esfilter": {"and":[
			{"regexp": {"status_whiteboard": ".*ucid.*"}},
			{"or":[
				{"regexp": {"status_whiteboard": ".*2\\.0.*"}},
				{"regexp": {"status_whiteboard": ".*1\\.5.*"}}
			]}
		]}},
		{"name": "feature-b2g = 2.0", "needed_fields":["cf_feature_b2g"], "esfilter": {"and":[
			{"term":{"cf_feature_b2g":"2.0"}}
		]}},

		{"name": "Platform webRTC", "esfilter": {"term": {"bug_id": 970426}}},
		{"name": "Loop MLP", "esfilter": {"term": {"bug_id": 972866}}},
		{"name": "Loop Mobile MVP", "esfilter": {"term": {"bug_id": 970426}}}
	]},

	{"name": "Milestone", "index": "bugs", "isFacet": true, "edges": [
		{
			"name": "Firefox31",
			"start_date": "18 MAR 2014",
			"target_date": "28 APR 2014",
			"partitions": [
				{"name": "Blocking", "esfilter": {"and": [
					{"term": {"cf_blocking_loop": "fx31+"}}
				]}},
				{"name": "Targeted", "esfilter": {"and": [
					{"term": {"target_milestone": "mozilla31"}},
					{"not": {"term": {"cf_blocking_loop": "fx31+"}}}  // UNFORTUNATE REDUNDANCY
				]}}
			]
		},
		{
			"name": "Firefox32",
			"start_date": "29 APR 2014",
			"target_date": "9 JUN 2014",
			"partitions": [
				{"name": "Blocking", "esfilter": {"and": [
					{"term": {"cf_blocking_loop": "fx32+"}}
				]}},
				{"name": "Targeted", "esfilter": {"and": [
					{"term": {"target_milestone": "mozilla32"}},
					{"not": {"term": {"cf_blocking_loop": "fx32+"}}}  // UNFORTUNATE REDUNDANCY
				]}}
			]
		},
		{
			"name": "1.5/2.0",
			"start_date": "29 APR 2014",
			"target_date": "9 JUN 2014",
			"esfilter": {"match_all": {}},
			"partitions": [
				{"name": "Blocking", "esfilter": {"and": [
					{"terms": {"cf_blocking_b2g": ["2.0+", "1.5+"]}}
				]}},
				{"name": "Targeted", "esfilter": {"and": [
					{"exists": {"field": "target_milestone"}},
					{"not": {"term": {"target_milestone": "---"}}},
					{"not": {"term": {"cf_blocking_loop": "fx32+"}}}  // UNFORTUNATE REDUNDANCY
				]}}
			]
		},

		{
			"name": "Firefox33",
			"start_date": "10 JUN 2014",
			"target_date": "21 JUL 2014",
			"partitions": [
				{"name": "Blocking", "esfilter": {"and": [
					{"term": {"cf_blocking_loop": "fx33+"}}
				]}},
				{"name": "Targeted", "esfilter": {"and": [
					{"term": {"target_milestone": "mozilla33"}},
					{"not": {"term": {"cf_blocking_loop": "fx33+"}}}  // UNFORTUNATE REDUNDANCY
				]}}
			]
		},
		{
			"name": "Firefox34",
			"start_date": "22 JUL 2014",
			"target_date": "1 SEP 2014",
			"partitions": [
				{"name": "Blocking", "esfilter": {"and": [
					{"term": {"cf_blocking_loop": "fx34+"}}
				]}},
				{"name": "Targeted", "esfilter": {"and": [
					{"term": {"target_milestone": "mozilla34"}},
					{"not": {"term": {"cf_blocking_loop": "fx34+"}}}  // UNFORTUNATE REDUNDANCY
				]}}
			]
		}

	]},


	{"name": "CountType", "index": "bugs", "isFacet": true, "partitions": [
		{"name": "Regressions", "esfilter": {"and":[
			{"term": {"keywords": "regression"}},
			Mozilla.BugStatus.Open.esfilter
		]}},
		{"name": "Open", "esfilter": Mozilla.BugStatus.Open.esfilter},
		{"name": "Closed", "esfilter": Mozilla.BugStatus.Closed.esfilter}
	]},
	{"name": "ChurnType", "partitions": [
		{"name": "Regression", "esfilter": {"term": {"keywords": "regression"}}},
		{"name": "Blocker", "esfilter": {"and": [
			{"or": [
				{"terms": {"cf_blocking_b2g": ["1.3+", "1.4+", "1.3t+", "1.5+", "2.0+"]}},
				{"terms": {"cf_blocking_loop": ["fx30+", "fx31+", "fx32+", "fx33+", "fx30+", "fx34+", "fx35+", "fx36+"]}}
			]}
		]}},
		{"name": "Targeted",
			"style": {"color": "#9467bd", "visibility": "hidden"},
			"esfilter": {"and": [
				{"exists": {"field": "target_milestone"}},
				{"not": {"term": {"target_milestone": "---"}}}
			]}
		},
		{"name": "Other", "style": {"color": "#dddddd"}, "esfilter": {"match_all": {}}}
	]}

]);
