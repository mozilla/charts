/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */



var Settings={};
window.Settings=Settings;

if (window.location.hostname=="metrics.mozilla.com"){
	Settings.basePath=".";
}else if (window.location.hostname=="people.mozilla.org"){
	Settings.basePath="http://people.mozilla.com/~klahnakoski/es/";
}else{
	var find="html/es";
		var i =window.location.pathname.indexOf(find)
		if (i==-1){
			Settings.basePath="http://people.mozilla.com/~klahnakoski/es/";
	}else{
		Settings.basePath=window.location.pathname.substring(0, i+find.length);
	}//endif
}//endif


Settings.imagePath=Settings.basePath+"/images";

