importScript("../modevlib/util/CNV.js");
importScript("../modevlib/qb/Qb.js");
importScript("../modevlib/charts/aColor.js");

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

function addTileClickers(){
	$(".project").hover(function(){
		var bugList = "#" + CNV.JSON2Object($(this).attr("bugsList")).join(",#");
		$(bugList).addClass("selected");
	},function(){
		var bugList = "#" + CNV.JSON2Object($(this).attr("bugsList")).join(",#");
		$(bugList).removeClass("selected");
	}).click(function(e){
		var bugList = $(".selected.project").map(function(){
			return CNV.JSON2Object($(this).attr("bugsList"));
		}).get();
		if (bugList.length == 0) {
			$(".bug_line").removeClass("selected").show();
		} else {
			bugList = "#" + bugList.join(",#");
			$(bugList).removeClass("selected").show();
			$(".bug_line").not(bugList).hide();
		}//endif
	});

	$("#show-bugs").click(function(){
		var bugList = $(".selected.project").map(function(){
			return CNV.JSON2Object($(this).attr("bugsList"));
		}).get();

		if (bugList.length == 0) {
			var allBugs= $.makeArray($(".bug_line")).map(function(v, i){
				return $(v)[0].id;
			});
			Bugzilla.showBugs(allBugs);
		}else{
			Bugzilla.showBugs(bugList);
		}//endif

	});


}//function


function tile(info){
	var normalColor = nvl(info.style.color, NORMAL);
	var hoverColor = Color.newInstance(normalColor).lighter().toHTML();

	info.bugsList = CNV.Object2JSON(info.bugs.select("bug_id"));
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
		'<div class="project"  style="background-color:{{color}}" dynamic-style="{{dynamicStyle|css}}" dynamic-state="{{states|attribute}}" href="{{bugsURL}}" bugsList="{{bugsList}}">' ,
		'<div class="release">{{name}}</div>',
		'<div class="count">{{bugs.length}}</div>',
		(info.unassignedBugs.length > 0 ? '<div class="unassigned"><a class="count_unassigned" href="{{unassignedURL}}">{{unassignedBugs.length}}</a></div>' : '') ,
		'</div>'
	]);
	return TEMPLATE.replace(info);
}//function


//START COUNTING AT 1 (BECAUSE PRIORITY STARTS AT 1
//IT IS IMPORTANT FOR THE sorttable LIB THAT ALL ROWS HAVE A VALUE,
//AND IT IS IMPORTANT THAT THE NULLS ARE SORTED TO THE BOTTOM
function getPartIndex(b, domain){
	var parts = nvl(domain.partitions, domain.edges);
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
	Map.forall(replacement, function(find, replace){
		name = name.replaceAll(find, replace);
	});
	return name;
}

