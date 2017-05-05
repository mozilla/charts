/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


importScript("../modevlib/util/aUtil.js");
importScript("../modevlib/util/aString.js");
importScript("owners.js");


var HIGHLIGHT=Color.BLUE.hue(60).multiply(0.6);


if (typeof OWNERS != 'undefined'){
	OWNERS = Map.zip(mapAllKey(OWNERS, function (k, v) {
		var manager;
		var owner;
		//PARSE THE <manager> "(" listOf(<assign_to>) ")" FORMAT
		if (v.indexOf("(") >= 0) {
			manager = v.left(v.indexOf("(")).trim();
			owner = v.between("(", ")").trim();
		} else {
			manager = v.trim();
			owner = "";
		}//endif


		var name = k.replaceLast(["::", ": ", ":"], "<br>").replaceLast(" (", "<br>(");
		return [k.deformat(), {"name": name, "owner": {"name": owner, "manager": manager}}];
	}));
}//endif

function getComponentDetails(c) {
	let candidates = Mozilla.Quantum.Team.partitions.mapExists(function(team){
		if (!team._fullFilter){
			team._fullFilter = Qb.where.compile(team.fullFilter);
		}
		if (team._fullFilter(c)) return team.manager;
	});

    let manager = coalesce(candidates[0], "");
    return {
      "name": c.component == "general" ? c.component + " (" + c.product + ")" : c.component,
      "owner":{"name":"", "manager":manager }
    };
}//function


// SHOW COUNT FOR ONE TEAM
function showTeam(team, showTYPE){
  var TEMPLATE = new Template('<div class="blocker">' +
    '<div class="component">{{team_name}}</div>' +
    '<div class="componentmanager">{{team_manager}}</div>' +
    '{{projectDetail}}' +
    '</div>');

  team.team_name=team.team.name;
  team.team_manager=team.team.manager;
  team.projectDetail = showTYPE(team);
  return TEMPLATE.replace(team);
}//function


// SHOW SUMMARY COUNT
function showSummary(type, team, detail, grandTotal, specialBugs, showTYPE) {

	var TEMPLATE = new Template(
		'<h1 style="text-align:center; padding: 20px 0 0 10px;vertical-align: top; display:inline-block">{{type}}&nbsp;&nbsp;</h1>' +
		'{{total}}'
	);

	var total = aMath.SUM(detail.cube.select("count"));
	var component = {};
	component.type = type;
    component.total=showTYPE(grandTotal);

	return TEMPLATE.replace(component)
}//function


// SHOW BLOCKER COUNT FOR ONE COMPONENT, ONE PROJECT
function showBlocker(detail) {
	detail.bugsList=detail.bugs.join(", ");
	detail.bugsURL = Bugzilla.searchBugsURL(detail.bugs);
	detail.unassignedURL = Bugzilla.searchBugsURL(detail.unassignedBugs);
	detail.color = age2color(detail.age).toHTML();

	let TEMPLATE = new Template('<div class="project {{additionalClass}}"  style="background-color:{{color}}" href="{{bugsURL}}" bugsList="{{bugsList}}" project="{{project}}">' +
		'<div class="count">{{count}}</div>' +
		(detail.unassignedCount > 0 ? '<div class="unassigned"><a class="count_unassigned" href="{{unassignedURL}}">{{unassignedCount}}</a></div>' : '') +
		'</div>');

	return TEMPLATE.replace(detail)
}//function


function showTotal(detail) {
	detail.bugsList=detail.bugs.join(", ");
	detail.bugsURL = Bugzilla.searchBugsURL(detail.bugs);
	detail.unassignedURL = Bugzilla.searchBugsURL(detail.unassignedBugs);
	detail.color = age2color(detail.age).toHTML();

	let TEMPLATE = new Template('<div class="total {{additionalClass}}"  style="background-color:{{color}}" href="{{bugsURL}}" bugsList="{{bugsList}}" project="{{project}}">' +
	  '<div style="font-weight: bold;">Total</div>' +
	  '<div class="total_count">{{count}}</div>' +
	  (detail.unassignedCount > 0 ? '<div class="total_unassigned"><a class="total_count_unassigned" href="{{unassignedURL}}">{{unassignedCount}}</a></div>' : '') +
	  '</div>'
	);

	return TEMPLATE.replace(detail)
}//function


function addProjectClickers(cube) {
	$(".project, .total").hover(function (e) {
		var old_color = $(this).attr("old_color");
		if (old_color == undefined) {
			old_color = $(this).css("background-color");
			$(this).attr("old_color", old_color);
		}//endif
		$(this).css("background-color", Color.newHTML(old_color).lighter().toHTML());
	},function (e) {
		var old_color = $(this).attr("old_color");
		$(this).css("background-color", old_color);
	}).click(function (e) {
		var link = $(this).attr("href");
		if (!link) return;
		window.open(link);
	});

	$(".count_unassigned, .total_count_unassigned").click(function (e) {
		var link = $(this).attr("href");
		window.open(link);
		return false;
	});

	$(".count_lost").click(function (e) {
		var link = $(this).attr("href");
		window.open(link);
		return false;
	});

	$(".project-summary").hover(function (e) {
		var self = $(this);
		var projectName = self.attr("project");
		var bugs = self.attr("bugsList").split(",").map(function(v){return v-0;});
		$(".project").filter(function(){
			var pro = $(this);

			if (pro.get(0)==self.get(0)) return true;
			if (pro.hasClass("project-summary")) return false;
			var thisProjectName=pro.attr("project");
			var thisBugs = pro.attr("bugsList").split(",").map(function(v){return v-0;});
			var overlap = projectName=="Total" || projectName==thisProjectName || thisBugs.intersect(bugs).length>0;
			return overlap;
		}).each(function(){
			var old_color = $(this).attr("old_color");
			if (old_color == undefined) {
				old_color = $(this).css("background-color");
				$(this).attr("old_color", old_color);
			}//endif
			$(this).css("background-color", HIGHLIGHT.toHTML());
		})
	},function (e) {
		$(".project").each(function(){
			var old_color = $(this).attr("old_color");
			$(this).css("background-color", old_color);
		});
	});
}//function


function age2color(age) {
	var green = Color.GREEN.multiply(0.4);
	var color = green.hue(Math.min(1.0, age / 7) * 120);
	return color;
}//function


function refresher(func){
	function callMe(){
		try{
			func()
		}catch(e){

		}
	}//method
	setInterval(callMe, 5*60*1000);
}


function showLastUpdated(){
	Thread.run(function*(){
		var result = yield (ESQuery.run({
			"from": "bugs",
			"select": {"name": "max_date", "value": "modified_ts", "aggregate": "maximum"},
			"esfilter": {"range": {"modified_ts": {"gte": Date.eod().addDay(-1).getMilli()}}}
		}));

		time = new Date(result.cube.max_date);

		var lu = $("#last-updated");
		lu.html(new Template("<div style='{{style|css}}'>{{name}}</div>").expand(result.index));
		lu.append("Last Updated " + time.addTimezone().format("NNN dd @ HH:mm") + Date.getTimezone());

	});
}
