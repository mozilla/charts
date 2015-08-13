importScript("../modevlib/util/convert.js");
importScript("../modevlib/qb/Qb.js");
importScript("../modevlib/charts/aColor.js");
importScript("../modevlib/gui/GUI.js");

var NORMAL = "#888888";
var NORMAL_HOVER = Color.newHTML(NORMAL).lighter().toHTML();
var SELECTED = Color.BLUE.hue(60).multiply(0.6).toHTML();
var SELECTED_HOVER = Color.BLUE.hue(60).multiply(0.6).lighter().toHTML();

function refresher(func){
	function callMe(){
		try {
			func()
		} catch (e) {

		}
	}//method
	setInterval(callMe, 5 * 60 * 1000);
}


function sidebarSlider(){
	$("body").css("display", "block");

	$('.sidebar_name').click(function(){
		var self = $(this);
		if (self.hasClass("selected")) {
			self.removeClass("selected");
			$("#sidebar").animate({"width": "0px"}, 500);
			$(".content").animate({"margin-left": "60px"}, 500);  //TODO:
		} else {
			self.addClass("selected");
			$("#sidebar").animate({"width": "300px"}, 500);
			$(".content").animate({"margin-left": "360px"}, 500);
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


function highlightBugs(){
	var selectedCats = $(".selected.project");
	var bugList = selectedCats.map(function(){
		return convert.json2value($(this).attr("bugsList"));
	}).get();
	if (bugList.length == 0) {
		$(".bug_line").removeClass("selected").show();
	} else {
		bugList = "#" + bugList.join(",#");
		$(bugList).removeClass("selected").show();
		$(".bug_line").not(bugList).hide();
	}//endif
}

function addTileClickers(selectedToShow){
	$(".project").hover(function(){
		var bugList = "#" + convert.json2value($(this).attr("bugsList")).join(",#");
		$(bugList).addClass("selected");
	}, function(){
		var bugList = "#" + convert.json2value($(this).attr("bugsList")).join(",#");
		$(bugList).removeClass("selected");
	}).click(function(e){
		highlightBugs();

		var selectedCats = $(".selected.project");
		GUI.state.show = selectedCats.map(function(){
			return $(this).attr("name");
		}).get();
		GUI.State2URL();
		GUI.State2Parameter();
	}).each(function(){
		var self = $(this);
		if (selectedToShow.contains(self.attr("name"))) {
			self.addClass("selected")
		}//endif
	});

	highlightBugs();

	$("#show-bugs").click(function(){
		var bugList = $(".selected.project").map(function(){
			return convert.json2value($(this).attr("bugsList"));
		}).get();

		if (bugList.length == 0) {
			var allBugs = $.makeArray($(".bug_line")).map(function(v, i){
				return $(v)[0].id;
			});
			Bugzilla.showBugs(allBugs);
		} else {
			Bugzilla.showBugs(bugList);
		}//endif

	});


}//function


function tile(info){
	var normalColor = coalesce(info.style.color, NORMAL);
	var hoverColor = Color.newInstance(normalColor).lighter().toHTML();

	info.bugsList = convert.value2json(info.bugs.select("bug_id"));
	info.bugsURL = Bugzilla.searchBugsURL(info.bugs.select("bug_id"));
	info.unassignedBugs = info.bugs.filter(function(b){
		return b.assigned_to == "nobody@mozilla.org"
	}).select("bug_id");
	info.unassignedURL = Bugzilla.searchBugsURL(info.unassignedBugs);
	info.color = normalColor;
	info.states = ["normal", "selected"];
	info.dynamicStyle = {
		":hover": {"background-color": hoverColor},
		".selected": {"background-color": SELECTED},
		".selected:hover": {"background-color": SELECTED_HOVER}
	};

	var TEMPLATE = new Template([
		'<div class="project" name="{{name}}"  style="background-color:{{color}}" dynamic-style="{{dynamicStyle|css}}" dynamic-state="{{states|attribute}}" href="{{bugsURL}}" bugsList="{{bugsList}}">' ,
		'<div class="release">{{name}}</div>',
			'<div class="count">' + (info.disabled ? 'N/A' : '{{bugs.length}}') + '</div>',
		(info.unassignedBugs.length > 0 ? '<div class="unassigned"><a class="count_unassigned" href="{{unassignedURL}}">{{unassignedBugs.length}}</a></div>' : '') ,
		'</div>'
	]);
	return TEMPLATE.replace(info);
}//function


//START COUNTING AT 1 (BECAUSE PRIORITY STARTS AT 1
//IT IS IMPORTANT FOR THE sorttable LIB THAT ALL ROWS HAVE A VALUE,
//AND IT IS IMPORTANT THAT THE NULLS ARE SORTED TO THE BOTTOM
function getPartIndex(b, domain){
	var parts = coalesce(domain.partitions, domain.edges);
	for (var i = 0; i < parts.length; i++) {
		var part = parts[i];
		var result = [b].filter(part.esfilter);
		if (result.length > 0) {
			if (!Map.get(part, "style.color")) return {"style": {}, "order": i + 1};

			return {
				"style": {
					"color": "transparent",
					"background-color": Map.get(part, "style.color")
				},
				"order": i + 1
			};
		}//endif
	}//for
	return {"style": {"color": "transparent"}, "order": parts.length + 1};
}//function


//1 IS POSITIVE INDICATION (MATCHES FILTER)
//2 IS NEGATIVE INDICATION
//IT IS IMPORTANT THAT THE NULLS ARE SORTED TO THE BOTTOM
//IT IS IMPORTANT FOR THE sorttable LIB THAT ALL ROWS HAVE A VALUE
function match(b, part){
	var result = [b].filter(part.esfilter);
	if (result.length == 0) return {"style": {"color": "transparent"}, "order": 2};
	if (!Map.get(part, "style.color")) return {"style": {}, "order": 1};

	return {
		"style": {
			"color": "transparent",
			"background-color": Map.get(part, "style.color")
		},
		"order": 1
	};
}//function


var replacement = {
	"javascript: ": "",
	"javascript engine:": "engine:",
	"javascript ": ""
};

function cleanupComponent(name){
	if (!name) return "<none>";
	Map.forall(replacement, function(find, replace){
		name = name.replaceAll(find, replace);
	});
	return name;
}

function bugDetails(bugs, categories){
	// categories IS THE DIMENSION DEFINTION


	var header = "";
	var rows = "";

	//EXTRA COLUMNS
	if (categories.extraColumns) {
		categories.extraColumns.forall(function(c){
			header += '<th><div>' + c.name + '</div></th>';
			rows += '<td><div class="bz_component">{{' + c.value + '|html}}</div></span></td>';
		})
	}//endif

	//PARAMETERIZED INDICATOR COLUMNS
	categories.edges.map(function(c){
		if (c.edges) {
			c.edges.forall(function(e){
				if (!e.columnName) {
					Log.error("Expecting a columnName field in dimension description.  (Used to add markup to bug records)")
				}//endif
				header += '<th><span class="indicator">' + e.name + '</span></th>';
				rows += '<td style="vertical-align: middle"><span class="indicator" style="{{' + e.columnName + '.style|style}}">{{' + e.columnName + '.order}}</span></td>';
			});

		} else if (c.partitions) {
			if (!c.columnName) {
				Log.error("Expecting a columnName field in dimension description.  (Used to add markup to bug records)")
			}//endif
			header += '<th><span class="indicator">' + c.name + '</span></th>';
			rows += '<td style="vertical-align: middle"><span class="indicator" style="{{' + c.columnName + '.style|style}}">{{' + c.columnName + '.order}}</span></td>';
		} else {
			if (!c.columnName) {
				Log.error("Expecting a columnName field in dimension description.  (Used to add markup to bug records)")
			}//endif
			header += '<th><span class="indicator">' + c.name + '</span></th>';
			rows += '<td style="vertical-align: middle"><span class="indicator" style="{{' + c.columnName + '.style|style}}">{{' + c.columnName + '.order}}</span></td>';
		}//endif
	});


	//PROCESS BUGS
	bugs.forall(function(b){
		b.component = cleanupComponent(b.component);
		b.bugLink = new HTML('<a>' + b.bug_id + '</a>');
		b.assigned_to = b.assigned_to == "nobody@mozilla.org" ? "" : b.assigned_to;
		categories.edges.map(function(c){
			if (c.edges) {
				c.edges.forall(function(e){
					b[e.columnName] = match(b, e);
				});

			} else if (c.partitions) {
				b[c.columnName] = getPartIndex(b, c);
			} else {
				b[c.columnName] = match(b, c);
			}//endif
		});

		b.overallPriority = -3 / b.release.order - 2 / b.beta.order - 1 / b.nightly.order - 2 / b.security.order - 1 / b.priority.order - 2 / b.stability.order;

	});

	bugs = Qb.sort(bugs, ["release.order", "overallPriority"]);

	var output = new Template([
		"<table class='table' style='width:auto'>",
		"<thead><tr>",
		"<th><div style='width:70px;'>ID</div></th>",
		"<th><div>Summary</div></th>",
		'<th><div>Component</div></th>',
		'<th><span>Owner</span></th>',
		header,
		"</tr></thead>",
		"<tbody>",
		{
			"from": ".",
			"template": [
				'<tr id="{{bug_id}}" class="bug_line hoverable">',
				"<td><div>{{bugLink}}</div></td>",
				"<td><div id='{{bug_id}}_desc' class='desc'>[screened]</div></td>" ,
				'<td><div class="bz_component">{{component|html}}</div></span></td>',
				'<td><div class="email">{{assigned_to|html}}</div></span></td>',
				rows,
				"</tr>"
			]
		},
		"</tbody>",
		"</table>"
	]).expand(bugs);

	return output;
}


function getCategoryHTML(category, allBugs){
	var edges = coalesce(category.edges, category.partitions);

	var html;

	if (edges == null) {
		//CATEGORY WITH SINGLE TILE
		html = tile({
			"name": category.name,
			"bugs": allBugs.list.filter(category.esfilter),
			"style": {} //coalesce(category.style, {})
		});

	} else {
		var unionFilter = edges.select("esfilter");

		html = edges.map(function(e, i){
			var info = {
				"name": e.version && e.name != "Release" ? e.name + "-" + e.version : e.name,
				"bugs": allBugs.list.filter(e.fullFilter),
				"version": e.version,
				"style": {}, //coalesce(e.style, {})
				"disabled": e.disabled
			};
			return tile(info)
		}).join("");

		//ADD THE REMAINDER
		var info = {
			"name": "Other",
			"style": {},
			"bugs": allBugs.list.filter({"and": [category.esfilter, {"not": {"or": unionFilter}}]})
		};
		if (info.bugs.length > 0) {
			html += tile(info);
		}//endif
	}//endif

	return '<div style="padding-top: 10px"><h3 id="' + category.name + '_title">' + category.name + '</h3></div><div id="' + category.name + '_tiles" style="padding-left: 50px">' + html + '</div>';
}//function


function setReleaseHTML(data){
	//DEAR SELF:  PLEASE LEARN D3!!

	var MAX_VERTICAL_HEIGHT = (window.innerHeight - 200)/2;
	var WIDTH = (window.innerWidth-250)/ data.edges[1].domain.partitions.length;
	var BAR_WIDTH = 2*WIDTH/3;
	var FONT_HEIGHT = 20;

	$(".train_title").height(MAX_VERTICAL_HEIGHT+FONT_HEIGHT);

	var header = "" + data.edges[1].domain.partitions.map(function(p, i){
		return '<td style="text-align: center; vertical-align: middle; width:'+WIDTH+'px;height:'+(FONT_HEIGHT*2)+'px"><div>' + p.name + '</div></td>';
	}).join("");

	var betaTemplate = new Template([
		'<td style="vertical-align:bottom;text-align: center; width:'+WIDTH+'px;height:'+MAX_VERTICAL_HEIGHT+'px">',
		'<div id="{{id}}" class="hoverable tracking" style="{{style|style}}" dynamic-style=":hover{background-color:{{lighter}}}">',
		'<span>{{value}}</span>',
		'</div>',
		'</td>'
	]);

	var scale = aMath.min(30, MAX_VERTICAL_HEIGHT / aMath.MAX(data.cube[1]), MAX_VERTICAL_HEIGHT / aMath.MAX(data.cube[2]));
	var BETA = data.edges[0].domain.partitions[1];
	var AURORA = data.edges[0].domain.partitions[2];
	var ESR = data.edges[0].domain.partitions[3];

	var beta = data.edges[1].domain.partitions.map(function(p, i){
		var style = {
			"width": BAR_WIDTH+"px",
			"height": (data.cube[1][i] * scale) + "px",
			"color": data.cube[1][i] * scale > FONT_HEIGHT ? "white" : "transparent",
			"text-align": "center",
			"align": "center",
			"display": "inline-block",
			"background-color": BETA.style.color,
			"overflow":"hidden"
		};

		return betaTemplate.replace({
			"id": "tracking_1_" + i,
			"value": data.cube[1][i],
			"style": style,
			"lighter": Color.newInstance(BETA.style.color).lighter()
		});
	}).join("");

	var devTemplate = new Template([
		'<td style="width:'+WIDTH+'px;text-align: center;">',
		'<div id="{{id}}" class="hoverable tracking" style="{{style|style}}" dynamic-style=":hover{background-color:{{lighter}}}">',
		'<div style="vertical-align: bottom;">{{value}}</div>',
		'</div>',
		'</td>'
	]);
	var dev = data.edges[1].domain.partitions.map(function(p, i){
		var style = {
			"width": BAR_WIDTH+"px",
			"height": (data.cube[2][i] * scale) + "px",
			"color": data.cube[2][i] * scale > FONT_HEIGHT ? "white" : "transparent",
			"vertical-align": "bottom",
			"text-align": "center",
			"display": "inline-block",
			"background-color": AURORA.style.color
		};
		return devTemplate.replace({
			"id": "tracking_2_" + i,
			"value": data.cube[2][i],
			"style": style,
			"lighter": Color.newInstance(AURORA.style.color).lighter()
		});
	}).join("");


	var esrTemplate = new Template([
		'<td style="vertical-align:middle;text-align: center; width:'+WIDTH+'px;">',
		'<div id="{{id}}" class="hoverable tracking" style="{{style|style}}" dynamic-style=":hover{background-color:{{lighter}}}">',
		'<div style="padding-top:6px;">{{value}}</div>',
		'</div>',
		'</td>'
	]);
	var esr = data.edges[1].domain.partitions.map(function(p, i){
		var style = {
			"width": BAR_WIDTH+"px",
			"height": BAR_WIDTH+"px",
			"color": "white",
			"vertical-align": "middle",
			"text-align": "center",
			"display": "inline-block",
			"background-color": ESR.style.color
		};
		if (data.cube[3][i] > 0) {
			return esrTemplate.replace({
				"id": "tracking_3_" + i,
				"value": data.cube[3][i],
				"style": style,
				"lighter": Color.newInstance(ESR.style.color).lighter()
			});
		} else {
			return "<td></td>";
		}//endif

	}).join("");


	$("#teams").html(
			'<div></div>' +
			'<table id="teamsTable">' +
			'<tbody>' +
			'<tr>' + beta + '</tr>' +
			'<tr>' + header + '</tr>' +
			'<tr>' + dev + '</tr>' +
//			(aMath.SUM(data.cube[0])>0 ? '<tr><td class="train_title"><h3>Release</h3></td>'+release+'</tr>' : '') +
//			(aMath.SUM(data.cube[3]) > 0 ? '<tr><td class="train_title"><h3>ESR 31</h3></td>' + esr + '</tr>' : '') +
			'</tbody>' +
			'</table>'
	);
	$("#beta_title").html('<h3 style="position:absolute;display:block;bottom:40px;right:0;">Beta&nbsp;(' + BETA.version + ')</h3>');
	$("#aurora_title").html('<h3 style="position:absolute;display:block;top:40px;right:0;">Aurora&nbsp;(' + AURORA.version + ')</h3>');

	//ADD CLICKERS
	$(".tracking").click(function(){
		var parts = $(this)[0].id.split("_");
		var release = convert.String2Integer(parts[1]);
		var team = convert.String2Integer(parts[2]);

		Thread.run(function*(){
			var bugs = yield (ESQuery.run({
				"select": ["bug_id"],
				"from": "bugs",
				"esfilter": {"and": [
					data.edges[0].domain.partitions[release].fullFilter,
					data.edges[1].domain.partitions[team].fullFilter,
					Mozilla.CurrentRecords.esfilter
				]}
			}));

			Bugzilla.showBugs(bugs.list.select("bug_id"));
		});
	});

	$(document).updateDynamicStyle();


}//function


function fillPlatform(temp, allBugs, onPrivateCluster){
	Mozilla.Platform.Categories.Security.partitions.forall(function(p){
		p.disabled = !onPrivateCluster;
	});
	temp.html(getCategoryHTML(Mozilla.Platform.Categories.Security, allBugs));

	//BIG HACK: INSERT STABILITY IN WITH SECURITY
	var stabilityBugs = allBugs.list.filter(Mozilla.Platform.Categories.Stability.fullFilter);
	if (stabilityBugs.length > 0) {
		$("#Security_title").html("Security/Stability");
		$("#Security_tiles").append(tile({
			"name": Mozilla.Platform.Categories.Stability.name,
			"bugs": stabilityBugs,
			"style": coalesce(Mozilla.Platform.Categories.Stability.style, {})
		}));
	}//endif

	Mozilla.Platform.Categories.edges.rightBut(2).forall(function(category){
		temp.append(getCategoryHTML(category, allBugs));
	});
}

function fillDevices(temp, allBugs, onPrivateCluster){
	Mozilla.Devices.Categories.edges.forall(function(category){
		temp.append(getCategoryHTML(category, allBugs));
	});
}
