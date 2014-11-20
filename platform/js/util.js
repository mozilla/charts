
importScript("../modevlib/util/CNV.js");
importScript("../modevlib/qb/Qb.js");
importScript("../modevlib/charts/aColor.js");

var NORMAL="#888888";
var NORMAL_HOVER=Color.newHTML(NORMAL).lighter().toHTML();
var SELECTED=Color.BLUE.hue(60).multiply(0.6).toHTML();
var SELECTED_HOVER = Color.BLUE.hue(60).multiply(0.6).lighter().toHTML();

function refresher(func){
	function callMe(){
		try{
			func()
		}catch(e){

		}
	}//method
	setInterval(callMe, 5*60*1000);
}


function sidebarSlider() {
	$("body").css("display", "block");

	$('.sidebar_name').click(function () {
		var self = $(this);
		if (self.hasClass("selected")) {
			self.removeClass("selected");
			$("#sidebar").animate({"width": "0px"}, 500);
			$(".content").animate({"padding-left":"60px"}, 500);  //TODO:
		} else {
			self.addClass("selected");
			$("#sidebar").animate({"width": "300px"}, 500);
			$(".content").animate({"padding-left":"360px"}, 500);
		}//endif
	});
}

function addRowClickers(){
	$(".bug_line").click(function(){
		var self = $(this);
		var link = Bugzilla.searchBugsURL(self[0].id);
		if (!link) return;
		window.open(link);
	});
}

function addTileClickers() {
	$(".project").hover(function(){
		var bugList ="#"+CNV.JSON2Object($(this).attr("bugsList")).join(",#");
		$(bugList).addClass("selected");

	}, function(){
		var bugList ="#"+CNV.JSON2Object($(this).attr("bugsList")).join(",#");
		$(bugList).removeClass("selected");
	}).click(function (e){
		var bugList = $(".selected.project").map(function(){
			return CNV.JSON2Object($(this).attr("bugsList"));
		}).get();
		if (bugList.length==0){
			$(".bug_line").removeClass("selected").slideDown(300, "swing");
		}else{
			bugList = "#"+bugList.join(",#");
			$(bugList).removeClass("selected").slideDown(1000, "swing");
			$(".bug_line").not(bugList).slideUp(1000, "swing");
		}//endif
	});
}//function


function tile(info){
	var normalColor = nvl(info.style.color, NORMAL);
	var hoverColor = Color.newInstance(normalColor).lighter().toHTML();

	info.bugsCount = info.bugs.length;
	info.bugsList = CNV.Object2JSON(info.bugs.select("bug_id"));
	info.bugsURL = Bugzilla.searchBugsURL(info.bugs.select("bug_id"));
	info.unassignedBugs = info.bugs.filter(function(b){
		return b.assigned_to == "nobody@mozilla.org"
	}).select("bug_id");
	info.unassignedBugsCount = info.unassignedBugs.length;
	info.unassignedURL = Bugzilla.searchBugsURL(info.unassignedBugs);
	info.color = normalColor;
	info.states = ["normal", "selected"];
	info.dynamicStyle={
		":hover": {"background-color": hoverColor},
		".selected": {"background-color": SELECTED},
		".selected:hover": {"background-color": SELECTED_HOVER}
	};

	var TEMPLATE = new Template([
		'<div class="project"  style="background-color:{{color}}" dynamic-style="{{dynamicStyle|css}}" dynamic-state="{{states|attribute}}" href="{{bugsURL}}" bugsList="{{bugsList}}">' ,
		'<div class="release">{{name}}</div>',
		'<div class="count">{{bugsCount}}</div>',
		(info.unassignedBugs.length > 0 ? '<div class="unassigned"><a class="count_unassigned" href="{{unassignedURL}}">{{unassignedBugsCount}}</a></div>' : '') ,
		'</div>'
	]);
	return TEMPLATE.replace(info);
}//function



//START COUNTING AT 1 (BECAUSE PRIORITY STARTS AT 1
//IT IS IMPORTANT FOR THE sorttable LIB THAT ALL ROWS HAVE A VALUE,
//AND IT IS IMPORTANT THAT THE NULLS ARE SORTED TO THE BOTTOM
function getPartIndex(b, domain){
	var parts = nvl(domain.partitions, domain.edges);
	for (var i=0;i<parts.length;i++){
		var part = parts[i];
		var result = [b].filter(part.esfilter);
		if (result.length>0){
			return i+1;
		}//endif
	}//for
	return '<span style="color: transparent;">'+(parts.length+1)+'</span>';
}//function


//1 IS POSITIVE INDICATION (MATCHES FILTER)
//2 IS NEGATIVE INDICATION
//IT IS IMPORTANT THAT THE NULLS ARE SORTED TO THE BOTTOM
//IT IS IMPORTANT FOR THE sorttable LIB THAT ALL ROWS HAVE A VALUE
function match(b, esfilter){
	var result = [b].filter(esfilter);
	if (result.length>0){
		return "1";
	}else{
		return '<span style="color: transparent;">2</span>';
	}//endif
}//function


