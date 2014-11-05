/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

importScript("Dimension.js");
importScript("qb/ESQuery.js");

if (!Mozilla) var Mozilla = {"name": "Mozilla", "edges": []};

(function(){

	var releaseTracking = {"name": "Release", "isFacet": true,
		"edges": [
			{"name": "Firefox33", "version": 33, "startDate": "10 JUN 2014", "esfilter": {"term": {"cf_tracking_firefox33": "+"}}},
			{"name": "Firefox34", "version": 34, "startDate": "22 JUL 2014", "esfilter": {"term": {"cf_tracking_firefox34": "+"}}},
			{"name": "Firefox35", "version": 35, "startDate": " 1 sep 2014", "esfilter": {"term": {"cf_tracking_firefox35": "+"}}},
			{"name": "Firefox36", "version": 36, "startDate": "14 oct 2014", "esfilter": {"term": {"cf_tracking_firefox36": "+"}}}
		]
	};

	if (Date.newInstance(releaseTracking.edges.last().startDate).addWeek(6)<Date.today()){
		Log.error("Ran out of releases!  Please add more to Dimension-Platform.js");
	}//endif


	var trainTracking = {"name": "Track", "esFacet": true,
		"edges": releaseTracking.edges.map(function(release){
			//THE TRACK DEPENDS ON THE CURRENT TIME, SO WE DYNAMICALLY ASSIGN IT HERE
			var period = Duration.newInstance("6week");
			var today = Date.today();

			var output = undefined;
			["Nightly", "Aurora", "Beta", "Release"].forall(function(trackName, track){
				var start = Date.newInstance(release.startDate).add(period.multiply(track));
				var end = start.add(period);
				if (start.getMilli() <= today.getMilli() && today.getMilli() < end.getMilli()) {
					output = {
						"name": trackName + "("+release.version+")",
						"version": release.version,
						"esfilter": release.esfilter
					};
				}//endif
			});
			return output;
		})
	};


	Dimension.addEdges(true, Mozilla, [
		{"name": "Platform", "index": "bugs",
			"esfilter": {"or": [
				{"term": {"product": "core"}}
			]},
			"edges": [

				{"name": "Team", "isFacet": true, "partitions": [
					{"name": "JS Team", "esfilter": {"and": [
						{"term": {"product": "core"}},
						{"prefix": {"component": "javascript"}}
					]}},

					{"name": "All Others"}
				]},

				{"name": "Category", "isFacet": true,
					"partitions": [
						{"name": "Security", "esfilter": {"and": [
							{"terms": {"keywords": ["sec-critical", "sec-high"]}}
						]}},
						{"name": "Stability", "esfilter": {"and": [
							{"terms": {"keywords": ["topcrash"]}}
						]}},
						{"name": "Priority 1", "esfilter": {"term": {"status_whiteboard.tokenized": "js:p1"}}},
						{"name": "Priority 2", "esfilter": {"term": {"status_whiteboard.tokenized": "js:p2"}}}
					]
				},

				releaseTracking,
				trainTracking,

				{"name":"B2GRelease",
					"edges":[
						{"name":"Blocking 2.1", "esfilter":{"term":{"cf_blocking_b2g": "+"}}},
						{"name":"Blocking 2.2", "esfilter":{"term":{"cf_blocking_b2g": "+"}}}
					]
				},

				{"name": "Bug Assignment", "isFacet": true,
					"partitions": [
						{"name": "Unassigned", "esfilter": {"term": {"assigned_to": "nobody@mozilla.org"}}},
						{"name": "Assigned", "esfilter": {"not": {"term": {"assigned_to": "nobody@mozilla.org"}}}}
					]
				}
			]
		}
	]);
})();

