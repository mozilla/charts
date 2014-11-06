
function refresher(func){
	function callMe(){
		try{
			func()
		}catch(e){

		}
	}//method
	setInterval(callMe, 5*60*1000);
}


//JUNK FOR THE Blockers/Regressions/Nominations
function sidebarSlider() {
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


function addProjectClickers(element) {
	$(element).find(".project").hover(function (e) {
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

	$(element).find(".count_unassigned").click(function (e) {
		var link = $(this).attr("href");
		window.open(link);
		return false;
	});

	$(element).find(".count_lost").click(function (e) {
		var link = $(this).attr("href");
		window.open(link);
		return false;
	});

	$(element).find(".project-summary").hover(function (e) {
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