function bugDetails(bugs) {

	var desk = Mozilla.Platform["Release Tracking - Desktop"];
	var b2g =Mozilla.Platform["Release Tracking - FirefoxOS"];
	bugs.forall(function(b){
		b.bugLink = Bugzilla.linkToBug(b.bug_id);
		b.priority = getPartIndex(b, Mozilla.Platform.Priority);
		b.security = getPartIndex(b, Mozilla.Platform.Security);
		b.stability =  match(b, Mozilla.Platform.Stability.esfilter);
		b.release = match(b, desk.Release.esfilter);
		b.beta = match(b, desk.Beta.esfilter);
		b.dev = match(b, desk.Dev.esfilter);
		b.nightly = match(b, desk.Nightly.esfilter);
		b.b2g21 = match(b, b2g["2.1"].esfilter);
		b.b2g22 = match(b, b2g["2.2"].esfilter);
		b.assigned_to = b.assigned_to=="nobody@mozilla.org" ? "" : b.assigned_to
	});

	//INITIAL ORDERING
	bugs = Qb.sort(bugs, ["release", "beta", "dev", "security", "priority"]);

	var output = new Template([
		"<table class='table' style='width:800px'>",
		"<thead><tr>",
		"<th><div style='width:70px;'>ID</div></th>",
		"<th><div style='width:350px'>Summary</div></th>",
		'<th><span class="indicator"><img style="height:20px;width:20px;" src="./images/lock.gif"></span></th>',
		'<th><span class="indicator">Stability</span></th>',
		'<th><span class="indicator">Release</span></th>',
		'<th><span class="indicator">Beta</span></th>',
		'<th><span class="indicator">Dev</span></th>',
		'<th><span class="indicator">NIghtly</span></th>',
		'<th><span class="indicator">2.1</span></th>',
		'<th><span class="indicator">2.2</span></th>',
		'<th><span class="indicator">Priority</span></th>',
		'<th><span style="width:120px;">Owner</span></th>',
		"</tr></thead>",
		"<tbody>",
		{
			"from":".",
			"template":[
				'<tr id="{{bug_id}}" class="bug_line hoverable">',
				"<td><div>{{bugLink}}</div></td>" ,
				"<td><div id='{{bug_id}}_desc' style='width:350px;padding-top: 8px;max-height: 3em;word-wrap: break-word;overflow: hidden;line-height: 0.9em;'>[screened]</div></td>" ,
				'<td><span class="indicator">{{security}}</span></td>',
				'<td><span class="indicator">{{stability}}</span></td>',
				'<td><span class="indicator">{{release}}</span></td>',
				'<td><span class="indicator">{{beta}}</span></td>',
				'<td><span class="indicator">{{dev}}</span></td>',
				'<td><span class="indicator">{{nightly}}</span></td>',
				'<td><span class="indicator">{{b2g21}}</span></td>',
				'<td><span class="indicator">{{b2g22}}</span></td>',
				'<td><span class="indicator">{{priority}}</span></td>',
				'<td><div class="email">{{assigned_to|html}}</div></span></td>',
				"</tr>"
			]
		},
		"</tbody>",
		"</table>"
	]).expand(bugs);

	return output;
}


function getCategoryHTML(category, allBugs){
	var edges = nvl(category.edges, category.partitions);
	var unionFilter = edges.select("esfilter");

	var html = edges.map(function(e, i){
		var info = {
			"name": e.name,
			"bugs": allBugs.list.filter(e.fullFilter),
			"style": nvl(e.style, {})
		};
		return tile(info)
	}).join("");

	//ADD THE REMAINDER
	var info = {
		"name": "Other",
		"style": {},
		"bugs": allBugs.list.filter({"and":[category.esfilter, {"not": {"or": unionFilter}}]})
	};
	if (info.bugs.length > 0) {
		html += tile(info);
	}//endif

	return '<div style="padding-top: 10px"><h3 id="' + category.name + '_title">' + category.name + '</h3></div><div id="' + category.name + '_tiles" style="padding-left: 50px">' + html + '</div>';
}//function



function setReleaseHTML(data){


	var header = data.edges[1].domain.partitions.map(function(p, i){
		return '<td style="text-align: center"><div>'+ p.name+'</div></td>';
	}).join("");

	var betaTemplate = new Template([
		'<td style="text-align: bottom"><div style="width:20px;height:{{value}}">{{{value}}</div></td>'
	]);
	var beta = data.edges[1].domain.partitions.map(function(p, i){
		return betaTemplate.replace({"value":data.cube[1][i]});
	}).join("");

	var devTemplate = new Template([
		'<td style="text-align: top"><div style="width:20px;height:{{value}}">{{{value}}</div></td>'
	]);
	var dev = data.edges[1].domain.partitions.map(function(p, i){
		return devTemplate.replace({"value":data.cube[2][i]});
	}).join("");


	$("#teams").html('<table id="teamsTable"><thead><tr>'+header+'</tr></thead><tr>'+betaTemplate+'</tr><tr>'+devTemplate+'</tr></table>');


}//function
