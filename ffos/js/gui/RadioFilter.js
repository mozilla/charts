
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


importScript("../debug/aLog.js");
importScript("../util/aTemplate.js");
importScript("../util/CNV.js");


RadioFilter = function(name, options, default_, refreshCallback){
	this.name=name;
	this.options=options;
	this.selected=default_;
	this.refreshCallback=refreshOnChange;
	this.isFilter=true;
	this.refresh();

};


RadioFilter.prototype.getSummary=function(){
	var html = this.name+": "+this.selected;
	return html;
};//method


//RETURN SOMETHING SIMPLE ENOUGH TO BE USED IN A URL
RadioFilter.prototype.getSimpleState=function(){
	return this.selected;
};

RadioFilter.prototype.setSimpleState=function(value){
	if (this.options.contains(value)){
		this.selected=value;
	}//endif
	if (this.refreshCallback) this.refresh();
};

RadioFilter.prototype.makeHTML=function(){
	var html = new Template([
		'<div id="{{name}}">',
		{
			"from": options,
			"template": '<input type="radio" name="{{name}}" value="{{.}}">{{.}}</input>'
		},
		'</div>'
	]);

	return html.expand(this);
};//method


RadioFilter.prototype.refresh = function(){
	$("input[type='radio'][name='"+name+"']").click(function(){


	});



};

