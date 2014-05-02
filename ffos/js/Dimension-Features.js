/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

importScript("Dimension.js");
importScript("qb/ESQuery.js");

if (!Mozilla) var Mozilla = {"name": "Mozilla", "edges": []};

Dimension.addEdges(true, Mozilla, [
	{"name": "Milestone", "index":"bugs", "edges": [
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

	]}

]);
