/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


importScript("../Settings.js");
importScript("../util/convert.js");
importScript("../charts/aColor.js");
importScript("../collections/aArray.js");
importScript("../util/aDate.js");
importScript("../util/aUtil.js");
importScript("../util/aParse.js");
importScript("../debug/aLog.js");
importScript("MVEL.js");
importScript("qb.js");

importScript("../rest/ElasticSearch.js");
importScript("../rest/Rest.js");


const ActiveDataQuery = {};

ActiveDataQuery.TrueFilter = {"match_all": {}};
ActiveDataQuery.DEBUG = false;
ActiveDataQuery.INDEXES = window.Settings.indexes;


(function () {
	ActiveDataQuery.run = function* (query) {
		let path = splitField(query.from);
		let index = ESQuery.INDEXES[path[0]];
		if (index === undefined) Log.error("{{index}} must be defined in Setting.js", {"index": path[0]});
		if (index.index) path[0] = index.index;
		query.from = joinField(path);

		let url = index.host + index.path;
		if (!url.endsWith("/query")) url += "/query";
		if (ActiveDataQuery.DEBUG) Log.note(convert.value2json(query));

		try {
			try {
				let output = yield (Rest.post({
					url: url,
					data: convert.value2json(query),
					dataType: "json",
					timeout: query.timeout,
				}));
				output.index = index;
				yield (output);
			} catch (e) {
				if (!e.contains(Exception.TIMEOUT)) {
					throw e;
				} else if (e.contains.indexOf("dynamic scripting disabled")) {
					Log.error("Public cluster can not be used", e)
				} else {
					Log.action("Query timeout");
					this.nextDelay = coalesce(this.nextDelay, 500) * 2;
					yield (Thread.sleep(this.nextDelay));
					Log.action("Retrying Query...");
					//TODO: TRY TO DO TAIL-RECURSION
					let output = yield (this.run());
					yield output;
				}//endif
			}//try
		} catch (e) {
			Log.error("Error with ActiveDataQuery", e);
		}//try

	};//method

	Settings.host_types["undefined"]=ActiveDataQuery.run;
	Settings.host_types["null"]=ActiveDataQuery.run;
	Settings.host_types["ActiveData"]=ActiveDataQuery.run;

	return 0;
})();
