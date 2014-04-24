
importScript("aLibrary.js");


var ScrumBugs={};

(function(){

	function get(whiteboard, name){
		//SAMPLE:
		//feature=story c=Browser_views u=metro_firefox_user p=3
		var output=whiteboard.between(name+"=", " ");
		if (output==null) return undefined;
		return output;
	}//method

	function getDates(whiteboard){
		var dates=whiteboard.between("feature=iteration", ")")+")";
		var startDate=Date.newInstance(dates.between("(", "-"));
		var endDate=Date.newInstance(dates.between("-", ")"));

	}//method


	ScrumBugs.parse=function(whiteboard){
		whiteboard=whiteboard+" ";
		var output={
			"feature":get(whiteboard, "feature"),
			"component":get(whiteboard, "c"),
			"user":get(whiteboard, "u"),
			"points":CNV.String2Integer(nvl(get(whiteboard, "p"), 0))
		};
		if (output.feature=="iteration"){
			//feature=iteration (May 02, 2013 - May 23, 2013)
			var dates=whiteboard.between("feature=iteration", ")")+")";
			output.startDate=Date.newInstance(dates.between("(", "-"));
			output.endDate=Date.newInstance(dates.between("-", ")"));
		}//endif


		return output;
	};//method


})();
