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
			"limit": 1000
		},
		{"name": "Platform", "field": "test_machine.platform", "type": "set", "limit": 1000},
		{"name":"TestOnly", "field":"result.test_name", "type":"set", "limit":1000},
		{"name":"Test", "field":["testrun.suite", "result.test_name"], "type":"set", "limit":1000, "esfilter":{"range":{"datazilla.date_loaded":{"gt":Date.today().subtract(Duration.newInstance("month")).getMilli()}}}},
		{"name": "Revision", "field": "test_build.revision", "type": "uid"}
	]}


]);


