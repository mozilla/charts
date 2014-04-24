/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

importScript("Dimension.js");

if (!Mozilla) var Mozilla={"name":"Mozilla", "edges":[]};

Dimension.addEdges(false,  Mozilla, [
	{"name":"Talos", "index":"talos", "edges":[
		{"name":"Branch", "field":"test_build.branch", "isFacet":true, "limit":100, "type":"set"}
	]}
]);


