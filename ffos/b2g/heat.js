/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


importScript("../js/util/aUtil.js");
importScript("../js/util/aString.js");
importScript("owners.js");


var HIGHLIGHT=Color.blue.hue(60).multiply(0.6);


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


		var name = k.replaceLast(["::", ": ", ":"], "<br>");
		return [k.deformat(), {"name": name, "owner": {"name": owner, "manager": manager}}];
	}));
}//endif

function getComponentDetails(comp) {
	var output = OWNERS[comp.deformat()];
	if (output !== undefined) return output;

	var name = comp.replaceLast(["::", ": ", ":"], "<br>");
	output = {"name": name, "owner": {"name": "", "manager": ""}};
	OWNERS[comp.deformat()] = output;
	return output;
}//function


// SHOW BLOCKER COUNT FOR ONE COMPONENT
function showComponent(detail, showTYPE) {
	var TEMPLATE = '<div class="blocker">' +
		'<div class="component">{{component}}</div>' +
		'<div class="componentmanager">{{manager}}</div>' +
		'<div class="componentowner">{{owner}}</div>' +
		'{{projectDetail}}' +
		'</div>';

	var component = Map.copy(detail[0]);
	var meta =  getComponentDetails(component.component);
	component.component = meta.name;
	component.manager = meta.owner.manager;
	component.owner = meta.owner.name=="" ? "": "(" + meta.owner.name + ")";
	component.projectDetail = detail.map(function (project, i) {
		if (project.count > 0) {
			return showTYPE(project);
		}//endif
	}).join("");
	return TEMPLATE.replaceVars(component)
}//function

// SHOW SUMMARY COUNT
function showSummary(type, team, detail, specialBugs, showTYPE) {

	var TEMPLATE = '<h3 style="padding: 20px 0 0 10px;vertical-align: top; display:inline-block">{{name}} {{type}}</h3><div class="blocker">' +
		'{{projectDetail}}' +
		'<div style="display:inline-block;width:50px">&nbsp;</div>' +
		'{{total}}' +
		'<div style="display:inline-block;width:50px">&nbsp;</div>' +
		'{{specialDetail}}' +
		'</div>';

	var total = aMath.sum.apply(undefined, detail.cube.select("count"));
	var component = {};

	if (team.length==0){
		component.name = "FFOS"
	}else{
		component.name = team.map(function(t){return t.name;}).join(", ")
	}//endif

	var numSummary=0;
	component.projectDetail = detail.cube.map(function (project, i) {
		project.project = detail.edges[0].domain.partitions[i].name;
		if (project.count > 0) {
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


	component.total=showTYPE({
		"project":"Total",
		"count":aMath.sum.apply(undefined, detail.cube.select("count")),
		"unassignedCount":aMath.sum.apply(undefined, detail.cube.select("unassignedCount")),
		"age":aMath.max.apply(undefined, detail.cube.select("age")),
		"bugs":detail.from.list.select("bug_id"),
		"unassignedBugs": detail.from.list.filter(Mozilla.B2G.Unassigned.esfilter).select("bug_id"),
		"additionalClass": "project-summary"

	});
	component.type=type;

	return TEMPLATE.replaceVars(component)
}//function

// SHOW TRIAGE COUNT FOR ONE COMPONENT, ONE PROJECT
function showNominations(detail) {
	detail.bugsList = detail.bugs.join(",");
	detail.bugsURL = Bugzilla.searchBugsURL(detail.bugs);
	detail.unassignedURL = Bugzilla.searchBugsURL(detail.unassignedBugs);
	detail.color = age2color(detail.age).toHTML();

	var TEMPLATE = '<div class="project {{additionalClass}}"  style="background-color:{{color}}" href="{{bugsURL}}" bugsList="{{bugsList}}">' +
		'<div class="release">{{project}}</div>' +
		'<div class="count">{{count}}</div>' +
		'</div>';

	return TEMPLATE.replaceVars(detail)
}//function

// SHOW BLOCKER COUNT FOR ONE COMPONENT, ONE PROJECT
function showBlocker(detail) {
	detail.bugsList=detail.bugs.join(", ");
	detail.bugsURL = Bugzilla.searchBugsURL(detail.bugs);
	detail.unassignedURL = Bugzilla.searchBugsURL(detail.unassignedBugs);
	detail.color = age2color(detail.age).toHTML();

	var TEMPLATE = '<div class="project {{additionalClass}}"  style="background-color:{{color}}" href="{{bugsURL}}" bugsList="{{bugsList}}">' +
		'<div class="release">{{project}}</div>' +
		'<div class="count">{{count}}</div>' +
		(detail.unassignedCount > 0 ? '<div class="unassigned"><a class="count_unassigned" href="{{unassignedURL}}">{{unassignedCount}}</a></div>' : '') +
		'</div>';

	return TEMPLATE.replaceVars(detail)
}//function


// SHOW BLOCKER COUNT FOR ONE COMPONENT, ONE PROJECT
function showRegression(detail) {
	detail.bugsList = detail.bugs.join(",");
	detail.bugsURL = Bugzilla.searchBugsURL(detail.bugs);
	detail.unassignedURL = Bugzilla.searchBugsURL(detail.unassignedBugs);
	detail.color = age2color(detail.age).toHTML();

	var TEMPLATE = '<div class="project {{additionalClass}}"  style="background-color:{{color}}" href="{{bugsURL}}" bugsList="{{bugsList}}">' +
		'<div class="release">{{project}}</div>' +
		'<div class="count">{{count}}</div>' +
		(detail.unassignedCount > 0 ? '<div class="unassigned"><a class="count_unassigned" href="{{unassignedURL}}">{{unassignedCount}}</a></div>' : '') +
		'</div>';

	return TEMPLATE.replaceVars(detail)
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
		window.open(link);
	});

	$(".count_unassigned").click(function (e) {
		var link = $(this).attr("href");
		window.open(link);
		return false;
	});

	$(".project-summary").hover(function (e) {
		var self = $(this);
		var bugs = self.attr("bugsList").split(",").map(function (v) {
			return CNV.String2Integer(v.trim());
		});
		$(".project").filter(function(){
			var pro = $(this);

			if (pro.get(0)==self.get(0)) return true;
			if (pro.hasClass("project-summary")) return false;
			var thisBugs=pro.attr("bugsList").split(",").map(function(v){return CNV.String2Integer(v.trim());});
			return bugs.intersect(thisBugs).length>0;
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
	var green = Color.green.multiply(0.4);
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
	Thread.run(function*() {
		while (true) {
			yield(Thread.sleep(5 * 60 * 1000));
			func();
		}//while
	});
}



