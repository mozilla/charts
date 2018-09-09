/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

importScript("charts/aColor.js");


(function(){
	var green = Color.GREEN.multiply(0.5).hue(10).toHTML();
	var blue = Color.BLUE.multiply(0.5).hue(10).toHTML();
	var yellow = Color.RED.multiply(0.7).hue(-60).toHTML();
	var red = Color.RED.multiply(0.5).toHTML();


	window.Settings = {
		"imagePath" : "images",

		// POINTERS TO THE MANY SYSTEMS
		"indexes" : {

			// BUGZILLA TABLES (ElasticSearch Indexes)
			"bugs" : {"name" : "public bugs cluster", "style" : {"color" : "black", "background-color" : green}, "host" : "https://activedata-public.devsvcprod.mozaws.net", "path":"/query", "index":"public_bugs", "host_type":"ActiveData"},
			"public_bugs" : {"name" : "Mozilla public bugs cluster", "style" : {"color" : "white", "background-color" : green}, "host" : "https://activedata-public.devsvcprod.mozaws.net", "path":"/query", "host_type":"ActiveData"},
			"public_comments" : {"style" : {"color" : "black", "background-color" : yellow}, "host" : "https://activedata-public.devsvcprod.mozaws.net", "path":"/query", "host_type":"ActiveData"},
			"private_bugs" : {"style" : {"color" : "black", "background-color" : yellow}, "host" : "https://activedata-private.devsvcprod.mozaws.net", "path":"/query", "host_type":"ActiveData"},
			"private_comments" : {"style" : {"color" : "black", "background-color" : yellow}, "host" : "https://activedata-private.devsvcprod.mozaws.net", "path":"/query", "host_type":"ActiveData"},
			// ACTIVE DATA TABLES
			"branches": {"style" : {"background-color" : blue}, "host" : "https://activedata.allizom.org", "table":"branches", "host_type":"ActiveData"},
			"jobs": {"style" : {"background-color" : blue}, "host" : "https://activedata.allizom.org", "table":"jobs", "host_type":"ActiveData"},
			"jobs.action.timings": {"style" : {"background-color" : blue}, "host" : "https://activedata.allizom.org", "table":"jobs.action.timings", "host_type":"ActiveData"},
			"local_jobs.action.timings": {"style" : {"background-color" : blue}, "host" : "http://localhost:5000", "table":"jobs.action.timings", "host_type":"ActiveData"},
			"timings": {"style" : {"background-color" : blue}, "host" : "https://activedata.allizom.org", "table":"jobs.action.timings", "host_type":"ActiveData"},
			"unittests": {"style" : {"background-color" : blue}, "host" : "https://activedata.allizom.org", "table":"unittest", "host_type":"ActiveData"},
			"perf": {"style" : {"background-color" : blue}, "host" : "https://activedata.allizom.org", "table":"perf", "host_type":"ActiveData"},
			"failures": {"style" : {"background-color" : blue}, "host" : "https://localhost", "table":"failures", "host_type":"ActiveData"}

		},

		//REGISTER GENERATORS THAT HANDLE qb QUERIES
		"host_types": {
		}
	};


	//GIVE ALL CLUSTERS NAMES AND IDS
	Map.forall(Settings.indexes, function(k, v){
		v._id=k;
		v.name=coalesce(v.name, k);
	});
})();
