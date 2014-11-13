
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




function bugDetails(bugs) {

	bugs.forall(function (b) {
		b.bugLink = Bugzilla.linkToBug(b.bug_id);
		b.priority = nvl(nvl(b.status_whiteboard, "").between("[js:p", "]"), "").left(1);
		b.security = 


	});

	bugs = Qb.sort(bugs, ["priority"]);

	var output = new Template([
		"<table class='table' style='width:800px'>",
		"<thead><tr>",
		"<th style='width:70px;'>ID</th>",
		"<th style='width:290px;'>Summary</th>",
		"<th style='width:70px;'>Status<br><span class='email'>Owner</span></th>",
		"<th style='width:20px;'>Priority</th>",
		"</tr></thead>",
		"<tbody>",
		{
			"from":".",
			"template":[
				'<tr id="{{bug_id}}" class="bug_line hoverable">' +
				"<td>{{bugLink}}</td>" +
				"<td><div style='width:290px;word-wrap: break-word'>{{short_desc|html}}</div></td>" +
				"<td><div style='width:120px;word-wrap: break-word'><b>{{status}}:</b><br><span class='email'>{{assigned_to|html}}</span></div></td>" +
				"<td><div style='text-align: right;width:20px;'>{{priority}}</div></td>"+
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

	return '<div style="padding-top: 10px"><h3>' + category.name + '</h3></div><div style="padding-left: 50px">' + html + '</div>';
}//function

