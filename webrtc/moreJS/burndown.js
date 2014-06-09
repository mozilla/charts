function bugDetails(bugs) {

	bugs.forall(function (b) {
		b.bugLink = Bugzilla.linkToBug(b.bug_id);
	});

	var output = new Template([
		"<table class='table' style='width:800px'>",
		"<thead><tr>",
		"<th style='width:70px;'>ID</th>",
		"<th>Summary</th>",
		"<th style='width:70px;'>Owner</th>",
		"<th>Status</th>",
		"<th>Estimate</th>",
		"</tr></thead>",
		"<tbody>",
		{
			"from":".",
			"template":[
				"<tr>" +
				"<td>{{bugLink}}</td>" +
				"<td><div style='width:290px;word-wrap: break-word'>{{summary|html}}</div></td>" +
				"<td><div style='width:120px;word-wrap: break-word'>{{owner|html}}</div></td>" +
				"<td><div style='width:70px;word-wrap: break-word'>{{status}}</div></td>" +
				"<td><div style='text-align: center;width:20px;'>{{estimate}}</div></td>" +
				"</tr>"
			]
		},
		"</tbody>",
		"</table>"
	]).expand(bugs);

	return output;
}

