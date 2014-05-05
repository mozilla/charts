////////////////////////////////////////////////////////////////////////////////
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
////////////////////////////////////////////////////////////////////////////////
// Author: Kyle Lahnakoski  (kyle@lahnakoski.com)
////////////////////////////////////////////////////////////////////////////////

importScript("../../lib/jquery.js");

//ADD DYNAMIC STYLING TO NODES!
//dynamicStyle="<add some css styles>"
//
//EVERY NODE IS GIVEN AN ID (IF NONE EXIST) AND
//A NEW STYLES ARE MADE FOR EACH ID BY PREFIXING EACH SELECTOR WITH "#<id>"
//
// $().updateDynamicStyle() CAN BE USED IN THE EVENT MORE NODES ARE CREATED USING THIS MARKUP

$(document).ready(function () {
	var UID = 0;
	var UID_PREFIX = "dynamicSelector";
	var INDICATOR_CLASS = "dynamic";

	function uid() {
		return UID++;
	}//method

	//RETURN LIST OF {"selector":<selector>, "style":<style>}
	function parseCSS(css) {
		return css.split("}").map(function (rule) {
			if (rule.trim()=="") return undefined;

			var info = rule.split("{");
			return {"selector": info[0].trim(), "style": CNV.style2Object(info[1])};
		});
	}//method

	function dynamicStyle() {
		var styles = [];
		$(this).find("." + INDICATOR_CLASS).each(function () {
			var self = $(this);
			var rules = parseCSS(self.attr("dynamic-style"));
			var defaultStyle = CNV.style2Object(self.attr("style"));
			var id = self.attr("id");
			if (id == undefined) {
				id = UID_PREFIX + uid();
				self.attr("id", id);
			}//endif

			styles.append("#" + id + "{" + CNV.Object2style(defaultStyle) + "}\n");  //DEFAULT
			rules.forall(function (rule) {
				styles.append("#" + id + rule.selector + "{" + CNV.Object2style(Map.setDefault(rule.style, defaultStyle)) + "}\n");
			});

			//CLEANUP
			self.removeClass(INDICATOR_CLASS);
			self.attr("style", "");
			self.attr("dynamic-style", "");
		});
		$("head").append('"<style type="text/css">' + styles.join("\n") + "</style>");
		return this;
	}

	$.fn.updateDynamicStyle = dynamicStyle;
	dynamicStyle.apply($("body"));
});


