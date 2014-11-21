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

	var SOLVED = ["fixed", "wontfix", "unaffected", "disabled"];

	var releaseTracking = {
		"name": "Release",
		"isFacet": true,
		"edges": [
			{"name": "Firefox33", "version": 33, "startDate": "10 JUN 2014", "esfilter": {"and":[
				{"not": {"terms": {"cf_status_firefox33": SOLVED}}},
				{"term": {"cf_tracking_firefox33": "+"}}
			]}},
			{"name": "Firefox34", "version": 34, "startDate": "22 JUL 2014", "esfilter": {"and":[
				{"not": {"terms": {"cf_status_firefox36": SOLVED}}},
				{"term": {"cf_tracking_firefox36": "+"}}
			]}},
			{"name": "Firefox35", "version": 35, "startDate": " 1 sep 2014", "esfilter": {"and":[
				{"not": {"terms": {"cf_status_firefox35": SOLVED}}},
				{"term": {"cf_tracking_firefox35": "+"}}
			]}},
			{"name": "Firefox36", "version": 36, "startDate": "14 oct 2014", "esfilter": {"and":[
				{"not": {"terms": {"cf_status_firefox36": SOLVED}}},
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
	var trainTrackingAbs = {
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
				}//endif
			});
			if (!output) otherFilter.append(release.esfilter);
			return output;
		})
	};
	trainTrackingAbs.edges.append({
		"name": trains.last().name,
		"style": trains.last().style,
		"esfilter": {"or":otherFilter}
	});

	//SHOW TRAINS AS PARTIITONS SO THERE IS NO DOUBLE COUNTING
	var trainTrackingRel = {
		"name": "Train",
		"isFacet": true,
		"requiredFields":releaseTracking.requiredFields,
		"partitions": releaseTracking.edges.map(function(release){
			//THE TRACK DEPENDS ON THE CURRENT TIME, SO WE DYNAMICALLY ASSIGN IT HERE
			var period = Duration.newInstance("6week");
			var today = Date.today();

			var output = undefined;
			trains.leftBut(1).forall(function(t, track){
				var start = Date.newInstance(release.startDate).add(period.multiply(3-track));
				var end = start.add(period);
				if (start.getMilli() <= today.getMilli() && today.getMilli() < end.getMilli()) {
					output = Map.setDefault({}, t, release);
				}//endif
			});
			return output;
		})
	};
	trainTrackingRel.partitions.append({
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
					"style":{"color":"#777777"},
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
						}
//						{"name": "Triage", "esfilter": {"regexp": {"status_whiteboard": ".*js:t.*"}}}
					]
				},

				releaseTracking,
				trainTrackingAbs,
				trainTrackingRel,

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
				},

				{"name": "Team", "isFacet": true, "esfilter":{"match_all":{}},
					"partitions":[
						{"name": "Desktop", "esfilter": {"or": [
							{"and": [
								{"term": {"product": "firefox"}},
								{"not": {"prefix": {"component": "dev"}}} //Anything not starting with "Developer Tools" (this is not 100% correct but should be a place to start)
							]},
							{"term": {"product": "toolkit"}}
						]}},
						{"name": "Dev Tools", "esfilter": {"and": [
							{"term": {"product": "firefox"}},
							{"prefix": {"component": "dev"}} // Component: Anything starting with "Developer Tools"
						]}},
						{"name":"Mobile", "esfilter": {"and":[
							{"term":{"product":"firefox for android"}},
							{"not":{"prefix":{"component":"graphics"}}}  //All except "Graphics, Panning and Zooming"
						]}},
						{"name":"JS", "esfilter": {"and":[
							{"term":{"product":"core"}},
							{"or":[
								{"prefix":{"component":"javascript"}},  //starts with "JavaScript" or "js", "MFBT", "Nanojit"
								{"prefix":{"component":"js"}},
								{"prefix":{"component":"mfbt"}},
								{"prefix":{"component":"nanojit"}}
							]}
						]}},
						{"name":"Layout", "esfilter": {"and":[
							{"term":{"product":"core"}},
							{"or":[
								{"prefix":{"component":"css parsing"}},  // Component: "CSS Parsing and Computation", starts with "HTML", starts with "Image", starts with "Layout", "Selection"
								{"prefix":{"component":"html"}},
								{"prefix":{"component":"image"}},
								{"prefix":{"component":"layout"}},
								{"prefix":{"component":"selection"}}
							]}
						]}},
						{"name":"Graphics", "esfilter": {"or":[
							{"and":[
								{"term":{"product":"firefox for android"}},
								{"prefix":{"component":"graphics"}}   //Component: "Graphics, Panning and Zooming"
							]},
							{"and":[
								{"term":{"product":"core"}},
								{"or":[
									{"prefix":{"component":"canvas"}},  // Anything starting with "Canvas", "Graphics", "Panning and Zooming", "SVG"
									{"prefix":{"component":"graphics"}},
									{"prefix":{"component":"panning"}},
									{"prefix":{"component":"svg"}}
								]}
							]}
						]}},
						{"name":"Necko", "description":"Network", "esfilter": {"and":[
							{"term":{"product":"core"}},
							{"prefix":{"component":"network"}}  // Product: Core, Component: starts with "Networking"
						]}},
						{"name":"Security", "esfilter": {"and":[
							{"term":{"product":"core"}},
							{"prefix":{"component":"security"}}  // Product: Core, Component: starts with "Security"
						]}},
						{"name":"DOM", "esfilter": {"and":[
							{"term":{"product":"core"}},
							{"or":[
								{"prefix":{"component":"dom"}},  // Anything starting with "DOM", "Document Navigation", "IPC", "XBL", "XForms"
								{"prefix":{"component":"document"}},
								{"prefix":{"component":"ipc"}},
								{"prefix":{"component":"xbl"}},
								{"prefix":{"component":"xform"}}
							]}
						]}},
						{"name":"Media", "esfilter": {"and":[
							{"term":{"product":"core"}},
							{"or":[
								{"prefix":{"component":"video"}},  // starts with "Video/Audio", "Web Audio", starts with "WebRTC"
								{"prefix":{"component":"web audio"}},
								{"prefix":{"component":"webrtc"}}
							]}
						]}},
						{"name":"AllY", "description":"Accessibility", "esfilter": {"and":[
							{"term":{"product":"core"}},
							{"prefix":{"component":"disability"}}  // "Disability Access APIs"
						]}},
						{"name":"Platform Integration", "esfilter": {"and":[
							{"term":{"product":"core"}},
							{"prefix":{"component":"widget"}}  // Component: starts with "Widget"
						]}},
						{
							"name":"Other",
							"esfilter": {"match_all":{}} // Any tracked bug not in one of the product/component combinations above.
						}
					]
				}
			]
		}
	]);
})();

