////////////////////////////////////////////////////////////////////////////////
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
////////////////////////////////////////////////////////////////////////////////
// Author: Kyle Lahnakoski  (kyle@lahnakoski.com)
////////////////////////////////////////////////////////////////////////////////

importScript("../../lib/jquery.js");

// ADD DYNAMIC STYLING TO NODES!
//
// Example:
// <div dynamicStyle=":hover {background_color: black}">Hello World</div>
//
// This is useful when using HTML templates; you can specify the dynamic
// styles (:hover, :visited) specific to the element, and not a general
// class
//
// Dynamic styles are implemented by assigning an <id> (if none already exist)
// to each element.  New styles are made for each element, prefixing the
// dynamic styles with "#<id>" and adding them to the style sheet.
//
// $().updateDynamicStyle() can be used to update the added nodes

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


