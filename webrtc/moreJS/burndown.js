function bugDetails(bugs) {

	bugs.forall(function (b) {
		b.bugLink = Bugzilla.linkToBug(b.bug_id);
	});

	var output = new Template([
		"<table class='table' style='width:800px'>",
		"<thead><tr>",
		"<th style='width:70px;'>ID</th>",
		"<th>Summary</th>",
		"<th style='width:70px;'>Owner</th>",
		"<th>Status</th>",
		"<th>Estimate</th>",
		"</tr></thead>",
		"<tbody>",
		{
			"from":".",
			"template":[
				"<tr>" +
				"<td>{{bugLink}}</td>" +
				"<td><div style='width:290px;word-wrap: break-word'>{{summary|html}}</div></td>" +
				"<td><div style='width:120px;word-wrap: break-word'>{{owner|html}}</div></td>" +
				"<td><div style='width:70px;word-wrap: break-word'>{{status}}</div></td>" +
				"<td><div style='text-align: center;width:20px;'>{{estimate}}</div></td>" +
				"</tr>"
			]
		},
		"</tbody>",
		"</table>"
	]).expand(bugs);

	return output;
}



function* allOpenDependencies(esfilter, dateRange, selects, allOpen) {
    var data = yield (getRawDependencyData(esfilter, dateRange, selects));
    yield (getDailyDependencies(data, esfilter, allOpen));
}//method


//EXPECTING
// esfilter - TO GENERATE THE TOP-LEVEL BUG IDS
// dateRange - A time DOMAIN DEFINITION
// selects - A LIST OF COLUMNS ALSO REQUIRED BY THE CALLER
//RETURNS CUBE OF bug X date
function* getRawDependencyData(esfilter, dateRange, selects) {

    var a = Log.action("Get dependencies", true);
    var topBugs = (yield(ESQuery.run(
        {
            "from": "bugs",
            "select": "bug_id",
            "esfilter": {"and": [
                esfilter
            ]}
        }
    ))).list;
    topBugs = [].union(topBugs);

    var possibleTree = (yield(ESQuery.run(
        {
            "from": "bug_hierarchy",
            "select": [
                "bug_id",
                "descendants"
            ],
            "esfilter": {"terms": {"bug_id": topBugs}}
        }
    ))).list;
    possibleTree = possibleTree.select("descendants");
    possibleTree.append(topBugs);
    possibleTree = Array.union(possibleTree);
    Log.actionDone(a);

    var allSelects = Array.union(
        [
            ["bug_id", "dependson", "bug_status", "modified_ts", "expires_on"],
            selects
        ]
    );

    var a = Log.action("Pull dependencies");
    var raw_data = yield (ESQuery.run(
        {
            "name": "Open Bug Count",
            "from": "bugs",
            "select": allSelects.copy(),
            "esfilter": {"and": [
                {"terms": {"bug_id": possibleTree}},
                {"range": {"modified_ts": {"lt": dateRange.max.getMilli()}}},
                {"range": {"expires_on": {"gte": dateRange.min.getMilli()}}}
            ]}
        }
    ));
    Log.actionDone(a);

    //ORGANIZE INTO DATACUBE: (DAY x BUG_ID)
    var data = yield (Q(
        {
            "from": raw_data,
            "select": allSelects.subtract(["bug_id"]).map(
                function (v) {
                    return {"value": v, "aggregate": "one"}
                }
            ),
            "edges": [
                {"name": "date", "range": {"min": "modified_ts", "max": "expires_on"}, "domain": dateRange},
                "bug_id"
            ]
        }
    ));

    //ADDING COLUMNS AS MARKUP
    data.columns.append({"name": "counted"});
    data.columns.append({"name": "date"});

    //ADD date AND bug_id TO ALL RECORDS
    var days = data.edges[0].domain.partitions;
    var bugs = data.edges[1].domain.partitions;
    for(var day = 0; day < data.cube.length; day++) {
        var bug = data.cube[day];
        var day_part = days[day];
        bug.forall(
            function (detail, i) {
                detail.date = day_part.value;    //ASSIGN DATE TO AGGREGATE RECORD
                detail.bug_id = bugs[i].value;   //ASSIGN BUG ID TO AGGREGATE RECORD
            }
        );
    }//for
    return data;
}

//EXPECTING
// data - DATA CUBE OF bugs X date
// topBugFilter - FILTER TO DETERMINE EACH DAY'S TOP-LEVEL BUG IDS (function, or esfilter)
// allOpen - true IF WE COUNT OPEN DEPENDENCIES OF CLOSED BUGS
//REWRITES THE .counted ATTRIBUTE TO BE "Open", "Closed", or "none"
function* getDailyDependencies(data, topBugFilter) {
    if (typeof(topBugFilter) != "function") topBugFilter = CNV.esFilter2function(topBugFilter);

	//FOR EACH DAY, FIND ALL DEPENDANT BUGS
	for (var day = 0; day < data.cube.length; day++) {
		var bug = data.cube[day];
		var allTopBugs = bug.map(function (detail) {
			if (topBugFilter(detail)) return detail;
		});

		yield (Hierarchy.addDescendants({
			"from": bug,
			"id_field": "bug_id",
			"fk_field": "dependson",
			"descendants_field": "dependencies"
		}));

		var allDescendantsForToday = Array.union(allTopBugs.select("dependencies")).union(allTopBugs.select("bug_id")).map(function(v){return v-0;});
		bug.forall(function(detail, i){
			if (allDescendantsForToday.contains(detail.bug_id)){
				detail.counted="Closed"
			}else{
				detail.counted="none";
			}//endif
		});

		var openTopBugs = [];
		var openBugs = bug.map(function (detail) {
			if (["new", "assigned", "unconfirmed", "reopened"].contains(detail.bug_status)){
                if (topBugFilter(detail)) -openTopBugs.append(detail);
				return detail;
			}else{
				return undefined;
			}//endif
		});

		yield (Hierarchy.addDescendants({
			"from": openBugs,
			"id_field": "bug_id",
			"fk_field": "dependson",
			"descendants_field": "dependencies"
		}));

		var openDescendantsForToday = Array.union(openTopBugs.select("dependencies")).union(openTopBugs.select("bug_id")).map(function(v){return v-0;});
		bug.forall(function(detail, i){
			if (openDescendantsForToday.contains(detail.bug_id) && ["new", "assigned", "unconfirmed", "reopened"].contains(detail.bug_status)){
				detail.counted="Open"
			}//endif
		});

	}//for

	yield (data);
}//function


