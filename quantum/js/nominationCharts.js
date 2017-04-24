importScript("../modevlib/Dimension-Quantum.js");


function showOpenNomCount(args) {
	Thread.run(function*() {
		///////////////////////////////////////////////////////////////////////
		// SIMPLE OPEN BUG COUNT, OVER TIME
		///////////////////////////////////////////////////////////////////////

		var timeDomain = Map.copy(args.timeDomain);
		timeDomain.max = timeDomain.max.add(timeDomain.interval);

		var chart = yield (ESQuery.run({
			"name": "Nomination Count",
			"from": "bugs",
			"select": {
				"name": "num_bug",
				"value": "bug_id",
				"aggregate": "count"
			},
			"edges": [
				{"name": "type", "domain": Mozilla.Quantum.Project.getDomain()},
				{"name": "date",
					"range": {
						"min": "modified_ts",
						"max": "expires_on"
					},
					"allowNulls": false,
					"domain": timeDomain
				}
			],
			"esfilter": {"and": [
				args.esfilter,
				Mozilla.BugStatus.Open.esfilter
			]}
		}));

		//DIRTY REVERSE OF THE TYPES
		chart.edges[0].domain.partitions.reverse();
		chart.cube.reverse();

		aChart.show({
			"id": args.chartID,
			"type": "area",
			"stacked": true,
			"cube": chart
		});
	});
}


function showNomChurn(args) {
	var fieldnames = ["cf_blocking_b2g", "cf_blocking_loop"];
	var projects = [
//		{"name": "1.3", "value": "1.3?", "nom":["1.3?"], "blocker":["1.3+"], "style":Mozilla.Quantum.Project["1.3"].style},
		{"name": "1.3T", "value": "1.3t?", "nom":["1.3t?"], "blocker":["1.3t+"], "style":Mozilla.Quantum.Project["1.3T"].style},
		{"name": "1.4", "value": "1.4?", "nom":["1.4?", "fx30?"], "blocker":["1.4+", "fx30+"], "style":Mozilla.Quantum.Project["1.4"].style},
		{"name": "2.0", "value": "2.0?", "nom":["2.0?", "fx31?", "fx32?"], "blocker":["2.0+", "fx31+", "fx32+"], "style":Mozilla.Quantum.Project["2.0"].style},
		{"name": "2.1", "value": "2.1?", "nom":["2.1?", "fx33?", "fx34?"], "blocker":["2.1+", "fx33+", "fx34+"], "style":Mozilla.Quantum.Project["2.1"].style},
		{"name": "2.2", "value": "2.2?", "nom":["2.2?", "fx35?", "fx36?"], "blocker":["2.2+", "fx35+", "fx36+"], "style":Mozilla.Quantum.Project["2.2"].style},
		{
			"name": "2.5",
			"value": "2.5?",
			"nom":["2.5?", "3.0?", "fx37?", "fx38?", "fx39?", "fx40?", "fx41?", "fx42?", "fx43?", "fx44?"],
			"blocker":["2.5+", "3.0+", "fx37+", "fx38+", "fx39+", "fx40+", "fx41+", "fx42+", "fx43+", "fx44+"],
			"style":Mozilla.Quantum.Project["2.5"].style
		},
		{
			"name": "2.6",
			"value": "2.6?",
			"nom":["2.6?", "fx45?", "fx46?", "fx47?", "fx48?"],
			"blocker":["2.6+", "fx45+", "fx46+", "fx47+", "fx48+"],
			"style":Mozilla.Quantum.Project["2.6"].style
		}
	];
	var triage = [];
	projects.forall(function(n){
		triage=triage.union(n.nom);
	});
	var blocker = [];
	projects.forall(function(n){
		blocker=blocker.union(n.blocker);
	});

	Thread.run(function*() {
		var a = Log.action("Get Nomination Counts ", true);

		//LOOK FOR CHANGES
		var changes = yield(ESQuery.run({
			"from": "bugs",
			"select": [
				"bug_id",
				"modified_ts",
				"changes"
			],
			"esfilter": {"and": [
				args.esfilter,
				//IF THERE IS A previous_value RECORD, WE CAN RESTRICT OURSELVES TO ONE-RECORD-PER-CHANGE
				{ "nested": {
					"path": "changes",
					"query": {"filtered": {
						"query": {
							"match_all": {}
						},
						"filter": {"and": [
							{"terms": {"changes.field_name": fieldnames}},
							{"or": [
								{"terms": {"changes.new_value": triage.union(blocker)}},
								{"terms": {"changes.old_value": triage}}
							]}
						]}
					}}
				}}
			]}
		}));
		Log.actionDone(a);

		var all = [];
		changes.list.forall(function (v) {
			v.changes.forall(function (c) {
				if (!fieldnames.contains(c.field_name)) return;
				all.append({
					"bug_id": v.bug_id,
					"modified_ts": v.modified_ts,
					"old_value": nvl(c.old_value, "---"),
					"new_value": nvl(c.new_value, "---")
				});
			});
		});

		//IF THE PROJECT IS MARKED AS BLOCKER, OR IF NOMINATION IS MARKED AS NON-BLOCKER
		var NOM_CHECK_LOGIC = "(project.blocker.contains(new_value) || (project.nom.contains(old_value) && !project.blocker.contains(new_value)))";

		var title = nvl({
			"1day": "Daily",
			"1week": "Weekly",
			"1month": "Monthly"
		}[sampleInterval.toString()], "") + " Change";


		var summary = yield(Q({
			"name":title,
			"from": all,
			"select": {"name": "count", "value": NOM_CHECK_LOGIC + " ? 1 : 0", "aggregate": "sum", "default":0},
			"edges": [
				{"name": "Project", "test": "true", "domain": {
					"name": "project",
					"type": "set",
					"key": "value",
					"partitions": projects,
					"end": function (p) {
						return p.name;
					}
				}},
				{"name": "modified_ts", "value": "Date.newInstance(modified_ts)", "domain": {"type": "time", "min": args.timeDomain.min, "max": args.timeDomain.max, "interval": args.timeDomain.interval, "value": "value"}}
			]
		}));

		aChart.show({
			"id": args.chartID,
			"sheetDiv": "info",
			"type": "bar",
			"stacked": true,
			"cube": summary,
			"xAxisSize": 50,
			"timeSeries": true,
			"clickAction": function (series, x, d) {
				Thread.run(function*() {
					var min = x.getMilli();
					var max = x.getMilli() + args.timeDomain.interval.milli;
					var logic = "(new_value == 'PROJECT+' || (old_value == 'PROJECT?' && new_value != 'PROJECT-' && new_value!='PROJECT+'))".replaceAll("PROJECT", {
						//AN UNFORTUNATE MAP FROM Project.name TO new_value PREFIX
						"1.3":"1.3",
						"1.3T":"1.3t",
						"1.4":"1.4",
						"2.0":"2.0",
						"2.1":"2.1",
						"2.2":"2.2"
					}[series]);

					var buglist = (yield (Qb.calc2List({
						"from": all,
						"select": {"value": "bug_id"},
						"where": logic + " && " + min + "<=modified_ts && modified_ts<" + max
					})));

					Bugzilla.showBugs(buglist.list);
				});
			}//click
		});
		Log.actionDone(a);


	});


}
