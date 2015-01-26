//EXPECTING
// esfilter - TO GENERATE THE TOP-LEVEL BUG IDS
// allOpen - true IF WE COUNT OPEN DEPENDENCIES OF CLOSED BUGS
//RETURNS CUBE OF bug X date, WITH OBJECT ELEMENTS HAVING "counted" PROPERTY INDICATING DEPENDENCY STATUS
function* allOpenDependencies(esfilter, selects) {

	var a = Log.action("Get dependencies", true);
	var topBugs;
	if (esfilter.term && esfilter.term.bug_id){
		topBugs=[esfilter.term.bug_id];
	}else{
		topBugs = (yield(ESQuery.run({
			"from": "bugs",
			"select": "bug_id",
			"esfilter": {"and": [
				esfilter,
				Mozilla.CurrentRecords.esfilter
			]}
		}))).list;
		topBugs = [].union(topBugs);
	}//endif

	if (topBugs.length==0){
		return [];
	}//endif

	var possibleTree = (yield(ESQuery.run({
		"from": "bug_hierarchy",
		"select": [
			"bug_id",
			"descendants"
		],
		"esfilter": {"terms": {"bug_id": topBugs}}
	}))).list;
	possibleTree = possibleTree.select("descendants");
	possibleTree.append(topBugs);
	possibleTree = Array.union(possibleTree);
	Log.actionDone(a);

	var allSelects= Array.union([["bug_id","dependson","bug_status"], selects]);

	var a = Log.action("Pull dependencies");
	var raw_data = yield (ESQuery.run({
		"name": "Open Bug Count",
		"from": "bugs",
		"select": allSelects.copy(),
		"esfilter": {"and": [
			Mozilla.CurrentRecords.esfilter,
			Mozilla.BugStatus.Open.esfilter,
			{"terms": {"bug_id": possibleTree}}
		]}
	}));
	Log.actionDone(a);

	//ENSURE RE HAVE ONE RECORD PER BUG
	var data = yield (Q({
		"from": raw_data,
		"select": allSelects.map(function(v){
			return {"value": v, "aggregate": "one"}
		}),
		"edges": [
			{"name":"unique", "value":"bug_id"}
		]
	}));

	var openBugs = data.cube;
	var openTopBugs = openBugs.filter({"and":[
		esfilter,

	]});

	Hierarchy.addDescendants({
		"from": openBugs,
		"id_field": "bug_id",
		"fk_field": "dependson",
		"descendants_field": "dependencies"
	}); yield (Thread.YIELD);


	var openDescendantsForToday = Array.union(openTopBugs.select("dependencies")).map(function(v){return v-0;});
	var shortList = openBugs.filter({"terms":{"bug_id":openDescendantsForToday}});

	yield (shortList);
}//function


