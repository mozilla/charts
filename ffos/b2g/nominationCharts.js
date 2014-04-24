importScript("../js/Dimension-B2G.js");


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
				{"name": "type", "domain": Mozilla.B2G.Project.getDomain()},
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
	var fieldname = "cf_blocking_b2g";
	var triage = ["1.3?", "1.3t?", "1.4?", "1.5?"];
	var blocker = ["1.3+", "1.3t+", "1.4+", "1.5+"];

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
							{"term": {"changes.field_name": fieldname}},
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
				if (c.field_name != fieldname) return;
				all.append({
					"bug_id": v.bug_id,
					"modified_ts": v.modified_ts,
					"old_value": nvl(c.old_value, "---"),
					"new_value": nvl(c.new_value, "---")
				});
			});
		});

		//IF THE PROJECT IS MARKED AS BLOCKER, OR IF NOMINATION IS MARKED AS NON-BLOCKER
		var NOM_CHECK_LOGIC = "((new_value==project.name+'+') || (old_value==project.name+'?' && new_value!=project.name+'+'))";

		var bugs = yield(Q({
			"from": all,
			"select": [
				{"name": "count", "value": NOM_CHECK_LOGIC + " ? 1 : 0", "aggregate": "sum"}
			],
			"edges": [
				{"name": "cf_blocking_b2g", "test": "true", "domain": {
					"name": "project",
					"type": "set",
					"key": "value",
					"partitions": triage.map(function(v){
						return {"name": v.leftBut(1), "value": v}
					}),
					"end": function (p) {
						return p.value;
					}
				}},
				{"name": "modified_ts", "value": "Date.newInstance(modified_ts)", "domain": {"type": "time", "min": args.timeDomain.min, "max": args.timeDomain.max, "interval": args.timeDomain.interval, "value": "value"}}
			]
		}));


		var title = nvl({
			"1day": "Daily",
			"1week": "Weekly",
			"1month": "Monthly"
		}[sampleInterval.toString()], "") + " Change";


		var summary = yield(Q({
			"name": title,
			"from": bugs,
			"select": {"value": "count", "default": 0, "aggregate": "sum"},
			"edges": [
				{"name": "Project", "domain": Mozilla.B2G.Project.getDomain()},
				{"name": "modified_ts", "value": "modified_ts", "domain": {"type": "time", "min": args.timeDomain.min, "max": args.timeDomain.max, "interval": args.timeDomain.interval, "value": "value"}}
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

					var logic = NOM_CHECK_LOGIC.replaceAll("project.name", CNV.String2Quote({
						//AN UNFORTUNATE MAP FROM Project.name TO new_value PREFIX
						"1.3":"1.3",
						"1.3T":"1.3t",
						"1.4":"1.4",
						"1.5/2.0":"1.5"
					}[series]));

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
