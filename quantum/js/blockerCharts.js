importScript("../modevlib/Dimension-Quantum.js");


function showOpenCount(args) {
	Thread.run(function*() {
		///////////////////////////////////////////////////////////////////////
		// SIMPLE OPEN BUG COUNT, OVER TIME
		///////////////////////////////////////////////////////////////////////

		var timeDomain = Map.copy(args.timeDomain);
		timeDomain.max = timeDomain.max.add(timeDomain.interval);

		var chart = yield (ESQuery.run({
			"from": "bugs",
			"select": {
				"name": "num_bug",
				"value": "bug_id",
				"aggregate": "count"
			},
			"edges": [
				{"name": "type", "domain": Mozilla.Quantum.FinalState.getDomain()},
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
			"id": args.chart.id,
			"name": args.chart.name,
			"type": "area",
			"stacked": true,
			"cube": chart
		});
	});
}


function showChurn(args) {
	Thread.run(function*() {
		///////////////////////////////////////////////////////////////////////
		// THREAD TO GET CLOSE RATES
		///////////////////////////////////////////////////////////////////////

		var a = Log.action("Load Bug Closures", true);
		//GET BUG FINAL STATES
		var allBugs = null;
		var allBugsThread = Thread.run(function*() {
			allBugs = yield(ESQuery.run({
				"from": "bugs",
				"select": [
					"bug_id",
					"product",
					"component",
					"cf_blocking_b2g",
					"cf_blocking_loop",
					"keywords",
					"target_milestone",
					"resolution",
					"status_whiteboard"
				],
				"esfilter": {"and": [
					args.esfilter,
					Mozilla.CurrentRecords.esfilter,
					Mozilla.BugStatus.Closed.esfilter,
					{"range": {"modified_ts": {"gte": args.timeDomain.min.getMilli()}}},
					{"term": {"bug_status": "resolved"}},
					{"term": {"resolution": "fixed"}}
				]}
			}));

			yield(null);

		});

		//PULL LATEST CLOSE DATES
		var bugClose = yield(ESQuery.run({
			"from": "bugs",
			"select": {"name": "closeDate", "value": "expires_on", "aggregate": "maximum"},
			"edges": [
				"bug_id"
			],
			"esfilter": {"and": [
				{"range": {"expires_on": {"gte": args.timeDomain.min.getMilli(), "lte": args.timeDomain.max.getMilli()}}},
				Mozilla.BugStatus.Open.esfilter,
				args.esfilter
			]}
		}));

		yield (Thread.join(allBugsThread));
		Log.actionDone(a);

		{//ADD THOSE closeDate TO TO MAIN LIST OF BUGS (WE SHOULD BE MERGING IN SOME FORM)
			var domain = bugClose.edges[0].domain;
			var data = bugClose.cube;
			allBugs.list.forall(function (v) {
				v.closeDate = Date.newInstance(data[domain.getPartByKey(v.bug_id).dataIndex]);    //USE dataIndex OF part TO LOOKUP closeDate IN CUBE
			});
			allBugs.columns.append({"name": "closeDate"});  //ADD TO METADATA
		}

		var churn = yield(Q({
			"from": allBugs,
			"name": "Activity History",
			"select": {"name": "count", "value": "bug_id", "aggregate": "count"},
			"edges": [
				{"name": "Category", "domain": Mozilla.Quantum.FinalState.getDomain()},
				{"name": "date", "value": "closeDate", "domain": Map.copy(args.timeDomain)}
			]
		}));

		//DIRTY REVERSE OF THE TYPES
		churn.edges[0].domain.partitions.reverse();
		churn.cube.reverse();
		churn.edges[0].domain.partitions[0].style.visibility = "visible";
		churn.edges[0].domain.partitions[1].style.visibility = "visible";


		aChart.show({
			"id": args.chart.id,
			"name":args.chart.name,
			"type": "bar",
			"stacked": true,
			"cube": churn,
			"clickAction": function (series, x, d) {
				var category = churn.edges[0].domain.getPartByKey(series);
				var date = churn.edges[1].domain.getPartByKey(x);

				Thread.run(function*() {
					var buglist = (yield (Qb.calc2List({
						"from": allBugs,
						"select": {"value": "bug_id"},
						"where": {"and": [
							{"range": {"closeDate": {"gte": date.min, "lt": date.max}}},
							category.fullFilter,
							args.esfilter
						]}

					})));

					Bugzilla.showBugs(buglist.list);
				});
			}//click
		});
	});
}


function showAges(args) {
	var timeDomain = Map.copy(args.timeDomain);
	timeDomain.max = timeDomain.max.add(timeDomain.interval);

	Thread.run(function*() {
		///////////////////////////////////////////////////////////////////////
		// THREAD TO AGE OF BLOCKERS
		///////////////////////////////////////////////////////////////////////

		var allBlockers = null;
		var allBlockersThread = Thread.run(function*() {
			allBlockers = yield(ESQuery.run({
				"from": "bugs",
				"select": [
					"bug_id",
					"cf_blocking_b2g",
					"cf_blocking_loop",
					"target_milestone",
					"status_whiteboard"
				],
				"esfilter": {"and": [
					GUI.getFilters("bugs"),
					Mozilla.CurrentRecords.esfilter,
					Mozilla.Quantum.Blockers.esfilter,
					{"or": [
						{"range": {"expires_on": {"gte": timeDomain.min.getMilli()}}},
						Mozilla.BugStatus.Open.esfilter
					]}
				]}
			}));
		});

		var blockers = yield (ElasticSearch.getMinMax({"and": [
			GUI.getFilters("bugs"),
			Mozilla.Quantum.Blockers.esfilter,
			Mozilla.BugStatus.Open.esfilter
		]}));

		yield(Thread.join(allBlockersThread));

		{//ADD THOSE max, min TO TO MAIN LIST OF BUGS (WE SHOULD BE MERGING IN SOME FORM)
			data = {};
			var domain = blockers.edges[0].domain;
			var data = blockers.cube;
			allBlockers.list.forall(function (v) {
				Map.copy({"min": null, "max": null}, v);  //DEFAULT VALUES
				Map.copy(nvl(data[domain.getPartByKey(v.bug_id).dataIndex], {}), v);
			});
		}

		var projectDomain = Mozilla.Quantum.FinalState.getDomain();
		projectDomain.partitions.pop();  //DO NOT SHOW THE Untargeted

		var a = Log.action("Request Bugs", true);
		var chart = yield(Q({
			"name": "Average Age of Blockers (Days)",
			"from": allBlockers.list,
			"select": {"name": "Average", "value": "nvl(min, time.min)>time.min ? null : (time.min.getMilli() - nvl(min, time.min).getMilli())/Duration.DAY.milli", "aggregate": "average", "default": 0, "style": {"color": "#00d6ff", "visibility": "hidden"}},
			"edges": [
				{"name": "Project", "domain": projectDomain},
				{"name": "date",
					"range": {"min": "min", "max": "max"},
					"allowNulls": false,
					domain: timeDomain
				}
			]
		}));
		Log.actionDone(a);

		//DIRTY REVERSE OF THE TYPES
		chart.edges[0].domain.partitions.reverse();
		chart.cube.reverse();
		chart.edges[0].domain.partitions[0].style.visibility = "visible";

		aChart.show({
			"id": args.chart.id,
			"name": args.chart.name,
			"type": "line",
			"stacked": false,
			"cube": chart
		});


	});


}

