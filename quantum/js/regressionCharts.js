function showRegressionAge(args) {
	var timeDomain = Map.copy(args.timeDomain);
	timeDomain.max = timeDomain.max.add(timeDomain.interval);

	Thread.run(function*() {
		///////////////////////////////////////////////////////////////////////
		// THREAD TO AGE OF REGRESSIONS
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
					"keywords"
				],
				"esfilter": {"and": [
					GUI.getFilters("bugs"),
					Mozilla.CurrentRecords.esfilter,
					Mozilla.Quantum.Regressions.esfilter,
					{"or": [
						{"range": {"expires_on": {"gte": timeDomain.min.getMilli()}}},
						Mozilla.BugStatus.Open.esfilter
					]}
				]}
			}));
		});

		var blockers = yield (ElasticSearch.getMinMax({"and": [
			GUI.getFilters("bugs"),
			Mozilla.Quantum.Regressions.esfilter,
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
			"name": "Average Age of Regressions (Days)",
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

