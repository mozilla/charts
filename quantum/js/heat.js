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


// SHOW COUNT FOR ONE COMPONENT
function showComponent(detail, showTYPE) {
	var TEMPLATE = new Template('<div class="blocker">' +
		'<div class="component">{{component}}</div>' +
		'<div class="componentmanager">{{manager}}</div>' +
		'<div class="componentowner">{{owner}}</div>' +
		'{{projectDetail}}' +
		'</div>');

	var component = Map.copy(detail[0]);
	var meta =  getComponentDetails(component);
	component.component = meta.name;
	component.manager = meta.owner.manager;
	component.owner = meta.owner.name=="" ? "": "(" + meta.owner.name + ")";
	component.projectDetail = detail.map(function (project, i) {
		if (project.show) {
			return showTYPE(project);
		}//endif
	}).join("");
	return TEMPLATE.replace(component)
}//function

// SHOW SUMMARY COUNT
function showSummary(type, team, detail, grandTotal, specialBugs, showTYPE) {

	var TEMPLATE = new Template(
		'<h3 style="padding: 20px 0 0 10px;vertical-align: top; display:inline-block">{{name}} {{type}}</h3><div class="blocker">' +
		'{{projectDetail}}' +
		'<div style="display:inline-block;width:50px">&nbsp;</div>' +
		'{{total}}' +
		'<div style="display:inline-block;width:50px">&nbsp;</div>' +
		'{{specialDetail}}' +
		'</div>');

	var total = aMath.SUM(detail.cube.select("count"));
	var component = {};
	component.type = type;

	if (team.length==0){
		component.name = "Quantum"
	}else{
		component.name = team.map(function(t){return t.name;}).join(", ")
	}//endif

	var numSummary=0;
	component.projectDetail = detail.cube.map(function (project, i) {
		project.project = detail.edges[0].domain.partitions[i].name;
		if (project.show) {
			numSummary++;
			return showTYPE(project);
		}//endif
	}).join("");
	if (numSummary<2) component.projectDetail="";

	if (specialBugs){
		component.specialDetail = showTYPE(specialBugs);
	}else{
		component.specialDetail = "";
	}//endif

	component.total=showTYPE(grandTotal);

	return TEMPLATE.replace(component)
}//function

// SHOW TRIAGE COUNT FOR ONE COMPONENT, ONE PROJECT
function showNominations(detail) {
	detail.bugsList = detail.bugs.join(",");
	detail.bugsURL = Bugzilla.searchBugsURL(detail.bugs);
	detail.unassignedURL = Bugzilla.searchBugsURL(detail.unassignedBugs);
	detail.color = age2color(detail.age).toHTML();

	var TEMPLATE = new Template(
		'<div class="project {{additionalClass}}"  style="background-color:{{color}}" href="{{bugsURL}}" bugsList="{{bugsList}}" project="{{project}}">' +
		'<div class="release">{{project}}</div>' +
		'<div class="count">{{count}}</div>' +
		'</div>');

	return TEMPLATE.replace(detail)
}//function

// SHOW BLOCKER COUNT FOR ONE COMPONENT, ONE PROJECT
function showBlocker(detail) {
	detail.bugsList=detail.bugs.join(", ");
	detail.bugsURL = Bugzilla.searchBugsURL(detail.bugs);
	detail.unassignedURL = Bugzilla.searchBugsURL(detail.unassignedBugs);
	detail.color = age2color(detail.age).toHTML();

	var TEMPLATE = new Template('<div class="project {{additionalClass}}"  style="background-color:{{color}}" href="{{bugsURL}}" bugsList="{{bugsList}}" project="{{project}}">' +
		'<div class="release">{{project}}</div>' +
		'<div class="count">{{count}}</div>' +
		(detail.unassignedCount > 0 ? '<div class="unassigned"><a class="count_unassigned" href="{{unassignedURL}}">{{unassignedCount}}</a></div>' : '') +
		'</div>');

	return TEMPLATE.replace(detail)
}//function


// SHOW BLOCKER COUNT FOR ONE COMPONENT, ONE PROJECT
function showTargeted(detail) {
	detail.bugsList=detail.bugs.join(", ");
	detail.bugsURL = detail.bugs.length==0 ? "" : Bugzilla.searchBugsURL(detail.bugs);
	detail.unassignedURL = Bugzilla.searchBugsURL(detail.unassignedBugs);
	detail.lostURL = Bugzilla.searchBugsURL(detail.lostBugs);
	detail.color = age2color(detail.age).toHTML();

	var TEMPLATE = new Template(
		'<div class="project {{additionalClass}}"  style="background-color:{{color}}" href="{{bugsURL}}" bugsList="{{bugsList}}" project="{{project}}">' +
		'<div class="release">{{project}}</div>' +
		'<div class="count">{{count}}</div>' +
		(detail.unassignedCount > 0 ? '<div class="unassigned"><a class="count_unassigned" href="{{unassignedURL}}">{{unassignedCount}}</a></div>' : '') +
		(detail.lostCount > 0 ? '<div class="lost"><a class="count_lost" href="{{lostURL}}">{{lostCount}}</a></div>' : '') +
		'</div>'
	);

	return TEMPLATE.replace(detail)
}//function


// SHOW BLOCKER COUNT FOR ONE COMPONENT, ONE PROJECT
function showRegression(detail) {
	detail.bugsList = detail.bugs.join(",");
	detail.bugsURL = Bugzilla.searchBugsURL(detail.bugs);
	detail.unassignedURL = Bugzilla.searchBugsURL(detail.unassignedBugs);
	detail.color = age2color(detail.age).toHTML();

	var TEMPLATE = new Template('<div class="project {{additionalClass}}"  style="background-color:{{color}}" href="{{bugsURL}}" bugsList="{{bugsList}}" project="{{project}}">' +
		'<div class="release">{{project}}</div>' +
		'<div class="count">{{count}}</div>' +
		(detail.unassignedCount > 0 ? '<div class="unassigned"><a class="count_unassigned" href="{{unassignedURL}}">{{unassignedCount}}</a></div>' : '') +
		'</div>');

	return TEMPLATE.replace(detail)
}//function

function addProjectClickers(cube) {
	$(".project").hover(function (e) {
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

	$(".count_unassigned").click(function (e) {
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


//JUNK FOR THE Blockers/Regressions/Nominations
function heatCommon() {
	$("body").css("display", "block");

	$('.sidebar_name').click(function () {
		var self = $(this);
		if (self.hasClass("selected")) {
			self.removeClass("selected");
			$("#sidebar").animate({"width": "0px"}, 500);
			$(".content").animate({"padding-left":"40px"}, 500);
		} else {
			self.addClass("selected");
			$("#sidebar").animate({"width": "300px"}, 500);
			$(".content").animate({"padding-left":"340px"}, 500);
		}//endif
	});
}

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
