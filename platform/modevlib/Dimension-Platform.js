/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

importScript("Dimension.js");
importScript("qb/ESQuery.js");

if (!Mozilla) var Mozilla = {"name": "Mozilla", "edges": []};

function requiredFields(esfilter){
	if (esfilter===undefined){
		return [];
	}else if (esfilter.and){
		return Array.union(esfilter.and.map(requiredFields));
	}else if (esfilter.or){
		return Array.union(esfilter.or.map(requiredFields));
	}else if (esfilter.not){
			return requiredFields(esfilter.not);
	}else if (esfilter.term){
		return Object.keys(esfilter.term)
	}else if (esfilter.terms){
		return Object.keys(esfilter.terms)
	}else if (esfilter.regexp){
		return Object.keys(esfilter.regexp)
	}else if (esfilter.missing){
		return [esfilter.missing.field]
	}else if (esfilter.exists){
		return [esfilter.missing.field]
	}else{
		return []
	}//endif
}//method



(function(){

	var releaseTracking = {
		"name": "Release",
		"isFacet": true,
		"edges": [
			{"name": "Firefox33", "version": 33, "startDate": "10 JUN 2014", "esfilter": {"and":[
				{"not": {"terms": {"cf_status_firefox33": ["fixed", "wontfix", "unaffected"]}}},
				{"term": {"cf_tracking_firefox33": "+"}}
			]}},
			{"name": "Firefox34", "version": 34, "startDate": "22 JUL 2014", "esfilter": {"and":[
				{"not": {"terms": {"cf_status_firefox36": ["fixed", "wontfix", "unaffected"]}}},
				{"term": {"cf_tracking_firefox36": "+"}}
			]}},
			{"name": "Firefox35", "version": 35, "startDate": " 1 sep 2014", "esfilter": {"and":[
				{"not": {"terms": {"cf_status_firefox35": ["fixed", "wontfix", "unaffected"]}}},
				{"term": {"cf_tracking_firefox35": "+"}}
			]}},
			{"name": "Firefox36", "version": 36, "startDate": "14 oct 2014", "esfilter": {"and":[
				{"not": {"terms": {"cf_status_firefox36": ["fixed", "wontfix", "unaffected"]}}},
				{"term": {"cf_tracking_firefox36": "+"}}
			]}}
		]
	};
	releaseTracking.requiredFields= Array.union(releaseTracking.edges.select("esfilter").map(requiredFields));

	if (Date.newInstance(releaseTracking.edges.last().startDate).addWeek(6)<Date.today()){
		Log.error("Ran out of releases!  Please add more to Dimension-Platform.js");
	}//endif

	var trains = [
		{"name":"Release", "style":{"color":"#E66000"}},
		{"name":"Beta", "style":{"color":"#FF9500"}},
		{"name":"Dev", "style":{"color":"#0095DD"}},
		{"name":"Nightly", "style":{"color":"#002147"}}
	];



	var otherFilter=[];    //NOT IN ANY OF THE THREE TRAINS
	var coveredFilter=[];  //ALREADY IN HIGHER PRIORITY TRAIN
	var trainTracking = {
		"name": "Release Tracking - Desktop",
		"esFacet": true,
		"requiredFields":releaseTracking.requiredFields,
		"edges": releaseTracking.edges.map(function(release){
			//THE TRACK DEPENDS ON THE CURRENT TIME, SO WE DYNAMICALLY ASSIGN IT HERE
			var period = Duration.newInstance("6week");
			var today = Date.today();

			var output = undefined;
			trains.leftBut(1).forall(function(t, track){
				var start = Date.newInstance(release.startDate).add(period.multiply(3-track));
				var end = start.add(period);
				if (start.getMilli() <= today.getMilli() && today.getMilli() < end.getMilli()) {
					output = Map.setDefault({}, t, release);
					coveredFilter.append(release.esfilter);
				}//endif
			});
			if (!output) otherFilter.append(release.esfilter);
			return output;
		})
	};
	trainTracking.edges.append({
		"name": trains.last().name,
		"style": trains.last().style,
		"esfilter": {"or":otherFilter}
	});


	Dimension.addEdges(true, Mozilla, [
		{"name": "Platform", "index": "bugs",
			"esfilter": {"or": [
				{"term": {"product": "core"}}
			]},
			"edges": [

				{
					"name": "Team",
					"isFacet": true,
					"partitions": [
						{"name": "JS Team", "esfilter": {"and": [
							{"term": {"product": "core"}},
							{"prefix": {"component": "javascript"}}
						]}},
						{"name": "All Others"}
					]
				},
				{
					"name": "Security",
					"partitions": [
						{
							"name": "Sec-Crit",
							"style":{"color":"#d62728"},
							"esfilter": {"term": {"keywords": "sec-critical"}}
						},
						{
							"name": "Sec-High",
							"style":{"color":"#ff7f0e"},
							"esfilter": {"term": {"keywords": "sec-high"}}
						}
					]
				},
				{
					"name": "Stability",
					"esfilter": {"terms": {"keywords": ["topcrash"]}}
				},
				{
					"name": "Priority",
					"partitions": [
						{
							"name": "P1",
							"esfilter": {"regexp": {"status_whiteboard": ".*js:p1.*"}}
						},
						{
							"name": "P2",
							"esfilter": {"regexp": {"status_whiteboard": ".*js:p2.*"}}
						},
//						{"name": "Triage", "esfilter": {"regexp": {"status_whiteboard": ".*js:t.*"}}}
					]
				},

				releaseTracking,
				trainTracking,

				{
					"name": "Release Tracking - FirefoxOS",
					"requiredFields": ["cf_blocking_b2g"],
					"esfilter": {"regexp": {"cf_blocking_b2g": ".*\\+"}},
					"edges": [
						{
							"name": "2.1",
							"style":{"color":"#00539F"},
							"esfilter": {"term": {"cf_blocking_b2g": "2.1+"}}
						},
						{
							"name": "2.2",
							"style":{"color":"#0095DD"},
							"esfilter": {"term": {"cf_blocking_b2g": "2.2+"}}
						}
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

