

function bugDetails(bugs){

	bugs.forall(function(b){
		b.bugLink=Bugzilla.linkToBug(b.bug_id);
	});

	return [
		"<table class='table' style='width:800px'><thead><tr>",
		"<th style='width:70px;'>ID</th>",
		"<th>Summary</th>",
		"<th style='width:70px;'>Owner</th>",
		"<th>Status</th>",
		"<th>Estimate</th>",
		"</tr></thead><tbody>",
		{
			"from":".",
			"template":[
				"<tr>",
				"<td>{{bugLink}}</td>",
				"<td><div style='width:290px;word-wrap: break-word'>{{summary}}</div></td>",
				"<td><div style='width:120px;word-wrap: break-word'>{{owner}}</div></td>",
				"<td><div style='width:70px;word-wrap: break-word'>{{status}}</div></td>",
				"<td><div style='text-align: center;width:20px;'>{{estimate}}</div></td>",
				"</tr>"
			]
		},
		"</tbody></table>"
	];
}


//EXPECTING LIST OF BUG IDS
function* allOpenDependencies(esfilter){

	var bugs=[];
	if (esfilter.term && esfilter.term.bug_id){
		bugs=Array.newInstance(esfilter.term.bug_id);
	}else if (esfilter.terms && esfilter.terms.bug_id){
		bugs=Array.newInstance(esfilter.terms.bug_id);
	}else{
		bugs = yield(ESQuery.run({
			"from":"bugs",
			"select":"bug_id",
			"esfilter":esfilter
		}));
	}


	bugs=Array.newInstance(bugs);

	//THESE ARE IMPORTANT BLOCKERS
	var a = Log.action("Get Hierarchy", true);
	var possibleTree = (yield(ESQuery.run({
		"from": "bug_hierarchy",
		"select": [
			"bug_id",
			"descendants"
		],
		"esfilter": {"terms": {"bug_id": bugs}}
	}))).list;
	if (possibleTree.length==0){
		possibleTree=[];
	}else{
		possibleTree=possibleTree[0].descendants;
	}//endif
	possibleTree = possibleTree.union(bugs);

	var allTree=undefined;
	var allTreeThread=Thread.run(function*(){
		try{
			allTree = (yield(ESQuery.run({
				"from": "bug_dependencies",
				"select": [
					"bug_id",
					"dependson"
				],
				"esfilter":	{"and": [
					{"terms":{"bug_id": possibleTree}},
					Mozilla.CurrentRecords.esfilter
				]}
			}))).list;
			allTree.append(0)
		}catch(e){
			//WHEN THE
			allTree=[0];
		}
	});

	var allOpen;
	var allOpenThread=Thread.run(function*(){
		allOpen = (yield(ESQuery.run({
			"from": "bugs",
			"select": "bug_id",
			"esfilter":	{"and": [
				{"terms":{"bug_id": possibleTree}},
				Mozilla.BugStatus.Open.esfilter,
				Mozilla.CurrentRecords.esfilter
			]}
		}))).list
	});

	yield (Thread.join(allTreeThread));
	yield (Thread.join(allOpenThread));

	allTree = allTree.filter(function(v){
		return bugs.contains(v.bug_id) || allOpen.contains(v.bug_id);
	});

	yield (Hierarchy.addDescendants({
       "from":allTree,
       "id_field":"bug_id",
       "fk_field":"dependson",
       "descendants_field": "dependencies"
    }));
	Log.actionDone(a);

	var output=[];
	allTree.forall(function(v){
		if (bugs.contains(v.bug_id)){
			output=output.union(v.dependencies);
		}//endif
	});

	yield (output);
}//function