function bugDetails(bugs, categories){
	// categories IS THE DIMENSION DEFINTION


	bugs.forall(function(b){
		b.component = cleanupComponent(b.component);
		b.bugLink = Bugzilla.linkToBug(b.bug_id);
		b.assigned_to = b.assigned_to == "nobody@mozilla.org" ? "" : b.assigned_to;

		categories.edges.map(function(c){
			if (c.edges){
				c.edges.forall(function(e){
					b[e.columnName] = match(b, e);
				});

			}else if (c.partitions){
				b[c.columnName] = getPartIndex(b, c)				;
			}else{
				b[c.columnName] = match(b, c);
			}//endif
		});
	});



	var header="";
	var rows="";

	//EXTRA COLUMNS
	if (categories.extraColumns){
		categories.extraColumns.forall(function(c){
			header+='<th><div>'+c.name+'</div></th>';
			rows+='<td><div class="bz_component">{{'+c.value+'|html}}</div></span></td>';
		})
	}//endif

	//PARAMETERIZED INDICATOR COLUMNS
	categories.edges.map(function(c){
		if (c.edges){
			c.edges.forall(function(e){
				if (!e.columnName){
					Log.error("Expecting a columnName field in dimension description.  (Used to add markup to bug records)")
				}//endif
				header+='<th><span class="indicator">'+e.name+'</span></th>';
				rows +=	'<td style="vertical-align: middle"><span class="indicator" style="{{'+e.columnName+'.style|style}}">{{'+e.columnName+'.order}}</span></td>';
			});

		}else if (c.partitions){
			if (!c.columnName){
				Log.error("Expecting a columnName field in dimension description.  (Used to add markup to bug records)")
			}//endif
			header+='<th><span class="indicator">'+c.name+'</span></th>';
			rows +=	'<td style="vertical-align: middle"><span class="indicator" style="{{'+c.columnName+'.style|style}}">{{'+c.columnName+'.order}}</span></td>';
		}else{
			if (!c.columnName){
				Log.error("Expecting a columnName field in dimension description.  (Used to add markup to bug records)")
			}//endif
			header+='<th><span class="indicator">'+c.name+'</span></th>';
			rows +=	'<td style="vertical-align: middle"><span class="indicator" style="{{'+c.columnName+'.style|style}}">{{'+c.columnName+'.order}}</span></td>';
		}//endif
	});

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
	var edges = nvl(category.edges, category.partitions);

	var html;

	if (edges == null) {
		//CATEGORY WITH SINGLE TILE
		html = tile({
			"name": category.name,
			"bugs": allBugs.list.filter(category.esfilter),
			"style": {} //nvl(category.style, {})
		});

	} else {
		var unionFilter = edges.select("esfilter");

		html = edges.map(function(e, i){
			var info = {
				"name": e.version && e.name!="Release" ? e.name+"-"+e.version : e.name,
				"bugs": allBugs.list.filter(e.fullFilter),
				"version": e.version,
				"style": {} //nvl(e.style, {})
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

	var MAX_VERTICAL_HEIGHT = 300;
	var FONT_HEIGHT = 20;

	var header = "<td></td>" + data.edges[1].domain.partitions.map(function(p, i){
		return '<td style="text-align: center; vertical-align: middle; width:60px;"><div>' + p.name + '</div></td>';
	}).join("");

	var betaTemplate = new Template([
		'<td style="vertical-align:bottom;text-align: center; width:60px;">',
		'<div id="{{id}}" class="hoverable tracking" style="{{style|style}}" dynamic-style=":hover{background-color:{{lighter}}}">',
		'<span>{{value}}</span>',
		'</div>',
		'</td>'
	]);

	var scale = aMath.min(10, MAX_VERTICAL_HEIGHT / aMath.MAX(data.cube[1]), MAX_VERTICAL_HEIGHT / aMath.MAX(data.cube[2]));
	var BETA = data.edges[0].domain.partitions[1];
	var AURORA = data.edges[0].domain.partitions[2];
	var ESR = data.edges[0].domain.partitions[3];

	var beta = data.edges[1].domain.partitions.map(function(p, i){
		var style = {
			"width": "40px",
			"height": (data.cube[1][i] * scale) + "px",
			"color": data.cube[1][i] * scale > FONT_HEIGHT ? "white" : "transparent",
			"text-align": "center",
			"align": "center",
			"display": "inline-block",
			"background-color": BETA.style.color
		};

		return betaTemplate.replace({
			"id": "tracking_1_" + i,
			"value": data.cube[1][i],
			"style": style,
			"lighter": Color.newInstance(BETA.style.color).lighter()
		});
	}).join("");

	var devTemplate = new Template([
		'<td style="width:60px;text-align: center;">',
		'<div id="{{id}}" class="hoverable tracking" style="{{style|style}}" dynamic-style=":hover{background-color:{{lighter}}}">',
		'<div style="vertical-align: bottom;">{{value}}</div>',
		'</div>',
		'</td>'
	]);
	var dev = data.edges[1].domain.partitions.map(function(p, i){
		var style = {
			"width": "40px",
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
		'<td style="vertical-align:middle;text-align: center; width:60px;">',
		'<div id="{{id}}" class="hoverable tracking" style="{{style|style}}" dynamic-style=":hover{background-color:{{lighter}}}">',
		'<div style="padding-top:6px;">{{value}}</div>',
		'</div>',
		'</td>'
	]);
	var esr = data.edges[1].domain.partitions.map(function(p, i){
		var style = {
			"width": "40px",
			"height": "40px",
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
		'<table id="teamsTable">' +
			'<tbody>' +
			'<tr><td class="train_title"><h3>Beta&nbsp;(' + BETA.version + ')</h3></td>' + beta + '</tr>' +
			'<tr>' + header + '</tr>' +
			'<tr><td class="train_title"><h3>Aurora&nbsp;(' + AURORA.version + ')</h3></td>' + dev + '</tr>' +
//			(aMath.SUM(data.cube[0])>0 ? '<tr><td class="train_title"><h3>Release</h3></td>'+release+'</tr>' : '') +
//			(aMath.SUM(data.cube[3]) > 0 ? '<tr><td class="train_title"><h3>ESR 31</h3></td>' + esr + '</tr>' : '') +
			'</tbody>' +
			'</table>'
	);


	//ADD CLICKERS
	$(".tracking").click(function(){
		var parts = $(this)[0].id.split("_");
		var release = CNV.String2Integer(parts[1]);
		var team = CNV.String2Integer(parts[2]);

		Thread.run(function*(){
			var bugs = yield (ESQuery.run({
				"select": ["bug_id"],
				"from": "bugs",
				"esfilter": {"and": [
					data.edges[0].domain.partitions[release].fullFilter,
					data.edges[1].domain.partitions[team].fullFilter,
					Mozilla.BugStatus.Open.esfilter,
					Mozilla.CurrentRecords.esfilter
				]}
			}));

			Bugzilla.showBugs(bugs.list.select("bug_id"));
		});
	});

	$(document).updateDynamicStyle();


}//function


function fillPlatform(temp, allBugs, onPrivateCluster){
	if (onPrivateCluster) {
		temp.html(getCategoryHTML(Mozilla.Platform.Security, allBugs));

		//BIG HACK: INSERT STABILITY IN WITH SECURITY
		var stabilityBugs = allBugs.list.filter(Mozilla.Platform.Stability.fullFilter);
		if (stabilityBugs.length > 0) {
			$("#Security_title").html("Security/Stability");
			$("#Security_tiles").append(tile({
				"name": Mozilla.Platform.Stability.name,
				"bugs": stabilityBugs,
				"style": nvl(Mozilla.Platform.Stability.style, {})
			}));
		}//endif
	} else {
		//PUBLIC CLUSTER HAS NO SEC. BUGS, SO GO STRAIGHT TO SHOWING THE STABILITY BUGS
		temp.append(getCategoryHTML(Mozilla.Platform.Stability, allBugs));
	}//endif

	temp.append(getCategoryHTML(Mozilla.Platform["Release Tracking - Desktop"], allBugs));
	temp.append(getCategoryHTML(Mozilla.Platform["Release Tracking - FirefoxOS"], allBugs));
	temp.append(getCategoryHTML(Mozilla.Platform.Priority, allBugs));
}

function fillDevices(temp, allBugs, onPrivateCluster){
	Mozilla.Devices.Categories.edges.forall(function(category){
		temp.append(getCategoryHTML(category, allBugs));
	});
}


function requiredFields(esfilter){
	//THIS LOOKS INTO DIMENSION DEFINITIONS, AS WELL AS ES FILTERS

	if (esfilter===undefined) return [];

	var parts = nvl(esfilter.edges, esfilter.partitions, esfilter.and, esfilter.or);
	if (parts){
		var rf = requiredFields(esfilter.esfilter);
		//A DIMENSION! - USE IT ANYWAY
		return Array.union(parts.map(requiredFields).append(rf));
	}//endif

	if (esfilter.esfilter){
		return requiredFields(esfilter.esfilter);
	}else if (esfilter.not){
		return requiredFields(esfilter.not);
	}else if (esfilter.term){
		return Object.keys(esfilter.term)
	}else if (esfilter.terms){
		return Object.keys(esfilter.terms)
	}else if (esfilter.regexp){
		return Object.keys(esfilter.regexp)
	}else if (esfilter.missing){
		return [esfilter.missing.field]
	}else if (esfilter.exists){
		return [esfilter.missing.field]
	}else{
		return []
	}//endif
}//method

