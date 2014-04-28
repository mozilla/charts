
importScript("aLibrary.js");


var ScrumBugs={};



(function(){
	var noMatch=[undefined, undefined];

	var pointsPattern=/p[=:](\w+)[ ,\]]/g;
	var componentPattern=/c[=:](\w+)[ ,\]]/g;
	var featurePattern=/(feature|ft)[=:](\w+)[ ,\]]/g;
	var userPattern=/u[=:](\w+)[ ,\]]/g;


	function getDates(whiteboard){
		var dates=whiteboard.between("feature=iteration", ")")+")";
		var startDate=Date.newInstance(dates.between("(", "-"));
		var endDate=Date.newInstance(dates.between("-", ")"));

	}//method


	ScrumBugs.parse=function(whiteboard){
		whiteboard=whiteboard+" ";
		var output={
			"feature":nvl(featurePattern.exec(whiteboard), noMatch)[1],
			"component":nvl(componentPattern.exec(whiteboard), noMatch)[1],
			"user":nvl(userPattern.exec(whiteboard), noMatch)[1],
			"points":nvl(pointsPattern.exec(whiteboard), noMatch)[1]
		};
		if (output.feature=="iteration"){
			//feature=iteration (May 02, 2013 - May 23, 2013)
			var dates=whiteboard.between("feature=iteration", ")")+")";
			output.startDate=Date.newInstance(dates.between("(", "-"));
			output.endDate=Date.newInstance(dates.between("-", ")"));
		}//endif


		return output;
	};//method

	var TEST = false;
	if (TEST){
		var white = "[est:4d, p=4][coordination]";
		ASSERT(ScrumBugs.parse(white).points == 4, "Wrong");
	}//endif


})();


