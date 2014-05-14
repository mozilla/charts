/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

importScript("Dimension.js");
importScript("qb/ESQuery.js");

if (!Mozilla) var Mozilla = {"name": "Mozilla", "edges": []};


//webRTC MARKS BUGS A LITTLE DIFFERENT
var webRTCFilter={"or":[
	{"and":[
		{"term":{"product":"loop"}},
		{"terms":{"component":["general", "client", "server"]}}
	]},
	{"and":[
		{"term":{"product":"core"}},
		{"prefix":{"component":"webrtc"}}
	]}
]}



Dimension.addEdges(true, Mozilla, [
	{"name": "B2G",
//				{"term": {"target_milestone": "mozilla31"}},
		"esfilter": {"or": [
			{"terms": {"cf_blocking_b2g": ["1.3+", "1.4+", "1.3t+", "1.5+", "1.3?", "1.4?", "1.3t?", "1.5?", "2.0+", "2.0?"]}},
			{"terms": {"cf_blocking_loop": ["fx30+", "fx31+", "fx32+", "fx33+", "fx30+", "fx34+", "fx35+", "fx36+", "fx30?", "fx31?", "fx32?", "fx33?", "fx30?", "fx34?", "fx35?", "fx36?"]}},
			{"term": {"product": "firefox os"}},
			webRTCFilter
		]},
		"edges": [
			{"name": "Nominations", "index": "bugs", "esfilter": {"or":[
				{"terms": {"cf_blocking_b2g": ["1.3?", "1.4?", "1.3t?", "1.5?", "2.0?"]}},
				{"terms": {"cf_blocking_loop": ["fx30?", "fx31?", "fx32?", "fx33?", "fx30?", "fx34?", "fx35?", "fx36?"]}}
			]}},
			{"name": "Blockers", "index": "bugs", "esfilter": {"or":[
				{"terms": {"cf_blocking_b2g": ["1.3+", "1.4+", "1.3t+", "1.5+", "2.0+"]}},
				{"terms": {"cf_blocking_loop": ["fx30+", "fx31+", "fx32+", "fx33+", "fx30+", "fx34+", "fx35+", "fx36+"]}}
			]}},
			{"name": "Regressions", "index": "bugs", "esfilter": {"term": {"keywords": "regression"}}},
			{"name": "Unassigned", "index": "bugs", "esfilter": {"term": {"assigned_to": "nobody@mozilla.org"}}},
			{"name": "Responsibility", "index": "bugs", "isFacet": true, "partitions": [
				{"name":"FxOS Team", "esfilter":{"not":{"terms":{"status_whiteboard.tokenized":["NPOTB", "POVB"]}}}},
				{"name":"Vendor (POVB)", "esfilter":{"term":{"status_whiteboard.tokenized":"POVB"}}},
				{"name":"Not Part of the Build (NPOTB)", "esfilter":{"term":{"status_whiteboard.tokenized":"NPOTB"}}}
			]},

			{"name": "CA Blocker", "index": "bug-hierarchy", "esfilter":{"term":{"blocked_by":984663}}},

			//AN UNFORTUNATE DISTINCTION BETWEEN DIMENSIONS (ABOVE, THAT OVERLAP), AND PARTITIONS THAT DO NOT OVERLAP
			{"name": "State", "index": "bugs", "isFacet": true,
				"partitions": [
					{"name": "Nominated", "esfilter": {"and": [
						{"or":[
							{"terms": {"cf_blocking_b2g": ["1.3?", "1.4?", "1.3t?", "1.5?", "2.0?"]}},
							{"terms": {"cf_blocking_loop": ["fx30?", "fx31?", "fx32?", "fx33?", "fx30?", "fx34?", "fx35?", "fx36?"]}}
						]},
						{"not": {"term": {"keywords": "regression"}}}
					]}},
					{"name": "Blocker", "esfilter": {"and": [
						{"or":[
							{"terms": {"cf_blocking_b2g": ["1.3+", "1.4+", "1.3t+", "1.5+", "2.0+"]}},
							{"terms": {"cf_blocking_loop": ["fx30+", "fx31+", "fx32+", "fx33+", "fx30+", "fx34+", "fx35+", "fx36+"]}}
						]},
						{"not": {"term": {"keywords": "regression"}}}
					]}},
					{"name": "Regression", "esfilter": {"term": {"keywords": "regression"}}}
				]
			},



			{"name": "Component",
				"field": "component",
				"type": "set",
				"esfilter": ESQuery.TrueFilter,
				"index":"bugs",
				"limit":200,
				"end": function (p) {
					return p.name;
				}
			},

			{"name":"Team", "isFacet": true, "partitions":[
				{"name":"Performance",
					"esfilter":{"or":[
						{"term":{"keywords":"perf"}},
						{"and":[
							{"term":{"product":"firefox os"}},
							{"term":{"component":"performance"}}
						]}
					]}
				},
				{"name":"System Front-End", "esfilter":{"and":[
					{"not":{"term":{"keywords":"perf"}}}, //AN UNFORTUNATE REDUNDANCY
					{"term": {"product": "firefox os"}},
					{"terms":{"component":[
						"gaia::browser",
						"gaia::everything.me",
						"gaia::first time experience",
						"gaia::homescreen",
						"gaia::search",
						"gaia::system",
						"gaia::system::browser chrome"
					]}}
				]}},
				{"name": "Productivity", "esfilter": {"and": [
					{"not": {"term": {"keywords": "perf"}}}, //AN UNFORTUNATE REDUNDANCY
					{"term": {"product": "firefox os"}},
					{"terms": {"component": [
						"gaia::e-mail",
						"gaia::clock",
						"gaia::calculator",
						"gaia::calendar",
						"gaia::notes"
					]}}
				]}},
				{"name": "Media", "esfilter": {"and": [
					{"not": {"term": {"keywords": "perf"}}}, //AN UNFORTUNATE REDUNDANCY
					{"term": {"product": "firefox os"}},
					{"terms": {"component": [
						"gaia::camera",
						"gaia::fmradio",
						"gaia::gallery",
						"gaia::music",
						"gaia::video"
					]}}
				]}},
				{"name": "RIL", "esfilter": {"and": [
					{"not": {"term": {"keywords": "perf"}}}, //AN UNFORTUNATE REDUNDANCY
					{"terms": {"component": [
						"ril",
						"nfc",
						"wifi",
						"rtsp"
					]}}
				]}},
				{"name": "System Platform", "esfilter": {"and": [
					{"not": {"term": {"keywords": "perf"}}}, //AN UNFORTUNATE REDUNDANCY
					{"term": {"product": "firefox os"}},
					{"terms": {"component": [
						"gaia::settings",
						"gaia::system::window mgmt",
						"gaia::keyboard",
						"gaia::system::input mgmt",
						"gaia::system::lockscreen"
					]}}
				]}},
				{"name": "Multi-media Platform", "esfilter": {"and": [
					{"not": {"term": {"keywords": "perf"}}}, //AN UNFORTUNATE REDUNDANCY
					{"terms": {"component": [
						"video/audio: recording",
						"video/audio"
					]}}
				]}},
				{"name": "Comms", "esfilter": {"and": [
					{"not": {"term": {"keywords": "perf"}}}, //AN UNFORTUNATE REDUNDANCY
					{"term": {"product": "firefox os"}},
					{"terms": {"component": [
						"dom: contacts",
						"gaia::contacts",
						"gaia::cost control",
						"gaia::dialer",
						"gaia::sms"
					]}}
				]}},
				{"name": "Devices", "esfilter": {"and": [
					{"not": {"term": {"keywords": "perf"}}}, //AN UNFORTUNATE REDUNDANCY
					{"term": {"product": "firefox os"}},
					{"terms": {"component": [
						"audiochannel",
						"bluetooth",
						"hardware",
						"vendcom"
					]}}
				]}},

				{"name": "Networking (Necko)", "esfilter": {"and": [
					{"not": {"term": {"keywords": "perf"}}}, //AN UNFORTUNATE REDUNDANCY
					{"terms": {"component": [
						"Networking".toLowerCase(),
						"networking: cache",
						"networking: http",
						"networking: websockets"
					]}}
				]}},
				{"name": "WebRTC Loop",
					"esfilter": {"and": [
						{"term": {"product": "loop"}},
						{"terms": {"component": ["general", "client", "server"]}}
					]}
				},
				{"name": "WebRTC Platform",
					"esfilter": {"and": [
						{"term": {"product": "core"}},
						{"prefix": {"component": "webrtc"}}
					]}
				},
				{"name": "Layout", "esfilter": {"and": [
					{"not": {"term": {"keywords": "perf"}}}, //AN UNFORTUNATE REDUNDANCY
					{"terms": {"component": [
						"CSS Parsing and Computation".toLowerCase(),
						"Layout".toLowerCase()
					]}}
				]}},

				{"name": "Javascript", "esfilter": {"and": [
					{"not": {"term": {"keywords": "perf"}}}, //AN UNFORTUNATE REDUNDANCY
					{"terms": {"component": [
						"JavaScript Engine".toLowerCase(),
						"JavaScript: GC".toLowerCase(),
						"javascript engine: jit"
					]}}
				]}},

				{"name": "DOM", "esfilter": {"and": [
					{"not": {"term": {"keywords": "perf"}}}, //AN UNFORTUNATE REDUNDANCY
					{"terms": {"component": [
						"dom".toLowerCase(),
						"dom: apps".toLowerCase(),
						"dom: events".toLowerCase(),
						"dom: devices interfaces".toLowerCase(),
						"dom: push notifications".toLowerCase(),
						"dom: device interfaces"
					]}}
				]}},

				{"name": "Graphics", "esfilter": {"and": [
					{"not": {"term": {"keywords": "perf"}}}, //AN UNFORTUNATE REDUNDANCY
					{"terms": {"component": [
						"Graphics".toLowerCase(),
						"Graphics: Layers".toLowerCase(),
						"Graphics: text".toLowerCase(),
						"Canvas: 2D".toLowerCase(),
						"Canvas: WebGL".toLowerCase(),
						"ImageLib".toLowerCase(),
						"Panning and Zooming".toLowerCase()
					]}}
				]}},



				{"name": "All Others", "esfilter": {"and": [
					{"not": {"term": {"keywords": "perf"}}},     //AN UNFORTUNATE REDUNDANCY
					{"not": {"term":{"product":"loop"}}},        //NO WebRTC Loop Product
					{"not": {"prefix":{"component":"webrtc"}}},  //NO WebRTC
					{"not": {"terms": {"component": [
						//AN UNFORTUNATE LIST OF EVERYTHING, SHOULD BE AUTO-GENERATED, BUT I NEED A EQUATION SIMPLIFIER, OR ELSE I BREAK ES
						"Canvas: 2D".toLowerCase(),
						"Canvas: WebGL".toLowerCase(),
						"CSS Parsing and Computation".toLowerCase(),
						"dom".toLowerCase(),
						"dom: apps".toLowerCase(),
						"dom: events".toLowerCase(),
						"dom: devices interfaces".toLowerCase(),
						"dom: push notifications".toLowerCase(),
						"dom: device interfaces",
						"Graphics".toLowerCase(),
						"Graphics: Layers".toLowerCase(),
						"Graphics: text".toLowerCase(),
						"Hardware Abstraction Layer (HAL)".toLowerCase(),
						"ImageLib".toLowerCase(),
						"IPC".toLowerCase(),
						"JavaScript Engine".toLowerCase(),
						"JavaScript: GC".toLowerCase(),
						"Layout".toLowerCase(),
						"MFBT".toLowerCase(),
						"Networking".toLowerCase(),
						"Panning and Zooming".toLowerCase(),
						"performance",
						"gaia::browser",
						"gaia::everything.me",
						"gaia::first time experience",
						"gaia::homescreen",
						"gaia::search",
						"gaia::system",
						"gaia::system::browser chrome",
						"gaia::e-mail",
						"gaia::clock",
						"gaia::calculator",
						"gaia::calendar",
						"gaia::notes",
						"gaia::camera",
						"gaia::fmradio",
						"gaia::gallery",
						"gaia::music",
						"gaia::video",
						"ril",
						"nfc",
						"wifi",
						"rtsp",
						"gaia::settings",
						"gaia::system::window mgmt",
						"gaia::keyboard",
						"gaia::system::input mgmt",
						"gaia::system::lockscreen",
						"video/audio: recording",
						"video/audio",
						"webrtc",
						"webrtc: video/audio",
						"webrtc: audio/video",
						"dom: contacts",
						"gaia::contacts",
						"gaia::cost control",
						"gaia::dialer",
						"gaia::sms",
						"audiochannel",
						"bluetooth",
						"hardware",
						"vendcom",
						"javascript engine: jit",
						"networking: cache",
						"networking: http",
						"networking: websockets"
					]}}}
				]}}
			]},

			{"name": "Project", "index": "bugs", "isFacet": true,
				"partitions": [
					//https://wiki.mozilla.org/Release_Management/B2G_Landing
					{"name": "1.3",
						"dateMarks":[
							{"name":"FC", "date":"Dec 9, 2013", "style":{strokeStyle:"black", verticalOffset: 10}},
							{"name":"CF", "date":"Mar 17, 2014", "style":{strokeStyle:"black", verticalOffset: 10}}
						],
						"style": {"color": "#d62728"},
						"esfilter": {"or":[
							{"terms": {"cf_blocking_b2g": ["1.3+", "1.3?"]}}
						]}
					},
					{"name": "1.3T",
						"dateMarks":[
							{"name":"FC", "date":"Dec 9, 2013", "style":{strokeStyle:"black", verticalOffset: 20}},
							{"name":"CF", "date":"Mar 17, 2014", "style":{strokeStyle:"black", verticalOffset: 20}}
						],
						"style": {"color": "#ff7f0e"},
						"esfilter": {"or":[
							{"terms": {"cf_blocking_b2g": ["1.3t+", "1.3t?"]}}
						]}
					},
					{"name": "1.4",
						"dateMarks":[
							{"name":"FC", "date":"Mar 17, 2014", "style":{strokeStyle:"black", verticalOffset: 30}},
							{"name":"SC", "date":"Apr 28, 2014", "style":{strokeStyle:"black", verticalOffset: 30}},
							{"name":"CF", "date":"Jun 9, 2014", "style":{strokeStyle:"black", verticalOffset: 30}}
						],
						"style": {"color": "#2ca02c"},
						"esfilter": {"or":[
							{"terms": {"cf_blocking_b2g": ["1.4+", "1.4?"]}},
							{"terms": {"cf_blocking_loop": ["fx30+", "fx30?"]}}
						]}
					},
					{"name": "1.5/2.0",
						"dateMarks":[
							{"FC":"Jun 9, 2014"},
							{"SC":"Jul 21, 2014"},
							{"CF":"Sep 01, 2014"}
						],
						"style": {"color": "#1f77b4"},
						"esfilter": {"or":[
							{"terms": {"cf_blocking_b2g": ["1.5+", "1.5?", "2.0+", "2.0?"]}},
							{"terms": {"cf_blocking_loop": ["fx31?", "fx32?", "fx31+", "fx32+"]}}
						]}
					},
					{"name": "Other", "style": {"color": "#9467bd"}, "esfilter": {"and": [
						{"not": {"terms": {"cf_blocking_b2g": ["1.3+", "1.4+", "1.3t+", "1.5+", "1.3?", "1.4?", "1.3t?", "1.5?", "2.0+", "2.0?"]}}},
						{"not": {"terms": {"cf_blocking_loop": ["fx30+", "fx31+", "fx32+", "fx33+", "fx30+", "fx34+", "fx35+", "fx36+", "fx30?", "fx31?", "fx32?", "fx33?", "fx30?", "fx34?", "fx35?", "fx36?"]}}}

					]}}
				]
			},

			{"name": "FinalState", "index": "bugs", "isFacet": true,
				"partitions": [
					{"name": "1.3",
						"dateMarks":[
							{"name":"FC", "date":"Dec 9, 2013", "style":{strokeStyle:"black", verticalOffset: 10}},
							{"name":"CF", "date":"Mar 17, 2014", "style":{strokeStyle:"black", verticalOffset: 10}}
						],
						"style": {"color": "#d62728"},
						"esfilter": {"term": {"cf_blocking_b2g": "1.3+"}}
					},
					{"name": "1.3T",
						"dateMarks":[
							{"name":"FC", "date":"Dec 9, 2013", "style":{strokeStyle:"black", verticalOffset: 20}},
							{"name":"CF", "date":"Mar 17, 2014", "style":{strokeStyle:"black", verticalOffset: 20}}
						],
						"style": {"color": "#ff7f0e"},
						"esfilter": {"term": {"cf_blocking_b2g": "1.3T+"}}},
					{"name": "1.4",
						"style": {"color": "#2ca02c"},
						"esfilter": {"term": {"cf_blocking_b2g": "1.4+"}},
						"dateMarks":[
							{"name":"FC", "date":"Mar 17, 2014", "style":{strokeStyle:"black", verticalOffset: 30}},
							{"name":"SC", "date":"Apr 28, 2014", "style":{strokeStyle:"black", verticalOffset: 30}},
							{"name":"CF", "date":"Jun 9, 2014", "style":{strokeStyle:"black", verticalOffset: 30}}
						]
					},
					{"name": "1.5/2.0",
						"dateMarks":[
							{"FC":"Jun 9, 2014"},
							{"SC":"Jul 21, 2014"},
							{"CF":"Sep 01, 2014"}
						],
						"style": {"color": "#1f77b4"},
						"esfilter": {"terms": {"cf_blocking_b2g": ["1.5+", "2.0+"]}}
					},
					{"name": "Targeted",
						"style": {"color": "#9467bd", "visibility":"hidden"},
						"esfilter": {"and": [
							{"exists": {"field": "target_milestone"}},
							{"not": {"term": {"target_milestone": "---"}}}
						]}
					},
					{"name": "Others", "style": {"color": "#dddddd", "visibility":"hidden"}, "esfilter": {"match_all": {}}}
				]
			}
		]
	}
]);

