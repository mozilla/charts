/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

importScript("Dimension.js");

if (!Mozilla) var Mozilla = {"name": "Mozilla", "edges": []};

Dimension.addEdges(false, Mozilla, [
	{"name": "Talos", "index": "talos", "edges": [
		{"name": "Product", "field": "test_build.name", "type": "set", "limit": 1000},
		{"name": "Branch", "field": "test_build.branch", "type": "set", "limit": 1000},
		{"name": "Platform", "field": "test_machine.platform", "type": "set", "limit": 1000},
		{
			"name": "OS",
			"field": ["test_machine.os", "test_machine.osversion"],
			"type": "set",
			"limit": 1000,
			"partitions": [
				{
					"name": "Android",
					"value": "Android",
					"esfilter": {"term": {"test_machine.os": "Android"}},
					"partitions": [
						{
							"name": "2.2",
							"value": "Android.2.2",
							"esfilter": {"and": [
								{"term": {"test_machine.os": "Android"}},
								{"term": {"test_machine.osversion": "2.2"}}
							]}
						},
						{
							"name": "4.0.4",
							"value": "Android.4.0.4",
							"esfilter": {"and": [
								{"term": {"test_machine.os": "Android"}},
								{"term": {"test_machine.osversion": "4.0.4"}}
							]}
						}
					]
				},
				{
					"name": "linux",
					"value": "linux",
					"esfilter": {"term": {"test_machine.os": "linux"}},
					"partitions": [
						{
							"name": "Ubuntu 12.04",
							"value": "linux.Ubuntu 12.04",
							"esfilter": {"and": [
								{"term": {"test_machine.os": "linux"}},
								{"term": {"test_machine.osversion": "Ubuntu 12.04"}}
							]}
						}
					]
				},
				{
					"name": "mac",
					"value": "mac",
					"esfilter": {"term": {"test_machine.os": "mac"}},
					"partitions": [
						{
							"name": "OS X 10.6.8",
							"value": "mac.OS X 10.6.8",
							"esfilter": {"and": [
								{"term": {"test_machine.os": "mac"}},
								{"term": {"test_machine.osversion": "OS X 10.6.8"}}
							]}
						},
						{
							"name": "OS X 10.8",
							"value": "mac.OS X 10.8",
							"esfilter": {"and": [
								{"term": {"test_machine.os": "mac"}},
								{"term": {"test_machine.osversion": "OS X 10.8"}}
							]}
						},
						{
							"name": "OS X 10.9",
							"value": "mac.OS X 10.9",
							"esfilter": {"and": [
								{"term": {"test_machine.os": "mac"}},
								{"term": {"test_machine.osversion": "OS X 10.9"}}
							]}
						}
					]
				},
				{
					"name": "win",
					"value": "win",
					"esfilter": {"term": {"test_machine.os": "win"}},
					"partitions": [
						{
							"name": "5.1.2600",
							"value": "win.5.1.2600",
							"esfilter": {"and": [
								{"term": {"test_machine.os": "win"}},
								{"term": {"test_machine.osversion": "5.1.2600"}}
							]}
						},
						{
							"name": "6.1.7601",
							"value": "win.6.1.7601",
							"esfilter": {"and": [
								{"term": {"test_machine.os": "win"}},
								{"term": {"test_machine.osversion": "6.1.7601"}}
							]}
						},
						{
							"name": "6.2.9200",
							"value": "win.6.2.9200",
							"esfilter": {"and": [
								{"term": {"test_machine.os": "win"}},
								{"term": {"test_machine.osversion": "6.2.9200"}}
							]}
						},
						{
							"name": "6.2.9200.m",
							"value": "win.6.2.9200.m",
							"esfilter": {"and": [
								{"term": {"test_machine.os": "win"}},
								{"term": {"test_machine.osversion": "6.2.9200.m"}}
							]}
						}
					]
				}
			]
		},
		{"name": "Platform", "field": "test_machine.platform", "type": "set", "limit": 1000},
//		{"name":"Test", "field":["testrun.suite", "result.test_name"], "type":"set", "limit":1000},
		{"name":"Test", "field":"result.test_name", "type":"set", "limit":1000},
		{"name": "Revision", "field": "test_build.revision", "type": "uid"}
	]}


]);


