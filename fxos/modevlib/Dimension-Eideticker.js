/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

importScript("Dimension.js");

if (!Mozilla) var Mozilla = {"name": "Mozilla", "edges": []};

Dimension.addEdges(false, Mozilla, [
	{"name": "Eideticker", "index": "eideticker", "edges": [
		{"name": "Device", "field": "metadata.device", "type": "set", "limit": 1000},
		{"name": "Branch", "field": "metadata.app", "type": "set", "limit": 1000},
		{"name": "Test", "field": "metadata.test", "type": "set", "limit": 1000},
		{"name": "Revision", "field": "revision", "type": "uid"},
		{"name": "Metric", "type":"set", "partition":["fps", "checkerboard", "timetostableframe"]}
	]}
]);
