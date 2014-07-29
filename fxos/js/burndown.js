function bugDetails(bugs) {

	var hasPriority=false;

	bugs.forall(function (b) {
		b.bugLink = Bugzilla.linkToBug(b.bug_id);
		hasPriority = hasPriority || (b.status !==undefined && b.status!=null);
	});

	var output = new Template([
		"<table class='table' style='width:800px'>",
		"<thead><tr>",
		"<th style='width:70px;'>ID</th>",
		"<th style='width:290px;'>Summary</th>",
		"<th style='width:70px;'>Status<br>Owner</th>",
		hasPriority ? "<th>Priority</th>" : "",
		"<th>Estimate</th>",
		"</tr></thead>",
		"<tbody>",
		{
			"from":".",
			"template":[
				"<tr>" +
				"<td>{{bugLink}}</td>" +
				"<td><div style='width:290px;word-wrap: break-word'>{{summary|html}}</div></td>" +
				"<td><div style='width:120px;word-wrap: break-word'><b>{{status}}:</b><br><span style='font-size: .7em;'>{{owner|html}}</span></div></td>" +
				(hasPriority ? "<td><div style='text-align: center;width:20px;'>{{priority}}</div></td>" : "")+
				"<td><div style='text-align: center;width:20px;'>{{estimate}}</div></td>" +
				"</tr>"
			]
		},
		"</tbody>",
		"</table>"
	]).expand(bugs);

	return output;
}

