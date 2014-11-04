


// SHOW ONR TILE WITH COUNT (AND OPTIONAL unassignedCount)
function showCount(detail){
	detail.bugsList = detail.bugs.join(", ");
	detail.bugsURL = Bugzilla.searchBugsURL(detail.bugs);
	detail.unassignedURL = Bugzilla.searchBugsURL(detail.unassignedBugs);
	detail.color = "grey";

	var TEMPLATE = new Template('<div class="project {{additionalClass}}"  style="background-color:{{color}}" href="{{bugsURL}}" bugsList="{{bugsList}}" project="{{project}}">' +
		'<div class="release">{{project}}</div>' +
		'<div class="count">{{count}}</div>' +
		(detail.unassignedCount > 0 ? '<div class="unassigned"><a class="count_unassigned" href="{{unassignedURL}}">{{unassignedCount}}</a></div>' : '') +
		'</div>');

	return TEMPLATE.replace(detail)
}//function
